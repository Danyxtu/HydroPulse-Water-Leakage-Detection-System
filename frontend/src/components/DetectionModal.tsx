import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { XCircle, Smartphone, Check, AlertCircle } from "lucide-react-native";
import { useDetection } from "../hooks/useDetection";
import { styles } from "../styles/DetectionModal.styles";

import { mqttService } from "../services/mqttService";

interface DetectionModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function DetectionModal({
  visible,
  onClose,
}: DetectionModalProps) {
  // Use custom hook for detection logic
  const { step, goToStep, resetDetection } = useDetection();

  // Reset modal state when closed
  const handleClose = () => {
    resetDetection();
    onClose();
  };

  // --- Reusable UI Elements ---
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

  // --- Frame 1: Info ---
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

  // --- Frame 2: Checklist ---
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

  // --- Frame 3: Detecting ---
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

  // --- Frame 4: Results ---
  const renderStep4 = () => (
    <View style={styles.innerContainer}>
      <Text style={[styles.titleText, { color: "#EF4444", fontSize: 18 }]}>
        1 Possible Leakage is detected!
      </Text>

      <View style={styles.zonesList}>
        {renderZoneRow("Kitchen Area", "leak")}
        {renderZoneRow("Guest Bathroom", "clear")}
        {renderZoneRow("Master's Bathroom", "clear")}
      </View>

      <Text style={styles.warningText}>
        Upon exiting, immediately check the passageway of the area that is
        detected for possible water leakage to avoid any issues or damage.
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
          {/* Close Button Top Right */}
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <XCircle size={32} color="#000" strokeWidth={1.5} />
          </TouchableOpacity>

          {/* Dynamic Content based on Step */}
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </View>
      </View>
    </Modal>
  );
}
