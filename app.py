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


API_ENDPOINT = f"https://api.iex.cloud/v1/data/core/quote/aapl?token={TOKEN}"
FETCH_INTERVAL = 5  # in seconds

def fetch_data():
    while True:
        try:
            response = requests.get(API_ENDPOINT)
            if response.status_code == 200:
                data = response.json()
                latest_price = data[0].get('latestPrice')
                data = {'latest_price': latest_price}
                socketio.emit('latest_price', data)
                print('Latest price: ', latest_price)
                app.logger.info(f'Emitted data: {data}')
            else:
                print(f"Error fetching data: HTTP {response.status_code}")
        except requests.RequestException as e:
            print(f"Request failed: {e}")

        time.sleep(FETCH_INTERVAL)

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    fetch_thread = Thread(target=fetch_data)
    fetch_thread.daemon = True
    fetch_thread.start()

    # socketio.run(app,host='0.0.0.0', port=5000, debug=True)
    socketio.run(app, host='127.0.0.1', port=5000, debug=True)

