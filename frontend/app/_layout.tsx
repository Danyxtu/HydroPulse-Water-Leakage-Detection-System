import { Stack } from "expo-router";
import { useEffect } from "react";
import { mqttService } from "../src/services/mqttService";

export default function RootLayout() {
  useEffect(() => {
    mqttService.connect();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="activity-logs" />
      <Stack.Screen name="usage-details" />
      <Stack.Screen name="profile-settings" />
      <Stack.Screen name="zone-management" />
    </Stack>
  );
}
