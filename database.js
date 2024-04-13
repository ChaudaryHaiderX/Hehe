const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const port = 3001; // Choose a port for your Node.js server
const multer = require('multer');

// Multer setup for handling file uploads with file type filter
const upload = multer({
    dest: 'uploads/',
    fileFilter: (req, file, cb) => {
        // Check if the uploaded file is a CSV file
        if (!file.originalname.match(/\.(csv)$/)) {
            return cb(new Error('Only CSV files are allowed!'), false);
        }
        cb(null, true);
    }
});



app.use(cors());

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '1234321',
    database: 'database',
    connectionLimit: 100
});


// Login Authentication
app.use(express.json());

app.post('/api/signin', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    const query = 'SELECT user_name FROM signin WHERE user_email = ? AND user_password = ?';

    pool.query(query, [email, password], (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (results.length === 1) {
            // User found, authentication successful
            const user = {
                user_name: results[0].user_name,
            };

            res.json({ message: 'Authentication successful', user });
        } else {
            // No user found, authentication failed
            res.status(401).json({ message: 'Invalid email or password' });
        }
    });
});



// Endpoint to get all sites data
app.get('/api/data', (req, res) => {
    pool.query('SELECT * FROM lsdata', (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        res.json(results);
    });
});

// Endpoint to calculate and update the 'Total Load shedding (MINS)' column
app.get('/api/calculatedData', (req, res) => {
    pool.query('SELECT * FROM lsdata', (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        // Calculate the 'Total Load shedding (MINS)' column
        const processedResults = results.map(row => {
            const LV = parseFloat(row.LV);
            const SOB = parseFloat(row.SOB);
            const GRM = parseFloat(row.GRM);
            const MF = parseFloat(row.MF);

            // Handle '-' case for columns
            const lvValue = LV === '-' || LV === null || LV === undefined || isNaN(Number(LV)) ? 0 : LV;
            const sobValue = SOB === '-' || SOB === null || SOB === undefined || isNaN(Number(SOB)) ? 0 : SOB;
            const grmValue = GRM === '-' || GRM === null || GRM === undefined || isNaN(Number(GRM)) ? 0 : GRM;
            const mfValue = MF === '-' || MF === null || MF === undefined || isNaN(Number(MF)) ? 0 : MF;

            // Check if MF is '-' or null or undefined
            if (mfValue === 0) {
                // If both LV and SOB data values are available
                if (lvValue !== null && sobValue !== null) {
                    // Compare LV and SOB values
                    row['Total Load shedding (MINS)'] = parseFloat((lvValue >= sobValue ? lvValue + grmValue : sobValue + grmValue).toFixed(2));
                } else if (lvValue !== null && sobValue === null) {
                    // If only LV is available
                    row['Total Load shedding (MINS)'] = parseFloat((lvValue + grmValue).toFixed(2));
                } else if (sobValue !== null && lvValue === null) {
                    // If only SOB is available
                    row['Total Load shedding (MINS)'] = parseFloat((sobValue + grmValue).toFixed(2));
                } else {
                    // If neither LV nor SOB is available, set 'Total Load shedding (MINS)' to null
                    row['Total Load shedding (MINS)'] = parseFloat(grmValue.toFixed(2));
                }
            } else {
                // If 'MF' is a numerical value, use it as 'Total Load shedding (MINS)'
                row['Total Load shedding (MINS)'] = parseFloat(mfValue.toFixed(2));
            }

            // Add the 'Total Load Shedding (HRS)' column in hours
            row['Total Load Shedding (HRS)'] = parseFloat((row['Total Load shedding (MINS)'] / 60).toFixed(2));

            row['System On Electricity (HRS)'] = parseFloat((24 - (row['Total Load shedding (MINS)'] / 60)).toFixed(2));

            row['Units Consumption'] = row['System On Electricity (HRS)'] * 2;

            row['Electricity Bill'] = parseFloat((row['Units Consumption'] * 8.5).toFixed(2));

            return row;
        });

        res.json(processedResults);
    });
});



app.get('/api/mainRegionsTableData', (req, res) => {
    const { from, to } = req.query;

    if (!from || !to) {
        res.status(400).json({ error: 'Both "from" and "to" parameters are required' });
        return;
    }

    const selectQuery = `
        SELECT *, STR_TO_DATE(Date, '%d-%b-%Y') AS formattedDate 
        FROM mainregions 
        WHERE STR_TO_DATE(Date, '%d-%b-%Y') BETWEEN STR_TO_DATE(${pool.escape(from)}, '%Y-%m-%d') 
                                                AND STR_TO_DATE(${pool.escape(to)}, '%Y-%m-%d')
    `;

    pool.query(selectQuery, (err, results) => {
        if (err) {
            console.error('Error executing select query:', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        res.json(results);
    });
});

app.get('/api/calculatedMainRegionsData', (req, res) => {
    const { from, to } = req.query;
    if (!from || !to) {
        res.status(400).json({ error: 'Both "from" and "to" parameters are required' });
        return;
    }
    let selectQuery = 'SELECT * FROM mainregions';

    if (from && to) {
        selectQuery += ` WHERE STR_TO_DATE(Date, '%d-%b-%Y') BETWEEN STR_TO_DATE(${pool.escape(from)}, '%Y-%m-%d') 
                                                        AND STR_TO_DATE(${pool.escape(to)}, '%Y-%m-%d')`;
    }

    pool.query(selectQuery, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        const processedResults = results.map(row => {
            // Loop through each column (except 'Date') to calculate related fields
            Object.keys(row).forEach(key => {
                if (key !== 'Date' && !isNaN(row[key])) {
                    const onElectricityHRS = parseFloat((24 - row[key]).toFixed(2));
                    const units = parseFloat((onElectricityHRS * 2).toFixed(2));
                    const bill = parseFloat((units * 8.5).toFixed(2));

                    row[`${key} On Electricity (HRS)`] = onElectricityHRS;
                    row[`${key} Units`] = units;
                    row[`${key} Bill`] = bill;
                }
            });

            // Filter and get keys that represent the original columns in the 'mainregions' table
            const originalColumns = Object.keys(row).filter(key => !key.includes(' On Electricity (HRS)') && !key.includes(' Units') && !key.includes(' Bill'));

            // Calculate Total Load Shedding (HRS) for original columns only
            const totalLoadShedding = originalColumns
                .filter(key => !isNaN(row[key]) && typeof row[key] === 'number')
                .reduce((acc, key) => acc + row[key], 0);

            const mrOnElectricity = Object.keys(row)
                .filter(key => key.includes(' On Electricity (HRS)'))
                .reduce((acc, key) => acc + row[key], 0);

            const mrUnitsConsumption = Object.keys(row)
                .filter(key => key.includes(' Units'))
                .reduce((acc, key) => acc + row[key], 0);

            const mrBill = Object.keys(row)
                .filter(key => key.includes(' Bill'))
                .reduce((acc, key) => acc + row[key], 0);

            row['Total Load Shedding (HRS)'] = parseFloat((totalLoadShedding).toFixed(2));
            row['System On Electricity (HRS)'] = parseFloat((mrOnElectricity).toFixed(2));
            row['Units Consumption'] = parseFloat((mrUnitsConsumption).toFixed(2));
            row['Electricity Bill'] = parseFloat((mrBill).toFixed(2));

            return row;
        });

        res.json(processedResults);
    });
});

app.get('/api/mainRegionsTableData/column/:columnName', (req, res) => {
    const columnName = req.params.columnName;
    const { from, to } = req.query;

    const selectQuery = `
        SELECT Date, \`${columnName}\`
        FROM mainregions
        WHERE STR_TO_DATE(Date, '%d-%b-%Y') BETWEEN STR_TO_DATE(${pool.escape(from)}, '%Y-%m-%d') 
                                                AND STR_TO_DATE(${pool.escape(to)}, '%Y-%m-%d')
    `;

    pool.query(selectQuery, (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        const columnData = results.map(row => ({
            Date: row.Date,
            [columnName]: row[columnName]
        }));

        res.json(columnData);
    });
});
    


app.get('/api/comercialRegionsTableData', (req, res) => {
    const { from, to } = req.query;

    if (!from || !to) {
        res.status(400).json({ error: 'Both "from" and "to" parameters are required' });
        return;
    }

    const selectQuery = `
        SELECT *, STR_TO_DATE(Date, '%d-%b-%Y') AS formattedDate 
        FROM comercialregiondata 
        WHERE STR_TO_DATE(Date, '%d-%b-%Y') BETWEEN STR_TO_DATE(${pool.escape(from)}, '%Y-%m-%d') 
                                                AND STR_TO_DATE(${pool.escape(to)}, '%Y-%m-%d')
    `;

    pool.query(selectQuery, (err, results) => {
        if (err) {
            console.error('Error executing select query:', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        res.json(results);
    });
});


app.get('/api/calculatedComercialRegionsData', (req, res) => {
    const { from, to } = req.query;
    if (!from || !to) {
        res.status(400).json({ error: 'Both "from" and "to" parameters are required' });
        return;
    }
    let selectQuery = 'SELECT * FROM comercialregiondata';

    if (from && to) {
        selectQuery += ` WHERE STR_TO_DATE(Date, '%d-%b-%Y') BETWEEN STR_TO_DATE(${pool.escape(from)}, '%Y-%m-%d') 
                                                        AND STR_TO_DATE(${pool.escape(to)}, '%Y-%m-%d')`;
    }

    pool.query(selectQuery, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        const processedResults = results.map(row => {
            // Loop through each column (except 'Date') to calculate related fields
            Object.keys(row).forEach(key => {
                if (key !== 'Date' && !isNaN(row[key])) {
                    const onElectricityHRS = parseFloat((24 - row[key]).toFixed(2));
                    const units = parseFloat((onElectricityHRS * 2).toFixed(2));
                    const bill = parseFloat((units * 8.5).toFixed(2));

                    row[`${key} On Electricity (HRS)`] = onElectricityHRS;
                    row[`${key} Units`] = units;
                    row[`${key} Bill`] = bill;
                }
            });

            // Filter and get keys that represent the original columns in the 'mainregions' table
            const originalColumns = Object.keys(row).filter(key => !key.includes(' On Electricity (HRS)') && !key.includes(' Units') && !key.includes(' Bill'));

            // Calculate Total Load Shedding (HRS) for original columns only
            const totalLoadShedding = originalColumns
                .filter(key => !isNaN(row[key]) && typeof row[key] === 'number')
                .reduce((acc, key) => acc + row[key], 0);;

            const mrOnElectricity = Object.keys(row)
                .filter(key => key.includes(' On Electricity (HRS)'))
                .reduce((acc, key) => acc + row[key], 0);

            const mrUnitsConsumption = Object.keys(row)
                .filter(key => key.includes(' Units'))
                .reduce((acc, key) => acc + row[key], 0);

            const mrBill = Object.keys(row)
                .filter(key => key.includes(' Bill'))
                .reduce((acc, key) => acc + row[key], 0);

            row['Total Load Shedding (HRS)'] = parseFloat((totalLoadShedding).toFixed(2));
            row['System On Electricity (HRS)'] = parseFloat((mrOnElectricity).toFixed(2));
            row['Units Consumption'] = parseFloat((mrUnitsConsumption).toFixed(2));
            row['Electricity Bill'] = parseFloat((mrBill).toFixed(2));

            return row;
        });

        res.json(processedResults);
    });
});

app.get('/api/comercialRegionsTableData/column/:columnName', (req, res) => {
    const columnName = req.params.columnName;
    const { from, to } = req.query;

    const selectQuery = `
        SELECT Date, \`${columnName}\`
        FROM comercialregiondata
        WHERE STR_TO_DATE(Date, '%d-%b-%Y') BETWEEN STR_TO_DATE(${pool.escape(from)}, '%Y-%m-%d') 
                                                AND STR_TO_DATE(${pool.escape(to)}, '%Y-%m-%d')
    `;

    pool.query(selectQuery, (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        const columnData = results.map(row => ({
            Date: row.Date,
            [columnName]: row[columnName]
        }));

        res.json(columnData);
    });
});


app.get('/api/mbusTableData', (req, res) => {
    const { from, to } = req.query;

    if (!from || !to) {
        res.status(400).json({ error: 'Both "from" and "to" parameters are required' });
        return;
    }

    const selectQuery = `
        SELECT *, STR_TO_DATE(Date, '%d-%b-%Y') AS formattedDate 
        FROM mbudata 
        WHERE STR_TO_DATE(Date, '%d-%b-%Y') BETWEEN STR_TO_DATE(${pool.escape(from)}, '%Y-%m-%d') 
                                                AND STR_TO_DATE(${pool.escape(to)}, '%Y-%m-%d')
    `;

    pool.query(selectQuery, (err, results) => {
        if (err) {
            console.error('Error executing select query:', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        res.json(results);
    });
});

app.get('/api/calculatedMbusData', (req, res) => {
    const { from, to } = req.query;
    if (!from || !to) {
        res.status(400).json({ error: 'Both "from" and "to" parameters are required' });
        return;
    }
    let selectQuery = 'SELECT * FROM mbudata';

    if (from && to) {
        selectQuery += ` WHERE STR_TO_DATE(Date, '%d-%b-%Y') BETWEEN STR_TO_DATE(${pool.escape(from)}, '%Y-%m-%d') 
                                                        AND STR_TO_DATE(${pool.escape(to)}, '%Y-%m-%d')`;
    }

    pool.query(selectQuery, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        const processedResults = results.map(row => {
            // Loop through each column (except 'Date') to calculate related fields
            Object.keys(row).forEach(key => {
                if (key !== 'Date' && !isNaN(row[key])) {
                    const onElectricityHRS = parseFloat((24 - row[key]).toFixed(2));
                    const units = parseFloat((onElectricityHRS * 2).toFixed(2));
                    const bill = parseFloat((units * 8.5).toFixed(2));

                    row[`${key} On Electricity (HRS)`] = onElectricityHRS;
                    row[`${key} Units`] = units;
                    row[`${key} Bill`] = bill;
                }
            });

            // Filter and get keys that represent the original columns in the 'mainregions' table
            const originalColumns = Object.keys(row).filter(key => !key.includes(' Bill'));

            // Calculate Total Load Shedding (HRS) for original columns only
            const totalLoadShedding = originalColumns
                .filter(key => !isNaN(row[key]) && typeof row[key] === 'number')
                .reduce((acc, key) => acc + row[key], 0);

            const mrOnElectricity = Object.keys(row)
                .filter(key => key.includes(' On Electricity (HRS)'))
                .reduce((acc, key) => acc + row[key], 0);

            const mrUnitsConsumption = Object.keys(row)
                .filter(key => key.includes(' Units'))
                .reduce((acc, key) => acc + row[key], 0);

            const mrBill = Object.keys(row)
                .filter(key => key.includes(' Bill'))
                .reduce((acc, key) => acc + row[key], 0);

            row['Total Load Shedding (HRS)'] = parseFloat((totalLoadShedding).toFixed(2));
            row['System On Electricity (HRS)'] = parseFloat((mrOnElectricity).toFixed(2));
            row['Units Consumption'] = parseFloat((mrUnitsConsumption).toFixed(2));
            row['Electricity Bill'] = parseFloat((mrBill).toFixed(2));

            return row;
        });

        res.json(processedResults);
    });
});

app.get('/api/mbusTableData/column/:columnName', (req, res) => {
    const columnName = req.params.columnName;
    const { from, to } = req.query;

    const selectQuery = `
        SELECT Date, \`${columnName}\`
        FROM mbudata
        WHERE STR_TO_DATE(Date, '%d-%b-%Y') BETWEEN STR_TO_DATE(${pool.escape(from)}, '%Y-%m-%d') 
                                                AND STR_TO_DATE(${pool.escape(to)}, '%Y-%m-%d')
    `;

    pool.query(selectQuery, (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        const columnData = results.map(row => ({
            Date: row.Date,
            [columnName]: row[columnName]
        }));

        res.json(columnData);
    });
});

// Endpoint to get calculated data for graph
app.get('/api/dataForGraph', (req, res) => {
    pool.query('SELECT `Site Code`, `Total Load shedding (MINS)` FROM lsdata', (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        res.json(results);
    });
});

// Fetch Data of MBUS
app.get('/api/mbusData', (req, res) => {
    const { column } = req.query; // Assuming the user will send the column name as a query parameter

    if (!column) {
        res.status(400).json({ error: 'Column name is required' });
        return;
    }

    const query = `SELECT YEAR(STR_TO_DATE(Date, '%d-%b-%y')) AS Year, 
                        MONTH(STR_TO_DATE(Date, '%d-%b-%y')) AS Month, 
                        SUM(${pool.escapeId(column)}) AS Total 
                   FROM mbudata 
                   WHERE STR_TO_DATE(Date, '%d-%b-%y') IS NOT NULL 
                   GROUP BY Year, Month`;

    pool.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        res.json(results);
    });
});

// MBUS Column Selector
app.get('/api/mbusData/columns', (req, res) => {
    pool.query(`SHOW COLUMNS FROM mbudata WHERE Field != 'Date'`, (err, results) => {
        if (err) {
            console.error('Error fetching column names:', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        const columnNames = results.map(row => row.Field);
        console.log(columnNames);
        res.json(columnNames);
    });
});

// Fetch Data of Comercial Regian
app.get('/api/comercialRegionData', (req, res) => {
    const { column } = req.query; // Assuming the user will send the column name as a query parameter

    if (!column) {
        res.status(400).json({ error: 'Column name is required' });
        return;
    }

    const query = `SELECT YEAR(STR_TO_DATE(Date, '%d-%b-%y')) AS Year, 
                        MONTH(STR_TO_DATE(Date, '%d-%b-%y')) AS Month, 
                        SUM(${pool.escapeId(column)}) AS Total 
                   FROM comercialregiondata 
                   WHERE STR_TO_DATE(Date, '%d-%b-%y') IS NOT NULL 
                   GROUP BY Year, Month`;

    pool.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        res.json(results);
    });
});

// app.get('/api/comercialRegionDataSort', (req, res) => {
//     const { column } = req.query; // Assuming the user will send the column name as a query parameter

//     if (!column) {
//         res.status(400).json({ error: 'Column name is required' });
//         return;
//     }

//     const query = `SELECT YEAR(STR_TO_DATE(Date, '%d-%b-%y')) AS Year, 
//                         MONTH(STR_TO_DATE(Date, '%d-%b-%y')) AS Month, 
//                         SUM(${pool.escapeId(column)}) AS Total 
//                    FROM comercialregiondata 
//                    WHERE STR_TO_DATE(Date, '%d-%b-%y') IS NOT NULL 
//                    GROUP BY Year, Month 
//                    ORDER BY Total DESC`; // Order by Total in descending order

//     pool.query(query, (err, results) => {
//         if (err) {
//             console.error('Error executing query:', err);
//             res.status(500).json({ error: 'Internal Server Error' });
//             return;
//         }

//         res.json(results);
//     });
// });


//  Comercial Regian Column Selector

app.get('/api/comercialRegionData/columns', (req, res) => {
    pool.query(`SHOW COLUMNS FROM comercialregiondata WHERE Field != 'Date'`, (err, results) => {
        if (err) {
            console.error('Error fetching column names:', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        const columnNames = results.map(row => row.Field);
        res.json(columnNames);
    });
});

// Fetch Data of Main Regions
app.get('/api/mainregions', (req, res) => {
    const { column } = req.query; // Assuming the user will send the column name as a query parameter

    if (!column) {
        res.status(400).json({ error: 'Column name is required' });
        return;
    }

    const query = `SELECT YEAR(STR_TO_DATE(Date, '%d-%b-%y')) AS Year, 
                        MONTH(STR_TO_DATE(Date, '%d-%b-%y')) AS Month, 
                        SUM(${pool.escapeId(column)}) AS Total 
                   FROM mainregions 
                   WHERE STR_TO_DATE(Date, '%d-%b-%y') IS NOT NULL 
                   GROUP BY Year, Month`;

    pool.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        res.json(results);
    });
});

// Main Regions Column Selector
app.get('/api/mainregions/columns', (req, res) => {
    pool.query(`SHOW COLUMNS FROM mainregions WHERE Field != 'Date'`, (err, results) => {
        if (err) {
            console.error('Error fetching column names:', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        const columnNames = results.map(row => row.Field);
        console.log(columnNames);
        res.json(columnNames);
    });
});

app.post('/api/uploadFile', upload.single('file'), (req, res) => {
    // Assuming the 'file' parameter is the name of the field in the form data

    // Access uploaded file details
    const uploadedFile = req.file;

    if (!uploadedFile) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    // Handle saving the file details to your database
    // For example, if you have a 'files' table in your database:
    const { originalname, filename, path } = uploadedFile;

    // Save the file details to your MySQL database
    const insertQuery = 'INSERT INTO files (original_name, file_name, file_path) VALUES (?, ?, ?)';
    pool.query(insertQuery, [originalname, filename, path], (err, result) => {
        if (err) {
            console.error('Error saving file details:', err);
            return res.status(500).json({ error: 'Error saving file to the database' });
        }

        return res.status(200).json({ message: 'File uploaded and details saved to the database' });
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

