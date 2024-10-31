import logging

from Config import DatabaseConnection
from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required
from Utils.AuthValidator import validate_token
from mysql.connector import Error


bp = Blueprint('AuthPublisher', __name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


def create_error_response(errorMessage, statusCode):
    if statusCode is None:
        return jsonify({'error': errorMessage})
    else:
        return jsonify({'error': errorMessage}), statusCode

@bp.route('/Authentication/getIdentity', methods=['GET'])
@jwt_required()
@validate_token
def get_identity():
    current_user = get_jwt_identity()

    load_user = request.args.get('loadUser', 'false').lower() == 'true'

    if (load_user):
        conn = DatabaseConnection.get_db_connection()
        cursor = conn.cursor(dictionary=True)

        try:
            query = "SELECT * FROM User WHERE username = %s"
            params = (current_user, )
            cursor.execute(query, params)
            user_data = cursor.fetchone()
                                  
            return jsonify(user= user_data)
        except Error as e:
            return create_error_response(e, 500)
        finally:
            if conn:
                conn.close()

    return jsonify(identity= current_user), 200