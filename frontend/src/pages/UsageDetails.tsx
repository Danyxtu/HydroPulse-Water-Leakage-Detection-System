import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronDown, ArrowLeftCircle } from "lucide-react-native";
import { useRouter } from "expo-router";
import { PieChart } from "react-native-gifted-charts";
import { styles } from "../styles/UsageDetails.styles";
import { waterService } from "../src/services/waterService";
import { LogEntry, CurrentUsage } from "../types";

export default function UsageDetails() {
  const router = useRouter();
  const [usageData, setUsageData] = useState<CurrentUsage | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Fetch Usage & Logs ---
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [usageRes, logsRes] = await Promise.all([
          waterService.getCurrentUsage(),
          waterService.getActivityLogs(),
        ]);

        if (usageRes.success) setUsageData(usageRes.data);
        if (logsRes.success) setLogs(logsRes.data);
      } catch (error) {
        console.error("FAILED TO FETCH USAGE DATA:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarPlaceholder} />
          <View>
            <Text style={styles.appName}>HydroPulse</Text>
            <Text style={styles.appSub}>Water Leakage Detection System</Text>
          </View>
        </View>
        <ChevronDown size={24} color="#A0B2C6" />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ArrowLeftCircle size={32} color="#67A1EB" strokeWidth={1.5} />
            </TouchableOpacity>
            <Text style={styles.cardTitle}>Today's Current Usage</Text>
          </View>

          {loading ? (
            <ActivityIndicator
              size="large"
              color="#4A90E2"
              style={{ marginVertical: 40 }}
            />
          ) : (
            <>
              <View style={styles.chartContainer}>
                {usageData && (
                  <PieChart
                    data={usageData.stats.map((s) => ({
                      ...s,
                      textColor: "#1A3B5C",
                      fontWeight: "bold",
                    }))}
                    radius={110}
                    showText
                    textSize={12}
                    textColor="#1A3B5C"
                  />
                )}
              </View>

              <Text style={styles.breakdownTitle}>Usage Breakdown:</Text>

              <View style={styles.listContainer}>
                {logs.map((log, index) => {
                  const isLast = index === logs.length - 1;
                  return (
                    <View
                      key={log.id}
                      style={[
                        styles.listItem,
                        !isLast && styles.listItemBorder,
                      ]}
                    >
                      <View style={styles.listLeft}>
                        <Text style={styles.listZone}>{log.zone}</Text>
                        <Text style={styles.listTime}>{log.time}</Text>
                      </View>
                      <View style={styles.listRight}>
                        <Text style={styles.listDetail}>
                          Usage Duration: {log.duration}
                        </Text>
                        <Text style={styles.listDetail}>
                          Est. Volume: {log.volume}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
