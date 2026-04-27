import { Stack } from "expo-router";
import { MqttProvider } from "../src/context/MqttContext";

export default function RootLayout() {
  return (
    <MqttProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="usage-details" />
        <Stack.Screen name="profile-settings" />
        <Stack.Screen name="zone-management" />
      </Stack>
    </MqttProvider>
  );
}
