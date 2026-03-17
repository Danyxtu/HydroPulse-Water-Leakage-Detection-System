#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// --- Sensor Pins ---
#define SENSOR_1_PIN 25
#define SENSOR_2_PIN 26
#define SENSOR_3_PIN 27

// --- WiFi & MQTT Config ---
const char *ssid = "krazy";
const char *password = "111111111";
const char *mqtt_server = "broker.hivemq.com";
const char *mqtt_command_topic = "hydropulse/commands/#";

// --- Calibration ---
const float PULSES_PER_LITER = 450.0;
const float K_FACTOR = 7.0;
const unsigned long LEAK_THRESHOLD_MS = 1800000;

// --- Objects ---
WiFiClient espClient;
PubSubClient client(espClient);

struct WaterZone
{
  String id;
  String name;
  volatile unsigned long totalPulses;
  volatile int currentSecondPulses;
  float flowRateLmin;
  unsigned long flowStartTime;
  bool isFlowing;
  String status;
};

WaterZone zones[3] = {
    {"1", "Kitchen", 0, 0, 0.0, 0, false, "Inactive"},
    {"2", "Guest Bath", 0, 0, 0.0, 0, false, "Inactive"},
    {"3", "Master Bath", 0, 0, 0.0, 0, false, "Inactive"}};

unsigned long lastMillis = 0;

// --- Interrupts ---
void IRAM_ATTR pulseCounter1()
{
  zones[0].totalPulses++;
  zones[0].currentSecondPulses++;
}
void IRAM_ATTR pulseCounter2()
{
  zones[1].totalPulses++;
  zones[1].currentSecondPulses++;
}
void IRAM_ATTR pulseCounter3()
{
  zones[2].totalPulses++;
  zones[2].currentSecondPulses++;
}

void callback(char *topic, byte *payload, unsigned int length)
{
  JsonDocument doc; // V7 Format
  deserializeJson(doc, payload, length);
  const char *action = doc["action"];
  if (action && strcmp(action, "START_SCAN") == 0)
  {
    Serial.println("COMMAND: Starting diagnostic...");
  }
}

void setup_wifi()
{
  delay(10);
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");
}

void reconnect()
{
  while (!client.connected())
  {
    Serial.print("Attempting MQTT...");
    if (client.connect("ESP32_HydroPulse_Multi"))
    {
      Serial.println("connected");
      client.subscribe(mqtt_command_topic);
    }
    else
    {
      delay(5000);
    }
  }
}

void publishZone(WaterZone &z)
{
  JsonDocument doc; // V7 Format
  doc["zoneId"] = z.id;
  doc["zoneName"] = z.name;
  doc["flowRate"] = z.flowRateLmin;
  doc["totalVolume"] = (float)z.totalPulses / PULSES_PER_LITER;
  doc["status"] = z.status;

  char buffer[256];
  serializeJson(doc, buffer);
  String topic = "hydropulse/status/" + z.id;
  client.publish(topic.c_str(), buffer);
}

void setup()
{
  Serial.begin(115200);
  setup_wifi();
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);

  // OLED code removed for troubleshooting

  pinMode(SENSOR_1_PIN, INPUT_PULLUP);
  pinMode(SENSOR_2_PIN, INPUT_PULLUP);
  pinMode(SENSOR_3_PIN, INPUT_PULLUP);

  attachInterrupt(digitalPinToInterrupt(SENSOR_1_PIN), pulseCounter1, FALLING);
  attachInterrupt(digitalPinToInterrupt(SENSOR_2_PIN), pulseCounter2, FALLING);
  attachInterrupt(digitalPinToInterrupt(SENSOR_3_PIN), pulseCounter3, FALLING);
}

void loop()
{
  if (!client.connected())
    reconnect();
  client.loop();

  if (millis() - lastMillis >= 1000)
  {
    Serial.println("\n--- HYDRO PULSE REPORT ---");
    for (int i = 0; i < 3; i++)
    {
      int pulsesThisSecond = zones[i].currentSecondPulses;
      zones[i].currentSecondPulses = 0;
      zones[i].flowRateLmin = (float)pulsesThisSecond / K_FACTOR;

      if (zones[i].flowRateLmin > 0.1)
      {
        if (!zones[i].isFlowing)
        {
          zones[i].isFlowing = true;
          zones[i].flowStartTime = millis();
        }
        zones[i].status = (millis() - zones[i].flowStartTime > LEAK_THRESHOLD_MS) ? "Leakage" : "Running";
      }
      else
      {
        zones[i].isFlowing = false;
        zones[i].status = "Inactive";
      }

      // Print to Serial Monitor
      Serial.printf("Zone %d [%s]: %.2f L/min | Status: %s\n", i + 1, zones[i].name.c_str(), zones[i].flowRateLmin, zones[i].status.c_str());

      publishZone(zones[i]);
    }
    lastMillis = millis();
  }
}