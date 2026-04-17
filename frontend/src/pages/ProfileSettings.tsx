import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeftCircle,
  User,
  Bell,
  Shield,
  Droplets,
  Phone,
  LogOut,
  ChevronRight,
  Cpu,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { styles } from "../styles/ProfileSettings.styles";

// --- Reusable Component for Setting Rows ---
interface SettingsRowProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  value?: string;
  isDestructive?: boolean;
  onPress?: () => void;
}

const SettingsRow = ({
  icon,
  title,
  subtitle,
  value,
  isDestructive,
  onPress,
}: SettingsRowProps) => (
  <TouchableOpacity
    style={styles.settingRow}
    activeOpacity={0.7}
    onPress={onPress}
  >
    <View style={styles.settingLeft}>
      <View
        style={[styles.iconBox, isDestructive && styles.iconBoxDestructive]}
      >
        {icon}
      </View>
      <View>
        <Text
          style={[styles.settingTitle, isDestructive && styles.textDestructive]}
        >
          {title}
        </Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
    </View>
    <View style={styles.settingRight}>
      {value && <Text style={styles.settingValue}>{value}</Text>}
      <ChevronRight size={20} color="#A0B2C6" />
    </View>
  </TouchableOpacity>
);

export default function ProfileSettingsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* --- Header --- */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeftCircle size={32} color="#67A1EB" strokeWidth={1.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile & Settings</Text>
        <View style={{ width: 32 }} /> {/* Spacer for alignment */}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* --- Profile Card --- */}
        <View style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>P</Text>
          </View>
          <Text style={styles.profileName}>Pheinz</Text>
          <Text style={styles.profileEmail}>System Administrator</Text>

          <TouchableOpacity style={styles.editProfileBtn}>
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* --- System & Hardware Settings --- */}
        <Text style={styles.sectionHeader}>IoT System</Text>
        <View style={styles.settingsGroup}>
          <SettingsRow
            icon={<Cpu size={20} color="#4A90E2" />}
            title="Hardware Configuration"
            subtitle="Manage zones and thresholds"
            onPress={() => router.push("/zone-management")}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon={<Droplets size={20} color="#4A90E2" />}
            title="Sensor Calibration"
            subtitle="Adjust sensitivity thresholds"
          />
          <View style={styles.divider} />
          <SettingsRow
            icon={<Bell size={20} color="#4A90E2" />}
            title="Alert Preferences"
            value="Push, SMS"
          />
        </View>

        {/* --- Account Settings --- */}
        <Text style={styles.sectionHeader}>Account</Text>
        <View style={styles.settingsGroup}>
          <SettingsRow
            icon={<User size={20} color="#4A90E2" />}
            title="Account Details"
          />
          <View style={styles.divider} />
          <SettingsRow
            icon={<Shield size={20} color="#4A90E2" />}
            title="Privacy & Security"
          />
        </View>

        {/* --- Support & Contacts --- */}
        <Text style={styles.sectionHeader}>Support</Text>
        <View style={styles.settingsGroup}>
          <SettingsRow
            icon={<Phone size={20} color="#4A90E2" />}
            title="Emergency Contact"
            value="Neal Jean (PM)"
          />
        </View>

        {/* --- Logout --- */}
        <View style={[styles.settingsGroup, { marginTop: 24 }]}>
          <SettingsRow
            icon={<LogOut size={20} color="#EF4444" />}
            title="Log Out"
            isDestructive={true}
          />
        </View>

        <Text style={styles.versionText}>HydroPulse App v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
