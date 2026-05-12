#include <WiFi.h>
#include <HTTPClient.h>
#include <ESP32Servo.h>

Servo myServo;

// ================= PINS =================
#define SOUND_PIN 34
#define SERVO_PIN 18

// ================= WIFI =================
const char* ssid = "Kalypso Cafee";
const char* password = "400040004000";

// ================= SERVER =================
const char* serverURL = "http://192.168.100.178:5000/api/sound";

// ================= SETTINGS =================
int threshold = 1500;        // 🔥 adjust this after testing
unsigned long lastTrigger = 0;
int cooldown = 3000;        // 3 sec delay between sends

void setup() {
  Serial.begin(115200);

  myServo.attach(SERVO_PIN);
  myServo.write(90);

  connectWiFi();
}

void loop() {
  int sound = analogRead(SOUND_PIN);

  Serial.println(sound);

  // ONLY trigger if above threshold AND cooldown passed
  if (sound > threshold && millis() - lastTrigger > cooldown) {

    Serial.println("🔊 SOUND DETECTED!");

    // move servo ONLY when triggered
    myServo.write(0);
    delay(500);
    myServo.write(90);

    sendToFlask(sound);

    lastTrigger = millis();
  }

  delay(100);
}

// ================= WIFI =================
void connectWiFi() {
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\n✅ Connected");
}

// ================= SEND =================
void sendToFlask(int value) {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(serverURL);
  http.addHeader("Content-Type", "application/x-www-form-urlencoded");

  String data = "sound=" + String(value);

  int code = http.POST(data);

  Serial.println(code);

  http.end();
}