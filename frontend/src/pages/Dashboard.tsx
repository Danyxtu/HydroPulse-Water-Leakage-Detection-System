import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronDown } from "lucide-react-native";
import { useRouter } from "expo-router";
import ConnectionBadge from "@components/Dashboard/ConnectionBadge";
import ZoneModal from "../components/ZoneModal";

// Styles
import { styles } from "@styles/Dashboard.styles";

// Type
import { Zone, ZoneStatus } from "@src/types/index";
import { MqttTelemetryPayload } from "@src/types/mqtt.types";

// Mock Datas
import { mockZoneData } from "@data/index";

// Components
import ZoneCard from "@components/Dashboard/ZoneCard";
import UsageToggle from "@components/Dashboard/UsageToggle";

// hooks
import { useMqtt } from "@hooks/useMqtt";
import { useMqttContext } from "@context/MqttContext";
import { apiService } from "@services/apiService";

const toZoneStatus = (status?: string): ZoneStatus => {
  const normalized = (status || "").toUpperCase();

  if (normalized === "LEAK" || normalized === "LEAKAGE") {
    return "Leakage";
  }

  if (
    normalized === "ON" ||
    normalized === "WARN" ||
    normalized === "RUNNING"
  ) {
    return "Running";
  }

  return "Inactive";
};

const toTimestamp = (value?: string) => {
  if (!value) {
    return Date.now();
  }

  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : Date.now();
};

export default function Dashboard() {
  const router = useRouter();
  const [zoneData, setZoneData] = useState<Zone[]>(mockZoneData);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [isZoneModalVisible, setIsZoneModalVisible] = useState(false);
  const { status: connectionStatus } = useMqttContext();
  const [activeToggle, setActiveToggle] = useState("Today");
  const [loading, setLoading] = useState(false);

  const { latestData: telemetryData } = useMqtt<MqttTelemetryPayload>(
    "hydropulse/zones/+/telemetry",
  );

  useEffect(() => {
    let active = true;

    const loadInitialZones = async () => {
      setLoading(true);
      const response = await apiService.getZones();

      if (active && response.success && response.data.length > 0) {
        const mapped = response.data.map((zone: any) => ({
          id: String(zone.zoneId || zone.id),
          zoneId: String(zone.zoneId || zone.id),
          name: zone.name,
          flowRate: Number(zone.flowRate) || 0,
          totalVolume: Number(zone.totalVolume) || 0,
          status: toZoneStatus(zone.status),
          timestamp: toTimestamp(zone.lastUpdate),
          duration: "0",
        })) as Zone[];

        setZoneData(mapped);
      }

      if (active) {
        setLoading(false);
      }
    };

    loadInitialZones();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!telemetryData?.zoneId) {
      return;
    }

    const zoneId = String(telemetryData.zoneId);
    const flowRate = Number(telemetryData.flowRate) || 0;
    const totalVolume = Number(telemetryData.totalVol) || 0;
    const status = toZoneStatus(telemetryData.status);
    const now = Date.now();

    setZoneData((currentZones) => {
      const exists = currentZones.some(
        (zone) => String(zone.id) === zoneId || String(zone.zoneId) === zoneId,
      );

      if (!exists) {
        const nextZone: Zone = {
          id: zoneId,
          zoneId,
          name: `Zone ${zoneId}`,
          flowRate,
          totalVolume,
          status,
          timestamp: now,
          duration: "0",
          startTime: status === "Running" ? now : undefined,
        };

        return [...currentZones, nextZone].sort(
          (a, b) => Number(a.id) - Number(b.id),
        );
      }

      return currentZones.map((zone) => {
        const isTargetZone =
          String(zone.id) === zoneId || String(zone.zoneId) === zoneId;

        if (!isTargetZone) {
          return zone;
        }

        const wasRunning = zone.status === "Running";
        const isRunning = status === "Running";

        return {
          ...zone,
          id: zoneId,
          zoneId,
          flowRate,
          totalVolume,
          status,
          timestamp: now,
          startTime: isRunning
            ? wasRunning
              ? zone.startTime
              : now
            : undefined,
        };
      });
    });
  }, [telemetryData]);

  const estimatedTotalVolume = zoneData
    .reduce((sum, zone) => sum + (Number(zone.totalVolume) || 0), 0)
    .toFixed(2);

  const handleZonePress = (zone: Zone) => {
    setSelectedZone(zone);
    setIsZoneModalVisible(true);
  };

  const handleCloseZoneModal = () => {
    setIsZoneModalVisible(false);
  };

  return (
    <>
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
                <Text style={styles.appSub}>
                  Water Leakage Detection System
                </Text>
              </View>
            </View>
            <ChevronDown size={24} color="#A0B2C6" />
          </TouchableOpacity>

          {/* --- Connection Status --- */}
          <ConnectionBadge state={connectionStatus} />

          {/* --- Loading Indicator --- */}
          {loading && (
            <ActivityIndicator
              size="large"
              color="#4A90E2"
              style={{ marginTop: 40 }}
            />
          )}

          {/* --- Zone Cards (Real-time updates) --- */}
          <Text style={styles.zoneHintText}>Click the cards to view more</Text>
          <View style={styles.zonesContainer}>
            {zoneData.map((zone) => (
              <TouchableOpacity
                key={zone.id}
                activeOpacity={0.94}
                onPress={() => handleZonePress(zone)}
              >
                <ZoneCard zone={zone} />
              </TouchableOpacity>
            ))}
          </View>

          {/* --- Usage Toggle --- */}
          <UsageToggle activeTab={activeToggle} onTabChange={setActiveToggle} />

          {/* --- Analytics Card --- */}
          <TouchableOpacity
            style={styles.analyticsCard}
            activeOpacity={0.9}
            onPress={() => router.push("/usage-details")}
          >
            <View style={styles.analyticsInfo}>
              <Text style={styles.analyticsTitle}>
                {activeToggle}'s{"\n"}Current{"\n"}Usage
              </Text>
              <View style={styles.analyticsStats}>
                <Text style={styles.statsText}>
                  Est. Volume: {estimatedTotalVolume}L
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </ScrollView>

        {/* --- Bottom Navigation --- */}
      </SafeAreaView>

      <ZoneModal
        visible={isZoneModalVisible}
        zone={selectedZone}
        onClose={handleCloseZoneModal}
      />
    </>
  );
}
