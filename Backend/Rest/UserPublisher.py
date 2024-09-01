import logging
from flask import Blueprint, jsonify, request
from mysql.connector import Error
from Config import DatabaseConnection


bp = Blueprint('UserPublisher', __name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def create_error_response(errorMessage, statusCode):
    if statusCode is None:
        return jsonify({'error': errorMessage})
    else:
        return jsonify({'error': errorMessage}), statusCode
    

@bp.route('/User/findUser', methods=['GET'])
def find_user():
    logging.info("Received a new request for endpoint User/findUser")

    user_id = request.args.get('id', type=int)

    if user_id is None:
        return create_error_response('Missing ID query parameter', 400)
    
    conn = DatabaseConnection.get_db_connection()

    if conn is None:
        return create_error_response('Database connection failed', 500)
    
    try:
        cursor = conn.cursor(dictionary=True)
        query = "SELECT * FROM User WHERE id = %s"
        cursor.execute(query, (user_id, ))
        user = cursor.fetchone()

        if user:
            return jsonify(user)
        else:
            return create_error_response('User not found', 404)
    except Error as e:
        return create_error_response(e, 500)
    finally:
        if conn:
            conn.close()
