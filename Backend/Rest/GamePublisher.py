import logging
import time
from datetime import datetime
from flask import Blueprint, jsonify, request
from Config import DatabaseConnection

bp = Blueprint('GamePublisher', __name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def create_error_response(errorMessage, statusCode=None):
    return jsonify({'error': errorMessage}), statusCode if statusCode else 400

@bp.route('/Game/PlayedGame', methods=['POST'])
def insert_played_game():
    print("Received a new request for Game/PlayedGame endpoint")

    conn = DatabaseConnection.get_db_connection()
    cursor = conn.cursor(dictionary=True)
    payload = request.get_json()
   
    try:
        # Controlla se il gioco esiste
        query = "SELECT * FROM Game WHERE name = %s"
        cursor.execute(query, (payload["game"],))
        existing_game = cursor.fetchone()

        if not existing_game:
            return create_error_response("Game not found.", 404)

        multiplier = existing_game['pointsMultiplier']
    # Calcola i punti guadagnati come intero
        earnedPoints = int(multiplier * payload['timePlayed'] / 1000)
        print(f"Multiplier: {multiplier}, Time Played: {payload['timePlayed']}, Earned Points: {earnedPoints}")


        # Controlla se nella data di oggi ho preso già il massimo di punti giornalieri ovvero 100
        user_id = payload["userId"]
        current_date = datetime.now().strftime('%Y-%m-%d')  # Data corrente

        # Query per ottenere il totale dei punti guadagnati dall'utente nella data corrente
        query = """
            SELECT SUM(earnedPoints) AS total_points
            FROM PlayedGame
            WHERE user_id = %s AND DATE(gameDate) = %s
        """
        params = (user_id, current_date)
        cursor.execute(query, params)
        result = cursor.fetchone()

        total_points_today = result['total_points'] if result and result['total_points'] is not None else 0
        print(f"Totale punti guadagnati dall'utente {user_id} oggi: {earnedPoints}")

        max_daily_points = 100  # Limite di punti giornalieri

        # Controlla se l'utente ha superato il limite di punti giornalieri
        if total_points_today < max_daily_points:
            # Calcola i punti aggiuntivi consentiti
            allowed_points = min(earnedPoints, max_daily_points - total_points_today)

            # Rimuovi 'Z' dal gameEndTime
            game_end_time = payload['gameEndTime'].replace('Z', '')  # Rimuovi 'Z'

            # Inserisce i punti consentiti nella tabella PlayedGame
            insert_query = "INSERT INTO PlayedGame (game_name, user_id, gameDate, earnedPoints) VALUES (%s, %s, %s, %s)"
            params = (payload["game"], user_id, game_end_time, allowed_points)

            cursor.execute(insert_query, params)

            update_points = "UPDATE User SET points = %s WHERE id = %s"

            parameters = (total_points_today + allowed_points, user_id)
            cursor.execute(update_points, parameters)
            conn.commit()

            return jsonify({
                'success': True,
                'message': f'You earned {allowed_points} points for this game today.',
                'total_points_today': total_points_today + allowed_points
            }), 201
        else:
            # Messaggio di avviso se ha già raggiunto il limite di punti giornalieri
            return jsonify({
                'success': False,
                'message': "You have reached the maximum daily points limit of 100 points. Come back tomorrow!",
                'total_points_today': total_points_today
            }), 403

    except Exception as e:
        print(f"Error saving played game: {e}")
        return create_error_response(str(e), 500)
    
    finally:
        if conn:
            conn.close()
