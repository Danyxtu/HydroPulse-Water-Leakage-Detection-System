/**
 * --- Centralized API Client ---
 * Resolves the API base URL in this order:
 * 1) EXPO_PUBLIC_API_URL env (set in .env / eas.json)
 * 2) Emulator-friendly localhost (Android = 10.0.2.2, iOS/web = localhost)
 * 3) Legacy LAN fallback (previous hardcoded IP)
 */
import { Platform } from "react-native";

const LEGACY_LAN_IP = "192.168.254.184";
const DEFAULT_PORT = 3000;

const getBaseUrl = () => {
  // Preferred: explicitly configured public env
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) return envUrl.replace(/\/$/, "") + "/api";

  // Emulator-friendly local dev
  if (Platform.OS === "android") {
    return `http://10.0.2.2:${DEFAULT_PORT}/api`;
  }
  if (Platform.OS === "ios" || Platform.OS === "web") {
    return `http://localhost:${DEFAULT_PORT}/api`;
  }

  // Fallback to legacy LAN IP when running on device without env
  return `http://${LEGACY_LAN_IP}:${DEFAULT_PORT}/api`;
};

const BASE_URL = getBaseUrl();

export const apiClient = {
  BASE_URL, // Export for debugging/edge cases

  get: async (endpoint: string) => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      return await response.json();
    } catch (error) {
      console.error(`API GET ERROR [${endpoint}]:`, error);
      throw error;
    }
  },

  post: async (endpoint: string, body?: any) => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return await response.json();
    } catch (error) {
      console.error(`API POST ERROR [${endpoint}]:`, error);
      throw error;
    }
  },

  patch: async (endpoint: string, body?: any) => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return await response.json();
    } catch (error) {
      console.error(`API PATCH ERROR [${endpoint}]:`, error);
      throw error;
    }
  },

  delete: async (endpoint: string) => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      return await response.json();
    } catch (error) {
      console.error(`API DELETE ERROR [${endpoint}]:`, error);
      throw error;
    }
  },
};
