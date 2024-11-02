import logging
from Rest import UserPublisher
from Rest import AuthPublisher
from Rest import ProductPublisher
from Rest import FAQPublisher
from Rest import NotificationPublisher

from flask import Flask, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from datetime import timedelta
from Utils.AuthValidator import SECRET_KEY


app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = SECRET_KEY
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)         #The authentication token will expire after 1 hour
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

#Register publisher endpoints
app.register_blueprint(UserPublisher.bp)
app.register_blueprint(AuthPublisher.bp)
app.register_blueprint(ProductPublisher.bp)
app.register_blueprint(FAQPublisher.bp)
app.register_blueprint(NotificationPublisher.bp)

#Enable JWT Authentication 
JWTManager(app)

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

    logging.info('Starting flask server...')

    try:
        app.run(debug=True, host='0.0.0.0', port=5000)
    except Exception as e:
        logging.error(f'An error occurred while starting the flask server: {e}')