from flask import Flask, render_template
from flask_socketio import SocketIO
from flask_cors import CORS  # Import CORS from flask_cors
import requests
import time
from threading import Thread

app = Flask(__name__)
# socketio = SocketIO(app, logger=True, engineio_logger=True, cors_allowed_origins="*")
socketio = SocketIO(app, cors_allowed_origins="*")
TOKEN = 'pk_a7f0e9682c6e4a87b5eb8ac8c3073470'
# CORS(app, supports_credentials=True, resources={r"/*": {"origins": "http://localhost:3000"}})  # Enable CORS for the entire app
CORS(app, supports_credentials=True, origins='*')  # Enable CORS for the entire app


FETCH_INTERVAL = 5  # in seconds

class StockStreamer:
    def __init__(self):
        self.stock_symbols = ['aapl', 'msft']
        self.pricing = {'aapl': 100, 'msft':100}

    def update_symbols(self, symbols):
        self.stock_symbols = symbols

    def fetch_data(self):
        while True:
            try:
                latest_prices = dict()
                for symbol in self.stock_symbols:
                    API_ENDPOINT = f"https://api.iex.cloud/v1/data/core/quote/{symbol}?token={TOKEN}"
                    response = requests.get(API_ENDPOINT)
                    if response.status_code == 200:
                        data = response.json()
                        latest_price = data[0].get('latestPrice')
                        latest_prices[symbol] = {'latest_price': latest_price}
                        print('Latest price: ', str(latest_price))
                    else:
                        print(f"Error fetching data: HTTP {response.status_code}")
                app.logger.info(f'Emitted data: {latest_prices}')
                socketio.emit('latest_prices', latest_prices)
            except requests.RequestException as e:
                print(f"Request failed: {e}")

            time.sleep(FETCH_INTERVAL)

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('update_ticker_symbols')
def handle_update_ticker_symbols(symbols):
    streamer.update_symbols(symbols)

@socketio.on('message')
def handle_message(message):
    print('Message Received - ', message)

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

if __name__ == '__main__':
    streamer = StockStreamer()
    fetch_thread = Thread(target=streamer.fetch_data)
    fetch_thread.daemon = True
    fetch_thread.start()

    # socketio.run(app,host='0.0.0.0', port=5000, debug=True)
    socketio.run(app, host='127.0.0.1', port=5000, debug=True, use_reloader=False)

