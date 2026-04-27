import { Router } from "express";
import prisma from "../utils/prisma.js";

const router = Router();

// GET: Activity Logs
router.get("/", async (req, res) => {
  try {
    const logs = await prisma.activityLog.findMany({
      include: { zone: true },
      orderBy: { timestamp: "desc" },
      take: 50,
    });

    const formattedLogs = logs.map((log) => ({
      id: log.id,
      zone: `Zone ${log.zone.zoneId}`,
      zoneName: log.zone.name,
      time: log.timestamp.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      date: log.timestamp.toLocaleDateString([], {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }),
      duration: log.duration || "--",
      volume: log.volume || "--",
      type: log.type,
      timestamp: log.timestamp.toISOString(),
    }));

    res.json({ success: true, data: formattedLogs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch logs" });
  }
});

export default router;
