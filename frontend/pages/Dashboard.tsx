import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Home,
  History,
  AlertTriangle,
  Activity,
  Minus,
  ChevronDown,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { PieChart } from "react-native-gifted-charts";
import DetectionModal from "../components/DetectionModal";
import { styles } from "../styles/Dashboard.styles";
import { waterService } from "../services/waterService";
import { Zone, CurrentUsage, ZoneStatus } from "../types";

export default function Dashboard() {
  const router = useRouter();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [zoneData, setZoneData] = useState<Zone[]>([]);
  const [usageData, setUsageData] = useState<CurrentUsage | null>(null);
  const [loading, setLoading] = useState(true);

  // --- Fetch Dashboard Data & Sync MQTT ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Ensure storage is initialized on first run
        await waterService.initializeStorage();

        const [zonesRes, usageRes] = await Promise.all([
          waterService.getZones(),
          waterService.getCurrentUsage(),
        ]);

        if (zonesRes.success) setZoneData(zonesRes.data);
        if (usageRes.success) setUsageData(usageRes.data);
      } catch (error) {
        console.error("FAILED TO FETCH DASHBOARD DATA:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Handle Real-time MQTT Updates
    // mqttService.connect((data) => {
    //   setZoneData((prevZones) =>
    //     waterService.applyLocalUpdate(
    //       data.zoneId,
    //       {
    //         status: data.status,
    //         flowRate: data.flowRate,
    //         totalVolume: data.totalVolume,
    //       },
    //       prevZones,
    //     ),
    //   );
    // });
  }, []);

  const getStatusConfig = (status: ZoneStatus) => {
    switch (status) {
      case "Leakage":
        return {
          color: styles.textRed,
          indicatorColor: styles.indicatorRed,
          icon: <AlertTriangle size={28} color="#E74C3C" />,
          label: "Possible Leakage",
        };
      case "Inactive":
        return {
          color: styles.textYellow,
          indicatorColor: styles.indicatorYellow,
          icon: <Minus size={28} color="#F1C40F" />,
          label: "Inactive",
        };
      case "Running":
        return {
          color: styles.textGreen,
          indicatorColor: styles.indicatorGreen,
          icon: <Activity size={28} color="#2ECC71" />,
          label: "Running",
        };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
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

        {/* --- Loading Indicator --- */}
        {loading && (
          <ActivityIndicator
            size="large"
            color="#4A90E2"
            style={{ marginTop: 40 }}
          />
        )}

        {/* --- Zone Cards --- */}
        {!loading && (
          <View style={styles.zonesContainer}>
            {zoneData.map((zone) => {
              const config = getStatusConfig(zone.status);
              return (
                <View key={zone.id} style={styles.card}>
                  <View style={styles.cardInfo}>
                    <Text style={styles.zoneName}>{zone.name}</Text>
                    <Text style={styles.timeUsage}>
                      {zone.flowRate !== undefined && zone.flowRate > 0
                        ? `Flow: ${zone.flowRate.toFixed(2)} L/min`
                        : `Time Usage: ${zone.timeUsage}`}
                    </Text>
                  </View>

                  <View style={styles.statusContainer}>
                    {config.icon}
                    <Text style={[styles.statusLabel, config.color]}>
                      {config.label}
                    </Text>
                  </View>
                  {/* Right edge color indicator */}
                  <View style={[styles.cardIndicator, config.indicatorColor]} />
                </View>
              );
            })}
          </View>
        )}

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
          {/* Pie Chart Area */}
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
