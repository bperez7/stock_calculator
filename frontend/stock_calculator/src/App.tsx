// import React, { useState, useEffect } from 'react';

// const ENDPOINT = 'ws://localhost:5000';  // Adjust the URL accordingly

// const App: React.FC = () => {
//   const [latestPrice, setLatestPrice] = useState<number | null>(null);
//   const [socket, setSocket] = useState<WebSocket | null>(null);

//   useEffect(() => {
//     // Create a new WebSocket instance
//     const newSocket = new WebSocket(ENDPOINT);

//     // Set up event listeners
//     newSocket.addEventListener('open', () => {
//       console.log('Connected to WebSocket server');
//     });

//     newSocket.addEventListener('message', (event) => {
//       // Handle incoming messages
//       const data = JSON.parse(event.data);
//       setLatestPrice(data.latest_price);
//     });

//     newSocket.addEventListener('close', () => {
//       console.log('WebSocket connection closed');
//     });

//     newSocket.addEventListener('error', (error) => {
//       console.error('WebSocket error:', error);
//     });

//     // Save the WebSocket instance to state
//     setSocket(newSocket);

//     // Clean up WebSocket connection on component unmount
//     return () => {
//       if (newSocket.readyState === WebSocket.OPEN || newSocket.readyState === WebSocket.CONNECTING) {
//         newSocket.close();
//       }
//     };
//   }, []); // Run once on mount

//   return (
//     <div>
//       <h1>Latest Price: {latestPrice !== null ? `$${latestPrice.toFixed(2)}` : 'Loading...'}</h1>
//     </div>
//   );
// };

// export default App;



import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

// const ENDPOINT = 'http://localhost:5000';
// const ENDPOINT = 'ws://localhost:5000';
// const ENDPOINT = 'http://192.168.68.61:5000'; 
const ENDPOINT = 'http://127.0.0.1:5000';


interface SocketData {
  latest_price: number;
}

const App: React.FC = () => {
  const [latestPrice, setLatestPrice] = useState<number | null>(null);

  useEffect(() => {
    // const socket = io(ENDPOINT);
    const socket = io(ENDPOINT, { transports: ['websocket'] });

  
    socket.on('latest_price', (data: SocketData) => {
      setLatestPrice(data.latest_price);
    });

    // const socket = io(ENDPOINT, { transports: ['websocket'] });

    socket.on('connect', () => {
      console.log('Connected to Flask-SocketIO server');
    });

    socket.on('connect_error', (error: any) => {
      console.error('WebSocket connection error:', error);
    });

    socket.on('latest_price', (data: SocketData) => {
      setLatestPrice(data.latest_price);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from Flask-SocketIO server');
    });

    
  
    return () => {
      socket.disconnect();
    };
  }, []);  // <-- Provide an empty dependency array here if you want it to run once on mount
  console.log("latest price: ", latestPrice)

  

  return (
    <div>
      <h1>Latest Price: {latestPrice !== null ? `$${latestPrice.toFixed(2)}` : 'Loading...'}</h1>
    </div>
  );
};

export default App;
