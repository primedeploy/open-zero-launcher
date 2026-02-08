import React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { wp, hp, fp } from "../utils";

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
          <Ionicons name="home-outline" size={fp(48)} color="#FFFFFF" />
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
    padding: wp(24),
  },
  container: {
    backgroundColor: "#000000",
    borderRadius: wp(16),
    padding: wp(32),
    alignItems: "center",
    borderWidth: wp(1),
    borderColor: "#333333",
    width: "100%",
    maxWidth: wp(340),
  },
  title: {
    fontSize: fp(22),
    fontWeight: "600",
    color: "#FFFFFF",
    marginTop: hp(16),
    marginBottom: hp(12),
    textAlign: "center",
  },
  description: {
    fontSize: fp(15),
    color: "#AAAAAA",
    textAlign: "center",
    lineHeight: fp(22),
    marginBottom: hp(28),
  },
  buttonContainer: {
    width: "100%",
    gap: hp(12),
  },
  primaryButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: hp(14),
    paddingHorizontal: wp(24),
    borderRadius: wp(8),
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#000000",
    fontSize: fp(16),
    fontWeight: "600",
  },
  secondaryButton: {
    paddingVertical: hp(14),
    paddingHorizontal: wp(24),
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#888888",
    fontSize: fp(15),
  },
});
