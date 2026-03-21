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
  listeners: [] as ((data: MqttStatusMessage) => void)[],

  // Public Broker Configuration
  brokerConfig: {
    host: 'wss://broker.hivemq.com:8884/mqtt', 
    clientId: `HydroPulse_Dev_${Math.random().toString(16).slice(2, 8)}`,
  },

  /**
   * --- Initialize Connection ---
   */
  connect: function(onStatusUpdate?: (data: MqttStatusMessage) => void) {
    // 1. If we have a new listener, add it to the list
    if (onStatusUpdate) {
      this.listeners.push(onStatusUpdate);
      console.log(`[MQTT] Listener added. Total listeners: ${this.listeners.length}`);
    }

    // 2. If client already exists, just stop here (the listener is already registered)
    if (this.client) return;

    console.log('[MQTT] Connecting to broker...');
    const client = mqtt.connect(this.brokerConfig.host, {
      clientId: this.brokerConfig.clientId,
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
          
          // 2. Notify all listeners
          this.listeners.forEach(cb => cb(data));
        }
      } catch (e) {
        console.error('[MQTT] Parsing Error:', e);
      }
    });

    client.on('error', (err) => {
      console.error('[MQTT] Connection Error:', err);
    });

    this.client = client;
  },

  /**
   * --- Send Commands to ESP32 ---
   */
  sendCommand: function(action: string, zoneId: string = '1') {
    if (!this.client) return;
    
    const payload = JSON.stringify({ action, zoneId, ts: Date.now() });
    this.client.publish('hydropulse/cmd', payload);
  }
};
