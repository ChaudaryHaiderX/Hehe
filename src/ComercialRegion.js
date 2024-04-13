import React, { useEffect, useState } from "react";
import { Chart } from "react-google-charts";
import axios from 'axios';
import './ChartCss/barChart.css';

export default function BarChart() {
    // const [chartsData, setChartsData] = useState([]);
    const [columnsName, setColumnsName] = useState('Central 1');
    const [chartOf, setChartOf] = useState('comercialRegionData');
    const [columnsNamesList, setColumnsNamesList] = useState([]);
    const [sortedData, setSortedData] = useState([]);
    const [isSorted, setIsSorted] = useState(false);
    const [formattedData, setFormattedData] = useState([['Year', 'LoadShedding(HRS)', { role: 'style' }]]);


    const handleSortClick = () => {
        const sortedChartData = [...formattedData]; // Create a copy of the formatted data
        sortedChartData.sort((a, b) => b[1] - a[1]); // Sort the copy
        setSortedData(sortedChartData); // Store the sorted data separately
        setIsSorted(!isSorted); // Toggle isSorted state
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/api/${chartOf}?column=${columnsName}`);
                const yearColors = {
                    '2017': '#4285F4',
                    '2018': '#34A853',
                    '2019': '#FBBC05',
                    // Add more years with respective colors here
                };
                const updatedFormattedData = [['Year', 'LoadShedding(HRS)', { role: 'style' }]];
                response.data.forEach(entry => {
                    const yearMonth = `${entry.Year}-${entry.Month}`;
                    updatedFormattedData.push([
                        yearMonth,
                        entry.Total,
                        yearColors[entry.Year],
                    ]);
                });
                setFormattedData(updatedFormattedData); // Update formattedData with fetched data
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        if (columnsName) {
            fetchData();
        }
    }, [columnsName, chartOf]);

    useEffect(() => {
        const fetchColumns = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/api/${chartOf}/columns`);
                setColumnsNamesList(response.data);
                setColumnsName(response.data[0]); // Set the default column name
            } catch (error) {
                console.error('Error fetching column names:', error);
            }
        };

        fetchColumns();
    }, [chartOf]);

    const handleChartChange = (e) => {
        setChartOf(e.target.value);
    };

    const handleInputChange = (e) => {
        setColumnsName(e.target.value);
    };

    const options = {
        chart: {
            title: "Company Performance",
            subtitle: "Load Shedding for each month of each year",
        },
        legend: 'none', // Hide legend to prevent duplicate legend items
        series: {
            0: { // This represents the first series (bar)
                bar: {
                    groupWidth: '90%', // Adjusts width of bars
                },
                // Adjust the space between bars
                // You can use values between 0 to 1 for spacing
                // For example, setting it to 0.5 will provide 50% space between bars
                spacing: 0.5,
            },
        },
        chartArea: {  // Adjust chart area to remove extra space
            left: '11%',
            right: '1%',
            top: '1%',
            bottom: '1%',
            width: '70%',
            height: '70%',
        },
        margin: 'auto', // Center the chart horizontally
    };

    return (
        <div className="container">
            <div className="input">

                <div className="chartSelector">
                    <select value={chartOf} onChange={handleChartChange}>
                        <option value="comercialRegionData">Commercial Region Data</option>
                        <option value="mbusData">Mbus Data</option>
                        <option value="mainregions">Main Regions Data</option>
                    </select>
                </div>

                <div className="columnSelector">
                    <select value={columnsName} onChange={handleInputChange}>
                        {columnsNamesList.map((name, index) => (
                            <option key={index} value={name}>{name}</option>
                        ))}
                    </select>
                </div>

                <button onClick={handleSortClick}>
                    {isSorted ? 'Original Data' : 'Sort Descending'}
                </button>
            </div>
            <div className="chart">
                <Chart
                    chartType="BarChart"
                    width="100%"
                    height="150%"
                    data={isSorted ? sortedData : formattedData}
                    options={options}
                />
            </div>
        </div>

    );
}