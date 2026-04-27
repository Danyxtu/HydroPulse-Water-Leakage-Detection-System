import mqtt from "mqtt";
import "dotenv/config"; // Load environment variables from .env file

const username = process.env.EXPO_PUBLIC_MQTT_USERNAME ?? ""; // Replace with your MQTT broker username
const password = process.env.EXPO_PUBLIC_MQTT_PASSWORD ?? ""; // Replace with your MQTT broker password

const options: mqtt.IClientOptions = {
  clientId: `my_ts_client_${Math.random().toString(16).substring(2, 8)}`,
  clean: true, // true: remove subscriptions on disconnect
  connectTimeout: 4000, // Time in milliseconds to wait for a connection
  reconnectPeriod: 1000, // Time between reconnection attempts
  username: username, // Uncomment if your broker requires auth
  password: password, // Uncomment if your broker requires auth
};

const brokerUrl = process.env.EXPO_PUBLIC_MQTT_URL ?? "";

const client: mqtt.MqttClient = mqtt.connect(brokerUrl, options);

console.log("Connecting to:", brokerUrl || "EMPTY! Defaulting to localhost");
client.on("connect", () => {
  console.log("✅ Connected to MQTT broker successfully!");

  // Example: Subscribe to a topic once connected
  // client.subscribe("typescript/demo/topic", (err) => {
  //   if (!err) {
  //     console.log("Subscribed to topic");
  //     // Publish a test message
  //     client.publish("typescript/demo/topic", "Hello from TypeScript!");
  //   }
  // });
  client.subscribe("hydropulse/zones/1/telemetry", (err) => {
    if (!err) {
      console.log("Subscribed to another topic");
    } else {
      console.error("Failed to subscribe to another topic:", err);
    }
  });
});

client.on("error", (error: Error) => {
  console.error("❌ Connection error:", error);
  client.end(); // Safely close the client on a fatal error
});

client.on("reconnect", () => {
  console.log("🔄 Reconnecting to broker...");
});

client.on("message", (topic: string, message: Buffer) => {
  // Messages arrive as Node.js Buffers, so they need to be converted to strings
  console.log(`📩 Received message on [${topic}]: ${message.toString()}`);
});
