import { Platform } from "react-native";
import type { CurrentUsage, LogEntry, Zone } from "@src/types/index";

const normalizeBaseUrl = (value: string) => value.replace(/\/$/, "");

const resolveApiBaseUrl = () => {
  const configured =
    process.env.EXPO_PUBLIC_BASE_URL || process.env.BASE_URL || "";

  if (configured) {
    return `${normalizeBaseUrl(configured)}/api`;
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:3000/api";
  }

  return "http://localhost:3000/api";
};

const API_BASE_URL = resolveApiBaseUrl();

type ApiResult<T> = {
  success: boolean;
  data: T;
  message?: string;
};

const safeFetchJson = async <T>(
  endpoint: string,
  fallback: T,
): Promise<ApiResult<T>> => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    const body = await response.json();

    if (typeof body?.success === "boolean") {
      return {
        success: body.success,
        data: (body.data as T) ?? fallback,
        message: body.message,
      };
    }

    return {
      success: response.ok,
      data: (body as T) ?? fallback,
    };
  } catch (error) {
    return {
      success: false,
      data: fallback,
      message: "Failed to connect to backend",
    };
  }
};

export const apiService = {
  baseUrl: API_BASE_URL,

  getZones: async (): Promise<ApiResult<Zone[]>> => {
    return safeFetchJson<Zone[]>("/zones", []);
  },

  getCurrentUsage: async (): Promise<ApiResult<CurrentUsage | null>> => {
    return safeFetchJson<CurrentUsage | null>("/usage/current", null);
  },

  getActivityLogs: async (): Promise<ApiResult<LogEntry[]>> => {
    return safeFetchJson<LogEntry[]>("/logs", []);
  },
};
