import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { headerStyles } from "@/styles/header.css";
import Feather from "@expo/vector-icons/Feather";
import { useState } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

// for navigations
const navigations = [
  { name: "Dashboard", route: "#" },
  { name: "Settings", route: "#" },
  { name: "Activity Logs", route: "#" },
  { name: "Our Team", route: "#" },
];

const Header = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const expandedHeight = 400;
  const height = useSharedValue(150);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: height.value,
      overflow: "hidden",
      width: "100%",
    };
  });
  const handlePress = () => {
    if (isExpanded) {
      height.value = withSpring(150);
    } else {
      height.value = withSpring(expandedHeight);
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={headerStyles.shadowWrapper}>
      {/*  */}
      <Animated.View style={[headerStyles.header, animatedStyle]}>
        <View style={headerStyles.topPart}>
          <View>
            <View style={headerStyles.pictureHolder}></View>
          </View>
          <View style={headerStyles.middlePart}>
            <Text style={headerStyles.appName}>HydroPulse</Text>
            <Text style={headerStyles.appDescription}>
              Water Leakage Detection System
            </Text>
          </View>
          <View>
            <TouchableOpacity
              onPress={handlePress}
              style={headerStyles.chevronButton}
            >
              <Feather
                name={isExpanded ? "chevrons-up" : "chevrons-down"}
                size={24}
                color="black"
              />
            </TouchableOpacity>
          </View>
        </View>
        {/*  */}
        <View
          style={[
            { display: isExpanded ? "flex" : "none" },
            headerStyles.expandedHeader,
          ]}
        >
          {navigations.map((nav) => (
            <TouchableOpacity
              key={nav.name}
              style={{ padding: 12, width: "100%", paddingLeft: 36 }}
            >
              <Text
                style={{
                  fontSize: 18,
                  textAlign: "left",
                  display: isExpanded ? "flex" : "none",
                }}
              >
                {nav.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({});
