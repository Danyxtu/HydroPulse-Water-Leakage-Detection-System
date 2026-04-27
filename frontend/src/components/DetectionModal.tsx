import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  Easing,
} from "react-native";
import {
  X,
  AlertTriangle,
  Droplets,
  CheckCircle2,
  Check,
  CircleAlert,
  Cpu,
} from "lucide-react-native";
import { styles } from "../styles/DetectionModal.styles";
import { COLORS } from "../constants/themes";
import { mockZoneData } from "../data/mockZoneData";
import { useMqtt } from "../hooks/useMqtt";
import { MqttStatusMessage } from "../types/index";

interface DetectionModalProps {
  visible: boolean;
  onClose: () => void;
}

const DetectionModal: React.FC<DetectionModalProps> = ({
  visible,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedZones, setSelectedZones] = useState<string[]>(
    mockZoneData.map((z) => z.id),
  );

  // Step 4 state
  const [activeZoneId, setActiveZoneId] = useState<string | null>(null);
  const [zoneResults, setZoneResults] = useState<
    Record<string, "leak" | "normal">
  >({});

  // Dynamic topic based on active selection
  const topic = activeZoneId
    ? `hydropulse/zones/${activeZoneId}/telemetry`
    : "telemetry";
  const { latestData } = useMqtt<MqttStatusMessage>(topic);

  // Animation for glowing effect
  const glowAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (currentStep === 4) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1.4,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      glowAnim.setValue(1);
    }
  }, [currentStep, glowAnim]);

  // Update results when telemetry arrives for active zone
  useEffect(() => {
    if (currentStep === 4 && activeZoneId && latestData) {
      // Check if this data belongs to the active zone (some brokers might send old messages)
      const isLeak = latestData.flowRate > 0;
      setZoneResults((prev) => ({
        ...prev,
        [activeZoneId]: isLeak ? "leak" : "normal",
      }));
    }
  }, [latestData, activeZoneId, currentStep]);

  const toggleZone = (id: string) => {
    setSelectedZones((prev) =>
      prev.includes(id) ? prev.filter((zid) => zid !== id) : [...prev, id],
    );
  };

  const handleNext = () => {
    if (currentStep < 4) {
      if (currentStep === 2) {
        setCurrentStep(3);
        setTimeout(() => {
          setCurrentStep(4);
        }, 3000);
      } else {
        setCurrentStep(currentStep + 1);
      }
    } else {
      onClose();
      setTimeout(() => {
        setCurrentStep(1);
        setActiveZoneId(null);
        setZoneResults({});
      }, 300);
    }
  };

  const handleBack = () => {
    if (currentStep > 1 && currentStep !== 3) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4].map((step) => (
        <View
          key={step}
          style={[styles.stepDot, currentStep === step && styles.stepDotActive]}
        />
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View>
      <Text style={styles.sectionTitle}>Section Selection</Text>
      <Text style={styles.sectionSubtitle}>
        Choose the zones you want to include in the leak detection process.
      </Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        {mockZoneData.map((zone) => (
          <TouchableOpacity
            key={zone.id}
            style={styles.zoneItem}
            onPress={() => toggleZone(zone.id)}
          >
            <View
              style={[
                styles.checkbox,
                selectedZones.includes(zone.id) && styles.checkboxChecked,
              ]}
            >
              {selectedZones.includes(zone.id) && (
                <Check size={14} color={COLORS.white} />
              )}
            </View>
            <Text style={styles.zoneName}>Zone {zone.id}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text style={styles.sectionTitle}>Safety Precautions</Text>
      <Text style={styles.sectionSubtitle}>
        Please perform these manual steps before starting the detection.
      </Text>
      <View style={styles.cautionContainer}>
        <View style={styles.cautionItem}>
          <AlertTriangle size={20} color="#F59E0B" style={styles.cautionIcon} />
          <Text style={styles.cautionText}>
            1. Close all faucets, taps, and showers throughout the entire
            premises.
          </Text>
        </View>
        <View style={styles.cautionItem}>
          <AlertTriangle size={20} color="#F59E0B" style={styles.cautionIcon} />
          <Text style={styles.cautionText}>
            2. Ensure all water-consuming appliances (washing machines,
            dishwashers) are turned off.
          </Text>
        </View>
        <View style={styles.cautionItem}>
          <AlertTriangle size={20} color="#F59E0B" style={styles.cautionIcon} />
          <Text style={styles.cautionText}>
            3. Refrain from flushing toilets or using any plumbing fixtures
            until the process is complete.
          </Text>
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.loadingText}>Running Leak Detection...</Text>
      <Text style={styles.loadingSubtext}>
        Analyzing flow rates across selected zones. This will take a few
        seconds.
      </Text>
    </View>
  );

  const renderZoneNode = (id: string, top: string, left: string) => {
    const result = zoneResults[id];
    const isSelected = activeZoneId === id;

    let nodeStyle = [styles.areaNode];
    if (result === "leak") nodeStyle.push(styles.areaNodeLeak);
    else if (result === "normal") nodeStyle.push(styles.areaNodeNormal);
    if (isSelected) nodeStyle.push(styles.areaNodeSelected);

    return (
      <View style={{ position: "absolute", top, left, alignItems: "center" }}>
        {result === "leak" && (
          <Animated.View
            style={[
              styles.glowingContainer,
              { transform: [{ scale: glowAnim }] },
            ]}
          />
        )}
        {result === "normal" && isSelected && (
          <Animated.View
            style={[
              styles.glowingContainerGreen,
              { transform: [{ scale: glowAnim }] },
            ]}
          />
        )}
        <TouchableOpacity style={nodeStyle} onPress={() => setActiveZoneId(id)}>
          <Droplets size={20} color={result ? COLORS.white : COLORS.textDark} />
        </TouchableOpacity>
        <Text
          style={[
            styles.zoneName,
            { marginTop: 4, fontSize: 11, fontWeight: "600" },
          ]}
        >
          Zone {id}
        </Text>
      </View>
    );
  };

  const renderStep4 = () => {
    const activeResult = activeZoneId ? zoneResults[activeZoneId] : null;

    return (
      <View style={styles.summaryContainer}>
        <Text style={styles.sectionTitle}>Detection Summary</Text>
        <Text style={styles.sectionSubtitle}>
          Click on a zone to subscribe and inspect its status.
        </Text>

        <View style={styles.visualizationBox}>
          {/* Path Lines from Prototype to Zones */}
          <View
            style={[
              styles.pathLine,
              {
                width: 80,
                height: 2,
                top: "40%",
                left: "25%",
                transform: [{ rotate: "-30deg" }],
              },
            ]}
          />
          <View
            style={[
              styles.pathLine,
              { width: 80, height: 2, top: "50%", left: "30%" },
            ]}
          />
          <View
            style={[
              styles.pathLine,
              {
                width: 80,
                height: 2,
                top: "60%",
                left: "25%",
                transform: [{ rotate: "30deg" }],
              },
            ]}
          />

          {/* Prototype Node */}
          <View
            style={{
              position: "absolute",
              left: "15%",
              top: "40%",
              alignItems: "center",
            }}
          >
            <View style={[styles.areaNode, styles.areaNodeMain]}>
              <Cpu size={32} color={COLORS.white} />
            </View>
            <Text
              style={[styles.zoneName, { marginTop: 8, fontWeight: "bold" }]}
            >
              Prototype
            </Text>
          </View>

          {/* Zone Nodes */}
          {renderZoneNode("1", "20%", "65%")}
          {renderZoneNode("2", "42%", "70%")}
          {renderZoneNode("3", "65%", "65%")}
        </View>

        <View
          style={[
            styles.statusCard,
            activeResult === "leak"
              ? styles.statusCardLeak
              : activeResult === "normal"
                ? styles.statusCardNormal
                : styles.statusCardEmpty,
          ]}
        >
          {activeResult === "leak" ? (
            <CircleAlert size={24} color="#B91C1C" />
          ) : activeResult === "normal" ? (
            <CheckCircle2 size={24} color="#059669" />
          ) : (
            <ActivityIndicator size={24} color={COLORS.textGray} />
          )}
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.statusTitle,
                {
                  color:
                    activeResult === "leak"
                      ? "#B91C1C"
                      : activeResult === "normal"
                        ? "#059669"
                        : COLORS.textDark,
                },
              ]}
            >
              {!activeZoneId
                ? "Select a Zone"
                : activeResult === "leak"
                  ? "Leakage Detected"
                  : activeResult === "normal"
                    ? "System Healthy"
                    : "Inspecting..."}
            </Text>
            <Text
              style={[
                styles.statusDesc,
                {
                  color:
                    activeResult === "leak"
                      ? "#991B1B"
                      : activeResult === "normal"
                        ? "#065F46"
                        : "#6B7280",
                },
              ]}
            >
              {!activeZoneId
                ? "Tap a zone circle to start inspection."
                : activeResult === "leak"
                  ? `Abnormal flow of ${latestData?.flowRate || "?"} L/min detected in Zone ${activeZoneId}.`
                  : activeResult === "normal"
                    ? `No abnormal flow rates detected in Zone ${activeZoneId}.`
                    : `Waiting for telemetry from Zone ${activeZoneId}...`}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const getButtonText = () => {
    if (currentStep === 1) return "Continue";
    if (currentStep === 2) return "Start Detection";
    if (currentStep === 4) return "Finish";
    return "";
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <Text style={styles.title}>Leak Detection</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={COLORS.textDark} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {renderStepIndicator()}
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </View>

          {currentStep !== 3 && (
            <View style={styles.footer}>
              {currentStep > 1 && currentStep !== 4 && (
                <TouchableOpacity
                  style={[styles.button, styles.buttonSecondary]}
                  onPress={handleBack}
                >
                  <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
                    Back
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary]}
                onPress={handleNext}
                disabled={currentStep === 1 && selectedZones.length === 0}
              >
                <Text style={[styles.buttonText, styles.buttonTextPrimary]}>
                  {getButtonText()}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default DetectionModal;
