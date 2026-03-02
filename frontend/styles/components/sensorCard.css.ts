import { StyleSheet } from "react-native";
import { colors, fontSize } from "@/constants";

export const sensorCardStyles = StyleSheet.create({
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
