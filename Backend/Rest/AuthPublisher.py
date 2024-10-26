import logging

from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required
from Utils.AuthValidator import validate_token


bp = Blueprint('AuthPublisher', __name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


@bp.route('/Authentication/getIdentity', methods=['GET'])
@jwt_required()
@validate_token
def get_identity():
    current_user = get_jwt_identity()
    return jsonify(identity= current_user), 200