import { Router } from 'express';
import { mqttClient } from '../services/mqttSync.js';

const router = Router();

// POST: Trigger Scan Command to ESP32
router.post('/scan', async (req, res) => {
  try {
    if (mqttClient && mqttClient.connected) {
      const payload = JSON.stringify({ action: 'START_SCAN', ts: Date.now() });
      mqttClient.publish('hydropulse/cmd', payload);
      res.json({ success: true, message: 'Scan command published' });
    } else {
      res.status(503).json({ success: false, message: 'MQTT Broker not connected' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send command' });
  }
});

export default router;
