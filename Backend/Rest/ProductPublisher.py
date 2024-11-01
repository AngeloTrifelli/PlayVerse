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


bp = Blueprint('ProductPublisher', __name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def create_error_response(errorMessage, statusCode):
    if statusCode is None:
        return jsonify({'error': errorMessage})
    else:
        return jsonify({'error': errorMessage}), statusCode
    

@bp.route('/Product/insert_product', methods=['POST'])
def insert_product():
    print("Received a new request for Product/add endpoint")
    
    UPLOAD_FOLDER = "./images/products"
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    conn = DatabaseConnection.get_db_connection()
    cursor = conn.cursor(dictionary=True)

    code = request.form.get('code')
    price = request.form.get('price')
    description = request.form.get('description')
    
    image_file = request.files.get('imageFile')
    if not image_file:
        return jsonify({'error': 'No file provided!'}), 400

    # Controllo se l'immagine esiste già nel database
    cursor.execute("SELECT * FROM Product WHERE photo = %s", (image_file.filename,))
    existing_image = cursor.fetchone()
    if existing_image:
        return create_error_response('Image already exists, change name!', 500)

    original_filename = image_file.filename
    extension = os.path.splitext(original_filename)[1]
    new_filename = f"{code}{extension}"
    file_path = os.path.abspath(os.path.join(UPLOAD_FOLDER, new_filename))  # Usa il percorso assoluto

    print(f"Attempting to save image to: {file_path}")

    # Controlla se il file esiste già nella cartella di destinazione
    if os.path.exists(file_path):
        return jsonify({'error': 'File already exists! Please rename the file and try again.'}), 400

    try:
        # Insert into products table
        insert_query = "INSERT INTO Product (code, description, photo, price) VALUES (%s,%s, %s, %s)"
        params = (code, description, new_filename, price)

        cursor.execute(insert_query, params)
        conn.commit()

        image_file.save(file_path)
        if os.path.exists(file_path):
            print(f"File saved successfully at: {file_path}")
        else:
            print("File NOT found after saving attempt!")
        
        return jsonify({'success': True, 'message': 'Product added successfully!'}), 201
    except Exception as e:
        print(f"Error saving file: {e}")
        return create_error_response(str(e), 500)
    finally:
        if conn:
            conn.close()

@bp.route('/Product/getAllProducts', methods=['GET'])
def get_all_products():
    logging.info("Received a new request for endpoint /Product/getAllProducts")
    
    # Connessione al database
    conn = DatabaseConnection.get_db_connection()
    
    if conn is None:
        logging.error("Database connection failed.")
        return create_error_response('Database connection failed', 500)

    try:
        cursor = conn.cursor(dictionary=True)
        query = "SELECT code, description, photo, price FROM Product"
        cursor.execute(query)
        products = cursor.fetchall()

        if products:
            return jsonify({
                "status": "success",
                "products": products
            })
        else:
            logging.info("No products found in the database.")
            return create_error_response('No products found', 404)

    except Exception as e:
        logging.error(f"Database error occurred: {str(e)}")
        return create_error_response(str(e), 500)
    
    finally:
        if conn:
            conn.close()

@bp.route('/Product/DeleteProduct', methods=['POST'])
def delete_product():
    logging.info("Received a new request for endpoint /Product/DeleteProduct")
    
    UPLOAD_FOLDER = "./images/products"
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

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
        query = "DELETE FROM Product WHERE code = %s"

        # Passa il codice come tupla
        cursor.execute(query, (payload['code'],))
        conn.commit()
        
        # Controllo per verificare che il prodotto sia stato eliminato
        if cursor.rowcount == 0:
            logging.warning(f"No product found with code: {payload['code']}")
            return create_error_response("Product not found", 404)

        # Possibili estensioni del file immagine
        extensions = ['jpg', 'png', 'jpeg', 'gif', 'bmp']
        image_deleted = False

        # Tentativo di eliminare l'immagine con estensione conosciuta
        for ext in extensions:
            image_path = os.path.join(UPLOAD_FOLDER, f"{payload['code']}.{ext}")
            if os.path.exists(image_path):
                os.remove(image_path)
                logging.info(f"Image file {image_path} deleted successfully.")
                image_deleted = True
                break

        if not image_deleted:
            logging.warning(f"No image file found for product code {payload['code']}.")

        # Chiusura cursore
        cursor.close()
        
        logging.info(f"Product with code {payload['code']} deleted successfully.")
        return jsonify({"message": "Product and associated image deleted successfully" if image_deleted else "Product deleted, no image found"}), 200


    except Exception as e:
        logging.error(f"Database error occurred: {str(e)}")
        return create_error_response(str(e), 500)
    
    finally:
        if conn:
            conn.close()

@bp.route('/Product/UpdateProduct', methods=['POST'])
def update_product():
    logging.info("Received a new request for endpoint /Product/UpdateProduct")
    UPLOAD_FOLDER = "./images/products"
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    # Recupera i dati dal form
    code = request.form.get('code')
    new_price = request.form.get('price')
    new_description = request.form.get('description')
    new_image_file = request.files.get('imageFile')  # Ottieni il file immagine

    conn = DatabaseConnection.get_db_connection()
    cursor = conn.cursor(dictionary=True)

    if conn is None:
        logging.error("Database connection failed.")
        return create_error_response('Database connection failed', 500)

    try:
        # Recupera l'immagine esistente
        cursor.execute("SELECT * FROM Product WHERE code = %s", (code,))
        product = cursor.fetchone()

        if product is None:
            logging.warning(f"No product found with code: {code}")
            return create_error_response("Product not found", 404)

        existing_image = product['photo']  # Salva l'immagine esistente
        image_to_save = existing_image  # Imposta di default l'immagine esistente

        # Se è stata fornita una nuova immagine, gestiscila
        if new_image_file:
            # Percorso del file esistente
            previous_image_path = os.path.join(UPLOAD_FOLDER, existing_image)
            if os.path.exists(previous_image_path):
                # Rimuovi l'immagine precedente se esiste
                os.remove(previous_image_path)

            # Salva la nuova immagine
            image_filename = f"{code}.{new_image_file.filename.split('.')[-1]}"  # Crea un nome per l'immagine
            new_image_file.save(os.path.join(UPLOAD_FOLDER, image_filename))  # Salva l'immagine

        # Esegui l'aggiornamento del prodotto
        query = """
            UPDATE Product 
            SET price = %s, description = %s, photo = %s 
            WHERE code = %s
        """
        cursor.execute(query, (new_price, new_description, image_filename, code))

        # Controllo per verificare che l'aggiornamento sia avvenuto
        if cursor.rowcount == 0:
            logging.warning(f"No product found with code: {code}")
            return create_error_response("Product not found", 404)

        # Salva le modifiche
        conn.commit()

        logging.info(f"Product with code {code} updated successfully.")
        return jsonify({"message": "Product updated successfully"}), 200

    except Exception as e:
        logging.error(f"Database error occurred: {str(e)}")
        return create_error_response(str(e), 500)

    finally:
        if conn:
            conn.close()
