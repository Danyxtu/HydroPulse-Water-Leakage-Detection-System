import React from "react";
import { Tabs } from "expo-router";
import { colors } from "@/constants";

const TabLayout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background, marginTop: 140 },
      }}
    >
      <Tabs.Screen name="dashboard" options={{ headerShown: false }} />
      <Tabs.Screen name="activityLogs" options={{ headerShown: false }} />
    </Tabs>
  );
};

export default TabLayout;
