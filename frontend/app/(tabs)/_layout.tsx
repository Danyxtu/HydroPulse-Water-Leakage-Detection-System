import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Tabs } from "expo-router";

const TabLayout = () => {
  return (
    <Tabs>
      <Tabs.Screen name="dashboard" options={{ headerShown: false }} />
      <Tabs.Screen name="activityLogs" options={{ headerShown: false }} />
    </Tabs>
  );
};

export default TabLayout;
