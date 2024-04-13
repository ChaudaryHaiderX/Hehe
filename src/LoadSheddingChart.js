import React, { useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS } from 'chart.js/auto';
import 'chartjs-plugin-zoom';
import './charts.css';

const LSChart = () => {
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/dataForGraph');
        const data = response.data;

        const siteCodes = data.map(entry => entry['Site Code']);
        const loadSheddingMins = data.map(entry => entry['Total Load shedding (MINS)']);

        const ctx = document.getElementById('myChart');

        new ChartJS(ctx, {
          type: 'bar',
          data: {
            labels: siteCodes,
            datasets: [{
              label: 'Total Load Shedding (MINS)',
              data: loadSheddingMins,
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1
            }]
          },
          options: {
            chart: {
              type: 'bar',
              // Other chart options
            },
            indexAxis: 'x',
            barPercentage: 80, // Adjust the width of the bars
            categoryPercentage: 0.9,
            xAxis: {
              categories: ['Category 1', 'Category 2', 'Category 3'],
              tickInterval: 10, // Set the interval between ticks to 1 unit
              // Other xAxis options
            },
            plotOptions: {
              series: {
                groupPadding: 10, // Adjust the padding between groups of bars
                pointPadding: 1, // Adjust the padding between bars within a group
                // Other plot options
              }
            },
            plugins: {
              zoom: {
                pan: {
                  enabled: true,
                  mode: 'x',
                  rangeMin: { x: null },
                  rangeMax: { x: null },
                },
                zoom: {
                  wheel: {
                    enabled: true,
                  },
                  pinch: {
                    enabled: true,
                  },
                  mode: 'x',
                  rangeMin: { x: null },
                  rangeMax: { x: null },
                },
                limits: {
                  x: {
                    min: 0, // Adjust the minimum range for x-axis
                    max: 10,
                    minRange: 10,

                  },
                },
              },
            },
            scales: {
              x: {
                ticks: {
                  autoSkip: true,
                  maxRotation: 0,
                  padding: 10,
                },
                min: 0,
                max: siteCodes.length,
              },
              y: {
                beginAtZero: true,
              },
            },
          },
        });


      } catch (error) {
        console.error('Error fetching chart data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className='barChart' style={{ overflowX: 'auto', width: '50%' }}>
      <canvas id="myChart"></canvas>
    </div>
  );
};

export default LSChart;
