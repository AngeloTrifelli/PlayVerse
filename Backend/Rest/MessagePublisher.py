import logging 
import time

from datetime import datetime
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from mysql.connector import Error
from Config import DatabaseConnection


bp = Blueprint('MessagePublisher', __name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def create_error_response(errorMessage, statusCode):
    if statusCode is None:
        return jsonify({'error': errorMessage})
    else:
        return jsonify({'error': errorMessage}), statusCode
    


@bp.route('/Message/create', methods=['POST'])
@jwt_required()
def create_message():
    logging.info("Received a new request for Notification/create endpoint")
    
    conn = DatabaseConnection.get_db_connection()
    cursor = conn.cursor(dictionary=True)
    payload = request.get_json()

    try:
        query = "INSERT INTO Message (sender_id, receiver_id, seen, sent_at, messageText, isForModerator) VALUES (%s, %s, %s, %s, %s, %s)"
        created_at = datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d %H:%M:%S')
    
        params = (payload['sender_id'], payload['receiver_id'], 0, created_at, payload['messageText'], 0)

        cursor.execute(query, params)
        conn.commit()

        return jsonify(success=True), 201        
    except Error as e:
        return create_error_response(e, 500)        
    finally:
        if conn:
            conn.close()