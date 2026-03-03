import { Text, View, useWindowDimensions } from "react-native";
import { activitylogStyles as styles } from "@/styles/activityLog.css";
import React from "react";
import { sensorActivityLogData } from "@/data/activityLog";

const ActivityLogs = () => {
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 1080;
  return (
    <View style={styles.container}>
      <View style={styles.logContainer}>
        {sensorActivityLogData.map((log, index) => (
          <View
            style={[
              styles.logRow,
              index < sensorActivityLogData.length - 1 && {
                borderBottomWidth: 1,
                borderBottomColor: "#ccc",
              },
            ]}
            key={index}
          >
            <View>
              <Text
                style={[
                  styles.sensorName,
                  { fontSize: isLargeScreen ? 18 : 12 },
                ]}
              >
                {log.sensorName}
              </Text>
              <Text
                style={[
                  styles.timeStamp,
                  { fontSize: isLargeScreen ? 18 : 12 },
                ]}
              >
                {log.timeStamp}
              </Text>
            </View>
            <View>
              <Text
                style={[
                  styles.timeUsage,
                  { fontSize: isLargeScreen ? 18 : 12 },
                ]}
              >
                Usage Duration: {log.timeUsage}
              </Text>
              <Text
                style={[
                  styles.estimatedVolume,
                  { fontSize: isLargeScreen ? 18 : 12 },
                ]}
              >
                Est. Volume: {log.estimatedVolume}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default ActivityLogs;
