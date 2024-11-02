import logging
import time
from datetime import datetime
import os

from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, jwt_required
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


@bp.route('/User/<int:id>/getFriends', methods=['GET'])
@jwt_required()
def get_friends(id):
    logging.info(f"Received a new request for User/getFriends endpoint. User id: {id}")

    conn = DatabaseConnection.get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        query = """SELECT DISTINCT *
                FROM (
	                SELECT firstUser_id AS id
                    FROM FriendOf
                    WHERE secondUser_id = %s
                        UNION
                    SELECT secondUser_id AS id
                    FROM FriendOf
                    WHERE firstUser_id = %s
                ) AS friends JOIN User u ON friends.id = u.id  """
        params = (id, id)
        cursor.execute(query, params)

        result = cursor.fetchall()

        return jsonify(result), 200    
    except Error as e:
        return create_error_response(e, 500)
    finally:
        if conn:
            conn.close()

    return None

            
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
def get_all_user():
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
            return jsonify(users)  # Restituisci un array di oggetti User
        else:
            return create_error_response('User not found', 404)
    except Error as e:
        return create_error_response(str(e), 500)  # Restituisci l'errore come stringa
    finally:
        if conn:
            conn.close()

from datetime import datetime, timedelta
from flask import jsonify, request
import logging

@bp.route('/User/SuspendedUser', methods=['POST'])
def SuspendedUser():
    logging.info("Received a new request for endpoint /User/SuspendedUser")
 
    conn = DatabaseConnection.get_db_connection()
    cursor = conn.cursor(dictionary=True)
    payload = request.get_json()

    if conn is None:
        logging.error("Database connection failed.")
        return create_error_response('Database connection failed', 500)

    try:
        # Recupera l'utente esistente
        cursor.execute("SELECT * FROM User WHERE id = %s", (payload['id'],))
        user = cursor.fetchone()

        if user is None:
            logging.warning(f"No user found with id: {payload['id']}")
            return create_error_response("user not found", 404)

        # Controlla la durata nel payload
        if payload['duration'] == 0:
            # Azione da eseguire se duration è 0 (annullamento della sospensione)
            cursor.execute("""
                UPDATE User 
                SET suspended = %s, suspensionEnd = NULL
                WHERE id = %s
            """, (False, payload['id']))  # Sospensione annullata
            logging.info(f"User with id {payload['id']} has been unsuspended.")
        else:
            # Azione da eseguire se duration è diverso da 0 (sospensione)
         # Calcola la data di fine sospensione
            suspension_duration_hours = int(payload['duration'])  # Assicurati che questo sia un intero
            suspension_end = datetime.now() + timedelta(hours=suspension_duration_hours)
            cursor.execute("""
                UPDATE User 
                SET suspended = %s, suspensionEnd = %s
                WHERE id = %s
            """, (True, suspension_end, payload['id']))  # Sospensione attivata
            logging.info(f"User with id {payload['id']} has been suspended until {suspension_end}.")

        # Salva le modifiche
        conn.commit()

        return jsonify({"message": "User status updated successfully"}), 200

    except Exception as e:
        logging.error(f"Database error occurred: {str(e)}")
        return create_error_response(str(e), 500)

    finally:
        if conn:
            conn.close()

@bp.route('/User/BannedUser', methods=['POST'])
def BannedUser():
    logging.info("Received a new request for endpoint /User/BannedUser")
 
    conn = DatabaseConnection.get_db_connection()
    cursor = conn.cursor(dictionary=True)
    payload = request.get_json()

    if conn is None:
        logging.error("Database connection failed.")
        return create_error_response('Database connection failed', 500)

    try:
        # Recupera l'utente esistente
        cursor.execute("SELECT * FROM User WHERE id = %s", (payload['id'],))
        user = cursor.fetchone()

        if user is None:
            logging.warning(f"No user found with id: {payload['id']}")
            return create_error_response("user not found", 404)

        if payload.get('banReason') is None or payload['banReason'] == "":
            cursor.execute("""
                UPDATE User 
                SET banned = %s, banReason = %s
                WHERE id = %s
            """, (False, None, payload['id']))  # Unban
            logging.info(f"User with id {payload['id']} has been unbanned.")
        else:
            cursor.execute("""
                UPDATE User 
                SET banned = %s, banReason = %s
                WHERE id = %s
            """, (True, payload['banReason'], payload['id']))  # Ban
            logging.info(f"User with id {payload['id']} has been banned.")


        # Salva le modifiche
        conn.commit()

        return jsonify({"message": "User status updated successfully"}), 200

    except Exception as e:
        logging.error(f"Database error occurred: {str(e)}")
        return create_error_response(str(e), 500)

    finally:
        if conn:
            conn.close()

@bp.route('/User/ModeratorUser', methods=['POST'])
def ModeratorUser():
    logging.info("Received a new request for endpoint /User/ModeratorUser")

    conn = DatabaseConnection.get_db_connection()
    cursor = conn.cursor(dictionary=True)
    payload = request.get_json()

    if conn is None:
        logging.error("Database connection failed.")
        return create_error_response('Database connection failed', 500)

    try:
        # Recupera l'utente esistente
        cursor.execute("SELECT * FROM User WHERE id = %s", (payload['id'],))
        user = cursor.fetchone()

        if user is None:
            logging.warning(f"No user found with id: {payload['id']}")
            return create_error_response("user not found", 404)

        # Determina il nuovo ruolo basato sul ruolo attuale dell'utente
        if user['role'] == "MODERATOR":  # Se l'utente è attualmente un moderatore
            new_role = "PLAYER"  # Rimuovi il ruolo di moderatore
            logging.info(f"User with id {payload['id']} is being demoted to PLAYER.")
        else:  # Se l'utente non è un moderatore
            new_role = "MODERATOR"  # Assegna il ruolo di moderatore
            logging.info(f"User with id {payload['id']} is being promoted to MODERATOR.")

        # Aggiorna il ruolo dell'utente
        cursor.execute("""
            UPDATE User 
            SET role = %s
            WHERE id = %s
        """, (new_role, payload['id']))

        # Salva le modifiche
        conn.commit()

        return jsonify({"message": "User status updated successfully"}), 200

    except Exception as e:
        logging.error(f"Database error occurred: {str(e)}")
        return create_error_response(str(e), 500)

    finally:
        if conn:
            conn.close()



@bp.route('/User/<int:id>/getUserList', methods=['GET'])
@jwt_required()
def get_user_list(id):
    logging.info(f"Received a new request for User/getUserList endpoint. User id: {id}")

    conn = DatabaseConnection.get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        query = """SELECT 
                        u.id,
                        u.username, 
                        u.name, 
                        u.surname,
                        u.role, 
                        u.suspended, 
                        u.banned,
                        CASE
                            WHEN f.firstUser_id IS NOT NULL OR f.secondUser_id IS NOT NULL THEN 1
                            ELSE 0
                        END AS isFriend,
                        CASE 
                            WHEN n.id IS NOT NULL THEN 1
                            ELSE 0
                        END AS friendRequestSent
                        FROM User u 
                        LEFT JOIN FriendOf f 
                            ON (f.firstUser_id = u.id AND f.secondUser_id = %s) OR (f.firstUser_id = %s AND f.secondUser_id = u.id)
                        LEFT JOIN Notification n
                            ON (n.user_id = u.id AND n.friendRequester_id = %s AND n.type = 'FRIEND_REQUEST')                                                
        """

        cursor.execute(query, (id, id, id))
        result = cursor.fetchall()    

        return jsonify(result), 200
    except Error as e:
        return create_error_response(e, 500)
    finally:
        if conn:
            conn.close()


@bp.route('/User/<int:id>/getNotifications', methods=['GET'])
@jwt_required()
def get_notifications(id):
    logging.info(f"Received a new request for User/getNotifications endpoint. User id: {id}")

    conn = DatabaseConnection.get_db_connection()
    cursor = conn.cursor(dictionary=True)    

    try:
        query = "SELECT * FROM Notification WHERE user_id = %s AND seen = 0"
        cursor.execute(query, (id, ))        

        notification_list = cursor.fetchall()

        return jsonify(notification_list), 200
    except Error as e:
        return create_error_response(e, 500)
    finally:
        if conn:
            conn.close()
