import jwt 
import logging
from functools import wraps
from flask import request, jsonify

SECRET_KEY = "42063105a281c96a6ba254bbfc2d77fd50861cae996f644ef1a8820cb7174dc6"


def validate_token(f):
    @wraps(f)
    def decorated (*args, **kwargs):
        token = None

        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]

        if not token:
            return jsonify(message= 'Missing authentication token!'), 403

        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            return jsonify(message= 'Token has expired!'), 401
        except jwt.InvalidTokenError:
            return jsonify(message= 'Invalid token!'), 401

        logging.info("Valid token!")
        return f(*args, **kwargs)
    
    return decorated

