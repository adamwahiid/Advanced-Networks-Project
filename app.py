from flask import Flask, request, jsonify, send_from_directory
from flask_socketio import SocketIO
import time

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

latest_command = None

# ================= FRONTEND =================
@app.route("/")
def home():
    return send_from_directory("frontend", "index.html")

@app.route("/<path:path>")
def static_files(path):
    return send_from_directory("frontend", path)

# ================= CONTROL =================
@app.route("/api/control", methods=["POST"])
def control():
    global latest_command

    data = request.get_json()
    latest_command = data.get("command")

    print("COMMAND RECEIVED:", latest_command)

    return "OK"

# ================= ESP32 =================
@app.route("/api/get_command", methods=["GET"])
def get_command():
    global latest_command
    return jsonify({"command": latest_command})   # ✅ DO NOT CLEAR HERE

# ================= CLEAR COMMAND =================
@app.route("/api/clear_command", methods=["POST"])
def clear_command():
    global latest_command
    latest_command = None
    return "CLEARED"

# ================= SOUND =================
@app.route("/api/sound", methods=["POST"])
def sound():
    value = request.form.get("sound")

    print("SOUND:", value)

    socketio.emit("update", {
        "value": value,
        "time": time.strftime("%H:%M:%S")
    })

    return "OK"

# ================= RUN =================
if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)    