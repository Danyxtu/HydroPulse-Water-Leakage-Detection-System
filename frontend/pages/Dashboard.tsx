import { Text, View, TouchableOpacity } from "react-native";
import { dashboardStyles } from "@/styles/dashboard.css";
import Feather from "@expo/vector-icons/Feather";
import Spacer from "@/components/Spacer";
import { SensorCard } from "@/components/Dashboard";

const sensorData = [
  {
    sensorName: "Kitchen Area",
    timeUsage: "2 hours",
    statusLabel: "Active" as const,
  },
  {
    sensorName: "Guest Bathroom",
    timeUsage: "5 hours",
    statusLabel: "Possible Leakage" as const,
  },
  {
    sensorName: "Living Room",
    timeUsage: "1 hour",
    statusLabel: "Inactive" as const,
  },
];

const Dashboard = () => {
  return (
    <View style={dashboardStyles.background}>
      {/* Header */}
      <View style={dashboardStyles.shadowWrapper}>
        <View style={dashboardStyles.header}>
          <View>
            <View style={dashboardStyles.pictureHolder}></View>
          </View>
          <View style={dashboardStyles.middlePart}>
            <Text style={dashboardStyles.appName}>HydroPulse</Text>
            <Text style={dashboardStyles.appDescription}>
              Water Leakage Detection System
            </Text>
          </View>
          <View>
            <TouchableOpacity style={dashboardStyles.chevronButton}>
              <Feather name="chevrons-down" size={24} color="black" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {/* Body */}
      <Spacer height={12} />
      <View style={dashboardStyles.body}>
        {sensorData.map((sensor, index) => (
          <View key={index} style={{ marginBottom: 6 }}>
            <SensorCard
              sensorName={sensor.sensorName}
              timeUsage={sensor.timeUsage}
              statusLabel={sensor.statusLabel}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

export default Dashboard;
