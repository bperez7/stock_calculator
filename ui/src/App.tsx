import React, { useEffect, useState } from 'react';
import './App.css';
import { io, Socket } from 'socket.io-client';
import { Doughnut, Pie } from 'react-chartjs-2';
import { Chart, ArcElement } from 'chart.js'
import { ChartOptions } from 'chart.js/auto'; // Importing ChartOptions might be necessary for proper typing

Chart.register(ArcElement);

interface TickerInfo {
  symbol: string;
  price: number;
  stocksHeld: number;
  totalValue: () => number;
}

const App: React.FC = () => {
  const [tickers, setTickers] = useState<TickerInfo[]>([
    { symbol: 'AAPL', price: 0, stocksHeld: 0, totalValue() { return this.stocksHeld * this.price; } },
    { symbol: 'MSFT', price: 0, stocksHeld: 0, totalValue() { return this.stocksHeld * this.price; } },
    { symbol: 'ORCL', price: 0, stocksHeld: 0, totalValue() { return this.stocksHeld * this.price; } },
    { symbol: 'TSLA', price: 0, stocksHeld: 0, totalValue() { return this.stocksHeld * this.price; } },
  ]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [chartData, setChartData] = useState<any>(null);

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

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const portfolioTotal = tickers.reduce((partial, ticker) => partial + ticker.totalValue(), 0)
  useEffect(() => {
    updateChartData(); // Call a function to update the chart data
    // setPortfolioTotal();
  }, [tickers]);

  const updateTickerSymbols = () => {
    const symbols = tickers.map(ticker => ticker.symbol.toLowerCase());
    socket?.emit('update_ticker_symbols', symbols);
  };
  const options = {
    plugins: {
      legend: {
        display: true,
        position: 'bottom', // You can change the legend position as needed
      },
    },
  };
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
    console.log(chartData)

  }

  // const [portfolioTotal, setPortfolioTotal] = useState(0)


  const Legend: React.FC<{ tickers: TickerInfo[] }> = ({ tickers }) => {
    const backgroundColors = chartData?.datasets?.[0]?.backgroundColor || [];
    console.log('background - ', backgroundColors);
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
  // const Legend: React.FC<{ tickers: TickerInfo[] }> = ({ tickers }) => {
  //   const { data } = chartData || {};
  //   const { datasets } = data || {};
  //   const backgroundColors = datasets?.[0]?.backgroundColor || [];
  //   const totalValue = datasets?.[0]?.data?.reduce((sum: number, value: number) => sum + value, 0) || 1; // Prevent division by zero
  //   const percentages = datasets?.[0]?.data?.map((value: number) => ((value / totalValue) * 100).toFixed(2)) || [];
  
  //   return (
  //     <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '20px' }}>
  //       {tickers.map((ticker, index) => (
  //         <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
  //           {backgroundColors[index] && (
  //             <div style={{ width: '10px', height: '10px', backgroundColor: backgroundColors[index], marginRight: '5px' }}></div>
  //           )}
  //           <span>{ticker.symbol}</span>
  //           {percentages[index] && <span style={{ marginLeft: '5px' }}>{`(${percentages[index]}%)`}</span>}
  //         </div>
  //       ))}
  //     </div>
  //   );
  // };
  
  return (
    <div className="App">
      <header className="App-header">
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
                    onChange={e => {
                      const newTickers = [...tickers];
                      newTickers[index].symbol = e.target.value.toUpperCase();
                      setTickers(newTickers);
                    }}
                  />
                </td>
                <td>{ticker.price.toFixed(2)}</td>
                <td>
                  <input
                    type="number"
                    value={ticker.stocksHeld}
                    onChange={e => {
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
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '20px' }}>
        {chartData && (
          <div style={{ width: '300px', height: '300px', marginRight: '20px' }}>
            <Doughnut data={chartData} />
          </div>
        )}
        <Legend tickers={tickers} />
      </div>

      </header>
    </div>
  );
};

export default App;



