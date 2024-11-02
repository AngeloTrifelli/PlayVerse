import logging 
import time

from datetime import datetime
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from mysql.connector import Error
from Config import DatabaseConnection


bp = Blueprint('NotificationPublisher', __name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def create_error_response(errorMessage, statusCode):
    if statusCode is None:
        return jsonify({'error': errorMessage})
    else:
        return jsonify({'error': errorMessage}), statusCode
    

@bp.route('/Notification/create', methods=['POST'])
@jwt_required()
def create_notification():
    logging.info("Received a new request for Notification/create endpoint")
    
    conn = DatabaseConnection.get_db_connection()
    cursor = conn.cursor(dictionary=True)
    payload = request.get_json()

    try:
        query = "INSERT INTO Notification (type, description, created_at, user_id, friendRequester_id, seen) VALUES (%s, %s, %s, %s, %s, %s)"
        created_at = datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d %H:%M:%S')

        params = (payload['type'], payload['description'], created_at, payload['user_id'], payload['friendRequester_id'], 0)

        cursor.execute(query, params)
        conn.commit()

        return jsonify(success=True), 201        
    except Error as e:
        return create_error_response(e, 500)        
    finally:
        if conn:
            conn.close()

@bp.route('/Notification/<int:id>/refuseFriendRequest', methods=['POST'])
@jwt_required()
def refuse_friend_request(id):
    logging.info(f"Received a new request for Notification/refuseFriendRequest endpoint. Notification id: {id}")
    
    conn = DatabaseConnection.get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        query = "SELECT * FROM Notification WHERE id = %s"
        cursor.execute(query, (id, ))
        notification_entity = cursor.fetchone()

        if (not notification_entity or notification_entity['type'] != 'FRIEND_REQUEST'):
            return create_error_response('Invalid Notification', 400)
        
        delete_query = "DELETE FROM Notification WHERE id = %s"
        cursor.execute(delete_query, (id, ))

        conn.commit()

        return jsonify(success=True), 200    
    except Error as e:
        return create_error_response(e, 500)        
    finally:
        if conn:
            conn.close()


@bp.route('/Notification/<int:id>/acceptFriendRequest', methods=['POST'])
@jwt_required()
def accept_friend_request(id):
    logging.info(f"Received a new request for Notification/acceptFriendRequest endpoint. Notification id: {id}")
    
    conn = DatabaseConnection.get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        query = "SELECT * FROM Notification WHERE id = %s"
        cursor.execute(query, (id, ))
        notification_entity = cursor.fetchone()

        if (not notification_entity or notification_entity['type'] != 'FRIEND_REQUEST'):
            return create_error_response('Invalid Notification', 400)
        
        insert_query = "INSERT INTO FriendOf (firstUser_id, secondUser_id) VALUES (%s, %s)"
        cursor.execute(insert_query, (notification_entity['user_id'], notification_entity['friendRequester_id']))

        update_query = "UPDATE Notification SET seen = 1 WHERE id = %s"
        cursor.execute(update_query, (id, ))    

        conn.commit()

        return jsonify(success=True), 200    
    except Error as e:
        return create_error_response(e, 500)        
    finally:
        if conn:
            conn.close()




