import React from 'react';
import { Line } from 'react-chartjs-2';

interface TimeSeriesGraphProps {
  data: { [key: string]: number };
  symbol: string;
}

const TimeSeriesGraph: React.FC<TimeSeriesGraphProps> = ({ data, symbol }) => {
  const chartData = {
    labels: Object.keys(data),
    datasets: [
      {
        label: symbol,
        data: Object.values(data),
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)',
      },
    ],
  };

  // const options = {
  //   scales: {
  //     x: {
  //       type: 'time',
  //       time: {
  //         unit: 'day',
  //       },
  //     },
  //     y: {
  //       beginAtZero: true,
  //     },
  //   },
  // };

  return (
    <div>
      <h2>{symbol.toUpperCase()} Time Series Graph</h2>
      <Line data={chartData}/>
    </div>
  );
};

export default TimeSeriesGraph;
