import { useState, useEffect } from "react";
import { Buffer } from "buffer";
import { useMqttContext } from "@context/MqttContext";

const topicMatches = (pattern: string, candidate: string) => {
  const patternParts = pattern.split("/");
  const candidateParts = candidate.split("/");

  for (let i = 0; i < patternParts.length; i++) {
    const part = patternParts[i];

    if (part === "#") {
      return true;
    }

    if (!candidateParts[i]) {
      return false;
    }

    if (part !== "+" && part !== candidateParts[i]) {
      return false;
    }
  }

  return patternParts.length === candidateParts.length;
};

export const useMqtt = <T = unknown>(topic: string) => {
  const { client } = useMqttContext();
  const [latestData, setLatestData] = useState<T | null>(null);
  const [latestTopic, setLatestTopic] = useState<string | null>(null);
  const [status, setStatus] = useState("disconnected");

  useEffect(() => {
    if (!client) {
      console.warn("⚠️ MQTT client is not ready yet.");
      return;
    }

    setStatus(client.connected ? "connected" : "disconnected");

    client.subscribe(topic, (err) => {
      if (err) {
        console.error(`❌ Failed to subscribe to ${topic}`, err);
      } else {
        console.log(`📡 Subscribed to topic: ${topic}`);
      }
    });

    const handleMessage = (receivedTopic: string, message: Uint8Array) => {
      if (!topicMatches(topic, receivedTopic)) {
        return;
      }

      try {
        const dataString = Buffer.from(message).toString();
        const parsed = JSON.parse(dataString) as T;
        setLatestTopic(receivedTopic);
        setLatestData(parsed);
      } catch (error) {
        console.error("❌ Error processing message:", error);
      }
    };

    const handleConnect = () => setStatus("connected");
    const handleClose = () => setStatus("disconnected");
    const handleReconnect = () => setStatus("reconnecting");

    client.on("message", handleMessage);
    client.on("connect", handleConnect);
    client.on("close", handleClose);
    client.on("reconnect", handleReconnect);

    return () => {
      console.log(`🛑 Unsubscribing from topic: ${topic}`);
      client.unsubscribe(topic);
      client.removeListener("message", handleMessage);
      client.removeListener("connect", handleConnect);
      client.removeListener("close", handleClose);
      client.removeListener("reconnect", handleReconnect);
    };
  }, [client, topic]);

  return { latestData, latestTopic, status };
};
