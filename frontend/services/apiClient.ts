/**
 * --- Centralized API Client ---
 */

const DEV_IP = '192.168.254.184';
const BASE_URL = `http://${DEV_IP}:3000/api`;

export const apiClient = {
  BASE_URL, // Export for edge cases

  get: async (endpoint: string) => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
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
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      return await response.json();
    } catch (error) {
      console.error(`API DELETE ERROR [${endpoint}]:`, error);
      throw error;
    }
  },
};
