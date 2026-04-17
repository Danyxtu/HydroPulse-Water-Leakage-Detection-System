import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Easing,
  StyleSheet,
} from "react-native";
import { XCircle, Smartphone, Check, AlertCircle } from "lucide-react-native";
import { useDetection } from "@hooks/useDetection";
import { styles } from "@styles/DetectionModal.styles";
import { mqttService } from "@services/mqttService";

interface DetectionModalProps {
  visible: boolean;
  onClose: () => void;
}

// ─────────────────────────────────────────────
//  Pipeline Diagram
//  Layout:
//    [      PROTOTYPE BOX      ]   y=20..70
//         |         |        |      stems from box bottom
//    hose1       hose2    hose3     y=70..160
//    [Area1]   [Area2]  [Area3]    y=160..185
// ─────────────────────────────────────────────
function PipelineDiagram({ leakOutlet = 1 }: { leakOutlet?: 1 | 2 | 3 }) {
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const blinkLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 0.25,
          duration: 520,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 520,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 900,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    blinkLoop.start();
    pulseLoop.start();

    return () => {
      blinkLoop.stop();
      pulseLoop.stop();
    };
  }, [blinkAnim, pulseAnim]);

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });
  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.15, 0.45],
  });

  const areas = [
    { id: 1 as const, area: "Area 1", zone: "Kitchen" },
    { id: 2 as const, area: "Area 2", zone: "Guest Bath" },
    { id: 3 as const, area: "Area 3", zone: "Master Bath" },
  ];

  return (
    <View style={pipelineStyles.card}>
      <View style={pipelineStyles.backdropPattern} />

      <View style={pipelineStyles.prototypeWrap}>
        <View style={pipelineStyles.prototypeBox}>
          <Text style={pipelineStyles.prototypeTitle}>Prototype</Text>
          <Text style={pipelineStyles.prototypeSubtitle}>HydroPulse Unit</Text>
        </View>
      </View>

      <View style={pipelineStyles.mainHose} />

      <View style={pipelineStyles.splitterWrap}>
        <View style={pipelineStyles.splitterBar} />
      </View>

      <View style={pipelineStyles.areasRow}>
        {areas.map((item) => {
          const isLeak = leakOutlet === item.id;

          return (
            <View key={item.id} style={pipelineStyles.branchCol}>
              <View
                style={[
                  pipelineStyles.branchNode,
                  isLeak && pipelineStyles.branchNodeLeak,
                ]}
              />

              {isLeak ? (
                <Animated.View
                  style={[
                    pipelineStyles.branchHose,
                    pipelineStyles.branchHoseLeak,
                    { opacity: blinkAnim },
                  ]}
                />
              ) : (
                <View style={pipelineStyles.branchHose} />
              )}

              <Animated.View
                style={[
                  pipelineStyles.areaCard,
                  isLeak
                    ? pipelineStyles.areaCardLeak
                    : pipelineStyles.areaCardClear,
                  isLeak && { opacity: blinkAnim },
                ]}
              >
                {isLeak && (
                  <Animated.View
                    style={[
                      pipelineStyles.areaGlow,
                      {
                        opacity: pulseOpacity,
                        transform: [{ scale: pulseScale }],
                      },
                    ]}
                  />
                )}

                <Text
                  style={[
                    pipelineStyles.areaText,
                    isLeak
                      ? pipelineStyles.areaTextLeak
                      : pipelineStyles.areaTextClear,
                  ]}
                >
                  {item.area}
                </Text>
                <Text
                  style={[
                    pipelineStyles.zoneText,
                    isLeak
                      ? pipelineStyles.zoneTextLeak
                      : pipelineStyles.zoneTextClear,
                  ]}
                >
                  {item.zone}
                </Text>

                <View
                  style={[
                    pipelineStyles.badge,
                    isLeak
                      ? pipelineStyles.badgeLeak
                      : pipelineStyles.badgeClear,
                  ]}
                >
                  <Text
                    style={[
                      pipelineStyles.badgeText,
                      isLeak
                        ? pipelineStyles.badgeTextLeak
                        : pipelineStyles.badgeTextClear,
                    ]}
                  >
                    {isLeak ? "Leak Detected" : "Normal"}
                  </Text>
                </View>
              </Animated.View>
            </View>
          );
        })}
      </View>

      <View style={pipelineStyles.legendRow}>
        <View style={pipelineStyles.legendItem}>
          <View
            style={[pipelineStyles.legendDot, { backgroundColor: "#E24B4A" }]}
          />
          <Text style={pipelineStyles.legendText}>Active leak path</Text>
        </View>
        <View style={pipelineStyles.legendItem}>
          <View
            style={[pipelineStyles.legendDot, { backgroundColor: "#34D399" }]}
          />
          <Text style={pipelineStyles.legendText}>Clear path</Text>
        </View>
      </View>
    </View>
  );
}

const pipelineStyles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 10,
    marginBottom: 14,
    overflow: "hidden",
  },
  backdropPattern: {
    position: "absolute",
    top: 0,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#DBEAFE",
    opacity: 0.35,
  },
  prototypeWrap: {
    alignItems: "center",
    marginBottom: 8,
  },
  prototypeBox: {
    minWidth: 190,
    backgroundColor: "#EFF6FF",
    borderColor: "#93C5FD",
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  prototypeTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1D4ED8",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  prototypeSubtitle: {
    marginTop: 2,
    fontSize: 10,
    color: "#60A5FA",
    fontWeight: "600",
  },
  mainHose: {
    alignSelf: "center",
    width: 8,
    height: 24,
    borderRadius: 4,
    backgroundColor: "#64748B",
    marginBottom: 2,
  },
  splitterWrap: {
    alignItems: "center",
    marginBottom: 4,
  },
  splitterBar: {
    width: "88%",
    height: 8,
    borderRadius: 4,
    backgroundColor: "#64748B",
  },
  areasRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 2,
  },
  branchCol: {
    flex: 1,
    alignItems: "center",
  },
  branchNode: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#9CA3AF",
  },
  branchNodeLeak: {
    backgroundColor: "#E24B4A",
  },
  branchHose: {
    width: 7,
    height: 46,
    borderRadius: 4,
    backgroundColor: "#34D399",
    marginTop: 2,
    marginBottom: 4,
  },
  branchHoseLeak: {
    backgroundColor: "#E24B4A",
    shadowColor: "#DC2626",
    shadowOpacity: 0.35,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  areaCard: {
    width: "100%",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderWidth: 1.2,
    alignItems: "center",
    overflow: "hidden",
    minHeight: 82,
  },
  areaCardLeak: {
    backgroundColor: "#FEE2E2",
    borderColor: "#FCA5A5",
  },
  areaCardClear: {
    backgroundColor: "#ECFDF5",
    borderColor: "#86EFAC",
  },
  areaGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#DC2626",
  },
  areaText: {
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 2,
    zIndex: 1,
  },
  areaTextLeak: {
    color: "#991B1B",
  },
  areaTextClear: {
    color: "#047857",
  },
  zoneText: {
    fontSize: 10,
    marginBottom: 6,
    zIndex: 1,
  },
  zoneTextLeak: {
    color: "#B91C1C",
    fontWeight: "600",
  },
  zoneTextClear: {
    color: "#059669",
    fontWeight: "500",
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    zIndex: 1,
  },
  badgeLeak: {
    backgroundColor: "#FECACA",
  },
  badgeClear: {
    backgroundColor: "#D1FAE5",
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "700",
  },
  badgeTextLeak: {
    color: "#B91C1C",
  },
  badgeTextClear: {
    color: "#047857",
  },
  legendRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
    flexWrap: "wrap",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    color: "#475569",
    fontWeight: "600",
  },
});
function ZoneRow4({
  name,
  outlet,
  status,
}: {
  name: string;
  outlet: string;
  status: "leak" | "clear";
}) {
  const blinkAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (status === "leak") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(blinkAnim, {
            toValue: 0.3,
            duration: 520,
            useNativeDriver: true,
          }),
          Animated.timing(blinkAnim, {
            toValue: 1,
            duration: 520,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [status]);

  const isLeak = status === "leak";

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: isLeak ? "#FEF2F2" : "#F9FAFB",
        borderRadius: 10,
        padding: 12,
        marginBottom: 8,
        borderWidth: isLeak ? 1 : 0.5,
        borderColor: isLeak ? "#FECACA" : "#E5E7EB",
      }}
    >
      <View>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: isLeak ? "#B91C1C" : "#111827",
          }}
        >
          {name}
        </Text>
        <Text style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>
          {outlet}
        </Text>
      </View>

      {isLeak ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#FEE2E2",
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 20,
            gap: 5,
          }}
        >
          <Animated.View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: "#E24B4A",
              opacity: blinkAnim,
            }}
          />
          <Text style={{ fontSize: 11, fontWeight: "500", color: "#B91C1C" }}>
            Leak detected
          </Text>
        </View>
      ) : (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#D1FAE5",
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 20,
            gap: 5,
          }}
        >
          <Check size={10} color="#059669" />
          <Text style={{ fontSize: 11, fontWeight: "500", color: "#059669" }}>
            Clear
          </Text>
        </View>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────
//  Main Modal
// ─────────────────────────────────────────────
export default function DetectionModal({
  visible,
  onClose,
}: DetectionModalProps) {
  const { step, goToStep, resetDetection } = useDetection();
  const [detectedLeakOutlet] = useState<1 | 2 | 3>(1);
  const detectedLeakAreaName =
    detectedLeakOutlet === 1
      ? "Kitchen Area"
      : detectedLeakOutlet === 2
        ? "Guest Bathroom"
        : "Master's Bathroom";

  const handleClose = () => {
    resetDetection();
    onClose();
  };

  const renderZoneRow = (
    name: string,
    status: "loading" | "leak" | "clear",
  ) => (
    <View style={styles.zoneRow} key={name}>
      <View>
        <Text style={styles.zoneName}>{name}</Text>
        <Text style={styles.zoneTime}>Est. Time left: XX mins</Text>
      </View>
      <View style={styles.statusIconContainer}>
        {status === "loading" && (
          <ActivityIndicator size="large" color="#67A1EB" />
        )}
        {status === "leak" && (
          <View style={[styles.iconCircle, { backgroundColor: "#B91C1C" }]}>
            <AlertCircle color="#FFFFFF" size={20} />
          </View>
        )}
        {status === "clear" && (
          <View style={[styles.iconCircle, { backgroundColor: "#22C55E" }]}>
            <Check color="#FFFFFF" size={20} />
          </View>
        )}
      </View>
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.innerContainer}>
      <View style={styles.iconWrapper}>
        <Smartphone size={24} color="#1A3B5C" />
      </View>
      <Text style={styles.titleText}>
        HydroPulse Water Leakage Detection System
      </Text>
      <Text style={styles.bodyText}>
        A dialog is a type of modal window that appears in front of app content
        to provide critical information, or prompt for a decision to be made.
      </Text>
      <View style={styles.buttonRowRight}>
        <TouchableOpacity style={styles.btnDisabled}>
          <Text style={styles.btnDisabledText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => goToStep(2)}>
          <Text style={styles.btnPurpleText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.innerContainer}>
      <View style={styles.iconWrapper}>
        <Smartphone size={24} color="#1A3B5C" />
      </View>
      <Text style={styles.titleText}>
        In preparation for scanning, please ensure the following:
      </Text>
      <View style={styles.listContainer}>
        <Text style={styles.listItem}>1. Ensure all faucets are close.</Text>
        <Text style={styles.listItem}>2. XXXXXXXXXXXXXXXXXXXXXX.</Text>
        <Text style={styles.listItem}>3. XXXXXXXXXXXXXXXXXXXXXX.</Text>
        <Text style={styles.listItem}>4. XXXXXXXXXX.</Text>
        <Text style={styles.listItem}>5. XXXXXXXXXXXXXXX.</Text>
      </View>
      <View style={styles.buttonRowRight}>
        <TouchableOpacity
          onPress={() => {
            mqttService.sendCommand("START_SCAN");
            goToStep(3);
          }}
        >
          <Text style={styles.btnBlueText}>Start Detection</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.innerContainer}>
      <Text style={[styles.titleText, { color: "#67A1EB", fontSize: 22 }]}>
        Detecting...
      </Text>
      <View style={styles.zonesList}>
        {renderZoneRow("Kitchen Area", "loading")}
        {renderZoneRow("Guest Bathroom", "loading")}
        {renderZoneRow("Master's Bathroom", "loading")}
      </View>
      <View style={styles.btnDisabledWideContainer}>
        <View style={styles.btnDisabledWide}>
          <Text style={styles.btnDisabledWideText}>
            Detection in process...
          </Text>
        </View>
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.innerContainer}>
      <Text style={[styles.titleText, { color: "#EF4444", fontSize: 18 }]}>
        1 Possible Leakage is detected!
      </Text>
      <Text
        style={{
          fontSize: 12,
          color: "#9CA3AF",
          textAlign: "center",
          marginBottom: 12,
          marginTop: -8,
        }}
      >
        See highlighted pipeline below
      </Text>

      {/* Pipeline diagram — set detectedLeakOutlet to 1, 2, or 3 */}
      <PipelineDiagram leakOutlet={detectedLeakOutlet} />

      <ZoneRow4
        name="Kitchen Area"
        outlet="Outlet 1 · Main pipeline"
        status={detectedLeakOutlet === 1 ? "leak" : "clear"}
      />
      <ZoneRow4
        name="Guest Bathroom"
        outlet="Outlet 2 · Main pipeline"
        status={detectedLeakOutlet === 2 ? "leak" : "clear"}
      />
      <ZoneRow4
        name="Master's Bathroom"
        outlet="Outlet 3 · Main pipeline"
        status={detectedLeakOutlet === 3 ? "leak" : "clear"}
      />

      <Text style={styles.warningText}>
        Upon exiting, immediately check the passageway of the{" "}
        {detectedLeakAreaName}
        for possible water leakage to avoid any issues or damage.
      </Text>

      <View style={styles.buttonRowSpaced}>
        <TouchableOpacity style={styles.btnGreenWide} onPress={handleClose}>
          <Text style={styles.btnGreenText}>Detection Complete</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleClose}
          style={{ justifyContent: "center", paddingHorizontal: 10 }}
        >
          <Text style={styles.btnPurpleText}>Exit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <XCircle size={32} color="#000" strokeWidth={1.5} />
          </TouchableOpacity>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </View>
      </View>
    </Modal>
  );
}
