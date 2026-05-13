🍼 Smart Baby Monitor System (IoT Project)
📌 Overview
This project is an IoT-based Smart Baby Monitor that allows parents to remotely monitor and control a baby cradle using a web application.

The system detects sound (baby crying), visualizes it in real-time, and allows remote control of a servo-powered rocking cradle.

🧠 System Architecture
ESP32 (Sensor + Servo)
        ↓ (MQTT)
Flask Backend Server
        ↓ (Socket.IO)
Web Application (GUI)
⚙️ Technologies Used
🔹 Microcontroller
ESP32

Sound Sensor

Servo Motor

🔹 Backend
Python (Flask)

Flask-SocketIO

MQTT (paho-mqtt)

🔹 Frontend
HTML / CSS / JavaScript

Chart.js (for real-time graph)

🔹 Communication Protocol
MQTT (Message Queuing Telemetry Transport)

📡 Why MQTT?
MQTT was chosen because:

Lightweight → ideal for ESP32

Low bandwidth usage

Real-time communication

Publish/Subscribe model → perfect for IoT systems

Reliable over unstable networks

🌍 WAN Implementation
To enable global access (WAN):

Used ngrok to expose the local Flask server

Generated a public URL:

https://xxxxx.ngrok-free.app
This allows:

Access from another laptop

Access from mobile devices

Real-world IoT deployment simulation

🚀 Features
🎤 Sound Detection
Detects baby crying using sound sensor

Sends data via MQTT

Displays live graph on web app

📊 Real-Time Dashboard
Live sound level updates

Alert when threshold exceeded

Statistics (max, avg, alerts)

🛏️ Cradle Control
Start / Stop rocking

Adjustable rocking speed (slider)

Smooth servo motion

🎥 Camera Feed
Live webcam streaming from second device

🔊 Audio Features
Play lullaby

Text-to-speech soothing messages

🖥️ How to Run
1. Run MQTT Broker (Mosquitto)
mosquitto -v
2. Run Flask Server
python app.py
3. Run ngrok (WAN access)
ngrok http 5000
4. Upload ESP32 Code
Set WiFi credentials

Set MQTT server IP

Upload using Arduino IDE

5. Open Web App
Local:

http://localhost:5000
WAN:

https://xxxxx.ngrok-free.app
🧪 Demo Scenario
Make sound → graph updates

System detects crying → alert appears

Click Start Rocking

Adjust speed slider → servo responds

Stop rocking

🏗️ Maquette
A physical model was built including:

Cradle structure

Mounted servo motor

Sound sensor

ESP32 board

👥 Team Members
Adam Wahid

(Add teammates here)

📎 Future Improvements
Mobile app version

Camera streaming over network

AI-based cry detection

Cloud deployment instead of ngrok

📄 License
This project is for educational purposes.
