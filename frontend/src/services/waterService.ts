import { apiClient } from "./apiClient";
import { Zone, CurrentUsage, LogEntry, ApiResponse } from "../types";

/**
 * --- Water Service (API Backend) ---
 * Now connects to your actual backend server.
 */

export const waterService = {
  // Initialize (Handled by server)
  initializeStorage: async () => {
    console.log("[API] Backend handles initialization");
  },

  // READ: Get all zones from DB
  getZones: async (): Promise<ApiResponse<Zone[]>> => {
    try {
      return await apiClient.get("/zones");
    } catch (e) {
      return {
        success: false,
        data: [],
        message: "Failed to connect to backend",
      };
    }
  },

  // READ: Get usage stats from DB
  getCurrentUsage: async (): Promise<ApiResponse<CurrentUsage>> => {
    try {
      return await apiClient.get("/usage/current");
    } catch (e) {
      return {
        success: false,
        data: { time: "--:--", estimatedVolume: "0.0L", stats: [] },
        message: "Backend connection failed",
      };
    }
  },

  // READ: Get activity logs from DB
  getActivityLogs: async (): Promise<ApiResponse<LogEntry[]>> => {
    try {
      return await apiClient.get("/logs");
    } catch (e) {
      return { success: false, data: [], message: "Failed to fetch logs" };
    }
  },

  // Real-time update logic (Used by MQTT to update local UI state)
  applyLocalUpdate: (
    id: string,
    updates: Partial<Zone>,
    currentZones: Zone[],
  ): Zone[] => {
    return currentZones.map((z) =>
      z.id === id || z.zoneId === id ? { ...z, ...updates } : z,
    );
  },

  // TRIGGER: Start detection scan (Sends request to backend)
  startDetectionScan: async (): Promise<
    ApiResponse<{ success: boolean; results: any }>
  > => {
    try {
      return await apiClient.post("/detection/scan", {});
    } catch (e) {
      return {
        success: false,
        data: { success: false, results: null },
        message: "Failed to start scan",
      };
    }
  },

  // ZONE MANAGEMENT (CRUD)
  createZone: async (data: Partial<Zone>): Promise<ApiResponse<Zone>> => {
    return await apiClient.post("/zones", data);
  },

  updateZone: async (
    id: string,
    data: Partial<Zone>,
  ): Promise<ApiResponse<Zone>> => {
    return await apiClient.patch(`/zones/${id}`, data);
  },

  deleteZone: async (id: string): Promise<ApiResponse<boolean>> => {
    return await apiClient.delete(`/zones/${id}`);
  },
};
