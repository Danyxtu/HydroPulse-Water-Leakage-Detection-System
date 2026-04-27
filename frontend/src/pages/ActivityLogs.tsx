import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronDown, Calendar as CalendarIcon } from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { styles } from "@styles/ActivityLogs.styles";
import { LogEntry } from "@src/types/index";
import { MqttUsagePayload } from "@src/types/mqtt.types";
import { useMqtt } from "@hooks/useMqtt";
import { apiService } from "@services/apiService";

type FilterRange = "Today" | "Yesterday" | "This week" | "Custom";
type ZoneFilter = "All" | "Zone 1" | "Zone 2" | "Zone 3";

const sortByTimestampDesc = (entries: LogEntry[]) => {
  return [...entries].sort(
    (a, b) =>
      new Date(b.timestamp || 0).getTime() -
      new Date(a.timestamp || 0).getTime(),
  );
};

const formatDurationFromMs = (durationMs: number) => {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
};

export default function ActivityLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRange, setFilterRange] = useState<FilterRange>("Today");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedZone, setSelectedZone] = useState<ZoneFilter>("All");
  const { latestData: usageData } = useMqtt<MqttUsagePayload>(
    "hydropulse/zones/+/usage",
  );

  useEffect(() => {
    let active = true;

    const fetchLogs = async () => {
      setLoading(true);
      const response = await apiService.getActivityLogs();

      if (active && response.success) {
        setLogs(sortByTimestampDesc(response.data));
      }

      if (active) {
        setLoading(false);
      }
    };

    fetchLogs();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!usageData?.zoneId) {
      return;
    }

    const now = new Date();
    const totalVol = Number(usageData.totalVol) || 0;
    const durationMs = Number(usageData.duration) || 0;
    const freshEntry: LogEntry = {
      id: `mqtt-${usageData.zoneId}-${now.getTime()}`,
      zone: `Zone ${usageData.zoneId}`,
      time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      duration: formatDurationFromMs(durationMs),
      volume: `${totalVol.toFixed(2)}L`,
      timestamp: now.toISOString(),
      type: usageData.status ? `Usage:${usageData.status}` : "Usage",
    };

    setLogs((prev) => sortByTimestampDesc([freshEntry, ...prev]));
  }, [usageData]);

  // Sync date when clicking preset filters
  const handleRangeChange = (range: FilterRange) => {
    setFilterRange(range);
    const now = new Date();
    if (range === "Today") {
      setSelectedDate(now);
    } else if (range === "Yesterday") {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      setSelectedDate(yesterday);
    } else if (range === "This week") {
      setSelectedDate(now); // Set to current for picker but label will show range
    }
  };

  const filteredLogs = useMemo(() => {
    const now = new Date();
    const isSameDay = (d1: Date, d2: Date) =>
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();

    return logs
      .filter((log) => {
        if (!log.timestamp) return false;
        const logDate = new Date(log.timestamp);
        let withinSelectedRange = false;

        if (filterRange === "Today") {
          withinSelectedRange = isSameDay(logDate, now);
        }
        if (filterRange === "Yesterday") {
          const yesterday = new Date(now);
          yesterday.setDate(now.getDate() - 1);
          withinSelectedRange = isSameDay(logDate, yesterday);
        }
        if (filterRange === "This week") {
          const sevenDaysAgo = new Date(now);
          sevenDaysAgo.setDate(now.getDate() - 7);
          withinSelectedRange = logDate >= sevenDaysAgo && logDate <= now;
        }
        if (filterRange === "Custom") {
          withinSelectedRange = isSameDay(logDate, selectedDate);
        }

        if (!withinSelectedRange) return false;
        if (selectedZone === "All") return true;
        return log.zone === selectedZone || `Zone ${log.zone}` === selectedZone;
      })
      .sort(
        (a, b) =>
          new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime(),
      );
  }, [logs, filterRange, selectedDate, selectedZone]);

  const getDateLabel = () => {
    if (filterRange === "This week") {
      const start = new Date();
      start.setDate(start.getDate() - 7);
      return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
    }
    return selectedDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const onDateChange = (date?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (date) {
      setSelectedDate(date);
      setFilterRange("Custom");
    }
  };

  const onDismiss = () => {
    setShowDatePicker(false);
  };

  const renderItem = ({ item }: { item: LogEntry }) => {
    return (
      <View style={styles.listItem}>
        <View style={styles.itemTopRow}>
          <View style={styles.zonePill}>
            <Text style={styles.zonePillText}>{item.zone}</Text>
          </View>
          <Text style={styles.listTime}>{item.time}</Text>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricBlock}>
            <Text style={styles.metricLabel}>Usage Duration</Text>
            <Text style={styles.metricValue}>{item.duration}</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricBlock}>
            <Text style={styles.metricLabel}>Est. Volume</Text>
            <Text style={styles.metricValue}>{item.volume}</Text>
          </View>
        </View>
      </View>
    );
  };

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

      <View style={styles.listWrapper}>
        <View style={styles.filterContainer}>
          <View style={styles.toggleContainer}>
            {(["Today", "Yesterday", "This week"] as FilterRange[]).map(
              (range) => (
                <TouchableOpacity
                  key={range}
                  style={[
                    styles.toggleButton,
                    filterRange === range && styles.toggleButtonActive,
                  ]}
                  onPress={() => handleRangeChange(range)}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      filterRange === range && styles.toggleTextActive,
                    ]}
                  >
                    {range}
                  </Text>
                </TouchableOpacity>
              ),
            )}
          </View>

          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <CalendarIcon size={18} color="#4A90E2" />
            <Text style={styles.datePickerText}>{getDateLabel()}</Text>
          </TouchableOpacity>

          <View style={styles.zoneFilterWrap}>
            <Text style={styles.zoneFilterLabel}>Filter by Zone</Text>
            <View style={styles.zoneFilterRow}>
              {(["All", "Zone 1", "Zone 2", "Zone 3"] as ZoneFilter[]).map(
                (zone) => (
                  <TouchableOpacity
                    key={zone}
                    style={[
                      styles.zoneChip,
                      selectedZone === zone && styles.zoneChipActive,
                    ]}
                    onPress={() => setSelectedZone(zone)}
                  >
                    <Text
                      style={[
                        styles.zoneChipText,
                        selectedZone === zone && styles.zoneChipTextActive,
                      ]}
                    >
                      {zone}
                    </Text>
                  </TouchableOpacity>
                ),
              )}
            </View>
          </View>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            maximumDate={new Date()}
            onValueChange={(_event: any, date?: Date) => onDateChange(date)}
            onDismiss={onDismiss}
          />
        )}

        <View style={styles.card}>
          {loading ? (
            <ActivityIndicator
              size="large"
              color="#4A90E2"
              style={{ marginTop: 40 }}
            />
          ) : (
            <FlatList
              data={filteredLogs}
              keyExtractor={(item: LogEntry) => item.id}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.flatListContent}
              ListEmptyComponent={
                <View style={{ alignItems: "center", marginTop: 40 }}>
                  <Text style={{ color: "#A0B2C6" }}>
                    No activity logs found for this time and zone.
                  </Text>
                </View>
              }
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
