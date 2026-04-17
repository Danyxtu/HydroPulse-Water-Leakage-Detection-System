import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronDown, Home, History } from "lucide-react-native";
import { useRouter } from "expo-router";
import { styles } from "@styles/ActivityLogs.styles";
import { waterService } from "@services/waterService";
import { LogEntry } from "@src/types/index";

export default function ActivityLogs() {
  const router = useRouter();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Fetch Logs ---
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await waterService.getActivityLogs();
        if (response.success) {
          setLogs(response.data);
        }
      } catch (error) {
        console.error("FAILED TO FETCH LOGS:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const renderItem = ({ item, index }: { item: LogEntry; index: number }) => {
    const isLast = index === logs.length - 1;

    return (
      <View style={[styles.listItem, !isLast && styles.listItemBorder]}>
        <View style={styles.listLeft}>
          <Text style={styles.listZone}>{item.zone}</Text>
          <Text style={styles.listTime}>{item.time}</Text>
        </View>
        <View style={styles.listRight}>
          <Text style={styles.listDetail}>Usage Duration: {item.duration}</Text>
          <Text style={styles.listDetail}>Est. Volume: {item.volume}</Text>
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
        <View style={styles.card}>
          {loading ? (
            <ActivityIndicator
              size="large"
              color="#4A90E2"
              style={{ marginTop: 40 }}
            />
          ) : (
            <FlatList
              data={logs}
              keyExtractor={(item: LogEntry) => item.id}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.flatListContent}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
