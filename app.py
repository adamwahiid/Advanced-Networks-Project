from flask import Flask, request, jsonify
from flask_cors import CORS
import time

app = Flask(__name__)

CORS(app)

# =========================================
# GLOBAL STATUS
# =========================================

baby_status = {
    "sound": 0,
    "crying": False,
    "last_update": "Never"
}

# =========================================
# RECEIVE DATA FROM ESP32
# =========================================

@app.route("/api/sound", methods=["POST"])
def receive_sound():

    sound = request.form.get("sound")

    if sound is None:

        return jsonify({
            "error": "No sound data"
        }), 400

    sound = int(sound)

    crying = sound > 1500

    baby_status["sound"] = sound
    baby_status["crying"] = crying
    baby_status["last_update"] = time.strftime("%H:%M:%S")

    print("================================")
    print(f"Sound Received: {sound}")
    print(f"Crying: {crying}")
    print("================================")

    return jsonify({
        "message": "Data received successfully",
        "sound": sound,
        "crying": crying
    })

# =========================================
# SEND STATUS TO FRONTEND
# =========================================

@app.route("/api/status", methods=["GET"])
def get_status():

    return jsonify(baby_status)

# =========================================
# MAIN
# =========================================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )