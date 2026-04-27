import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Activity, AlertTriangle, Clock3, Minus, X } from "lucide-react-native";
import { mockActivityLogs } from "@data/mockActivityLogsData";
import { styles } from "@styles/ZoneModal.styles";
import { LogEntry, Zone, ZoneStatus } from "@src/types/index";

interface ZoneModalProps {
  visible: boolean;
  zone: Zone | null;
  onClose: () => void;
}

type StatusConfig = {
  label: string;
  badgeBg: string;
  textColor: string;
  accentColor: string;
  icon: React.ReactNode;
};

const SCREEN_HEIGHT = Dimensions.get("window").height;
const ENTER_BACKDROP_DURATION = 180;
const EXIT_BACKDROP_DURATION = 160;
const EXIT_SHEET_DURATION = 190;

const toSafeZoneLabel = (zone: Zone | null) => {
  if (!zone) return "";

  const rawId = String(zone.id).trim();
  if (rawId.toLowerCase().startsWith("zone")) {
    const suffix = rawId.replace(/^zone\s*/i, "").trim();
    return suffix ? `Zone ${suffix}` : "Zone";
  }

  return `Zone ${rawId}`;
};

const normalize = (value: string) =>
  value.trim().toLowerCase().replace(/\s+/g, " ");

const toTimestamp = (value?: string) => {
  if (!value) return 0;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

const formatRelativeTime = (timestamp?: number) => {
  if (!timestamp) return "Just now";

  const diffInSeconds = Math.floor((Date.now() - timestamp) / 1000);
  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hr ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
};

const getContextualMessage = (zone: Zone) => {
  switch (zone.status) {
    case "Leakage":
      return "Abnormal flow detected";
    case "Inactive":
      return zone.lastUsed
        ? `Last used: ${zone.lastUsed}`
        : "No recent activity";
    case "Running":
      return zone.flowRate > 5 ? "Normal usage pattern" : "Low flow detected";
    default:
      return "No status information";
  }
};

const getDuration = (zone: Zone) => {
  if (zone.status === "Inactive") return "0";
  if (zone.status === "Running" && zone.startTime) {
    const duration = Math.floor((Date.now() - zone.startTime) / 60000);
    return duration.toString();
  }

  return zone.duration || "0";
};

const getStatusConfig = (status: ZoneStatus): StatusConfig => {
  switch (status) {
    case "Leakage":
      return {
        label: "Possible Leakage",
        badgeBg: "#FEE2E2",
        textColor: "#B91C1C",
        accentColor: "#EF4444",
        icon: <AlertTriangle size={18} color="#B91C1C" />,
      };
    case "Inactive":
      return {
        label: "Inactive",
        badgeBg: "#FEF3C7",
        textColor: "#B45309",
        accentColor: "#F59E0B",
        icon: <Minus size={18} color="#B45309" />,
      };
    case "Running":
      return {
        label: "Running",
        badgeBg: "#DCFCE7",
        textColor: "#166534",
        accentColor: "#22C55E",
        icon: <Activity size={18} color="#166534" />,
      };
    default:
      return {
        label: "Inactive",
        badgeBg: "#FEF3C7",
        textColor: "#B45309",
        accentColor: "#F59E0B",
        icon: <Minus size={18} color="#B45309" />,
      };
  }
};

const formatLogDateLabel = (log: LogEntry) => {
  if (!log.timestamp) return log.time;

  const date = new Date(log.timestamp);
  if (Number.isNaN(date.getTime())) return log.time;

  const datePart = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const timePart = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${datePart} • ${timePart}`;
};

export default function ZoneModal({ visible, zone, onClose }: ZoneModalProps) {
  const [renderModal, setRenderModal] = useState(visible);
  const sheetTranslateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const runEnterAnimation = () => {
    sheetTranslateY.stopAnimation();
    backdropOpacity.stopAnimation();
    sheetTranslateY.setValue(SCREEN_HEIGHT);
    backdropOpacity.setValue(0);

    Animated.parallel([
      Animated.spring(sheetTranslateY, {
        toValue: 0,
        damping: 22,
        stiffness: 210,
        mass: 0.9,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: ENTER_BACKDROP_DURATION,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const runExitAnimation = (afterClose?: () => void) => {
    sheetTranslateY.stopAnimation();
    backdropOpacity.stopAnimation();

    Animated.parallel([
      Animated.timing(sheetTranslateY, {
        toValue: SCREEN_HEIGHT,
        duration: EXIT_SHEET_DURATION,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: EXIT_BACKDROP_DURATION,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (!finished) return;
      setRenderModal(false);
      afterClose?.();
    });
  };

  useEffect(() => {
    if (visible) {
      setRenderModal(true);
      const rafId = requestAnimationFrame(runEnterAnimation);
      return () => cancelAnimationFrame(rafId);
    }

    if (renderModal) {
      runExitAnimation();
    }
  }, [visible, renderModal]);

  const handleDismiss = () => {
    runExitAnimation(onClose);
  };

  const zoneLabel = useMemo(() => toSafeZoneLabel(zone), [zone]);

  const zoneLogs = useMemo(() => {
    if (!zone) return [];

    const selectedZone = normalize(zoneLabel);
    return mockActivityLogs
      .filter((log) => normalize(log.zone) === selectedZone)
      .sort((a, b) => toTimestamp(b.timestamp) - toTimestamp(a.timestamp));
  }, [zone, zoneLabel]);

  if (!zone || !renderModal) return null;

  const statusConfig = getStatusConfig(zone.status);

  return (
    <Modal
      visible={renderModal}
      transparent
      animationType="none"
      onRequestClose={handleDismiss}
    >
      <View style={styles.overlay}>
        <Animated.View
          pointerEvents="none"
          style={[styles.overlayBackdrop, { opacity: backdropOpacity }]}
        />

        <TouchableOpacity
          activeOpacity={1}
          style={styles.overlayPressArea}
          onPress={handleDismiss}
        />

        <Animated.View
          style={[
            styles.sheet,
            { transform: [{ translateY: sheetTranslateY }] },
          ]}
        >
          <View style={styles.grabber} />

          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>{zoneLabel}</Text>
              <Text style={styles.sheetSubtitle}>
                Live zone details and filtered activity logs
              </Text>
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleDismiss}
              activeOpacity={0.85}
            >
              <X size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.heroCard}>
              <View
                style={[
                  styles.statusAccent,
                  { backgroundColor: statusConfig.accentColor },
                ]}
              />

              <View style={styles.heroHeader}>
                <View>
                  <Text style={styles.heroTitle}>{zoneLabel}</Text>
                  <Text style={styles.heroSubTitle}>
                    Full zone performance view
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: statusConfig.badgeBg },
                  ]}
                >
                  {statusConfig.icon}
                  <Text
                    style={[
                      styles.statusBadgeText,
                      { color: statusConfig.textColor },
                    ]}
                  >
                    {statusConfig.label}
                  </Text>
                </View>
              </View>

              <View style={styles.metricsRow}>
                <View style={styles.metricTile}>
                  <Text style={styles.metricLabel}>FLOW RATE</Text>
                  <Text style={styles.metricValue}>
                    {zone.flowRate?.toFixed(1) || "0.0"}
                    <Text style={styles.metricUnit}> L/min</Text>
                  </Text>
                </View>

                <View style={styles.metricTile}>
                  <Text style={styles.metricLabel}>DAILY VOLUME</Text>
                  <Text style={styles.metricValue}>
                    {zone.totalVolume?.toFixed(2) || "0.00"}
                    <Text style={styles.metricUnit}> L</Text>
                  </Text>
                </View>

                <View style={styles.metricTile}>
                  <Text style={styles.metricLabel}>DURATION</Text>
                  <Text style={styles.metricValue}>
                    {getDuration(zone)}
                    <Text style={styles.metricUnit}> min</Text>
                  </Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaLeft}>
                  <Clock3 size={12} color="#8E8E93" />
                  <Text style={styles.metaTimeText}>
                    {formatRelativeTime(zone.timestamp)}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.metaStatusText,
                    { color: statusConfig.textColor },
                  ]}
                >
                  {getContextualMessage(zone)}
                </Text>
              </View>
            </View>

            <View style={styles.logsSection}>
              <Text style={styles.logsTitle}>Activity Logs</Text>
              <Text style={styles.logsSubtitle}>Entries for {zoneLabel}</Text>

              {zoneLogs.length === 0 ? (
                <View style={styles.emptyLogsBox}>
                  <Text style={styles.emptyLogsText}>
                    No activity logs found for this zone.
                  </Text>
                </View>
              ) : (
                zoneLogs.map((log) => (
                  <View key={log.id} style={styles.logItem}>
                    <View style={styles.logItemHeader}>
                      <Text style={styles.logTime}>
                        {formatLogDateLabel(log)}
                      </Text>
                      <View style={styles.logZonePill}>
                        <Text style={styles.logZonePillText}>{log.zone}</Text>
                      </View>
                    </View>

                    <View style={styles.logMetricsRow}>
                      <View style={styles.logMetricCol}>
                        <Text style={styles.logMetricLabel}>Duration</Text>
                        <Text style={styles.logMetricValue}>
                          {log.duration}
                        </Text>
                      </View>

                      <View style={styles.logDivider} />

                      <View style={styles.logMetricCol}>
                        <Text style={styles.logMetricLabel}>Est. Volume</Text>
                        <Text style={styles.logMetricValue}>{log.volume}</Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
