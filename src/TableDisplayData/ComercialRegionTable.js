import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../DataDisplay.css';

const DataDisplay = () => {

    const [showComRegion, setShowComRegion] = useState(false);
    const [comRegionColumns, setComRegionColumns] = useState([]);
    const [selectedComRegionColumn, setSelectedComRegionColumn] = useState('Comercial Region');
    const [comRegionData, setComRegionData] = useState([]);

    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    useEffect(() => {
        fetchComRegionColumns();
    }, []);

    const fetchComRegionColumns = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/comercialRegionData/columns');
            setComRegionColumns(['Comercial Region', ...response.data]);
        } catch (error) {
            console.error('Error fetching Main Region columns:', error);
        }
    };

    const handleShowComRegion = async () => {
        try {
            let response;

            if (selectedComRegionColumn === 'Comercial Region') {
                response = await axios.get('http://localhost:3001/api/comercialRegionsTableData', {
                    params: { from: fromDate, to: toDate }
                });
            } else {
                response = await axios.get(`http://localhost:3001/api/comercialRegionsTableData/column/${selectedComRegionColumn}`, {
                    params: { from: fromDate, to: toDate }
                });
            }

            setComRegionData(response.data);
            setShowComRegion(true);
        } catch (error) {
            console.error('Error fetching main region data:', error);
        }
    };

    const handleColumnChange = (selectedColumn) => {
        setSelectedComRegionColumn(selectedColumn);
    };


    return (
        <div className='lsData'>
            <div className="buttons">

                <div>
                    <select value={selectedComRegionColumn} onChange={(e) => handleColumnChange(e.target.value)}>
                        {comRegionColumns.map((column, index) => (
                            <option key={index} value={column}>
                                {column}
                            </option>
                        ))}
                    </select>
                    <button onClick={handleShowComRegion}>Apply Filter</button>
                </div>

            </div>

            <div className="dateInputs">
                {/* Date input fields */}
                <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                />
                <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                />
            </div>

            <div className="alignTable">
                <div className="tableData">
                    {showComRegion && (
                        <table>
                            <thead>
                                <tr>
                                    {selectedComRegionColumn === 'Comercial Region' ? (
                                        <>
                                            <th>Date</th>
                                            {comRegionColumns
                                                .filter(column => column !== 'Comercial Region')
                                                .map((column, index) => (
                                                    <th key={index}>{column}</th>
                                                ))}
                                        </>
                                    ) : (
                                        <>
                                            <th>Date</th>
                                            <th>{selectedComRegionColumn}</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {comRegionData.map((row, index) => (
                                    <tr key={index}>
                                        {selectedComRegionColumn === 'Comercial Region' ? (
                                            <>
                                                <td>{row.Date}</td>
                                                {comRegionColumns
                                                    .filter(column => column !== 'Comercial Region')
                                                    .map((column, index) => (
                                                        <td key={index}>{row[column]}</td>
                                                    ))}
                                            </>
                                        ) : (
                                            <>
                                                <td>{row.Date}</td>
                                                <td>{row[selectedComRegionColumn]}</td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

        </div>
    );
};

export default DataDisplay;
