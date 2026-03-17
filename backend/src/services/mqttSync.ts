import mqtt from 'mqtt';
import prisma from '../utils/prisma.js';

/**
 * --- MQTT Sync Service (SMART MODE) ---
 * Listens to ESP32 messages and calculates status based on DB thresholds.
 */

const MQTT_HOST = process.env.MQTT_HOST || 'ws://broker.hivemq.com:8000/mqtt';
export let mqttClient: mqtt.MqttClient | null = null;

export const startMqttSync = () => {
  mqttClient = mqtt.connect(MQTT_HOST);

  mqttClient.on('connect', () => {
    console.log('✅ BACKEND CONNECTED TO MQTT BROKER');
    mqttClient?.subscribe('hydropulse/status/+', (err) => {
      if (!err) console.log('📡 Subscribed to status topics');
    });
  });

  mqttClient.on('message', async (topic, payload) => {
    try {
      const data = JSON.parse(payload.toString());
      const { zoneId, flowRate, totalVolume } = data;
      const currentFlow = parseFloat(flowRate);

      // 1. Fetch current zone configuration (to get the user-defined threshold)
      let zone = await prisma.zone.findUnique({
        where: { zoneId: zoneId.toString() },
      });

      // 2. Determine SMART Status
      // Logic: 
      // - If flowRate > threshold -> LEAKAGE
      // - If flowRate > 0 but <= threshold -> RUNNING
      // - If flowRate === 0 -> INACTIVE
      
      let smartStatus: 'Leakage' | 'Running' | 'Inactive' = 'Inactive';
      const threshold = zone?.threshold || 5.0; // Fallback to 5.0 if not found

      if (currentFlow > threshold) {
        smartStatus = 'Leakage';
      } else if (currentFlow > 0) {
        smartStatus = 'Running';
      } else {
        smartStatus = 'Inactive';
      }

      console.log(`[MQTT] Update: Zone ${zoneId} | Rate: ${currentFlow} L/min | Status: ${smartStatus} (Limit: ${threshold})`);

      // 3. Persist to PostgreSQL
      zone = await prisma.zone.upsert({
        where: { zoneId: zoneId.toString() },
        update: {
          flowRate: currentFlow,
          status: smartStatus,
          totalVolume: parseFloat(totalVolume),
        },
        create: {
          zoneId: zoneId.toString(),
          name: zoneId === '1' ? 'Kitchen Area' : `Zone ${zoneId}`,
          flowRate: currentFlow,
          status: smartStatus,
          totalVolume: parseFloat(totalVolume),
          threshold: 5.0,
        },
      });

      // 4. Create Activity Log ONLY if status just changed to Leakage
      // (Optional: Logic to prevent spamming logs every second during a single leak)
      if (smartStatus === 'Leakage') {
        // Find if we already logged a leak in the last minute
        const recentLog = await prisma.activityLog.findFirst({
          where: {
            zoneId: zone.id,
            timestamp: { gte: new Date(Date.now() - 60000) }
          }
        });

        if (!recentLog) {
          await prisma.activityLog.create({
            data: {
              zoneId: zone.id,
              volume: `${currentFlow.toFixed(2)} L/min`,
              duration: 'Active Leak',
            },
          });
          console.log(`⚠️ CRITICAL: Leakage logged for ${zone.name}`);
        }
      }

      // 5. Update Daily Usage
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await prisma.dailyUsage.upsert({
        where: { zoneId_date: { zoneId: zone.id, date: today } },
        update: { volume: parseFloat(totalVolume) },
        create: { zoneId: zone.id, date: today, volume: parseFloat(totalVolume) },
      });

    } catch (error) {
      console.error('❌ FAILED TO PROCESS MQTT MESSAGE:', error);
    }
  });

  mqttClient.on('error', (err) => {
    console.error('MQTT Connection Error:', err);
  });
};
