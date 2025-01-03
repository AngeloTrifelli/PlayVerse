import logging
from datetime import timedelta, timezone, date
import os
import datetime
import time 
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

        if user:
            logging.info(f'User data: {user}')  # Log dei dati dell'utente

            # Controllo se l'utente è bannato
            if user.get('banned'):

                return create_error_response('User is banned. Access denied.', 403)

            # Controllo se l'utente è sospeso
            if user.get('suspended'):
                suspension_end = user.get('suspensionEnd')  # Assumendo che 'suspensionEnd' sia la colonna nel DB
                if suspension_end:  # Assicurati che la data di fine sospensione esista
                    ## Conversione a UTC
                    current_date = datetime.now()

                    # Controlla se la data di fine sospensione è scaduta
                    if current_date > suspension_end:
                        # Rimuovi la sospensione e aggiorna il database
                        update_query = "UPDATE User SET suspended = FALSE, suspensionEnd = NULL WHERE id = %s"
                        cursor.execute(update_query, (user['id'],))
                        conn.commit()

                        # Genera il token di accesso se l'utente è ora attivo
                        access_token = create_access_token(identity=payload['username'])
                        return jsonify(access_token=access_token), 200
                    else:
                        # La sospensione è ancora attiva
                        return create_error_response(
                            f'User is suspended until {suspension_end.strftime("%Y-%m-%d %H:%M:%S")}',
                            403
                        )

            # Genera il token di accesso se l'utente non è né bannato né sospeso
            access_token = create_access_token(identity=payload['username'])
            return jsonify(access_token=access_token), 200

        return create_error_response('Invalid credentials!', 400)

    except Error as e:
        logging.error(f'Error during login: {str(e)}')  # Log dell'errore
        return create_error_response(str(e), 500)
    
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
            suspension_duration_hours = int(payload['duration']) # Assicurati che questo sia un intero
            # Calcola la data e l'ora attuali fino ai secondi
            suspension_end = datetime.now().replace(microsecond=0) + timedelta(hours=suspension_duration_hours)
            logging.info(f"Suspension end at time {suspension_end}.")
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

@bp.route('/User/distributeWeeklyCredits', methods=['POST'])
def distribute_weekly_credits():
    """Distribuisce i crediti in base alla classifica ogni settimana, il lunedì a mezzanotte."""
    conn = DatabaseConnection.get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Data di riferimento per iniziare le settimane, es. il 04-11
        reference_date = date(2024, 11, 4)
        today = date.today()
        days_since_reference = (today - reference_date).days
        # Trova l'inizio della settimana attuale
        start_of_week = reference_date + timedelta(days=(days_since_reference // 7) * 7)
        end_of_week = start_of_week + timedelta(days=7)

        # Controlla se oggi è la fine della settimana
        if today != end_of_week:
            logging.warning(f"Distribuzione crediti non avvenuta. Oggi: {today}, data di fine settimana: {end_of_week}.")
            return jsonify({
                "success": False, 
                "message": "I crediti saranno distribuiti solo alla fine della settimana (lunedì a mezzanotte)."
            }), 403

        user_role = "ADMIN"
        # Recupera i giocatori ordinati per punti della settimana
        ranking_query = """
            SELECT id, username, points 
            FROM User
            WHERE role != %s AND suspended = 0 AND banned = 0
            ORDER BY points DESC
        """
        cursor.execute(ranking_query,(user_role))
        users = cursor.fetchall()

        # Distribuisci i crediti in base alla posizione in classifica
        for i, user in enumerate(users):
            credits = 50 if i == 0 else 30 if i == 1 else 20 if i == 2 else 10
            update_query = """
                UPDATE User
                SET credits = credits + %s 
                WHERE id = %s
            """
            cursor.execute(update_query, (credits, user['id']))

        conn.commit()

        return jsonify({
            "success": True,
            "message": f"Crediti distribuiti con successo per la settimana che termina il {end_of_week}."
        }), 200

    except Exception as e:
        logging.error(f"Errore nella distribuzione dei crediti settimanali: {e}")
        return jsonify({"error": str(e)}), 500

    finally:
        if conn:
            conn.close()


@bp.route('/User/<int:id>/messages', methods=['GET'])
@jwt_required()
def get_messages(id):
    logging.info(f"Received a new request for User/messages endpoint. User id: {id}")

    conn = DatabaseConnection.get_db_connection()
    cursor = conn.cursor(dictionary=True)  

    second_user_id = request.args.get('secondUserId', None)

    try:
        query = "SELECT * FROM Message WHERE (sender_id = %s AND receiver_id = %s) OR (sender_id = %s AND receiver_id = %s) ORDER BY id ASC"
        params = (id, second_user_id, second_user_id, id)    
        cursor.execute(query, params)
        
        messages = cursor.fetchall()

        return jsonify(messages), 200
    except Error as e:
        return create_error_response(e, 500)
    finally:
        if conn:
            conn.close()