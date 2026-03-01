import { StyleSheet, Text, View } from "react-native";
import React from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import Octicons from "@expo/vector-icons/Octicons";
import { colors, fontSize } from "@/constants";

interface SensorCardProps {
  sensorName: string;
  timeUsage: string;
  statusLabel: "Possible Leakage" | "Inactive" | "Active";
}

const statusConfig = {
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    height: 100,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
  },
  leftPart: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    width: 150,
  },
  middlePart: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    width: 95,
    height: 100,
  },
  sensorName: {
    fontSize: fontSize.title,
    fontWeight: "bold",
    color: colors.primary,
  },
  sensorUsageLabel: {
    fontSize: fontSize.subtitle,
    color: colors.secondary,
  },
  sensorStatusLabel: {
    fontSize: fontSize.subtitle,
    color: "#666",
    marginTop: 4,
    textAlign: "center",
    fontWeight: "500",
  },
  statusIndicator: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 15,
    height: 100,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
});
