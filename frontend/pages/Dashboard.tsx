import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl, // ← Add this
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Home,
  History,
  AlertTriangle,
  Activity,
  Minus,
  ChevronDown,
  Clock,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { PieChart } from "react-native-gifted-charts";
import DetectionModal from "../components/DetectionModal";
import { styles } from "../styles/Dashboard.styles";
import { mqttService } from "../services/mqttService";
import { Zone, CurrentUsage, ZoneStatus } from "../types";

// Mock Data - Initial display while waiting for MQTT
const mockZoneData: Zone[] = [
  {
    id: "1",
    name: "Kitchen Area",
    zoneId: "1",
    zoneName: "Kitchen Area",
    flowRate: 0,
    totalVolume: 0,
    status: "Inactive" as ZoneStatus,
    timestamp: Date.now(),
    duration: "0",
  },
  {
    id: "2",
    name: "Guest Bathroom",
    zoneId: "2",
    zoneName: "Guest Bathroom",
    flowRate: 0,
    totalVolume: 0,
    status: "Inactive" as ZoneStatus,
    timestamp: Date.now(),
    duration: "0",
  },
  {
    id: "3",
    name: "Master's Bathroom",
    zoneId: "3",
    zoneName: "Master's Bathroom",
    flowRate: 0,
    totalVolume: 0,
    status: "Inactive" as ZoneStatus,
    timestamp: Date.now(),
    duration: "0",
  },
];

const mockUsageData: CurrentUsage = {
  time: "00:00",
  estimatedVolume: "0.0L",
  stats: [
    {
      value: 33,
      color: "#4A90E2",
      text: "33%",
      label: "Kitchen",
    },
    {
      value: 33,
      color: "#2ECC71",
      text: "33%",
      label: "Guest Bath",
    },
    {
      value: 34,
      color: "#F1C40F",
      text: "34%",
      label: "Master Bath",
    },
  ],
};

// Reusable Zone Card Component
const ZoneCard = ({ zone }: { zone: Zone }) => {
  const getStatusConfig = (status: ZoneStatus) => {
    switch (status) {
      case "Leakage":
        return {
          color: styles.textRed,
          indicatorColor: styles.indicatorRed,
          icon: <AlertTriangle size={20} color="#E74C3C" />,
          label: "Possible Leakage",
          bgColor: "#FCEBEB",
        };
      case "Inactive":
        return {
          color: styles.textYellow,
          indicatorColor: styles.indicatorYellow,
          icon: <Minus size={20} color="#F1C40F" />,
          label: "Inactive",
          bgColor: "#FAEEDA",
        };
      case "Running":
        return {
          color: styles.textGreen,
          indicatorColor: styles.indicatorGreen,
          icon: <Activity size={20} color="#2ECC71" />,
          label: "Running",
          bgColor: "#EAF3DE",
        };
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = Math.floor((now - timestamp) / 1000);

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  const getContextualMessage = (zone: Zone) => {
    switch (zone.status) {
      case "Leakage":
        return "⚠️ Abnormal flow detected";
      case "Inactive":
        return zone.lastUsed
          ? `Last used: ${zone.lastUsed}`
          : "No recent activity";
      case "Running":
        return zone.flowRate && zone.flowRate > 5
          ? "Normal usage pattern"
          : "Low flow detected";
      default:
        return "";
    }
  };

  const calculateDuration = (zone: Zone) => {
    if (zone.status === "Inactive") return "0";
    if (zone.status === "Running" && zone.startTime) {
      const duration = Math.floor((Date.now() - zone.startTime) / 60000);
      return duration.toString();
    }
    return zone.duration || "0";
  };

  const config = getStatusConfig(zone.status);

  return (
    <View style={styles.enhancedCard}>
      <View style={styles.enhancedCardHeader}>
        <View style={styles.zoneNameContainer}>
          <Text style={styles.enhancedZoneName}>{zone.name}</Text>
          <Text style={styles.zoneId}>Zone #{zone.id}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: config.bgColor }]}>
          {config.icon}
          <Text style={[styles.statusBadgeText, config.color]}>
            {config.label}
          </Text>
        </View>
      </View>

      <View style={styles.metricsGrid}>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>FLOW RATE</Text>
          <Text style={styles.metricValue}>
            {zone.flowRate?.toFixed(1) || "0.0"}
            <Text style={styles.metricUnit}> L/min</Text>
          </Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>TOTAL VOLUME</Text>
          <Text style={styles.metricValue}>
            {zone.totalVolume?.toFixed(2) || "0.00"}
            <Text style={styles.metricUnit}> L</Text>
          </Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>DURATION</Text>
          <Text style={styles.metricValue}>
            {calculateDuration(zone)}
            <Text style={styles.metricUnit}> min</Text>
          </Text>
        </View>
      </View>

      <View style={styles.enhancedCardFooter}>
        <View style={styles.lastUpdateContainer}>
          <Clock size={12} color="#8E8E93" />
          <Text style={styles.lastUpdateText}>
            {zone.timestamp ? formatTimestamp(zone.timestamp) : "Just now"}
          </Text>
        </View>
        <Text style={styles.contextualMessage}>
          {getContextualMessage(zone)}
        </Text>
      </View>

      <View style={[styles.cardIndicator, config.indicatorColor]} />
    </View>
  );
};

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
      // Wait a brief moment for visual feedback
      await new Promise((resolve) => setTimeout(resolve, 800));

      // If MQTT is disconnected, reconnect
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
              <Text style={styles.appSub}>Water Leakage Detection System</Text>
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
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navTextActive}>Dashboard</Text>
          <Home size={24} color="#4A90E2" />
          <View style={styles.activeIndicator} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/activity-logs")}
        >
          <Text style={styles.navTextInactive}>Activity Logs</Text>
          <History size={24} color="#8E8E93" />
          <View style={styles.inactiveIndicator} />
        </TouchableOpacity>
      </View>

      <DetectionModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />
    </SafeAreaView>
  );
}
