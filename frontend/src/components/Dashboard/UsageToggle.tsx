import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS, SIZES } from "@constants/themes";

interface UsageToggleProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const options = ["Today", "Week", "Month"];

const UsageToggle = ({ activeTab, onTabChange }: UsageToggleProps) => {
  return (
    <View style={styles.container}>
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          style={[
            styles.tab,
            activeTab === option && styles.activeTab,
          ]}
          onPress={() => onTabChange(option)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === option && styles.activeTabText,
            ]}
          >
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#E2E8F0", // Slightly darker than background for contrast
    borderRadius: 14,
    padding: 4,
    marginHorizontal: SIZES.padding,
    marginTop: 20,
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: COLORS.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B", // Slate 500
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: "700",
  },
});

export default UsageToggle;
