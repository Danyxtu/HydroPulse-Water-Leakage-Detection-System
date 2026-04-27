import { Zone, ZoneStatus } from "@src/types/index";

export const mockZoneData: Zone[] = [
  {
    id: "1",
    flowRate: 0,
    totalVolume: 0,
    status: "Inactive" as ZoneStatus,
    timestamp: Date.now(),
    duration: "0",
  },
  {
    id: "2",
    flowRate: 0,
    totalVolume: 0,
    status: "Inactive" as ZoneStatus,
    timestamp: Date.now(),
    duration: "0",
  },
  {
    id: "3",
    flowRate: 0,
    totalVolume: 0,
    status: "Inactive" as ZoneStatus,
    timestamp: Date.now(),
    duration: "0",
  },
];
