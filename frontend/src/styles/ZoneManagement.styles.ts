import { StyleSheet } from "react-native";
import { COLORS, SIZES } from "../constants/themes";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textDark,
  },
  addCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMedium,
    padding: 20,
    marginBottom: 24,
    borderStyle: "dashed",
    borderWidth: 2,
    borderColor: COLORS.secondary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  addText: {
    color: COLORS.secondary,
    fontWeight: "bold",
    fontSize: 16,
  },
  zoneCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMedium,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  zoneHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  zoneName: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textDark,
  },
  zoneId: {
    fontSize: 12,
    color: COLORS.textGray,
    marginTop: 2,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.textGray,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 12,
    color: COLORS.textDark,
    fontSize: 14,
    fontWeight: "500",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 5,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  saveText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: 14,
  },
  deleteBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  deleteText: {
    color: COLORS.red,
    fontWeight: "600",
    fontSize: 14,
  },
});
