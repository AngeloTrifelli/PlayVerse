import logging
from flask_socketio import SocketIO
from flask import request

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

socketio = SocketIO(cors_allowed_origins="*")

# SOCKET IO METHODS
active_users = {}

@socketio.on('connect')
def handle_connect():    
    user_id = request.args.get('userId')    
    if user_id:
        active_users[user_id] = request.sid
        logging.info(f"User {user_id} connected with session {request.sid}")

@socketio.on('disconnect')
def handle_disconnect():
    user_id = request.args.get('userId')
    if user_id in active_users:
        del active_users[user_id]
        logging.info(f"User {user_id} disconnected")