/**
 * --- ENHANCED MQTT SERVICE ---
 * Manages WebSocket connection to MQTT broker with:
 * - Auto-reconnection
 * - Proper cleanup
 * - Connection state tracking
 * - Multiple callback support
 */

import mqtt from "mqtt";
import { Buffer } from "buffer";
import { MqttStatusMessage } from "../types";

// Polyfill for Buffer (Required for MQTT in React Native)
if (typeof global.Buffer === "undefined") {
  global.Buffer = Buffer;
}

// Connection states
export type ConnectionState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

interface MqttCallbacks {
  onStatusUpdate?: (data: MqttStatusMessage) => void;
  onConnectionChange?: (state: ConnectionState) => void;
  onError?: (error: Error) => void;
}

const resolveBrokerUrl = () => {
  // Prefer explicit env; must include protocol (ws:// or wss://)
  const envUrl = process.env.EXPO_PUBLIC_MQTT_URL;
  if (envUrl) return envUrl;

  // Default to HiveMQ Cloud secure WebSocket endpoint; change to your own
  // cluster URL if needed. Format: wss://<cluster>.s#.hivemq.cloud:8884/mqtt
  return "wss://danny-0fc5e19c.a01.euc1.aws.hivemq.cloud:8884/mqtt";
};

// Optional auth (HiveMQ Cloud requires username/password)
const resolveAuth = () => {
  const username = process.env.EXPO_PUBLIC_MQTT_USERNAME;
  const password = process.env.EXPO_PUBLIC_MQTT_PASSWORD;

  if (username && password) {
    return { username, password };
  }

  // Fallback credentials (requested defaults)
  return { username: "hydropulse", password: "Hydropulse123" };
};

export const mqttService = {
  client: null as mqtt.MqttClient | null,
  connectionState: "disconnected" as ConnectionState,
  callbacks: {} as MqttCallbacks,
  reconnectAttempts: 0,
  maxReconnectAttempts: 5,

  // Broker Configuration
  brokerConfig: {
    host: resolveBrokerUrl(),
    clientId: `HydroPulse_${Math.random().toString(16).slice(2, 8)}`,
    reconnectPeriod: 5000, // 5 seconds
    connectTimeout: 30000, // 30 seconds
  },

  // Topics
  topics: {
    status: "hydropulse/status/+", // Wildcard for all zones
    statusZone: (zoneId: string) => `hydropulse/status/${zoneId}`,
    command: "hydropulse/cmd",
    detection: "hydropulse/detection/+",
  },

  /**
   * --- Initialize Connection ---
   */
  connect: (callbacks: MqttCallbacks = {}) => {
    // Prevent multiple connections
    if (mqttService.client?.connected) {
      console.log("[MQTT] Already connected");
      return;
    }

    // Store callbacks
    mqttService.callbacks = callbacks;

    console.log("[MQTT] Connecting to broker...");
    mqttService.setConnectionState("connecting");

    const client = mqtt.connect(mqttService.brokerConfig.host, {
      clientId: mqttService.brokerConfig.clientId,
      reconnectPeriod: mqttService.brokerConfig.reconnectPeriod,
      connectTimeout: mqttService.brokerConfig.connectTimeout,
      clean: true, // Clean session
      ...resolveAuth(),
    });

    // --- Connection Events ---
    client.on("connect", () => {
      console.log("[MQTT] ✅ Connected to broker!");
      mqttService.reconnectAttempts = 0;
      mqttService.setConnectionState("connected");

      // Subscribe to topics
      mqttService.subscribeToTopics(client);
    });

    client.on("reconnect", () => {
      mqttService.reconnectAttempts++;
      console.log(
        `[MQTT] 🔄 Reconnecting... Attempt ${mqttService.reconnectAttempts}`,
      );

      if (mqttService.reconnectAttempts >= mqttService.maxReconnectAttempts) {
        console.error("[MQTT] ❌ Max reconnection attempts reached");
        mqttService.disconnect();
      }
    });

    client.on("close", () => {
      console.log("[MQTT] Connection closed");
      mqttService.setConnectionState("disconnected");
    });

    client.on("offline", () => {
      console.log("[MQTT] ⚠️ Client offline");
      mqttService.setConnectionState("disconnected");
    });

    client.on("error", (err) => {
      console.error("[MQTT] ❌ Error:", err.message);
      mqttService.setConnectionState("error");

      if (mqttService.callbacks.onError) {
        mqttService.callbacks.onError(err);
      }
    });

    // --- Message Handler ---
    client.on("message", (topic, payload) => {
      mqttService.handleMessage(topic, payload);
    });

    mqttService.client = client;
  },

  /**
   * --- Subscribe to Topics ---
   */
  subscribeToTopics: (client: mqtt.MqttClient) => {
    // Subscribe to status updates for all zones
    client.subscribe(mqttService.topics.status, { qos: 1 }, (err) => {
      if (err) {
        console.error("[MQTT] Subscription error:", err);
      } else {
        console.log("[MQTT] ✅ Subscribed to status updates");
      }
    });

    // Subscribe to detection alerts
    client.subscribe(mqttService.topics.detection, { qos: 1 }, (err) => {
      if (err) {
        console.error("[MQTT] Subscription error:", err);
      } else {
        console.log("[MQTT] ✅ Subscribed to detection alerts");
      }
    });
  },

  /**
   * --- Handle Incoming Messages ---
   */
  handleMessage: (topic: string, payload: Buffer) => {
    try {
      const messageStr = payload.toString();
      console.log(`[MQTT] 📨 Message from ${topic}:`, messageStr);

      // Parse JSON
      const data = JSON.parse(messageStr);

      // Route message based on topic
      if (topic.startsWith("hydropulse/status/")) {
        mqttService.handleStatusUpdate(data, topic);
      } else if (topic.startsWith("hydropulse/detection/")) {
        mqttService.handleDetectionAlert(data, topic);
      }
    } catch (error) {
      console.error("[MQTT] ❌ Message parsing error:", error);
      // Don't crash - just log and continue
    }
  },

  /**
   * --- Handle Status Updates ---
   */
  handleStatusUpdate: (data: any, topic: string) => {
    try {
      // Extract zone ID from topic (e.g., hydropulse/status/1 → "1")
      const zoneId = topic.split("/").pop();

      console.log("[MQTT] Parsed status payload:", data);

      // Validate data structure
      const statusMessage: MqttStatusMessage = {
        zoneId: data.zoneId || zoneId,
        zoneName: data.zoneName,
        flowRate: parseFloat(data.flowRate) || 0,
        totalVolume: parseFloat(data.totalVolume) || 0,
        status: data.status,
        timestamp: data.timestamp || Date.now(),
      };

      // Callback to UI
      if (mqttService.callbacks.onStatusUpdate) {
        mqttService.callbacks.onStatusUpdate(statusMessage);
      }
    } catch (error) {
      console.error("[MQTT] Error handling status update:", error);
    }
  },

  /**
   * --- Handle Detection Alerts ---
   */
  handleDetectionAlert: (data: any, topic: string) => {
    console.log("[MQTT] 🚨 Detection Alert (raw):", data);
    console.log("[MQTT] 🚨 Detection Alert topic:", topic);
    // You can add a separate callback for detection alerts
    // callbacks.onDetectionAlert?.(data);
  },

  /**
   * --- Send Commands to Hardware ---
   */
  sendCommand: (action: string, zoneId: string = "1") => {
    if (!mqttService.client?.connected) {
      console.error("[MQTT] Cannot send command - not connected");
      return false;
    }

    try {
      const payload = JSON.stringify({
        action,
        zoneId,
        timestamp: Date.now(),
      });

      mqttService.client.publish(
        mqttService.topics.command,
        payload,
        { qos: 1, retain: false },
        (err) => {
          if (err) {
            console.error("[MQTT] Publish error:", err);
          } else {
            console.log(`[MQTT] ✅ Command sent: ${action} to zone ${zoneId}`);
          }
        },
      );

      return true;
    } catch (error) {
      console.error("[MQTT] Error sending command:", error);
      return false;
    }
  },

  /**
   * --- Disconnect and Cleanup ---
   */
  disconnect: () => {
    if (!mqttService.client) return;

    console.log("[MQTT] Disconnecting...");

    try {
      mqttService.client.end(false, {}, () => {
        console.log("[MQTT] ✅ Disconnected");
      });
    } catch (error) {
      console.error("[MQTT] Error during disconnect:", error);
    }

    mqttService.client = null;
    mqttService.setConnectionState("disconnected");
    mqttService.callbacks = {};
    mqttService.reconnectAttempts = 0;
  },

  /**
   * --- Connection State Management ---
   */
  setConnectionState: (state: ConnectionState) => {
    mqttService.connectionState = state;

    if (mqttService.callbacks.onConnectionChange) {
      mqttService.callbacks.onConnectionChange(state);
    }
  },

  /**
   * --- Get Connection Status ---
   */
  isConnected: (): boolean => {
    return mqttService.client?.connected || false;
  },

  /**
   * --- Get Connection State ---
   */
  getConnectionState: (): ConnectionState => {
    return mqttService.connectionState;
  },
};
