import React, { useEffect, useState } from 'react';
import './App.css';
import { io, Socket } from 'socket.io-client';
import { Doughnut, Pie } from 'react-chartjs-2';
import { Chart, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Legend } from 'chart.js'
import { ChartOptions } from 'chart.js/auto'; // Importing ChartOptions might be necessary for proper typing
import _debounce from 'lodash/debounce';
import StockGraphs from './StockGraphs';



// Register required chart elements and scales
Chart.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Legend
);
// Chart.register(ArcElement);
// Chart.registerScale('category', Chart.scale.CategoryScale);


interface TickerInfo {
  symbol: string;
  price: number;
  stocksHeld: number;
  totalValue: () => number;
}

export type StockData = {
  [symbol: string]: {
    [date: string]: number;
  };
};

const App: React.FC = () => {
  const [tickers, setTickers] = useState<TickerInfo[]>([
    { symbol: 'AAPL', price: 0, stocksHeld: 0, totalValue() { return this.stocksHeld * this.price; } },
    { symbol: 'MSFT', price: 0, stocksHeld: 0, totalValue() { return this.stocksHeld * this.price; } },
    { symbol: 'ORCL', price: 0, stocksHeld: 0, totalValue() { return this.stocksHeld * this.price; } },
    { symbol: 'TSLA', price: 0, stocksHeld: 0, totalValue() { return this.stocksHeld * this.price; } },
  ]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [timeData, setTimeData] = useState<any>(null);


  function checkProperties(stockData: StockData) {
    for (var key in stockData) {
        if (!stockData[key]) {
          return false;
        }
    }
    return true;
  }
  useEffect(() => {
    const newSocket = io('http://127.0.0.1:5000');
    setSocket(newSocket);

    newSocket.on('latest_prices', (latestPrices: Record<string, { latest_price: number }>) => {
      console.log(latestPrices)
      setTickers(prevTickers => prevTickers.map(ticker => ({
        ...ticker,
        price: latestPrices[ticker.symbol.toLowerCase()]?.latest_price || 0,
      })));
    });

    updateChartData(); // Call a function to update the chart data
    updateTimeSeriesData(); // get time series for new symbol


    newSocket.on('prices_over_time', (timeSeriesData: StockData) => {
      console.log('series - ', timeSeriesData)
      // const isValidTimeSeries = Object.values(timeSeriesData).every(x !== null)
      if (checkProperties(timeSeriesData)) {
        setTimeData(timeSeriesData);
      }
    })
 

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const debouncedUpdateTickerSymbols = _debounce((symbols: string[]) => {
    socket?.emit('update_ticker_symbols', symbols);
    updateTimeSeriesData(); // get time series for new symbol
  }, 500); // Adjust the debounce delay as needed

  const handleTickerSymbolChange = (index: number, value: string) => {
    const newTickers = [...tickers];
    newTickers[index].symbol = value.toUpperCase();
    setTickers(newTickers);
  
    // Update the chart data when ticker symbols change
    updateChartData();
    console.log('handling change');
      // Emit updated symbols to the WebSocket

    updateTickerSymbols();
    // const symbols = newTickers.map(ticker => ticker.symbol.toLowerCase());
    // socket?.emit('update_ticker_symbols', symbols);

  };

  const portfolioTotal = tickers.reduce((partial, ticker) => partial + ticker.totalValue(), 0)
  useEffect(() => {
    updateChartData(); // Call a function to update the chart data
  }, [tickers]);

  const updateTickerSymbols = () => {
    const symbols = tickers.map(ticker => ticker.symbol.toLowerCase());
    debouncedUpdateTickerSymbols(symbols);

    // socket?.emit('update_ticker_symbols', symbols);
    console.log('updated ticker symbols - ', symbols);
  };

  const updateTimeSeriesData = () => {
    socket?.emit('get_historical_data');
  };


  // const options = {
  //   plugins: {
  //     legend: {
  //       display: true,
  //       position: 'bottom', // You can change the legend position as needed
  //     },
  //   },
  // };


  const updateChartData = () => {
    const data = {
      labels: tickers.map(ticker => ticker.symbol),
      datasets: [
        {
          data: tickers.map(ticker => ticker.totalValue()),
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
          ],
        },
      ],
      plugins: {
        legend: {
          display: true,
          position: 'bottom', // You can change the legend position as needed
        },
      },
    };
    setChartData(data);
    console.log('chart data - ', chartData)
    // console.log('time series data - ', timeData);

  }


  const Legend: React.FC<{ tickers: TickerInfo[] }> = ({ tickers }) => {
    const backgroundColors = chartData?.datasets?.[0]?.backgroundColor || [];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '20px' }}>
        {tickers.map((ticker, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
            {backgroundColors[index] && (
              <div style={{ width: '10px', height: '10px', backgroundColor: backgroundColors[index], marginRight: '5px' }}></div>
            )}
            <span>{ticker.symbol}</span>
            <span style={{ marginLeft: '5px' }}>{(ticker.totalValue()*100/portfolioTotal).toFixed(2) + '%'}</span>

          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {/* Left Section for Stock Graphs */}
          <div style={{ flex: 1 }}>
            {timeData && <StockGraphs stockData={timeData} />}
          </div>
  
          {/* Right Section for Ticker Table and Doughnut Chart */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Ticker Table */}
            <table>
              <thead>
                <tr>
                  <th>Ticker Symbol</th>
                  <th>Price</th>
                  <th># Stocks Held</th>
                  <th>Total Value</th>
                </tr>
              </thead>
              <tbody>
                {tickers.map((ticker, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        type="text"
                        value={ticker.symbol}
                        onChange={(e) => handleTickerSymbolChange(index, e.target.value)}
                      />
                    </td>
                    <td>{ticker.price.toFixed(2)}</td>
                    <td>
                      <input
                        type="number"
                        value={ticker.stocksHeld}
                        onChange={(e) => {
                          const newTickers = [...tickers];
                          newTickers[index].stocksHeld = parseInt(e.target.value, 10) || 0;
                          setTickers(newTickers);
                        }}
                      />
                    </td>
                    <td>{ticker.totalValue().toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={updateTickerSymbols}>Update Ticker Symbols</button>
  
            {/* Doughnut Chart */}
            {chartData && (
              <div className="pie-chart" style={{ marginTop: '20px' }}>
                <Doughnut data={chartData} />
                <Legend tickers={tickers} />
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
  
//   return (
//     <div className="App">
//       <header className="App-header">
//         <table>
//           <thead>
//             <tr>
//               <th>Ticker Symbol</th>
//               <th>Price</th>
//               <th># Stocks Held</th>
//               <th>Total Value</th>
//             </tr>
//           </thead>
//           <tbody>
//             {tickers.map((ticker, index) => (
//               <tr key={index}>
//                 <td>
//                   <input
//                     type="text"
//                     value={ticker.symbol}
//                     onChange={e => handleTickerSymbolChange(index, e.target.value)}

//                     // onChange={e => {
//                     //   const newTickers = [...tickers];
//                     //   newTickers[index].symbol = e.target.value.toUpperCase();
//                     //   setTickers(newTickers);
//                     // }}
//                   />
//                 </td>
//                 <td>{ticker.price.toFixed(2)}</td>
//                 <td>
//                   <input
//                     type="number"
//                     value={ticker.stocksHeld}
//                     onChange={e => {
//                       const newTickers = [...tickers];
//                       newTickers[index].stocksHeld = parseInt(e.target.value, 10) || 0;
//                       setTickers(newTickers);
//                     }}
//                   />
//                 </td>
//                 <td>{ticker.totalValue().toFixed(2)}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//         <button onClick={updateTickerSymbols}>Update Ticker Symbols</button>
//         {/* <button onClick={updateTimeSeriesData}>Update Time Series Data</button> */}
//         <div className="chart-container" style={{ display: 'flex', marginTop: '20px' }}>
//   {timeData && (
//     <div style={{ marginRight: '50px' }}>
//       <StockGraphs stockData={timeData} />
//     </div>
//   )}
//   {chartData && (
//     <div style={{ marginLeft: '50px' }}>
//       <div className="pie-chart">
//         <Doughnut data={chartData} />
//         <Legend tickers={tickers} />
//       </div>
//     </div>
//   )}
// </div>
//         {/* {timeData &&
//           <StockGraphs stockData={timeData}/>
//         }
//         <div style={{ display: 'flex', alignItems: 'center', marginTop: '20px' }}>
//         {chartData && (
//           <div style={{ width: '300px', height: '300px', marginRight: '20px' }}>
//             <Doughnut data={chartData} />
//           </div>
//         )}
//         <Legend tickers={tickers} />
//       </div> */}

//       </header>
      
//     </div>
//   );
};

export default App;



