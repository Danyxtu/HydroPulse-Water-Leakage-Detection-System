import { Tabs } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { LayoutDashboard, History, Radar } from "lucide-react-native";
import DetectionModal from "@components/DetectionModal";
import { COLORS } from "@constants/themes";

const TabLayout = () => {
  const [isDetectionModalVisible, setIsDetectionModalVisible] = useState(false);

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textGray,
          tabBarLabelStyle: styles.tabBarLabel,
        }}
      >
        <Tabs.Screen
          name="dashboard"
          options={{
            title: "Dashboard",
            tabBarLabel: "Dashboard",
            tabBarIconStyle: styles.dashboardShift,
            tabBarLabelStyle: styles.dashboardShift,
            tabBarIcon: ({ color, size }) => (
              <LayoutDashboard color={color} size={size} />
            ),
          }}
        />

        <Tabs.Screen
          name="start-detection"
          options={{
            title: "",
            tabBarLabel: "",
            tabBarIcon: () => null,
            tabBarButton: () => (
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.detectButtonWrap}
                onPress={() => setIsDetectionModalVisible(true)}
              >
                <View style={styles.detectButtonOuter}>
                  <View style={styles.detectButtonInner}>
                    <Radar size={24} color="#FFFFFF" />
                  </View>
                </View>
              </TouchableOpacity>
            ),
          }}
        />

        <Tabs.Screen
          name="activity-logs"
          options={{
            title: "Logs",
            tabBarLabel: "ActivityLogs",
            tabBarIconStyle: styles.activityLogsShift,
            tabBarLabelStyle: styles.activityLogsShift,
            tabBarIcon: ({ color, size }) => (
              <History color={color} size={size} />
            ),
          }}
        />
      </Tabs>

      <DetectionModal
        visible={isDetectionModalVisible}
        onClose={() => setIsDetectionModalVisible(false)}
      />
    </>
  );
};

export default TabLayout;

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#FFFFFF",
    height: 74,
    paddingTop: 8,
    paddingBottom: 8,
    borderTopWidth: 0,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  tabBarLabel: {
    fontSize: 11,
    marginTop: -2,
    marginBottom: 2,
  },
  dashboardShift: {
    transform: [{ translateX: 10 }],
  },
  activityLogsShift: {
    transform: [{ translateX: -10 }],
  },
  detectButtonWrap: {
    top: -22,
    justifyContent: "center",
    alignItems: "center",
  },
  detectButtonOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 8,
  },
  detectButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
});
