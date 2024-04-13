// import React, { useEffect } from 'react';
// import axios from 'axios';
// import { Chart as ChartJS } from 'chart.js/auto';
// import 'chartjs-plugin-zoom';
// import './charts.css';

// const LSChart = () => {
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await axios.get('http://localhost:3001/api/mbusData'); // Update the endpoint
//         const data = response.data;

//         // Extracting dates and load shedding data for chart
//         const dates = data.map(entry => entry['NEW MBU']);
//         const loadSheddingData = data.map(entry => entry['C1-LHR-01']);

//         const ctx = document.getElementById('myChart');

//         new ChartJS(ctx, {
//           type: 'bar',
//           data: {
//             labels: dates,
//             datasets: [{
//               label: 'Load Shedding (MINS)',
//               data: loadSheddingData,
//               backgroundColor: 'rgba(75, 192, 192, 0.2)',
//               borderColor: 'rgba(75, 192, 192, 1)',
//               borderWidth: 1
//             }]
//           },
//           options: {
//             indexAxis: 'x',
//             barPercentage: 10, // Adjust the width of the bars
//             categoryPercentage: 0.8,
//             scales: {
//               x: {
//                 ticks: {
//                   autoSkip: true,
//                   maxRotation: 0,
//                   padding: 10,
//                 },
//               },
//               y: {
//                 beginAtZero: true,
//               },
//             },
//           },
//           // ... Rest of your chart options
//         });     

//       } catch (error) {
//         console.error('Error fetching chart data:', error);
//       }
//     };

//     fetchData();
//   }, []);

//   return (
//     <div className='barChart' style={{ overflowX: 'auto', width: '100%' }}>
//       <canvas id="myChart"></canvas>
//     </div>
//   );
// };

// export default LSChart;

import React, { useEffect, useState } from "react";
import { Chart } from "react-google-charts";
import axios from 'axios';
import './ChartCss/barChart.css';

export default function BarChart() {
  const [chartData, setChartData] = useState([]);
  const [columnName, setColumnName] = useState('C1-LHR-01');
  const [columnNamesList, setColumnNamesList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/mbusData?column=${columnName}`);
        setChartData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (columnName) {
      fetchData();
    }
  }, [columnName]);

  useEffect(() => {
    const fetchColumns = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/mbusData/columns');
        setColumnNamesList(response.data);
        setColumnName(response.data[0]); // Set the default column name
      } catch (error) {
        console.error('Error fetching column names:', error);
      }
    };

    fetchColumns();
  }, []);

  const handleInputChange = (e) => {
    setColumnName(e.target.value);
  };

  const yearColors = {
    '2017': '#4285F4',
    '2018': '#34A853',
    '2019': '#FBBC05',
    // Add more years with respective colors here
  };

  const formattedData = [['Year', 'LoadShedding(HRS)', { role: 'style' }]];
  chartData.forEach(entry => {
    const yearMonth = `${entry.Year}-${entry.Month}`;
    formattedData.push([
      yearMonth,
      entry.Total,
      yearColors[entry.Year],
    ]);
  });

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
        <select value={columnName} onChange={handleInputChange}>
          {columnNamesList.map((name, index) => (
            <option key={index} value={name}>{name}</option>
          ))}
        </select>
      </div>
      <div className="chart">
        <Chart
          chartType="BarChart"
          width="110%"
          height="150%"
          data={formattedData}
          options={options}
        />
      </div>
    </div>

  );
}
