import { Router } from "express";
import { getMQTTClient } from "../config/mqtt.js";

const router = Router();

router.post("/scan", (req, res) => {
  try {
    const client = getMQTTClient();

    if (!client.connected) {
      res
        .status(503)
        .json({ success: false, message: "MQTT is not connected" });
      return;
    }

    const payload = JSON.stringify({
      action: "START_SCAN",
      timestamp: Date.now(),
    });

    client.publish("hydropulse/cmd", payload, (error?: Error) => {
      if (error) {
        res
          .status(500)
          .json({ success: false, message: "Failed to publish command" });
        return;
      }

      res.json({ success: true, message: "Scan command published" });
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "MQTT client unavailable" });
  }
});

export default router;
