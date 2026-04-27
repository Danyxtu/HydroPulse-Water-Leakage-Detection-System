// Types
import { styles } from "@styles/Dashboard.styles";
import { Zone, ZoneStatus } from "@/src/types";
import { AlertTriangle, Minus, Activity, Clock } from "lucide-react-native";
import { View, Text } from "react-native";

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
          <Text style={styles.enhancedZoneName}>Zone {zone.id}</Text>
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
          <Text style={styles.metricLabel}>DAILY VOLUME</Text>
          <Text style={styles.metricValue}>
            {zone.totalVolume?.toFixed(2) || "0.00"}
            <Text style={styles.metricUnit}> L</Text>
          </Text>
          <Text style={{ fontSize: 8, color: "#8E8E93", marginTop: 2 }}>Since 12:01 AM</Text>
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

export default ZoneCard;
