import { View } from "react-native";

// Styles
import { dashboardStyles } from "@/styles/dashboard.css";

// Components
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
      {/* Body */}
      <View style={dashboardStyles.body}>
        {/* Sensor Cards */}
        {sensorData.map((sensor, index) => (
          <View key={index}>
            <SensorCard
              sensorName={sensor.sensorName}
              timeUsage={sensor.timeUsage}
              statusLabel={sensor.statusLabel}
            />
          </View>
        ))}
        {/* Today's Current Usage */}
      </View>
    </View>
  );
};

export default Dashboard;
