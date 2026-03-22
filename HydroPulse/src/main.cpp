// #include <Arduino.h>
// #include <WiFi.h>
// #include <PubSubClient.h>
// #include <ArduinoJson.h>
// #include <WiFiClientSecure.h> 

// #define MQTT_MAX_PACKET_SIZE 512

// // --- Sensor Pins ---
// #define SENSOR_1_PIN 25
// #define SENSOR_2_PIN 26
// #define SENSOR_3_PIN 27

// // --- WiFi & MQTT Config ---
// const char *ssid = "Danny";
// const char *password = "nononnein";
// // const char *mqtt_server = "broker.hivemq.com";
// // const char *mqtt_command_topic = "hydropulse/commands/#";

// // --- HiveMQ Cloud Config ---
// const char *mqtt_server = "danny-0fc5e19c.a01.euc1.aws.hivemq.cloud";  // ← YOUR CLUSTER URL
// const int mqtt_port = 8883;  // Use 8883 for secure (recommended) or 1883 for non-secure
// const char *mqtt_user = "hydropulse";  // ← YOUR USERNAME
// const char *mqtt_password = "Hydropulse123";  // ← YOUR PASSWORD
// const char *mqtt_command_topic = "hydropulse/commands/#";

// // --- Calibration ---
// const float PULSES_PER_LITER = 450.0;
// const float K_FACTOR = 7.0;
// const unsigned long LEAK_THRESHOLD_MS = 1800000;  // 30 minutes
// const unsigned long LONG_USAGE_MS = 300000;        // 5 minutes

// // --- Objects ---
// WiFiClientSecure espClient;
// PubSubClient client(espClient);

// struct WaterZone
// {
//   String id;
//   String name;
//   volatile unsigned long totalPulses;
//   volatile int currentSecondPulses;
//   float flowRateLmin;
//   unsigned long flowStartTime;
//   bool isFlowing;
//   String status;
// };

// WaterZone zones[3] = {
//     {"1", "Kitchen", 0, 0, 0.0, 0, false, "Inactive"},
//     {"2", "Guest Bath", 0, 0, 0.0, 0, false, "Inactive"},
//     {"3", "Master Bath", 0, 0, 0.0, 0, false, "Inactive"}};

// unsigned long lastMillis = 0;

// // --- Interrupts with Debouncing ---
// void IRAM_ATTR pulseCounter1()
// {
//   static unsigned long lastMicros = 0;
//   unsigned long now = micros();
//   if (now - lastMicros > 10000) { // 10ms debounce in microseconds
//     zones[0].totalPulses++;
//     zones[0].currentSecondPulses++;
//     lastMicros = now;
//   }
// }

// void IRAM_ATTR pulseCounter2()
// {
//   static unsigned long lastMicros = 0;
//   unsigned long now = micros();
//   if (now - lastMicros > 10000) {
//     zones[1].totalPulses++;
//     zones[1].currentSecondPulses++;
//     lastMicros = now;
//   }
// }

// void IRAM_ATTR pulseCounter3()
// {
//   static unsigned long lastMicros = 0;
//   unsigned long now = micros();
//   if (now - lastMicros > 10000) {
//     zones[2].totalPulses++;
//     zones[2].currentSecondPulses++;
//     lastMicros = now;
//   }
// }

// // --- MQTT Callback ---
// void callback(char *topic, byte *payload, unsigned int length)
// {
//   JsonDocument doc;
//   deserializeJson(doc, payload, length);
//   const char *action = doc["action"];
  
//   if (action && strcmp(action, "START_SCAN") == 0)
//   {
//     Serial.println("COMMAND: Starting diagnostic...");
//   }
//   else if (action && strcmp(action, "RESET_TOTALS") == 0)
//   {
//     Serial.println("COMMAND: Resetting all zone totals...");
//     for (int i = 0; i < 3; i++)
//     {
//       noInterrupts();
//       zones[i].totalPulses = 0;
//       interrupts();
//     }
//   }
// }

// // --- WiFi Setup ---
// void setup_wifi()
// {
//   delay(10);
//   Serial.print("Connecting to ");
//   Serial.println(ssid);
//   WiFi.begin(ssid, password);
  
//   int timeout = 0;
//   while (WiFi.status() != WL_CONNECTED && timeout < 20) 
//   {
//     delay(500);
//     Serial.print(".");
//     timeout++;
//   }
  
//   if (WiFi.status() == WL_CONNECTED) 
//   {
//     Serial.println("\nWiFi connected");
//     Serial.print("IP: ");
//     Serial.println(WiFi.localIP());
//   } 
//   else 
//   {
//     Serial.println("\nWiFi connection failed!");
//   }
// }

// // --- MQTT Reconnect ---
// void reconnect()
// {
//   while (!client.connected())
//   {
//     Serial.print("Attempting MQTT...");
//     if (client.connect("ESP32_HydroPulse_Multi"))
//     {
//       Serial.println("connected");
//       client.subscribe(mqtt_command_topic);
//     }
//     else
//     {
//       Serial.print("failed, rc=");
//       Serial.print(client.state());
//       Serial.println(" retrying in 5s");
//       delay(5000);
//     }
//   }
// }

// // --- Publish Zone Data ---
// void publishZone(WaterZone &z)
// {
//   JsonDocument doc;
//   doc["zoneId"] = z.id;
//   doc["zoneName"] = z.name;
//   doc["flowRate"] = z.flowRateLmin;
  
//   // Read totalPulses atomically
//   noInterrupts();
//   unsigned long pulses = z.totalPulses;
//   interrupts();
  
//   doc["totalVolume"] = (float)pulses / PULSES_PER_LITER;
//   doc["status"] = z.status;

//   char buffer[256];
//   serializeJson(doc, buffer);
//   String topic = "hydropulse/status/" + z.id;
  
//   if (client.publish(topic.c_str(), buffer))
//   {
//     // Publish successful
//   }
//   else
//   {
//     Serial.println("MQTT publish failed for zone " + z.id);
//   }
// }

// // --- Setup ---
// void setup()
// {
//   Serial.begin(115200);
//   delay(1000); // Give serial time to initialize
  
//   Serial.println("\n=== HydroPulse Multi-Zone Monitor ===");
//   Serial.println("Initializing...");
  
//   // WiFi setup
//   setup_wifi();
  
//   // MQTT setup
//   client.setBufferSize(512);
//   client.setServer(mqtt_server, 1883);
//   client.setCallback(callback);
  
//   // Pin setup
//   pinMode(SENSOR_1_PIN, INPUT_PULLUP);
//   pinMode(SENSOR_2_PIN, INPUT_PULLUP);
//   pinMode(SENSOR_3_PIN, INPUT_PULLUP);

//   // Interrupt setup
//   attachInterrupt(digitalPinToInterrupt(SENSOR_1_PIN), pulseCounter1, FALLING);
//   attachInterrupt(digitalPinToInterrupt(SENSOR_2_PIN), pulseCounter2, FALLING);
//   attachInterrupt(digitalPinToInterrupt(SENSOR_3_PIN), pulseCounter3, FALLING);
  
//   Serial.println("Setup complete!");
//   Serial.println("Monitoring zones:");
//   for (int i = 0; i < 3; i++)
//   {
//     Serial.printf("  Zone %s: %s (Pin %d)\n", 
//                   zones[i].id.c_str(), 
//                   zones[i].name.c_str(),
//                   (i == 0) ? SENSOR_1_PIN : (i == 1) ? SENSOR_2_PIN : SENSOR_3_PIN);
//   }
//   Serial.println();
// }

// // --- Main Loop ---
// void loop()
// {
//   // Maintain MQTT connection
//   if (!client.connected())
//   {
//     reconnect();
//   }
//   client.loop();

//   // Process data every second
//   if (millis() - lastMillis >= 1000)
//   {
//     Serial.println("\n--- HYDRO PULSE REPORT ---");
    
//     for (int i = 0; i < 3; i++)
//     {
//       // Atomic read and reset of pulse count
//       noInterrupts();
//       int pulsesThisSecond = zones[i].currentSecondPulses;
//       zones[i].currentSecondPulses = 0;
//       interrupts();
      
//       // Calculate flow rate
//       zones[i].flowRateLmin = (float)pulsesThisSecond / K_FACTOR;

//       // Determine status based on flow
//       if (zones[i].flowRateLmin > 0.1)
//       {
//         // Water is flowing
//         if (!zones[i].isFlowing)
//         {
//           zones[i].isFlowing = true;
//           zones[i].flowStartTime = millis();
//         }
        
//         unsigned long flowDuration = millis() - zones[i].flowStartTime;
        
//         if (flowDuration > LEAK_THRESHOLD_MS)
//         {
//           zones[i].status = "LEAK DETECTED!";
//         }
//         else if (flowDuration > LONG_USAGE_MS)
//         {
//           zones[i].status = "Long Usage";
//         }
//         else
//         {
//           zones[i].status = "Running";
//         }
//       }
//       else
//       {
//         // No flow detected
//         zones[i].isFlowing = false;
//         zones[i].status = "Inactive";
//       }

//       // Print to Serial Monitor
//       Serial.printf("Zone %d [%s]: %.2f L/min | Status: %s | Total: %.2f L\n", 
//                     i + 1, 
//                     zones[i].name.c_str(), 
//                     zones[i].flowRateLmin, 
//                     zones[i].status.c_str(),
//                     (float)zones[i].totalPulses / PULSES_PER_LITER);

//       // Publish to MQTT
//       publishZone(zones[i]);
//     }
    
//     lastMillis = millis();
//   }
// }

#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>  // For SSL/TLS
#include <PubSubClient.h>
#include <ArduinoJson.h>

#define MQTT_MAX_PACKET_SIZE 512

// --- Sensor Pins ---
#define SENSOR_1_PIN 25
#define SENSOR_2_PIN 26
#define SENSOR_3_PIN 27

// --- WiFi Config ---
const char *ssid = "Danny";
const char *password = "nononnein";

// --- HiveMQ Cloud Config ---
const char *mqtt_server = "Danny-0fc5e19c.a01.euc1.aws.hivemq.cloud";  // ← CHANGE THIS
const int mqtt_port = 8883;  // 8883 for SSL, 1883 for non-SSL
const char *mqtt_user = "hydropulse";  // ← CHANGE THIS
const char *mqtt_password = "Hydropulse123";  // ← CHANGE THIS
const char *mqtt_command_topic = "hydropulse/commands/#";

// --- Calibration ---
const float PULSES_PER_LITER = 450.0;
const float K_FACTOR = 7.0;
const unsigned long LEAK_THRESHOLD_MS = 1800000;
const unsigned long LONG_USAGE_MS = 300000;

// --- Objects ---
WiFiClientSecure espClient;  // Changed for SSL
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
  static unsigned long lastMicros = 0;
  unsigned long now = micros();
  if (now - lastMicros > 10000) {
    zones[0].totalPulses++;
    zones[0].currentSecondPulses++;
    lastMicros = now;
  }
}

void IRAM_ATTR pulseCounter2()
{
  static unsigned long lastMicros = 0;
  unsigned long now = micros();
  if (now - lastMicros > 10000) {
    zones[1].totalPulses++;
    zones[1].currentSecondPulses++;
    lastMicros = now;
  }
}

void IRAM_ATTR pulseCounter3()
{
  static unsigned long lastMicros = 0;
  unsigned long now = micros();
  if (now - lastMicros > 10000) {
    zones[2].totalPulses++;
    zones[2].currentSecondPulses++;
    lastMicros = now;
  }
}

void callback(char *topic, byte *payload, unsigned int length)
{
  JsonDocument doc;
  deserializeJson(doc, payload, length);
  const char *action = doc["action"];
  
  if (action && strcmp(action, "START_SCAN") == 0)
  {
    Serial.println("COMMAND: Starting diagnostic...");
  }
  else if (action && strcmp(action, "RESET_TOTALS") == 0)
  {
    Serial.println("COMMAND: Resetting all zone totals...");
    for (int i = 0; i < 3; i++)
    {
      noInterrupts();
      zones[i].totalPulses = 0;
      interrupts();
    }
  }
}

void setup_wifi()
{
  delay(10);
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  
  int timeout = 0;
  while (WiFi.status() != WL_CONNECTED && timeout < 20) 
  {
    delay(500);
    Serial.print(".");
    timeout++;
  }
  
  if (WiFi.status() == WL_CONNECTED) 
  {
    Serial.println("\n✓ WiFi connected");
    Serial.print("  IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("  Signal: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
  } 
  else 
  {
    Serial.println("\n✗ WiFi connection failed!");
  }
}

void reconnect()
{
  while (!client.connected())
  {
    Serial.print("Connecting to HiveMQ Cloud: ");
    Serial.print(mqtt_server);
    Serial.print(":");
    Serial.println(mqtt_port);
    
    if (client.connect("ESP32_HydroPulse_Multi", mqtt_user, mqtt_password))
    {
      Serial.println("✓ MQTT connected to HiveMQ Cloud!");
      client.subscribe(mqtt_command_topic);
      
      // Publish startup message
      JsonDocument doc;
      doc["device"] = "ESP32_HydroPulse";
      doc["status"] = "online";
      doc["zones"] = 3;
      char buffer[128];
      serializeJson(doc, buffer);
      client.publish("hydropulse/system/status", buffer);
    }
    else
    {
      Serial.print("✗ MQTT failed, rc=");
      Serial.print(client.state());
      Serial.println();
      
      // Print error details
      switch(client.state()) {
        case -4: Serial.println("  → Connection timeout"); break;
        case -3: Serial.println("  → Connection lost"); break;
        case -2: Serial.println("  → Connect failed"); break;
        case -1: Serial.println("  → Disconnected"); break;
        case 1: Serial.println("  → Bad protocol"); break;
        case 2: Serial.println("  → Bad client ID"); break;
        case 3: Serial.println("  → Unavailable"); break;
        case 4: Serial.println("  → Bad credentials"); break;
        case 5: Serial.println("  → Unauthorized"); break;
      }
      
      Serial.println("  Retrying in 5s...");
      delay(5000);
    }
  }
}

void publishZone(WaterZone &z)
{
  JsonDocument doc;
  doc["zoneId"] = z.id;
  doc["zoneName"] = z.name;
  doc["flowRate"] = z.flowRateLmin;
  
  noInterrupts();
  unsigned long pulses = z.totalPulses;
  interrupts();
  
  doc["totalVolume"] = (float)pulses / PULSES_PER_LITER;
  doc["status"] = z.status;
  doc["timestamp"] = millis();

  char buffer[256];
  serializeJson(doc, buffer);
  String topic = "hydropulse/status/" + z.id;
  
  if (!client.publish(topic.c_str(), buffer))
  {
    Serial.println("✗ MQTT publish failed for zone " + z.id);
  }
}

void setup()
{
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n╔════════════════════════════════════╗");
  Serial.println("║  HydroPulse Multi-Zone Monitor    ║");
  Serial.println("║  HiveMQ Cloud Edition              ║");
  Serial.println("╚════════════════════════════════════╝\n");
  
  setup_wifi();
  
  // Configure SSL/TLS for HiveMQ Cloud
  espClient.setInsecure();  // Skip certificate validation
  
  client.setBufferSize(512);
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
  
  pinMode(SENSOR_1_PIN, INPUT_PULLUP);
  pinMode(SENSOR_2_PIN, INPUT_PULLUP);
  pinMode(SENSOR_3_PIN, INPUT_PULLUP);

  attachInterrupt(digitalPinToInterrupt(SENSOR_1_PIN), pulseCounter1, FALLING);
  attachInterrupt(digitalPinToInterrupt(SENSOR_2_PIN), pulseCounter2, FALLING);
  attachInterrupt(digitalPinToInterrupt(SENSOR_3_PIN), pulseCounter3, FALLING);
  
  Serial.println("\n✓ Setup complete!");
  Serial.println("Monitoring zones:");
  for (int i = 0; i < 3; i++)
  {
    Serial.printf("  • Zone %s: %s (GPIO %d)\n", 
                  zones[i].id.c_str(), 
                  zones[i].name.c_str(),
                  (i == 0) ? SENSOR_1_PIN : (i == 1) ? SENSOR_2_PIN : SENSOR_3_PIN);
  }
  Serial.println();
}

void loop()
{
  if (!client.connected())
    reconnect();
  client.loop();

  if (millis() - lastMillis >= 1000)
  {
    Serial.println("\n─── HYDRO PULSE REPORT ───");
    
    for (int i = 0; i < 3; i++)
    {
      noInterrupts();
      int pulsesThisSecond = zones[i].currentSecondPulses;
      zones[i].currentSecondPulses = 0;
      interrupts();
      
      zones[i].flowRateLmin = (float)pulsesThisSecond / K_FACTOR;

      if (zones[i].flowRateLmin > 0.1)
      {
        if (!zones[i].isFlowing)
        {
          zones[i].isFlowing = true;
          zones[i].flowStartTime = millis();
        }
        
        unsigned long flowDuration = millis() - zones[i].flowStartTime;
        
        if (flowDuration > LEAK_THRESHOLD_MS)
          zones[i].status = "LEAK DETECTED!";
        else if (flowDuration > LONG_USAGE_MS)
          zones[i].status = "Long Usage";
        else
          zones[i].status = "Running";
      }
      else
      {
        zones[i].isFlowing = false;
        zones[i].status = "Inactive";
      }

      Serial.printf("Zone %d [%s]: %.2f L/min | %s | Total: %.2f L\n", 
                    i + 1, 
                    zones[i].name.c_str(), 
                    zones[i].flowRateLmin, 
                    zones[i].status.c_str(),
                    (float)zones[i].totalPulses / PULSES_PER_LITER);

      publishZone(zones[i]);
    }
    
    lastMillis = millis();
  }
}