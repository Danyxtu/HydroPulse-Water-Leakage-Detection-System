import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { Wifi, Loader, WifiOff, AlertCircle } from "lucide-react-native";

interface ConnectionBadgeProps {
  state: "connected" | "connecting" | "disconnected" | "error" | "reconnecting";
}

const ConnectionBadge = ({ state }: ConnectionBadgeProps) => {
  const config = {
    connected: {
      color: "#10B981", // Emerald 500
      text: "Connected",
      bg: "#D1FAE5", // Emerald 100
      icon: Wifi,
    },
    connecting: {
      color: "#F59E0B", // Amber 500
      text: "Connecting...",
      bg: "#FEF3C7", // Amber 100
      icon: Loader,
    },
    reconnecting: {
      color: "#F59E0B",
      text: "Reconnecting...",
      bg: "#FEF3C7",
      icon: Loader,
    },
    disconnected: {
      color: "#64748B", // Slate 500
      text: "Disconnected",
      bg: "#F1F5F9", // Slate 100
      icon: WifiOff,
    },
    error: {
      color: "#EF4444", // Red 500
      text: "Error",
      bg: "#FEE2E2", // Red 100
      icon: AlertCircle,
    },
  }[state] || {
    color: "#64748B",
    text: "Unknown",
    bg: "#F1F5F9",
    icon: AlertCircle,
  };

  const Icon = config.icon;

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Icon color={config.color} size={14} strokeWidth={2.5} />
      <Text style={[styles.text, { color: config.color }]}>{config.text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start", // Prevents the badge from stretching full width
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999, // Perfect pill shape
    marginBottom: 12,
    marginHorizontal: 16,
    gap: 6, // Adds clean spacing between icon and text (React Native 0.71+)
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});

export default ConnectionBadge;
