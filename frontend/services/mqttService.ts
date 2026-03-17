/**
 * --- MQTT SERVICE (DEVELOPMENT) ---
 * Manages the WebSocket connection to the MQTT broker.
 */

import mqtt from 'mqtt';
import { Buffer } from 'buffer';
import { MqttStatusMessage } from '../types';

// Polyfill for Buffer (Required for MQTT in React Native)
if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}

export const mqttService = {
  client: null as mqtt.MqttClient | null,

  // Public Broker Configuration
  brokerConfig: {
    host: 'ws://broker.hivemq.com:8000/mqtt', 
    clientId: `HydroPulse_Dev_${Math.random().toString(16).slice(2, 8)}`,
  },

  /**
   * --- Initialize Connection ---
   */
  connect: (onStatusUpdate?: (data: MqttStatusMessage) => void) => {
    if (mqttService.client) return;

    console.log('[MQTT] Connecting to broker...');
    const client = mqtt.connect(mqttService.brokerConfig.host, {
      clientId: mqttService.brokerConfig.clientId,
    });

    client.on('connect', () => {
      console.log('[MQTT] Connected to Public Broker!');
      client.subscribe('hydropulse/status/+', (err) => {
        if (!err) console.log('[MQTT] Subscribed to status updates');
      });
    });

    client.on('message', (topic, payload) => {
      try {
        const messageStr = payload.toString();
        
        // 1. If it's a status update topic, parse and validate
        if (topic.startsWith('hydropulse/status/')) {
          const data: MqttStatusMessage = JSON.parse(messageStr);
          
          // 2. Call the UI callback with clean data
          if (onStatusUpdate) {
            onStatusUpdate(data);
          }
        }
      } catch (e) {
        console.error('[MQTT] Parsing Error:', e);
      }
    });

    client.on('error', (err) => {
      console.error('[MQTT] Connection Error:', err);
    });

    mqttService.client = client;
  },

  /**
   * --- Send Commands to ESP32 ---
   */
  sendCommand: (action: string, zoneId: string = '1') => {
    if (!mqttService.client) return;
    
    const payload = JSON.stringify({ action, zoneId, ts: Date.now() });
    mqttService.client.publish('hydropulse/cmd', payload);
  }
};
