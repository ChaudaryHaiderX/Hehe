import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './DataDisplay.css';

const DataDisplay = () => {
    const [originalData, setOriginalData] = useState([]);
    const [calculatedData, setCalculatedData] = useState([]);
    const [showOriginal, setShowOriginal] = useState(false);
    const [showCalculatedBill, setShowCalculatedBill] = useState(false);
    const [showCalculatedData, setShowCalculatedData] = useState(true);

    const [showMainRegion, setShowMainRegion] = useState(false);
    const [mainRegionColumns, setMainRegionColumns] = useState([]);
    const [selectedMainRegionColumn, setSelectedMainRegionColumn] = useState('Main Region');
    const [mainRegionData, setMainRegionData] = useState([]);

    const [showComRegion, setShowComRegion] = useState(false);
    const [comRegionColumns, setComRegionColumns] = useState([]);
    const [selectedComRegionColumn, setSelectedComRegionColumn] = useState('Comercial Region');
    const [comRegionData, setComRegionData] = useState([]);

    const [showMbu, setShowMbu] = useState(false);
    const [mbuColumns, setMbuColumns] = useState([]);
    const [selectedMbuColumn, setSelectedMbuColumn] = useState('Mbu');
    const [mbuData, setMbuData] = useState([]);

    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    useEffect(() => {
        fetchOriginalData();
        fetchCalculatedData();
        fetchMainRegionColumns();
        fetchComRegionColumns();
        fetchMbuColumns();
    }, []);

    const fetchOriginalData = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/data');
            setOriginalData(response.data);
        } catch (error) {
            console.error('Error fetching original data:', error);
        }
    };

    const fetchCalculatedData = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/calculatedData');
            setCalculatedData(response.data);
        } catch (error) {
            console.error('Error fetching calculated data:', error);
        }
    };

    const fetchMainRegionColumns = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/mainregions/columns');
            setMainRegionColumns(['Main Region', ...response.data]);
        } catch (error) {
            console.error('Error fetching Main Region columns:', error);
        }
    };

    const fetchComRegionColumns = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/comercialRegionData/columns');
            setComRegionColumns(['Comercial Region', ...response.data]);
        } catch (error) {
            console.error('Error fetching Comercial Region columns:', error);
        }
    };

    const fetchMbuColumns = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/mbusData/columns');
            setMbuColumns(['Mbu', ...response.data]);
        } catch (error) {
            console.error('Error fetching Mbu columns:', error);
        }
    };

    const handleShowMainRegion = async () => {
        try {
            let response;

            if (selectedMainRegionColumn === 'Main Region') {
                response = await axios.get('http://localhost:3001/api/mainRegionsTableData', {
                    params: { from: fromDate, to: toDate }
                });
            } else {
                response = await axios.get(`http://localhost:3001/api/mainRegionsTableData/column/${selectedMainRegionColumn}`, {
                    params: { from: fromDate, to: toDate }
                });
            }

            setMainRegionData(response.data);
            setShowMainRegion(true);
            setShowOriginal(false);
            setShowComRegion(false);
            setShowMbu(false);
            setShowCalculatedBill(false);
            setShowCalculatedData(false);
        } catch (error) {
            console.error('Error fetching main region data:', error);
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
            setShowOriginal(false);
            setShowMainRegion(false);
            setShowMbu(false);
            setShowCalculatedBill(false);
            setShowCalculatedData(false);
        } catch (error) {
            console.error('Error fetching main region data:', error);
        }
    };

    const handleShowMbu = async () => {
        try {
            let response;

            if (selectedMbuColumn === 'Mbu') {
                response = await axios.get('http://localhost:3001/api/mbusTableData', {
                    params: { from: fromDate, to: toDate }
                });
            } else {
                response = await axios.get(`http://localhost:3001/api/mbusTableData/column/${selectedMbuColumn}`, {
                    params: { from: fromDate, to: toDate }
                });
            }

            setMbuData(response.data);
            setShowMbu(true);
            setShowComRegion(false);
            setShowOriginal(false);
            setShowMainRegion(false);
            setShowCalculatedBill(false);
            setShowCalculatedData(false);
        } catch (error) {
            console.error('Error fetching main region data:', error);
        }
    };

    const handleColumnChange = (selectedColumn) => {
        setSelectedMainRegionColumn(selectedColumn);
        setSelectedComRegionColumn(selectedColumn);
        setSelectedMbuColumn(selectedColumn);
    };

    const handleShowCalculatedBill = () => {
        setShowOriginal(false);
        setShowCalculatedData(false);
        setShowCalculatedBill(true);
        setShowMainRegion(false);
        setShowComRegion(false);
        setShowMbu(false);
    };

    const handleShowOriginalData = () => {
        setShowOriginal(true);
        setShowCalculatedData(false);
        setShowCalculatedBill(false);
        setShowMainRegion(false);
        setShowComRegion(false);
        setShowMbu(false);
    };

    const handleShowCalculatedData = () => {
        setShowOriginal(false);
        setShowCalculatedBill(false);
        setShowCalculatedData(true);
        setShowMainRegion(false);
        setShowComRegion(false);
        setShowMbu(false);
    };

    return (
        <div className='lsData'>
            <div className="buttons">
                <button onClick={handleShowCalculatedData}>Show Calculated Data</button>
                <button onClick={handleShowOriginalData}>Show Original Data</button>
                <button onClick={handleShowCalculatedBill}>Show Calculated Bill</button>

                <div>
                    <select value={selectedMainRegionColumn} onChange={(e) => handleColumnChange(e.target.value)}>
                        {mainRegionColumns.map((column, index) => (
                            <option key={index} value={column}>
                                {column}
                            </option>
                        ))}
                    </select>
                    <button onClick={handleShowMainRegion}>Apply Filter</button>
                </div>

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

                <div>
                    <select value={selectedMbuColumn} onChange={(e) => handleColumnChange(e.target.value)}>
                        {mbuColumns.map((column, index) => (
                            <option key={index} value={column}>
                                {column}
                            </option>
                        ))}
                    </select>
                    <button onClick={handleShowMbu}>Apply Filter</button>
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
                    {showCalculatedBill && (
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Site Code</th>
                                    <th>Major City</th>
                                    <th>Prime</th>
                                    <th>OSV</th>
                                    <th>Region</th>
                                    <th>Comm Region</th>
                                    <th>Commercial with Split</th>
                                    <th>Zone</th>
                                    <th>Vendor</th>
                                    <th>MBU</th>
                                    <th>Units Consumption</th>
                                    <th>Electricity Bill</th>
                                </tr>
                            </thead>
                            <tbody>
                                {calculatedData.map((row, index) => (
                                    <tr key={index}>
                                        <td>{row.Date}</td>
                                        <td>{row['Site Code']}</td>
                                        <td>{row['Major City']}</td>
                                        <td>{row.Prime}</td>
                                        <td>{row.OSV}</td>
                                        <td>{row.Region}</td>
                                        <td>{row['Comm Region']}</td>
                                        <td>{row['Commercial with Split']}</td>
                                        <td>{row.Zone}</td>
                                        <td>{row.Vendor}</td>
                                        <td>{row.MBU}</td>
                                        <td>{row['Units Consumption']}</td>
                                        <td>{row['Electricity Bill']}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    {showOriginal && (
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Site Code</th>
                                    <th>Major City</th>
                                    <th>Prime</th>
                                    <th>OSV</th>
                                    <th>Region</th>
                                    <th>Comm Region</th>
                                    <th>Commercial with Split</th>
                                    <th>Zone</th>
                                    <th>Vendor</th>
                                    <th>MBU</th>
                                    <th>SOB</th>
                                    <th>LV</th>
                                    <th>GRM</th>
                                    <th>MF</th>
                                    <th>Total Load shedding (MINS)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {originalData.map((row, index) => (
                                    <tr key={index}>
                                        <td>{row.Date}</td>
                                        <td>{row['Site Code']}</td>
                                        <td>{row['Major City']}</td>
                                        <td>{row.Prime}</td>
                                        <td>{row.OSV}</td>
                                        <td>{row.Region}</td>
                                        <td>{row['Comm Region']}</td>
                                        <td>{row['Commercial with Split']}</td>
                                        <td>{row.Zone}</td>
                                        <td>{row.Vendor}</td>
                                        <td>{row.MBU}</td>
                                        <td>{row.SOB}</td>
                                        <td>{row.LV}</td>
                                        <td>{row.GRM}</td>
                                        <td>{row.MF}</td>
                                        <td>{row['Total Load shedding (MINS)']}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    {showMbu && (
                        <table>
                            <thead>
                                <tr>
                                    {selectedMbuColumn === 'Mbu' ? (
                                        <>
                                            <th>Date</th>
                                            {mbuColumns
                                                .filter(column => column !== 'Mbu')
                                                .map((column, index) => (
                                                    <th key={index}>{column}</th>
                                                ))}
                                        </>
                                    ) : (
                                        <>
                                            <th>Date</th>
                                            <th>{selectedMbuColumn}</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {mbuData.map((row, index) => (
                                    <tr key={index}>
                                        {selectedMbuColumn === 'Mbu' ? (
                                            <>
                                                <td>{row.Date}</td>
                                                {mbuColumns
                                                    .filter(column => column !== 'Mbu')
                                                    .map((column, index) => (
                                                        <td key={index}>{row[column]}</td>
                                                    ))}
                                            </>
                                        ) : (
                                            <>
                                                <td>{row.Date}</td>
                                                <td>{row[selectedMbuColumn]}</td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    {showCalculatedData && (
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Site Code</th>
                                    <th>Major City</th>
                                    <th>Prime</th>
                                    <th>OSV</th>
                                    <th>Region</th>
                                    <th>Comm Region</th>
                                    <th>Commercial with Split</th>
                                    <th>Zone</th>
                                    <th>Vendor</th>
                                    <th>MBU</th>
                                    <th>SOB</th>
                                    <th>LV</th>
                                    <th>GRM</th>
                                    <th>MF</th>
                                    <th>Total Load shedding (MINS)</th>
                                    <th>Total Load Shedding (HRS)</th>
                                    <th>System On Electricity (HRS)</th>
                                    <th>Units Consumption</th>
                                    <th>Electricity Bill</th>
                                </tr>
                            </thead>
                            <tbody>
                                {calculatedData.map((row, index) => (
                                    <tr key={index}>
                                        <td>{row.Date}</td>
                                        <td>{row['Site Code']}</td>
                                        <td>{row['Major City']}</td>
                                        <td>{row.Prime}</td>
                                        <td>{row.OSV}</td>
                                        <td>{row.Region}</td>
                                        <td>{row['Comm Region']}</td>
                                        <td>{row['Commercial with Split']}</td>
                                        <td>{row.Zone}</td>
                                        <td>{row.Vendor}</td>
                                        <td>{row.MBU}</td>
                                        <td>{row.SOB}</td>
                                        <td>{row.LV}</td>
                                        <td>{row.GRM}</td>
                                        <td>{row.MF}</td>
                                        <td>{row['Total Load shedding (MINS)']}</td>
                                        <td>{row['Total Load Shedding (HRS)']}</td>
                                        <td>{row['System On Electricity (HRS)']}</td>
                                        <td>{row['Units Consumption']}</td>
                                        <td>{row['Electricity Bill']}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    {showMainRegion && (
                        <table>
                            <thead>
                                <tr>
                                    {selectedMainRegionColumn === 'Main Region' ? (
                                        <>
                                            <th>Date</th>
                                            {mainRegionColumns
                                                .filter(column => column !== 'Main Region')
                                                .map((column, index) => (
                                                    <th key={index}>{column}</th>
                                                ))}
                                        </>
                                    ) : (
                                        <>
                                            <th>Date</th>
                                            <th>{selectedMainRegionColumn}</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {mainRegionData.map((row, index) => (
                                    <tr key={index}>
                                        {selectedMainRegionColumn === 'Main Region' ? (
                                            <>
                                                <td>{row.Date}</td>
                                                {mainRegionColumns
                                                    .filter(column => column !== 'Main Region')
                                                    .map((column, index) => (
                                                        <td key={index}>{row[column]}</td>
                                                    ))}
                                            </>
                                        ) : (
                                            <>
                                                <td>{row.Date}</td>
                                                <td>{row[selectedMainRegionColumn]}</td>
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
