import { CurrentUsage } from "@src/types/index";

export const mockUsageData: CurrentUsage = {
  time: "00:00",
  estimatedVolume: "0.0L",
  stats: [
    {
      value: 33,
      color: "#4A90E2",
      text: "33%",
      label: "Kitchen",
    },
    {
      value: 33,
      color: "#2ECC71",
      text: "33%",
      label: "Guest Bath",
    },
    {
      value: 34,
      color: "#F1C40F",
      text: "34%",
      label: "Master Bath",
    },
  ],
};
