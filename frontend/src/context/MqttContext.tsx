import React, { createContext, useContext, useEffect, useState } from "react";
import { mqttService } from "../services/mqttService";
import mqtt from "mqtt";

type ConnectionStatus =
  | "connected"
  | "connecting"
  | "disconnected"
  | "error"
  | "reconnecting";

interface MqttContextType {
  status: ConnectionStatus;
  client: mqtt.MqttClient | null;
}

const MqttContext = createContext<MqttContextType | undefined>(undefined);

export const MqttProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");

  useEffect(() => {
    mqttService.connect();
    const client = mqttService.client;

    if (client) {
      if (client.connected) {
        setStatus("connected");
      } else {
        setStatus("connecting");
      }

      const handleConnect = () => setStatus("connected");
      const handleClose = () => setStatus("disconnected");
      const handleOffline = () => setStatus("disconnected");
      const handleReconnect = () => setStatus("reconnecting");
      const handleError = () => setStatus("error");

      client.on("connect", handleConnect);
      client.on("close", handleClose);
      client.on("offline", handleOffline);
      client.on("reconnect", handleReconnect);
      client.on("error", handleError);

      return () => {
        client.removeListener("connect", handleConnect);
        client.removeListener("close", handleClose);
        client.removeListener("offline", handleOffline);
        client.removeListener("reconnect", handleReconnect);
        client.removeListener("error", handleError);
      };
    }
  }, []);

  return (
    <MqttContext.Provider value={{ status, client: mqttService.client }}>
      {children}
    </MqttContext.Provider>
  );
};

export const useMqttContext = () => {
  const context = useContext(MqttContext);
  if (context === undefined) {
    throw new Error("useMqttContext must be used within an MqttProvider");
  }
  return context;
};
