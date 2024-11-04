import logging 
import time

from datetime import datetime
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from mysql.connector import Error
from Config import DatabaseConnection
from Config.InitSocketIO import socketio
from Config.InitSocketIO import active_users


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
    logging.info("Received a new request for Message/create endpoint")
    
    conn = DatabaseConnection.get_db_connection()
    cursor = conn.cursor(dictionary=True)
    payload = request.get_json()

    try:
        query = "INSERT INTO Message (sender_id, receiver_id, seen, sent_at, messageText, isForModerator) VALUES (%s, %s, %s, %s, %s, %s)"
        created_at = datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d %H:%M:%S')
    
        params = (payload['sender_id'], payload['receiver_id'], 0, created_at, payload['messageText'], 0)

        cursor.execute(query, params)

        if str(payload['receiver_id']) in active_users:            
            socketio.emit('newMessage', {
                'sender_id': payload['sender_id'],
                'receiver_id': payload['receiver_id'],
                'messageText': payload['messageText'],
                'seen': False,
                'sent_at': created_at
            })        
        else:            
            sender_username = get_jwt_identity()
            query = "INSERT INTO Notification (type, description, created_at, user_id, friendRequester_id, seen) VALUES (%s, %s, %s, %s, %s, %s)"
            params = ('NEW_MESSAGE', f"You have a new message from {sender_username}", created_at, payload['receiver_id'], None, 0)
            cursor.execute(query, params)
    
        conn.commit()


        return jsonify(success=True), 201        
    except Error as e:
        return create_error_response(e, 500)        
    finally:
        if conn:
            conn.close()