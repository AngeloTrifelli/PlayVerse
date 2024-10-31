import logging
import time
from datetime import datetime
import os

from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token
from mysql.connector import Error
from hashlib import sha256
from Config import DatabaseConnection
from pathlib import Path


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

@bp.route('/User/register', methods=['POST'])
def register():
    print("Received a new request for User/register endpoint")
    
    conn = DatabaseConnection.get_db_connection()
    cursor = conn.cursor(dictionary=True)
    payload = request.get_json()
    
    try:
        cursor = conn.cursor(dictionary=True)
        query = "SELECT * FROM User WHERE username = %s"
        cursor.execute(query, (payload["username"], ))
        existing_user = cursor.fetchone()


        if (existing_user):
            return create_error_response('Username already taken!', 400)
    
        encoded_password = sha256(str(payload['password']).encode('utf-8')).hexdigest()
        created_at = datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d %H:%M:%S')

        insert_query = "INSERT INTO User (username, password, role, name, surname, dateOfBirth, points, credits, created_at) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)"
        params = (payload["username"], encoded_password, "PLAYER", payload["name"], payload["surname"], payload["dateOfBirth"], 0, 0, created_at)

        cursor.execute(insert_query, params)
        conn.commit()

        return jsonify({'success': True}), 201
    except Error as e:
        return create_error_response(e, 500)
    finally:
        if conn:
            conn.close()
            
@bp.route('/User/login', methods=['POST'])
def login():
    logging.info('Received a new request for User/login endpoint')

    conn = DatabaseConnection.get_db_connection()
    cursor = conn.cursor(dictionary=True)
    payload = request.get_json()

    try:
        query = 'SELECT * FROM User WHERE username = %s AND password = %s'
        encoded_password = sha256(str(payload['password']).encode('utf-8')).hexdigest()
        cursor.execute(query, (payload['username'], encoded_password))
        user = cursor.fetchone()

        if (user):
            access_token = create_access_token(identity=payload['username'])
            return jsonify(access_token=access_token), 200
        
        return create_error_response('Invalid credentials!', 400)
    except Error as e:
        return create_error_response(e, 500)
    finally:
        if conn:
            conn.close()
            
@bp.route('/User/getRole', methods=['GET'])
def get_user_role():
    logging.info("Received a new request for endpoint /User/getRole")

    # Prendi l'ID utente dai parametri della query
    user_id = request.args.get('id', type=int)

    # Controlla se l'ID è stato fornito
    if user_id is None:
        return create_error_response('Missing ID query parameter', 400)
    
    # Connessione al database
    conn = DatabaseConnection.get_db_connection()

    if conn is None:
        return create_error_response('Database connection failed', 500)
    
    try:
        cursor = conn.cursor(dictionary=True)
        # Query per prendere il ruolo dell'utente
        query = "SELECT role FROM User WHERE id = %s"
        cursor.execute(query, (user_id, ))
        user = cursor.fetchone()

        if user:
            # Restituisci solo il ruolo dell'utente
            return jsonify({
                "status": "success",
                "role": user['role']  # 'role' è il campo che contiene il ruolo dell'utente
            })
        else:
            return create_error_response('User not found', 404)
    except Error as e:
        return create_error_response(str(e), 500)
    finally:
        if conn:
            conn.close()

@bp.route('/User/getAllUser', methods=['GET'])
def get_all_faq():
    logging.info("Received a new request for endpoint /User/getAllUser")
    
    # Connessione al database
    conn = DatabaseConnection.get_db_connection()
    
    if conn is None:
        logging.error("Database connection failed.")
        return create_error_response('Database connection failed', 500)

    try:
        cursor = conn.cursor(dictionary=True)
        query = "SELECT * FROM User"
        cursor.execute(query)  # Esegui la query
        users = cursor.fetchall()  # Usa fetchall() per ottenere tutte le righe

        if users:
            return jsonify(users)  # Restituisci un array di oggetti FAQ
        else:
            return create_error_response('User not found', 404)
    except Error as e:
        return create_error_response(str(e), 500)  # Restituisci l'errore come stringa
    finally:
        if conn:
            conn.close()