import { StyleSheet } from "react-native";
import { colors, fontSize } from "@/constants";

export const activitylogStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
  },
  logRow: {
    backgroundColor: "transparent",
    padding: 10,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    width: "85%",
  },
  logContainer: {
    borderRadius: 10,
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    backgroundColor: "#fff",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: 12,
  },
  sensorName: {
    fontSize: fontSize.title,
    fontWeight: "bold",
    color: colors.secondary,
  },
  timeStamp: {
    fontSize: fontSize.body,
    color: "#666",
    marginTop: 6,
  },
  timeUsage: {
    fontSize: fontSize.body,
    color: colors.secondary,
  },
  estimatedVolume: {
    fontSize: fontSize.body,
    color: colors.secondary,
    marginTop: 6,
  },
});
