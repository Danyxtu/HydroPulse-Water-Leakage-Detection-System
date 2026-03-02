import { Text, View } from "react-native";
import React from "react";
import { statusConfig } from "@/utils/Dashboard/statusConfig";
// Styles
import { sensorCardStyles as styles } from "@/styles/components/sensorCard.css";

interface SensorCardProps {
  sensorName: string;
  timeUsage: string;
  statusLabel: "Possible Leakage" | "Inactive" | "Active";
}

const SensorCard = ({
  sensorName,
  timeUsage,
  statusLabel,
}: SensorCardProps) => {
  return (
    <View style={styles.container}>
      {/* Sensor name and description */}
      <View style={styles.leftPart}>
        <Text style={styles.sensorName}>{sensorName}</Text>
        <Text style={styles.sensorUsageLabel}>Time Usage: {timeUsage}</Text>
      </View>
      {/* Sensor Icon */}
      <View style={styles.middlePart}>
        {statusConfig[statusLabel].icon}
        <Text
          style={[
            styles.sensorStatusLabel,
            { color: statusConfig[statusLabel].statusTextColor },
          ]}
        >
          {statusConfig[statusLabel].label}
        </Text>
      </View>
      {/* Sensor indicator */}
      <View
        style={[
          styles.statusIndicator,
          { backgroundColor: statusConfig[statusLabel].statusColor },
        ]}
      ></View>
    </View>
  );
};

export default SensorCard;
