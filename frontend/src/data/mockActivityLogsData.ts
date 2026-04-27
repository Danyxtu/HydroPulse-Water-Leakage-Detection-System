import { LogEntry } from "../types";

const generateMockData = (): LogEntry[] => {
  const logs: LogEntry[] = [];
  const zones = ["Zone 1", "Zone 2", "Zone 3"];
  const now = new Date();

  // Generate data for the last 11 days (including today)
  for (let i = 0; i < 11; i++) {
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() - i);

    // Generate ~10 logs per day
    for (let j = 0; j < 10; j++) {
      const hour = 8 + Math.floor(Math.random() * 12); // Between 8 AM and 8 PM
      const minute = Math.floor(Math.random() * 60);
      const logDate = new Date(targetDate);
      logDate.setHours(hour, minute, 0);

      const durationSec = 30 + Math.floor(Math.random() * 300);
      const volume = (durationSec * 0.005).toFixed(2); // Mock calc

      logs.push({
        id: `log-${i}-${j}`,
        zone: zones[Math.floor(Math.random() * zones.length)],
        time: logDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        duration: `${Math.floor(durationSec / 60)}m ${durationSec % 60}s`,
        volume: `${volume}L`,
        timestamp: logDate.toISOString(),
      });
    }
  }
  return logs;
};

export const mockActivityLogs: LogEntry[] = generateMockData();
