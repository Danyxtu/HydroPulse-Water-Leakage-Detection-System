// --- Zone & Status Types ---
export type ZoneStatus = 'Leakage' | 'Inactive' | 'Running';

export interface Zone {
  id: string;
  zoneId: string;
  name: string;
  timeUsage: string;
  status: ZoneStatus;
  flowRate?: number;
  totalVolume?: number;
  estimatedVolume?: string;
  threshold?: number; // L/min threshold for leakage detection
}

// --- Usage Statistics ---
export interface UsageStat {
  value: number;
  color: string;
  text: string;
  label?: string;
}

export interface CurrentUsage {
  time: string;
  estimatedVolume: string;
  stats: UsageStat[];
}

// --- Activity & Usage Logs ---
export interface LogEntry {
  id: string;
  zone: string;
  time: string;
  duration: string;
  volume: string;
  timestamp?: string; // ISO format for sorting
}

// --- MQTT Message Types ---
export interface MqttStatusMessage {
  zoneId: string;
  flowRate: number;
  totalVolume: number;
  status: ZoneStatus;
}

// --- API Responses ---
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
