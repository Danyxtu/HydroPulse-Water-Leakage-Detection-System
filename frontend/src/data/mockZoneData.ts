import { Zone, ZoneStatus } from "@src/types/index";

export const mockZoneData: Zone[] = [
  {
    id: "1",
    name: "Kitchen Area",
    zoneId: "1",
    zoneName: "Kitchen Area",
    flowRate: 0,
    totalVolume: 0,
    status: "Inactive" as ZoneStatus,
    timestamp: Date.now(),
    duration: "0",
  },
  {
    id: "2",
    name: "Guest Bathroom",
    zoneId: "2",
    zoneName: "Guest Bathroom",
    flowRate: 0,
    totalVolume: 0,
    status: "Inactive" as ZoneStatus,
    timestamp: Date.now(),
    duration: "0",
  },
  {
    id: "3",
    name: "Master's Bathroom",
    zoneId: "3",
    zoneName: "Master's Bathroom",
    flowRate: 0,
    totalVolume: 0,
    status: "Inactive" as ZoneStatus,
    timestamp: Date.now(),
    duration: "0",
  },
];
