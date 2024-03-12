import React, { useEffect, useState } from 'react';
import './App.css';
import { io, Socket } from 'socket.io-client';

interface TickerInfo {
  symbol: string;
  price: number;
  stocksHeld: number;
  totalValue: () => number;
}

const App: React.FC = () => {
  const [tickers, setTickers] = useState<TickerInfo[]>([
    { symbol: 'aapl', price: 0, stocksHeld: 0, totalValue() { return this.stocksHeld * this.price; } },
    { symbol: 'msft', price: 0, stocksHeld: 0, totalValue() { return this.stocksHeld * this.price; } },
  ]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io('http://127.0.0.1:5000');
    setSocket(newSocket);

    newSocket.on('latest_prices', (latestPrices: Record<string, { latest_price: number }>) => {
      console.log(latestPrices)
      setTickers(prevTickers => prevTickers.map(ticker => ({
        ...ticker,
        price: latestPrices[ticker.symbol]?.latest_price || 0,
      })));
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const updateTickerSymbols = () => {
    const symbols = tickers.map(ticker => ticker.symbol.toLowerCase());
    socket?.emit('update_ticker_symbols', symbols);
  };

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
                      newTickers[index].symbol = e.target.value.toLowerCase();
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
      </header>
    </div>
  );
};

export default App;


// import React, { useEffect, useState } from 'react';
// import './App.css';
// import { io, Socket } from 'socket.io-client';

// const App: React.FC = () => {
//   const [messages, setMessages] = useState<string[]>([]);
//   const [socket, setSocket] = useState<Socket | null>(null);

//   useEffect(() => {
//     // Connect to WebSocket server
//     const newSocket = io('http://127.0.0.1:5000');
//     setSocket(newSocket);

//     // Listen for messages
//     newSocket.on('message', (message: string) => {
//       setMessages((prevMessages) => [...prevMessages, message]);
//     });


//     // Clean up on component unmount
//     return () => {
//       newSocket.disconnect();
//     };
//   }, []);

//   // Function to send message to server
//   const sendMessage = () => {
//     if (socket) {
//       socket.emit('message', 'Hello from client!');
//       socket.emit('update_ticker_symbols', ['aapl', 'meta'])
//     }
//   };

//   return (
//     <div className="App">
//       <header className="App-header">
//         <p>WebSocket Messages:</p>
//         <ul>
//           {messages.map((message, index) => (
//             <li key={index}>{message}</li>
//           ))}
//         </ul>
//         <button onClick={sendMessage}>Send Message</button>
//       </header>
//     </div>
//   );
// };

// export default App;
