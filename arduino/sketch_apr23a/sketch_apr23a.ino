#include <WiFi.h>
#include <HTTPClient.h>
#include <ESP32Servo.h>

Servo myServo;

// ================= PINS =================

#define SOUND_PIN 34
#define SERVO_PIN 18

// ================= WIFI =================

// CHANGE THESE
const char* ssid = "Adam wahid";
const char* password = "adamwahidd";

// ================= SERVER =================

// CHANGE TO YOUR LAPTOP IP
const char* serverURL =
  "http://172.20.10.10:5000/api/sound";

// ================= SETTINGS =================

int threshold = 80;

void setup() {

  Serial.begin(115200);

  Serial.println("\n\n===== ESP32 START =====");

  // ================= SERVO =================

  myServo.attach(SERVO_PIN);
  myServo.write(90);

  Serial.println("Servo Ready");

  // ================= WIFI =================

  connectWiFi();
}

void loop() {

  int sound = analogRead(SOUND_PIN);

  Serial.print("Sound Level: ");
  Serial.println(sound);

  // sound detected
  if (sound > threshold) {

    Serial.println("🔊 SOUND DETECTED!");

    // move servo
    myServo.write(0);
    delay(800);

    myServo.write(90);

    // send to Flask
    sendToFlask(sound);

    delay(2000);
  }

  delay(100);
}

// =====================================================
// WIFI CONNECTION
// =====================================================

void connectWiFi() {

  Serial.println("\nConnecting to WiFi...");

  WiFi.mode(WIFI_STA);

  WiFi.begin(ssid, password);

  int tries = 0;

  while (WiFi.status() != WL_CONNECTED) {

    delay(500);

    Serial.print(".");

    tries++;

    // timeout after ~20 sec
    if (tries > 40) {

      Serial.println("\n❌ WIFI CONNECTION FAILED");

      Serial.println("CHECK:");
      Serial.println("- SSID");
      Serial.println("- PASSWORD");
      Serial.println("- 2.4GHz WiFi");
      Serial.println("- Hotspot compatibility");

      return;
    }
  }

  Serial.println("\n✅ WIFI CONNECTED!");
  Serial.print("ESP32 IP: ");

  Serial.println(WiFi.localIP());
}

// =====================================================
// SEND TO FLASK
// =====================================================

void sendToFlask(int value) {

  if (WiFi.status() != WL_CONNECTED) {

    Serial.println("❌ WiFi Disconnected");

    return;
  }

  HTTPClient http;

  Serial.println("Connecting to Flask...");

  http.begin(serverURL);

  http.addHeader(
    "Content-Type",
    "application/x-www-form-urlencoded"
  );

  String data = "sound=" + String(value);

  Serial.print("Sending Data: ");
  Serial.println(data);

  int responseCode = http.POST(data);

  Serial.print("HTTP Response Code: ");
  Serial.println(responseCode);

  if (responseCode > 0) {

    String response = http.getString();

    Serial.print("Server Response: ");
    Serial.println(response);
  }
  else {

    Serial.println("❌ Failed to send request");
  }

  http.end();
}