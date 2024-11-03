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


bp = Blueprint('FAQPublisher', __name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def create_error_response(errorMessage, statusCode):
    if statusCode is None:
        return jsonify({'error': errorMessage})
    else:
        return jsonify({'error': errorMessage}), statusCode
    

@bp.route('/FAQ/insert_faq', methods=['POST'])
def insert_faq():
    print("Received a new request for FAQ/add endpoint")

    conn = DatabaseConnection.get_db_connection()
    payload = request.get_json()
   
    try:
        cursor = conn.cursor(dictionary=True)
        query = "SELECT * FROM Faq WHERE title = %s"
        cursor.execute(query, (payload["title"], ))
        existing_faq = cursor.fetchone()


        if (existing_faq):
            return create_error_response('Title already taken!', 400)
        # Insert into products table
        insert_query = "INSERT INTO Faq (title, description) VALUES (%s,%s)"
        params = (payload["title"], payload["description"])

        cursor.execute(insert_query, params)
        conn.commit()
        
        return jsonify({'success': True, 'message': 'FAQ added successfully!'}), 201
    except Exception as e:
        print(f"Error saving file: {e}")
        return create_error_response(str(e), 500)
    finally:
        if conn:
            conn.close()

@bp.route('/FAQ/getAllFAQ', methods=['GET'])
def get_all_faq():
    logging.info("Received a new request for endpoint /FAQ/getAllFAQ")
    
    # Connessione al database
    conn = DatabaseConnection.get_db_connection()
    
    if conn is None:
        logging.error("Database connection failed.")
        return create_error_response('Database connection failed', 500)

    try:
        cursor = conn.cursor(dictionary=True)
        query = "SELECT * FROM Faq"
        cursor.execute(query)  # Esegui la query
        faqs = cursor.fetchall()  # Usa fetchall() per ottenere tutte le righe

        if faqs:
            return jsonify(faqs)  # Restituisci un array di oggetti FAQ
        else:
            return create_error_response('FAQ not found', 404)
    except Error as e:
        return create_error_response(str(e), 500)  # Restituisci l'errore come stringa
    finally:
        if conn:
            conn.close()

@bp.route('/FAQ/DeleteFAQ', methods=['POST'])
def delete_product():
    logging.info("Received a new request for endpoint /FAQ/DeleteFAQ")

    conn = DatabaseConnection.get_db_connection()
    payload = request.get_json()
    cursor = conn.cursor(dictionary=True)

    # Connessione al database
    conn = DatabaseConnection.get_db_connection()
    
    if conn is None:
        logging.error("Database connection failed.")
        return create_error_response('Database connection failed', 500)

    try:
        cursor = conn.cursor(dictionary=True)
        query = "DELETE FROM Faq WHERE id = %s"

        # Passa il codice come tupla
        cursor.execute(query, (payload['id'],))
        conn.commit()
        
        # Controllo per verificare che il prodotto sia stato eliminato
        if cursor.rowcount == 0:
            logging.warning(f"No faq found with id: {payload['id']}")
            return create_error_response("Product not found", 404)

        # Chiusura cursore
        cursor.close()
        
        logging.info(f"faq with id {payload['id']} deleted successfully.")
        return jsonify({"message": "faq and associated image deleted successfully"}), 200


    except Exception as e:
        logging.error(f"Database error occurred: {str(e)}")
        return create_error_response(str(e), 500)
    
    finally:
        if conn:
            conn.close()

@bp.route('/FAQ/UpdateFAQ', methods=['POST'])
def update_product():
    logging.info("Received a new request for endpoint /FAQ/UpdateFAQ")
 

    conn = DatabaseConnection.get_db_connection()
    cursor = conn.cursor(dictionary=True)
    payload = request.get_json()

    if conn is None:
        logging.error("Database connection failed.")
        return create_error_response('Database connection failed', 500)

    try:
        # Recupera l'immagine esistente
        cursor.execute("SELECT * FROM Faq WHERE id = %s", (payload['id'],))
        faq = cursor.fetchone()

        if faq is None:
            logging.warning(f"No faq found with code: {code}")
            return create_error_response("faq not found", 404)

        # Esegui l'aggiornamento del prodotto
        query = """
            UPDATE Faq 
            SET title = %s, description = %s
            WHERE id = %s
        """
        cursor.execute(query, (payload['title'], payload['description'], payload['id']))

        # Controllo per verificare che l'aggiornamento sia avvenuto
        if cursor.rowcount == 0:
            logging.warning(f"No faq found with id: {payload['id']}")
            return create_error_response("faq not found", 404)

        # Salva le modifiche
        conn.commit()

        logging.info(f"faq with code {payload['id']} updated successfully.")
        return jsonify({"message": "faq updated successfully"}), 200

    except Exception as e:
        logging.error(f"Database error occurred: {str(e)}")
        return create_error_response(str(e), 500)

    finally:
        if conn:
            conn.close()

