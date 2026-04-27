// --- Zone & Status Types ---
export type ZoneStatus = "Leakage" | "Inactive" | "Running";

// types/index.ts or types.ts
export interface Zone {
  id: string;
  zoneId?: string;
  name?: string;
  flowRate: number;
  totalVolume: number;
  status: "Running" | "Inactive" | "Leakage";
  timestamp: number;
  threshold?: number; // Optional threshold for leakage detection
  timeUsage?: string; // Optional field for usage duration

  // Optional fields
  duration?: string;
  startTime?: number;
  lastUsed?: string;
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
  type?: string;
  date?: string;
  zoneName?: string;
  timestamp?: string; // ISO format for sorting
}

// --- MQTT Message Types ---
export interface MqttStatusMessage {
  zoneId: string;
  zoneName?: string;
  flowRate: number;
  totalVolume: number;
  status: ZoneStatus;
  timestamp?: number;
}

// --- API Responses ---
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
