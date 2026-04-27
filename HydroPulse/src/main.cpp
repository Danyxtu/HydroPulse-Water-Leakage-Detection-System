#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClientSecure.h> 
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <SPI.h>
#include <Adafruit_GFX.h>
#include <Adafruit_ST7789.h>

// ==============================================================================
// CONFIG
// ==============================================================================
#define MQTT_MAX_PACKET_SIZE 256

const char *WIFI_SSID = "Danny";
const char *WIFI_PASSWORD = "nononnein";

const char *MQTT_BROKER = "7e224ba4113345ca914279edb263cf4c.s1.eu.hivemq.cloud";
const int MQTT_PORT = 8883; 
const char *MQTT_USER = "hydropulse";
const char *MQTT_PASSWORD = "Hydropulse123";

const uint8_t PIN_SENSOR_1 = 25;
const uint8_t PIN_SENSOR_2 = 26;
const uint8_t PIN_SENSOR_3 = 27;

#define TFT_CS   21
#define TFT_DC   2
#define TFT_RST  17

Adafruit_ST7789 tft = Adafruit_ST7789(TFT_CS, TFT_DC, TFT_RST);

#define COLOR_DARKGREY 0x39E7

const float PULSES_PER_LITER = 450.0;
const float K_FACTOR = 7.0;

const unsigned long MIN_PULSE_INTERVAL_US_DEFAULT = 2500;
const unsigned long MIN_PULSE_INTERVAL_US_BY_ZONE[3] = {
  MIN_PULSE_INTERVAL_US_DEFAULT,
  MIN_PULSE_INTERVAL_US_DEFAULT,
  5000 // Zone 3 gets extra debounce to reject line noise.
};

const int MIN_VALID_PULSES_PER_SECOND_DEFAULT = 2;
const int MIN_VALID_PULSES_PER_SECOND_BY_ZONE[3] = {
  MIN_VALID_PULSES_PER_SECOND_DEFAULT,
  MIN_VALID_PULSES_PER_SECOND_DEFAULT,
  3 // Require a stronger signal on Zone 3 before reporting flow.
};

const float MAX_VALID_FLOW_LMIN = 60.0;
const float FLOW_ON_THRESHOLD_LMIN = 0.30;
const float FLOW_OFF_THRESHOLD_LMIN = 0.15;
const uint8_t FLOW_START_CONFIRM_SECONDS = 2;
const uint8_t FLOW_STOP_CONFIRM_SECONDS = 2;

const unsigned long THRESHOLD_LEAK_MS = 1800000;
const unsigned long THRESHOLD_LONG_USAGE_MS = 300000;

// ==============================================================================
// NETWORK
// ==============================================================================
WiFiClientSecure secureClient;
PubSubClient mqttClient(secureClient);

// ==============================================================================
// STRUCTS
// ==============================================================================
struct WaterSensor {
  String id;
  String name;
  uint8_t pin;

  volatile unsigned long totalPulses;
  volatile int pulsesThisSecond;

  float flowRateLmin;
  bool isFlowing;
  String status;

  unsigned long flowStartTimeMs;

  unsigned long sessionStartTimeMs;
  float sessionStartVolume;
  bool wasFlowing;

  unsigned long lastAlertTime;
};

// DTOs
struct TelemetryDTO {
  const char* zoneId;
  float flowRate;
  float totalVolume;
  const char* status;
};

struct AlertDTO {
  const char* zoneId;
  const char* alertType;
  const char* msg;
};

struct UsageDTO {
  const char* zoneId;
  float totalVolume;
  unsigned long durationMs;
  const char* status;
};

// ==============================================================================
// UTILS
// ==============================================================================
void logMsg(String msg) {
  Serial.println("[LOG] " + msg);
}

// ==============================================================================
// MQTT PUBLISHERS
// ==============================================================================
void publishTelemetry(TelemetryDTO data) {
  JsonDocument doc;
  doc["zoneId"] = data.zoneId;
  doc["flowRate"] = data.flowRate;
  doc["totalVol"] = data.totalVolume;
  doc["status"] = data.status;

  char buffer[256];
  serializeJson(doc, buffer);

  String topic = "hydropulse/zones/" + String(data.zoneId) + "/telemetry";
  if (mqttClient.publish(topic.c_str(), buffer)) {
    // logMsg("Telemetry sent to " + topic);
  } else {
    logMsg("Failed to send Telemetry to " + topic);
  }
}

void publishAlert(AlertDTO alert) {
  JsonDocument doc;
  doc["zoneId"] = alert.zoneId;
  doc["alertType"] = alert.alertType;
  doc["msg"] = alert.msg;

  char buffer[256];
  serializeJson(doc, buffer);

  String topic = "hydropulse/zones/" + String(alert.zoneId) + "/alerts";
  if (mqttClient.publish(topic.c_str(), buffer)) {
    logMsg("ALERT SENT: " + String(alert.alertType) + " on Zone " + String(alert.zoneId));
  } else {
    logMsg("Failed to send Alert to " + topic);
  }
}

void publishUsage(UsageDTO usage) {
  JsonDocument doc;
  doc["zoneId"] = usage.zoneId;
  doc["totalVol"] = usage.totalVolume;
  doc["duration"] = usage.durationMs;
  doc["status"] = usage.status;

  char buffer[256];
  serializeJson(doc, buffer);

  String topic = "hydropulse/zones/" + String(usage.zoneId) + "/usage";
  if (mqttClient.publish(topic.c_str(), buffer)) {
    logMsg("USAGE SENT: " + String(usage.totalVolume) + "L used on Zone " + String(usage.zoneId));
  } else {
    logMsg("Failed to send Usage to " + topic);
  }
}

// ==============================================================================
// SENSORS
// ==============================================================================
WaterSensor sensors[3] = {
  {"1", "Kitchen", 25, 0, 0, 0.0, false, "OFF", 0, 0, 0.0, false, 0},
  {"2", "Guest Bath", 26, 0, 0, 0.0, false, "OFF", 0, 0, 0.0, false, 0},
  {"3", "Master Bath", 27, 0, 0, 0.0, false, "OFF", 0, 0, 0.0, false, 0}
};

volatile unsigned long lastPulseTimeUs[3] = {0, 0, 0};
uint8_t flowOnCandidateSeconds[3] = {0, 0, 0};
uint8_t flowOffCandidateSeconds[3] = {0, 0, 0};

void IRAM_ATTR registerPulse(uint8_t sensorIndex) {
  unsigned long nowUs = micros();
  unsigned long elapsedUs = nowUs - lastPulseTimeUs[sensorIndex];
  unsigned long minPulseIntervalUs = MIN_PULSE_INTERVAL_US_BY_ZONE[sensorIndex];

  // Ignore pulses that are too close together (line noise/bounce).
  if (elapsedUs >= minPulseIntervalUs) {
    lastPulseTimeUs[sensorIndex] = nowUs;
    sensors[sensorIndex].pulsesThisSecond++;
  }
}

// ISR
void IRAM_ATTR handleInterruptSensor1() {
  registerPulse(0);
}
void IRAM_ATTR handleInterruptSensor2() {
  registerPulse(1);
}
void IRAM_ATTR handleInterruptSensor3() {
  registerPulse(2);
}

// ==============================================================================
// DISPLAY
// ==============================================================================
uint16_t statusColor(const String &status) {
  if (status == "LEAK") return ST77XX_RED;
  if (status == "WARN") return ST77XX_YELLOW;
  if (status == "ON") return ST77XX_GREEN;
  return COLOR_DARKGREY;
}

void initDisplay() {
  tft.init(240, 320);
  tft.setRotation(1); // Landscape 320x240
  tft.setTextWrap(false);
  tft.fillScreen(ST77XX_BLACK);

  tft.fillRect(0, 0, 320, 20, ST77XX_BLUE);
  tft.setCursor(8, 6);
  tft.setTextColor(ST77XX_WHITE, ST77XX_BLUE);
  tft.setTextSize(1);
  tft.print("HydroPulse - Live Zones");
}

void updateDisplay() {
  const int cardX = 6;
  const int cardW = 308;
  const int cardH = 68;
  const int cardGap = 6;
  const int topY = 22;
  const uint16_t cardBg = 0x1082;

  for (int i = 0; i < 3; i++) {
    float totalVol = sensors[i].totalPulses / PULSES_PER_LITER;
    int y = topY + (i * (cardH + cardGap));

    // Redraw each card to avoid overlapping text artifacts.
    tft.fillRoundRect(cardX, y, cardW, cardH, 6, cardBg);
    tft.drawRoundRect(cardX, y, cardW, cardH, 6, COLOR_DARKGREY);

    tft.setTextSize(1);
    tft.setTextColor(ST77XX_WHITE, cardBg);
    tft.setCursor(cardX + 10, y + 8);
    tft.printf("Zone %d (%s)", i + 1, sensors[i].name.c_str());

    tft.setTextColor(statusColor(sensors[i].status), cardBg);
    tft.setCursor(cardX + 210, y + 8);
    tft.printf("%-4s", sensors[i].status.c_str());

    tft.setCursor(cardX + 10, y + 28);
    tft.setTextColor(ST77XX_CYAN, cardBg);
    tft.setTextSize(1);
    tft.printf("Flow : %6.2f L/min", sensors[i].flowRateLmin);

    tft.setCursor(cardX + 10, y + 46);
    tft.setTextColor(ST77XX_WHITE, cardBg);
    tft.printf("Total: %7.2f L", totalVol);
  }
}

// ==============================================================================
// WIFI + MQTT
// ==============================================================================
void connectWiFi() {
  logMsg("Connecting to WiFi: " + String(WIFI_SSID));
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  logMsg("WiFi Connected! IP: " + WiFi.localIP().toString());
}

void connectMQTT() {
  secureClient.setInsecure();
  mqttClient.setServer(MQTT_BROKER, MQTT_PORT);

  while (!mqttClient.connected()) {
    logMsg("Attempting MQTT connection...");
    if (mqttClient.connect("esp32", MQTT_USER, MQTT_PASSWORD)) {
      logMsg("MQTT Connected to HiveMQ!");
    } else {
      logMsg("MQTT Failed, rc=" + String(mqttClient.state()) + " (retrying in 2s)");
      delay(2000);
    }
  }
}

// ==============================================================================
// SETUP
// ==============================================================================
void setup() {
  Serial.begin(115200);
  logMsg("--- HydroPulse System Starting ---");

  initDisplay();
  logMsg("Display Initialized");

  connectWiFi();
  connectMQTT();

  mqttClient.setBufferSize(MQTT_MAX_PACKET_SIZE);

  pinMode(PIN_SENSOR_1, INPUT_PULLUP);
  pinMode(PIN_SENSOR_2, INPUT_PULLUP);
  pinMode(PIN_SENSOR_3, INPUT_PULLUP);

  unsigned long nowUs = micros();
  for (int i = 0; i < 3; i++) {
    sensors[i].pulsesThisSecond = 0;
    sensors[i].totalPulses = 0;
    lastPulseTimeUs[i] = nowUs;
    flowOnCandidateSeconds[i] = 0;
    flowOffCandidateSeconds[i] = 0;
  }

  attachInterrupt(digitalPinToInterrupt(PIN_SENSOR_1), handleInterruptSensor1, FALLING);
  attachInterrupt(digitalPinToInterrupt(PIN_SENSOR_2), handleInterruptSensor2, FALLING);
  attachInterrupt(digitalPinToInterrupt(PIN_SENSOR_3), handleInterruptSensor3, FALLING);
  
  logMsg("Sensors and Interrupts Ready");
}

// ==============================================================================
// LOOP
// ==============================================================================
unsigned long lastReportTimeMs = 0;

void loop() {
  if (!mqttClient.connected()) {
    connectMQTT();
  }
  mqttClient.loop();

  if (millis() - lastReportTimeMs >= 1000) {
    for (int i = 0; i < 3; i++) {
      int rawPulses = 0;

      noInterrupts();
      rawPulses = sensors[i].pulsesThisSecond;
      sensors[i].pulsesThisSecond = 0;
      interrupts();

      int validPulses = rawPulses;
      if (validPulses < MIN_VALID_PULSES_PER_SECOND_BY_ZONE[i]) {
        validPulses = 0;
      }

      sensors[i].flowRateLmin = validPulses / K_FACTOR;

      if (sensors[i].flowRateLmin > MAX_VALID_FLOW_LMIN) {
        sensors[i].flowRateLmin = 0.0;
        validPulses = 0;
      }

      sensors[i].totalPulses += validPulses;
      float totalVol = sensors[i].totalPulses / PULSES_PER_LITER;
      bool aboveOnThreshold = sensors[i].flowRateLmin > FLOW_ON_THRESHOLD_LMIN;
      bool belowOffThreshold = sensors[i].flowRateLmin < FLOW_OFF_THRESHOLD_LMIN;

      if (!sensors[i].isFlowing) {
        if (aboveOnThreshold) {
          if (flowOnCandidateSeconds[i] < FLOW_START_CONFIRM_SECONDS) {
            flowOnCandidateSeconds[i]++;
          }
        } else {
          flowOnCandidateSeconds[i] = 0;
        }

        if (flowOnCandidateSeconds[i] >= FLOW_START_CONFIRM_SECONDS) {
          sensors[i].flowStartTimeMs = millis();
          sensors[i].isFlowing = true;
          flowOnCandidateSeconds[i] = 0;
        }
        flowOffCandidateSeconds[i] = 0;

      } else {
        if (belowOffThreshold) {
          if (flowOffCandidateSeconds[i] < FLOW_STOP_CONFIRM_SECONDS) {
            flowOffCandidateSeconds[i]++;
          }
        } else {
          flowOffCandidateSeconds[i] = 0;
        }

        if (flowOffCandidateSeconds[i] >= FLOW_STOP_CONFIRM_SECONDS) {
          sensors[i].isFlowing = false;
          flowOffCandidateSeconds[i] = 0;
        }
        flowOnCandidateSeconds[i] = 0;
      }

      if (sensors[i].isFlowing) {
        unsigned long duration = millis() - sensors[i].flowStartTimeMs;

        if (duration > THRESHOLD_LEAK_MS) {
          sensors[i].status = "LEAK";

          if (millis() - sensors[i].lastAlertTime > 60000) {
            publishAlert({sensors[i].id.c_str(),"LEAK","Leak detected"});
            sensors[i].lastAlertTime = millis();
          }

        } else if (duration > THRESHOLD_LONG_USAGE_MS) {
          sensors[i].status = "WARN";
        } else {
          sensors[i].status = "ON";
        }

      } else {
        sensors[i].status = "OFF";
      }

      bool flowing = sensors[i].status != "OFF";

      if (flowing && !sensors[i].wasFlowing) {
        sensors[i].sessionStartTimeMs = millis();
        sensors[i].sessionStartVolume = totalVol;
        sensors[i].wasFlowing = true;
      }

      if (!flowing && sensors[i].wasFlowing) {
        float used = totalVol - sensors[i].sessionStartVolume;
        unsigned long duration = millis() - sensors[i].sessionStartTimeMs;

        if (used > 0.05) {
          publishUsage({sensors[i].id.c_str(), used, duration, "DONE"});
        }

        sensors[i].wasFlowing = false;
      }

      publishTelemetry({
        sensors[i].id.c_str(),
        sensors[i].flowRateLmin,
        totalVol,
        sensors[i].status.c_str()
      });
    }

    // Print summary to Serial for monitoring (after current sample is processed).
    Serial.printf("[LIVE] Z1: %.2f L/m | Z2: %.2f L/m | Z3: %.2f L/m\n",
                  sensors[0].flowRateLmin, sensors[1].flowRateLmin, sensors[2].flowRateLmin);

    updateDisplay();
    lastReportTimeMs = millis();
  }
}