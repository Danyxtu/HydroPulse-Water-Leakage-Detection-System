import Ionicons from "@expo/vector-icons/Ionicons";
import Octicons from "@expo/vector-icons/Octicons";
import { colors } from "@/constants";

export const statusConfig = {
  "Possible Leakage": {
    label: "Possible Leakage",
    icon: (
      <Ionicons
        name="warning-outline"
        size={24}
        color={colors.possibleLeakage}
      />
    ),
    statusColor: "#C00F0C33",
    statusTextColor: colors.possibleLeakage,
  },
  Inactive: {
    label: "Inactive",
    icon: <Ionicons name="close-outline" size={24} color={colors.inactive} />,
    statusColor: "#E8B93133",
    statusTextColor: colors.inactive,
  },
  Active: {
    label: "Active",
    icon: <Octicons name="pulse" size={24} color={colors.active} />,
    statusColor: "#14AE5C33",
    statusTextColor: colors.active,
  },
};
