import logging
from Rest import UserPublisher
from flask import Flask, request
from flask_cors import CORS


app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

#Register publisher endpoints
app.register_blueprint(UserPublisher.bp)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

    logging.info('Starting flask server...')

    try:
        app.run(debug=True, host='0.0.0.0', port=5000)
    except Exception as e:
        logging.error(f'An error occurred while starting the flask server: {e}')