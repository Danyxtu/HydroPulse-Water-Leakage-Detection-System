import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronDown } from "lucide-react-native";
import { useRouter } from "expo-router";
import { PieChart } from "react-native-gifted-charts";
import DetectionModal from "@components/DetectionModal";

// Styles
import { styles } from "@styles/Dashboard.styles";

import { mqttService } from "@services/mqttService";

// Type
import { Zone, CurrentUsage, ZoneStatus } from "@src/types/index";

// Mock Datas
import { mockUsageData, mockZoneData } from "@data/index";

// Components
import ZoneCard from "@components/Dashboard/ZoneCard";

// Connection Status Badge
const ConnectionBadge = ({ state }: { state: string }) => {
  const config = {
    connected: { color: "#2ECC71", text: "🟢 Live", bg: "#EAF3DE" },
    connecting: { color: "#F1C40F", text: "🟡 Connecting...", bg: "#FAEEDA" },
    disconnected: { color: "#8E8E93", text: "⚫ Offline", bg: "#F8F9FA" },
    error: { color: "#E74C3C", text: "🔴 Error", bg: "#FCEBEB" },
  }[state] || { color: "#8E8E93", text: "⚫ Unknown", bg: "#F8F9FA" };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: config.bg,
        borderRadius: 8,
        marginBottom: 12,
        marginHorizontal: 16,
      }}
    >
      <Text style={{ fontSize: 11, fontWeight: "600", color: config.color }}>
        {config.text}
      </Text>
    </View>
  );
};

export default function Dashboard() {
  const router = useRouter();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [zoneData, setZoneData] = useState<Zone[]>(mockZoneData);
  const [usageData, setUsageData] = useState<CurrentUsage | null>(
    mockUsageData,
  );
  const [loading, setLoading] = useState(false);
  const [connectionState, setConnectionState] =
    useState<string>("disconnected");
  const [refreshing, setRefreshing] = useState(false); // ← Pull-to-refresh state

  // ============================================
  // PULL TO REFRESH HANDLER
  // ============================================
  const onRefresh = async () => {
    setRefreshing(true);
    console.log("🔄 Pull to refresh triggered!");

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (connectionState !== "connected") {
        console.log("🔌 Reconnecting MQTT...");
        mqttService.disconnect();

        mqttService.connect({
          onStatusUpdate: handleStatusUpdate,
          onConnectionChange: (state) => {
            console.log("🔌 Connection state:", state);
            setConnectionState(state);
          },
          onError: (error) => {
            console.error("❌ MQTT Error:", error.message);
          },
        });
      }

      console.log("✅ Dashboard refreshed!");
    } catch (error) {
      console.error("❌ Refresh failed:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // ============================================
  // STATUS UPDATE HANDLER (extracted for reuse)
  // ============================================
  const handleStatusUpdate = (data: any) => {
    console.log("\n🎉 DASHBOARD RECEIVED UPDATE!");
    console.log("Zone ID:", data.zoneId);
    console.log("Flow Rate:", data.flowRate, "L/min");
    console.log("Total Volume:", data.totalVolume, "L");
    console.log("Status:", data.status);

    setZoneData((prevZones) =>
      prevZones.map((zone) =>
        zone.zoneId === data.zoneId
          ? {
              ...zone,
              flowRate: data.flowRate,
              totalVolume: data.totalVolume,
              status: data.status as ZoneStatus,
              timestamp: data.timestamp || Date.now(),
              name: data.zoneName || zone.name,
            }
          : zone,
      ),
    );

    console.log("✅ Zone data updated in state\n");
  };

  // ============================================
  // MQTT REAL-TIME INTEGRATION
  // ============================================
  useEffect(() => {
    console.log("🚀 Initializing MQTT connection...");

    mqttService.connect({
      onStatusUpdate: handleStatusUpdate,
      onConnectionChange: (state) => {
        console.log("🔌 Connection state:", state);
        setConnectionState(state);
      },
      onError: (error) => {
        console.error("❌ MQTT Error:", error.message);
      },
    });

    return () => {
      console.log("🧹 Disconnecting MQTT...");
      mqttService.disconnect();
    };
  }, []);

  return (
    <>
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#4A90E2"]} // Android
              tintColor="#4A90E2" // iOS
              title="Pull to refresh" // iOS
              titleColor="#8E8E93" // iOS
            />
          }
        >
          {/* --- Header --- */}
          <TouchableOpacity
            style={styles.header}
            activeOpacity={0.9}
            onPress={() => router.push("/profile-settings")}
          >
            <View style={styles.headerLeft}>
              <View style={styles.avatarPlaceholder} />
              <View>
                <Text style={styles.appName}>HydroPulse</Text>
                <Text style={styles.appSub}>
                  Water Leakage Detection System
                </Text>
              </View>
            </View>
            <ChevronDown size={24} color="#A0B2C6" />
          </TouchableOpacity>

          {/* --- Connection Status --- */}
          <ConnectionBadge state={connectionState} />

          {/* --- Loading Indicator --- */}
          {loading && (
            <ActivityIndicator
              size="large"
              color="#4A90E2"
              style={{ marginTop: 40 }}
            />
          )}

          {/* --- Zone Cards (Real-time updates) --- */}
          <View style={styles.zonesContainer}>
            {zoneData.map((zone) => (
              <ZoneCard key={zone.id} zone={zone} />
            ))}
          </View>

          {/* --- Analytics Card --- */}
          <TouchableOpacity
            style={styles.analyticsCard}
            activeOpacity={0.9}
            onPress={() => router.push("/usage-details")}
          >
            <View style={styles.analyticsInfo}>
              <Text style={styles.analyticsTitle}>
                Today's{"\n"}Current{"\n"}Usage
              </Text>
              <View style={styles.analyticsStats}>
                <Text style={styles.statsText}>
                  Time: {usageData?.time || "00:00"}
                </Text>
                <Text style={styles.statsText}>
                  Est. Volume: {usageData?.estimatedVolume || "0.0L"}
                </Text>
              </View>
            </View>
            {usageData && (
              <PieChart
                data={usageData.stats.map((s) => ({
                  ...s,
                  textColor: "#fff",
                  fontSize: 10,
                }))}
                radius={60}
                showText
                textSize={10}
                textColor="#fff"
              />
            )}
          </TouchableOpacity>

          {/* --- Action Button --- */}
          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.8}
            onPress={() => setIsModalVisible(true)}
          >
            <Text style={styles.actionButtonText}>Start Detection</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* --- Bottom Navigation --- */}
      </SafeAreaView>
      <DetectionModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />
    </>
  );
}
