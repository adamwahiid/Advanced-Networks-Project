from flask import Flask, request, render_template_string
from flask_socketio import SocketIO
import time

app = Flask(__name__)

socketio = SocketIO(app, cors_allowed_origins="*")

# =====================================================
# FRONTEND
# =====================================================

HTML = """
<!DOCTYPE html>
<html>

<head>

<title>Baby Monitor</title>

<style>

body{
    background:#111;
    color:white;
    font-family:Arial;
    text-align:center;
    padding:40px;
}

.card{
    background:#222;
    padding:20px;
    border-radius:15px;
    width:400px;
    margin:auto;
}

.event{
    background:#333;
    padding:10px;
    margin:10px;
    border-radius:10px;
}

</style>

<script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>

</head>

<body>

<h1>👶 Baby Monitor Dashboard</h1>

<div class="card">

<h2>Live Sound Events</h2>

<div id="events"></div>

</div>

<script>

const socket = io();

socket.on("update", function(data){

    let div = document.createElement("div");

    div.className = "event";

    div.innerHTML =
        "🔊 Sound: " +
        data.value +
        " | ⏰ " +
        data.time;

    document.getElementById("events")
        .prepend(div);
});

</script>

</body>
</html>
"""

# =====================================================
# HOME
# =====================================================

@app.route("/")
def home():
    return render_template_string(HTML)

# =====================================================
# SOUND API
# =====================================================

@app.route("/api/sound", methods=["POST"])
def sound():

    value = request.form.get("sound")

    print("\n🔊 SOUND RECEIVED:", value)

    event = {
        "value": value,
        "time": time.strftime("%H:%M:%S")
    }

    socketio.emit("update", event)

    return "OK"

# =====================================================
# START
# =====================================================

if __name__ == "__main__":

    socketio.run(
        app,
        host="0.0.0.0",
        port=5000,
        debug=True
    )