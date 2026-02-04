import React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type DefaultLauncherModalProps = {
  visible: boolean;
  onSetDefault: () => void;
  onSkip: () => void;
};

export const DefaultLauncherModal = ({
  visible,
  onSetDefault,
  onSkip,
}: DefaultLauncherModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Ionicons name="home-outline" size={48} color="#FFFFFF" />
          <Text style={styles.title}>Set as Default Launcher</Text>
          <Text style={styles.description}>
            Open Zero Launcher works best as your default home app. Would you
            like to set it now?
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={onSetDefault}
              activeOpacity={0.7}
            >
              <Text style={styles.primaryButtonText}>Set as Default</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onSkip}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryButtonText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  container: {
    backgroundColor: "#000000",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333333",
    width: "100%",
    maxWidth: 340,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: "#FFFFFF",
    marginTop: 16,
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 15,
    color: "#AAAAAA",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#888888",
    fontSize: 15,
  },
});
