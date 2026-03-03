import { StyleSheet } from "react-native";
import { colors, fontSize } from "@/constants";
import { fontWeights } from "@/constants/typography";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 24,
    flexDirection: "row",
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    height: 180,
    paddingVertical: 20,
  },
  infoColumn: {
    flex: 0.8,
    justifyContent: "space-between",
  },
  label: {
    fontSize: fontSize.label,
    fontWeight: "bold",
    color: colors.primary,
    lineHeight: 30,
  },
  statsContainer: {
    marginTop: 20,
  },
  statText: {
    fontSize: fontSize.subtitle,
    fontWeight: "bold",
    color: "#1A3B5D",
    marginBottom: 4,
  },
  chartColumn: {
    flex: 1.2,
    alignItems: "center",
    justifyContent: "center",
  },
  chartPlaceholder: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "transparent",
    borderWidth: 40,
    borderColor: colors.usage.master,
    borderLeftColor: colors.usage.kitchen,
    borderBottomColor: colors.usage.bathroom,
    transform: [{ rotate: "45deg" }],
    alignItems: "center",
    justifyContent: "center",
  },
});
