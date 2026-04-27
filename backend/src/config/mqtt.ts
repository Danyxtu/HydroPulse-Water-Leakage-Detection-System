import mqtt from "mqtt";
import type { ZoneStatus } from "@prisma/client";
import prisma from "../utils/prisma.js";

const MQTT_URL =
  process.env.MQTT_URL ||
  process.env.EXPO_PUBLIC_MQTT_URL ||
  "mqtt://localhost:1883";
const MQTT_USERNAME =
  process.env.MQTT_USERNAME || process.env.EXPO_PUBLIC_MQTT_USERNAME;
const MQTT_PASSWORD =
  process.env.MQTT_PASSWORD || process.env.EXPO_PUBLIC_MQTT_PASSWORD;

const TOPICS = {
  telemetry: "hydropulse/zones/+/telemetry",
  usage: "hydropulse/zones/+/usage",
  alerts: "hydropulse/zones/+/alerts",
};

const ZONE_NAMES: Record<string, string> = {
  "1": "Kitchen",
  "2": "Guest Bath",
  "3": "Master Bath",
};

type TelemetryPayload = {
  zoneId?: string | number;
  flowRate?: number | string;
  totalVol?: number | string;
  totalVolume?: number | string;
  status?: string;
};

type UsagePayload = {
  zoneId?: string | number;
  totalVol?: number | string;
  totalVolume?: number | string;
  duration?: number | string;
  status?: string;
};

type AlertPayload = {
  zoneId?: string | number;
  alertType?: string;
  msg?: string;
};

const parseJson = <T>(raw: Buffer): T | null => {
  try {
    return JSON.parse(raw.toString()) as T;
  } catch {
    return null;
  }
};

const toFiniteNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const extractZoneIdFromTopic = (topic: string): string | null => {
  const parts = topic.split("/");
  if (parts.length < 4) {
    return null;
  }

  return parts[2] || null;
};

const formatDuration = (durationMs: number): string => {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
};

const toZoneStatus = (rawStatus?: string): ZoneStatus => {
  const status = (rawStatus || "").toUpperCase();

  if (status === "LEAK") {
    return "Leakage";
  }

  if (status === "ON" || status === "WARN") {
    return "Running";
  }

  return "Inactive";
};

const ensureZone = async (zoneId: string) => {
  return prisma.zone.upsert({
    where: { zoneId },
    update: {},
    create: {
      zoneId,
      name: ZONE_NAMES[zoneId] || `Zone ${zoneId}`,
      status: "Inactive",
      flowRate: 0,
      totalVolume: 0,
      threshold: 5.0,
    },
  });
};

const handleTelemetry = async (topic: string, message: Buffer) => {
  const payload = parseJson<TelemetryPayload>(message);
  if (!payload) {
    return;
  }

  const zoneId = String(
    payload.zoneId || extractZoneIdFromTopic(topic) || "",
  ).trim();
  if (!zoneId) {
    return;
  }

  const flowRate = toFiniteNumber(payload.flowRate, 0);
  const totalVolume = toFiniteNumber(
    payload.totalVol ?? payload.totalVolume,
    0,
  );
  const status = toZoneStatus(payload.status);

  const zone = await prisma.zone.upsert({
    where: { zoneId },
    update: {
      flowRate,
      totalVolume,
      status,
    },
    create: {
      zoneId,
      name: ZONE_NAMES[zoneId] || `Zone ${zoneId}`,
      flowRate,
      totalVolume,
      status,
      threshold: 5.0,
    },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.dailyUsage.upsert({
    where: {
      zoneId_date: {
        zoneId: zone.id,
        date: today,
      },
    },
    update: {
      volume: totalVolume,
    },
    create: {
      zoneId: zone.id,
      date: today,
      volume: totalVolume,
    },
  });
};

const handleUsage = async (topic: string, message: Buffer) => {
  const payload = parseJson<UsagePayload>(message);
  if (!payload) {
    return;
  }

  const zoneId = String(
    payload.zoneId || extractZoneIdFromTopic(topic) || "",
  ).trim();
  if (!zoneId) {
    return;
  }

  const totalVolume = toFiniteNumber(
    payload.totalVol ?? payload.totalVolume,
    0,
  );
  const durationMs = toFiniteNumber(payload.duration, 0);
  const zone = await ensureZone(zoneId);

  await prisma.activityLog.create({
    data: {
      zoneId: zone.id,
      duration: formatDuration(durationMs),
      volume: `${totalVolume.toFixed(2)}L`,
      type: payload.status ? `Usage:${payload.status}` : "Usage",
    },
  });
};

const handleAlert = async (topic: string, message: Buffer) => {
  const payload = parseJson<AlertPayload>(message);
  if (!payload) {
    return;
  }

  const zoneId = String(
    payload.zoneId || extractZoneIdFromTopic(topic) || "",
  ).trim();
  if (!zoneId) {
    return;
  }

  const zone = await ensureZone(zoneId);

  await prisma.activityLog.create({
    data: {
      zoneId: zone.id,
      duration: payload.msg || "Alert detected",
      volume: "--",
      type: payload.alertType || "Alert",
    },
  });
};

const routeIncomingMessage = async (topic: string, message: Buffer) => {
  if (topic.endsWith("/telemetry")) {
    await handleTelemetry(topic, message);
    return;
  }

  if (topic.endsWith("/usage")) {
    await handleUsage(topic, message);
    return;
  }

  if (topic.endsWith("/alerts")) {
    await handleAlert(topic, message);
  }
};

// Singleton instance to prevent multiple connections
let mqttClient: mqtt.MqttClient | null = null;

/**
 * Connects to the MQTT broker and sets up base event listeners.
 */
export const connectMQTT = (): Promise<mqtt.MqttClient> => {
  return new Promise((resolve, reject) => {
    if (mqttClient) {
      return resolve(mqttClient);
    }

    console.log(`🔌 Connecting to MQTT broker at ${MQTT_URL}...`);

    const options: mqtt.IClientOptions = {
      clientId: `hydropulse_backend_${Math.random().toString(16).substring(2, 8)}`,
      clean: true,
      connectTimeout: 4000,
      reconnectPeriod: 1000,
    };

    if (MQTT_USERNAME) options.username = MQTT_USERNAME;
    if (MQTT_PASSWORD) options.password = MQTT_PASSWORD;

    mqttClient = mqtt.connect(MQTT_URL, options);

    mqttClient.on("connect", () => {
      console.log("✅ Connected to MQTT broker successfully!");

      mqttClient?.subscribe(Object.values(TOPICS), (err) => {
        if (err) {
          console.error("❌ Failed to subscribe to MQTT topics:", err);
        } else {
          console.log(
            `📡 Subscribed: ${TOPICS.telemetry}, ${TOPICS.usage}, ${TOPICS.alerts}`,
          );
        }
      });

      resolve(mqttClient!);
    });

    mqttClient.on("error", (error) => {
      console.error("❌ MQTT Connection error:", error.message);

      if (!mqttClient?.connected) {
        reject(error);
      }
    });

    mqttClient.on("reconnect", () => {
      console.log("🔄 Reconnecting to MQTT broker...");
    });

    mqttClient.on("close", () => {
      console.log("🔌 Disconnected from MQTT broker.");
    });

    mqttClient.on("message", async (topic, message) => {
      try {
        await routeIncomingMessage(topic, message);
      } catch (error) {
        console.error(`❌ Failed to process MQTT message on ${topic}:`, error);
      }
    });
  });
};

/**
 * Returns the active MQTT client. Throws an error if not connected.
 */
export const getMQTTClient = (): mqtt.MqttClient => {
  if (!mqttClient) {
    throw new Error("MQTT client is not initialized. Call connectMQTT first.");
  }
  return mqttClient;
};

/**
 * Gracefully disconnects the MQTT client.
 */
export const disconnectMQTT = () => {
  if (mqttClient) {
    mqttClient.end(false, () => {
      console.log("🔌 MQTT client ended gracefully.");
    });
    mqttClient = null;
  }
};
