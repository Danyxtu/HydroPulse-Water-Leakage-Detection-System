import mqtt from "mqtt";
import { Buffer } from "buffer";

/**
 * MQTT connection
 *
 *  - Connects to the MQTT broker using credentials from environment variables.
 *     * CLient ID is generated randomly for each session to avoid conflicts.
 *     * Username from the .env
 *     * Password from the .env
 */

// MQTT Service to handle all MQTT related operations

const username = process.env.EXPO_PUBLIC_MQTT_USERNAME ?? "";
const password = process.env.EXPO_PUBLIC_MQTT_PASSWORD ?? "";
const MQTT_URL = process.env.EXPO_PUBLIC_MQTT_URL ?? "";

if (!MQTT_URL) {
  console.warn("[MQTT] EXPO_PUBLIC_MQTT_URL is not set.");
}

const options: mqtt.IClientOptions = {
  clientId: `my_ts_client_${Math.random().toString(16).substring(2, 8)}`,
  clean: true, // true: remove subscriptions on disconnect
  connectTimeout: 4000, // Time in milliseconds to wait for a connection
  reconnectPeriod: 1000, // Time between reconnection attempts
  username: username, // Uncomment if your broker requires auth
  password: password, // Uncomment if your broker requires auth
};

// Poly fill for Buffer in React Native environment
if (typeof global.Buffer === "undefined") {
  global.Buffer = Buffer;
}

export const mqttService = {
  client: null as mqtt.MqttClient | null,

  connect: function () {
    if (this.client?.connected) {
      console.log("⚡ MQTT Client already exists.");
      return;
    }

    if (this.client && !this.client.connected) {
      console.log("🔄 MQTT Client reconnecting...");
      return;
    }

    console.log("🔌 Connecting to MQTT broker...");
    this.client = mqtt.connect(MQTT_URL, options);

    this.client.on("connect", () => {
      console.log("✅ Connected to MQTT broker");
    });

    this.client.on("reconnect", () => {
      console.log("🔄 Reconnecting to MQTT broker...");
    });

    this.client.on("error", (error) => {
      console.error("❌ MQTT connection error:", error.message);
    });

    this.client.on("close", () => {
      console.log("🔌 MQTT connection closed");
    });
  },

  disconnect: function () {
    if (this.client) {
      const activeClient = this.client;
      this.client = null;
      activeClient.end(true, () => {
        console.log("🔌 Disconnected from MQTT broker");
      });
    }
  },
};
