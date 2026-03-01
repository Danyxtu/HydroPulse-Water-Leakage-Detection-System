import { StyleSheet } from "react-native";
import { colors } from "@/constants/colors";
import { fontSize } from "@/constants/typography";

export const dashboardStyles = StyleSheet.create({
  // General
  background: {
    backgroundColor: colors.background,
    height: "100%",
  },
  // Heading
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  shadowWrapper: {
    backgroundColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 16,
    paddingTop: 45,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    height: 136,
  },
  pictureHolder: {
    backgroundColor: "#dcdc",
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  middlePart: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    width: 230,
    height: 100,
  },
  appName: {
    width: "100%",
    fontSize: fontSize.title,
    color: colors.primary,
    fontWeight: "bold",
    marginBottom: 4,
  },
  appDescription: {
    width: "100%",
    fontSize: fontSize.subtitle,
    color: colors.secondary,
  },
  chevronButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  // Body
  body: {
    padding: 18,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    height: 100,
  },
});
