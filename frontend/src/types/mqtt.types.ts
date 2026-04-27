export type DeviceTelemetryStatus = "ON" | "OFF" | "WARN" | "LEAK";

export interface MqttTelemetryPayload {
  zoneId: string;
  flowRate: number;
  totalVol: number;
  status: DeviceTelemetryStatus;
}

export interface MqttUsagePayload {
  zoneId: string;
  totalVol: number;
  duration: number;
  status: string;
}

export interface MqttAlertPayload {
  zoneId: string;
  alertType: string;
  msg: string;
}
