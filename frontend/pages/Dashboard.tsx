import { View } from "react-native";
import { sensorData } from "@/data/sensorData";
// Styles
import { dashboardStyles } from "@/styles/dashboard.css";

// Components
import { SensorCard } from "@/components/Dashboard";
import UsageCard from "@/components/Dashboard/UsageCard";

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
        <UsageCard />
      </View>
    </View>
  );
};

export default Dashboard;
