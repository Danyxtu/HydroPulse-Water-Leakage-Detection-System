import { StyleSheet } from "react-native";
import { COLORS, SIZES } from "@constants/themes";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: SIZES.radiusLarge,
    borderBottomRightRadius: SIZES.radiusLarge,
    padding: SIZES.padding,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.padding,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
  },
  appName: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  appSub: {
    fontSize: 12,
    color: COLORS.textDark,
    opacity: 0.7,
  },
  zonesContainer: {
    paddingHorizontal: SIZES.padding,
    gap: 12,
  },
  zoneHintText: {
    marginHorizontal: SIZES.padding,
    marginBottom: 8,
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textDark,
    opacity: 0.68,
  },

  // Enhanced Card Styles
  enhancedCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusSmall,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    overflow: "hidden",
    position: "relative",
  },

  enhancedCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },

  zoneNameContainer: {
    flex: 1,
  },

  enhancedZoneName: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.secondary,
    marginBottom: 4,
  },

  zoneId: {
    fontSize: 11,
    color: COLORS.textDark,
    opacity: 0.5,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },

  statusBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
  },

  // Metrics Grid
  metricsGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },

  metricBox: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    padding: 10,
    borderRadius: 8,
  },

  metricLabel: {
    fontSize: 9,
    fontWeight: "600",
    color: COLORS.textDark,
    opacity: 0.6,
    marginBottom: 6,
    letterSpacing: 0.5,
  },

  metricValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.secondary,
  },

  metricUnit: {
    fontSize: 11,
    fontWeight: "500",
    color: COLORS.textDark,
    opacity: 0.6,
  },

  // Card Footer
  enhancedCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: "#E5E5E5",
  },

  lastUpdateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  lastUpdateText: {
    fontSize: 11,
    color: "#8E8E93",
  },

  contextualMessage: {
    fontSize: 11,
    color: COLORS.textDark,
    fontWeight: "500",
  },

  // Original Card Styles (for backward compatibility)
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusSmall,
    padding: SIZES.radiusSmall,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    overflow: "hidden",
  },
  cardInfo: {
    flex: 1,
  },
  zoneName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.secondary,
    marginBottom: 4,
  },
  timeUsage: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textDark,
  },
  statusContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 90,
    marginRight: 10,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: "bold",
    marginTop: 4,
  },
  cardIndicator: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 6,
  },
  textRed: { color: COLORS.redDark },
  indicatorRed: { backgroundColor: COLORS.redLight },
  textYellow: { color: COLORS.yellowDark },
  indicatorYellow: { backgroundColor: COLORS.yellowLight },
  textGreen: { color: COLORS.greenDark },
  indicatorGreen: { backgroundColor: COLORS.greenLight },

  analyticsCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusSmall,
    padding: SIZES.padding,
    marginHorizontal: SIZES.padding,
    marginTop: SIZES.radiusSmall,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  analyticsInfo: {
    flex: 1,
  },
  analyticsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.secondary,
    lineHeight: 24,
    marginBottom: SIZES.padding,
  },
  analyticsStats: {
    gap: 4,
  },
  statsText: {
    fontSize: 13,
    fontWeight: "bold",
    color: COLORS.textDark,
  },
  actionButton: {
    backgroundColor: COLORS.white,
    marginHorizontal: 40,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButtonText: {
    color: COLORS.secondary,
    fontSize: 16,
    fontWeight: "bold",
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 12,
    paddingBottom: 30,
    borderTopLeftRadius: SIZES.radiusLarge,
    borderTopRightRadius: SIZES.radiusLarge,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  navItem: {
    alignItems: "center",
    gap: 4,
    width: 80,
  },
  navTextActive: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "500",
  },
  navTextInactive: {
    color: "#8E8E93",
    fontSize: 12,
    fontWeight: "500",
  },
  activeIndicator: {
    width: "100%",
    height: 2,
    backgroundColor: COLORS.primary,
    marginTop: 4,
  },
  inactiveIndicator: {
    width: "100%",
    height: 2,
    backgroundColor: "transparent",
    marginTop: 4,
  },
});
