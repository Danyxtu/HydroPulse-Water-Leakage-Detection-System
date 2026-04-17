import { StyleSheet } from "react-native";
import { COLORS, SIZES } from "../constants/themes";

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMedium,
    padding: 12,
    paddingTop: 40,
  },
  closeButton: {
    position: "absolute",
    top: 15,
    right: 15,
    zIndex: 10,
  },
  innerContainer: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radiusSmall,
    padding: 24,
    alignItems: "center",
  },
  iconWrapper: {
    marginBottom: 16,
  },
  titleText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textDark,
    textAlign: "center",
    marginBottom: 16,
  },
  bodyText: {
    fontSize: 13,
    color: "#4B5563",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  listContainer: {
    width: "100%",
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  listItem: {
    fontSize: 13,
    color: "#4B5563",
    marginBottom: 6,
  },
  zonesList: {
    width: "100%",
    marginVertical: 10,
    gap: 16,
  },
  zoneRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  zoneName: {
    fontSize: 15,
    fontWeight: "bold",
    color: COLORS.textDark,
  },
  zoneTime: {
    fontSize: 11,
    color: COLORS.textDark,
    marginTop: 2,
  },
  statusIconContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  warningText: {
    fontSize: 10,
    color: COLORS.redDark,
    textAlign: "center",
    marginTop: 20,
    marginBottom: 20,
    lineHeight: 14,
  },
  buttonRowRight: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "flex-end",
    gap: 16,
    alignItems: "center",
  },
  buttonRowSpaced: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
  },
  btnDisabled: {
    backgroundColor: "#D1D5DB",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  btnDisabledText: {
    color: "#9CA3AF",
    fontWeight: "bold",
  },
  btnPurpleText: {
    color: "#6D28D9",
    fontWeight: "bold",
    paddingHorizontal: 10,
  },
  btnBlueText: {
    color: "#3B82F6",
    fontWeight: "bold",
  },
  btnDisabledWideContainer: {
    width: "100%",
    alignItems: "flex-end",
    marginTop: 20,
  },
  btnDisabledWide: {
    backgroundColor: "#D1D5DB",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  btnDisabledWideText: {
    color: "#9CA3AF",
    fontWeight: "bold",
  },
  btnGreenWide: {
    backgroundColor: "#A7F3D0",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  btnGreenText: {
    color: "#059669",
    fontWeight: "bold",
  },
});
