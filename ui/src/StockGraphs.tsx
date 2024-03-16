import React from 'react';
import TimeSeriesGraph from './TimeSeriesGraph';
import { StockData } from './App';
import './App.css';



interface StockGraphsProps {
  stockData: StockData; // Assuming your data structure
}

// const StockGraphs: React.FC<StockGraphsProps> = ({ stockData }) => {
//   return (
//     <div>
//       {Object.entries(stockData).map(([symbol, data]) => (
//         <TimeSeriesGraph key={symbol} data={data} symbol={symbol} />
//       ))}
//     </div>
//   );
// };

const StockGraphs: React.FC<StockGraphsProps> = ({ stockData }) => {
  return (
    <div className="grid-container">
      {Object.entries(stockData).map(([symbol, data]) => (
        <TimeSeriesGraph key={symbol} data={data} symbol={symbol} />
      ))}
    </div>
  );
};


export default StockGraphs;
