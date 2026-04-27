import { StyleSheet, Dimensions } from "react-native";
import { COLORS, SIZES } from "../constants/themes";

const { width } = Dimensions.get("window");

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
    maxHeight: "95%",
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMedium,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textDark,
  },
  closeButton: {
    padding: 5,
  },
  content: {
    padding: 20,
  },
  stepIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 4,
  },
  stepDotActive: {
    backgroundColor: COLORS.primary,
    width: 20,
  },
  
  // Step 1 Styles
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textDark,
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 20,
  },
  zoneItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
  },
  zoneName: {
    fontSize: 15,
    color: COLORS.textDark,
  },

  // Step 2 Styles
  cautionContainer: {
    gap: 16,
  },
  cautionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFBEB",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
  },
  cautionText: {
    fontSize: 14,
    color: "#92400E",
    flex: 1,
    lineHeight: 20,
  },
  cautionIcon: {
    marginRight: 12,
    marginTop: 2,
  },

  // Step 3 Styles
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: COLORS.textDark,
    fontWeight: "500",
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },

  // Step 4 (Summary) Styles
  summaryContainer: {
    alignItems: "center",
  },
  visualizationBox: {
    width: "100%",
    height: 300,
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },
  pathLine: {
    position: "absolute",
    backgroundColor: "#E5E7EB",
    zIndex: 1,
  },
  pathLineActive: {
    backgroundColor: COLORS.primary,
    height: 3,
  },
  areaNode: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 3,
    backgroundColor: "#E5E7EB",
    borderWidth: 2,
    borderColor: "#D1D5DB",
  },
  areaNodeMain: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.primary,
    borderColor: "#6D28D9",
  },
  areaNodeNormal: {
    backgroundColor: "#10B981",
    borderColor: "#059669",
  },
  areaNodeLeak: {
    backgroundColor: "#EF4444",
    borderColor: "#B91C1C",
  },
  areaNodeSelected: {
    borderColor: COLORS.primary,
    borderWidth: 3,
  },
  areaLabel: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: "bold",
    textAlign: "center",
  },
  areaLabelMain: {
    fontSize: 12,
  },
  statusCard: {
    width: "100%",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  statusCardLeak: {
    backgroundColor: "#FEE2E2",
  },
  statusCardNormal: {
    backgroundColor: "#ECFDF5",
  },
  statusCardEmpty: {
    backgroundColor: "#F3F4F6",
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 12,
  },
  statusDesc: {
    fontSize: 13,
    marginLeft: 12,
    marginTop: 2,
  },

  // Footer
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonSecondary: {
    backgroundColor: "#F3F4F6",
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  buttonTextSecondary: {
    color: COLORS.textDark,
  },
  buttonTextPrimary: {
    color: COLORS.white,
  },
  
  // Glowing animation
  glowingContainer: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(239, 68, 68, 0.4)",
    zIndex: 2,
  },
  glowingContainerGreen: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(16, 185, 129, 0.4)",
    zIndex: 2,
  }
});
