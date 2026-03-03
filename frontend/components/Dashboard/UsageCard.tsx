import React from "react";
import { Text, View } from "react-native";
import { styles } from "@/styles/components/usageCard.css";

const UsageCard = () => {
  return (
    <View style={styles.card}>
      <View style={styles.infoColumn}>
        <Text style={styles.label}>Today's{"\n"}Current Usage</Text>

        <View style={styles.statsContainer}>
          {/* Mocking real data values */}
          <Text style={styles.statText}>Time: 12:45 PM</Text>
          <Text style={styles.statText}>Est. Volume: 1200L</Text>
        </View>
      </View>

      <View style={styles.chartColumn}>
        <View style={styles.chartPlaceholder}></View>
      </View>
    </View>
  );
};

export default UsageCard;
