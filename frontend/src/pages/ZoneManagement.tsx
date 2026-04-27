import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeftCircle,
  PlusCircle,
  Trash2,
  Save,
  Cpu,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { styles } from "../styles/ZoneManagement.styles";
import { Zone } from "@src/types/index";

// interface ZoneWithThreshold extends Zone {
//   threshold?: number;
// }
import { COLORS } from "@constants/themes";

export default function ZoneManagement() {
  const router = useRouter();
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      {/* --- Header --- */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeftCircle
            size={32}
            color={COLORS.secondary}
            strokeWidth={1.5}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Zone Management</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* --- Add New Zone Button --- */}
        <TouchableOpacity style={styles.addCard}>
          <PlusCircle size={24} color={COLORS.secondary} />
          <Text style={styles.addText}>Add New Hardware Unit</Text>
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} />
        ) : (
          zones.map((zone) => (
            <View key={zone.id} style={styles.zoneCard}>
              <View style={styles.zoneHeader}>
                <View>
                  <Text style={styles.zoneName}>{zone.name}</Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Cpu size={12} color={COLORS.textGray} />
                    <Text style={styles.zoneId}>
                      Hardware ID: {zone.zoneId}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  // onPress={() => handleDelete(zone.id, zone.name)}
                >
                  <Trash2 size={20} color={COLORS.red} />
                </TouchableOpacity>
              </View>

              {/* Editable Fields */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Zone Name</Text>
                <TextInput
                  style={styles.input}
                  value={zone.name}
                  // onChangeText={(text) =>
                  //   // updateLocalZone(zone.id, "name", text)
                  // }
                  placeholder="e.g. Garden Area"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Leakage Threshold (L/min)</Text>
                <TextInput
                  style={styles.input}
                  value={zone.threshold?.toString() || "5.0"}
                  // onChangeText={(text) =>
                  // updateLocalZone(zone.id, "threshold", parseFloat(text) || 0)
                  // }
                  keyboardType="numeric"
                  placeholder="Sensitivity"
                />
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.saveBtn}
                  // onPress={() => handleSave(zone)}
                  disabled={savingId === zone.id}
                >
                  {savingId === zone.id ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Save size={16} color="#fff" />
                      <Text style={styles.saveText}>Save Settings</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
