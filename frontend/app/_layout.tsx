import { StyleSheet } from "react-native";
import { Stack } from "expo-router";
import Header from "@/components/Header";
import { colors } from "@/constants";

const RootLayout = () => {
  return (
    <Stack
      screenOptions={{
        header: () => <Header />,
        contentStyle: { backgroundColor: colors.background || "red" },
      }}
    >
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
};

export default RootLayout;

const styles = StyleSheet.create({});
