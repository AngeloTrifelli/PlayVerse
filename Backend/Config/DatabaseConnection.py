import mysql.connector
import logging
import os
from mysql.connector import Error


def get_db_connection():
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
    
    try:
        connection = mysql.connector.connect(
            host='database',
            user=os.getenv('MYSQL_USER'),
            password=os.getenv('MYSQL_PASSWORD'),
            database=os.getenv('MYSQL_DATABASE')
        )
        return connection
    except Error as e:
        logging.error(f'Error connecting to MySql database: {e}')
        return None
