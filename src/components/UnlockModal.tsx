import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { verifyAppLockPassword } from "../services";
import { wp, hp, fp } from "../utils";

type UnlockModalProps = {
  visible: boolean;
  appName: string;
  appIcon: string | null;
  onUnlock: () => void;
  onCancel: () => void;
};

export const UnlockModal = ({
  visible,
  appName,
  appIcon,
  onUnlock,
  onCancel,
}: UnlockModalProps) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  async function handleUnlock() {
    if (!password.trim()) {
      setError("Please enter password");
      return;
    }

    setIsVerifying(true);
    setError("");

    const isValid = await verifyAppLockPassword(password);

    setIsVerifying(false);

    if (isValid) {
      setPassword("");
      setError("");
      onUnlock();
    } else {
      setError("Incorrect password");
      setPassword("");
    }
  }

  function handleCancel() {
    setPassword("");
    setError("");
    onCancel();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Ionicons name="lock-closed" size={fp(32)} color="#FFFFFF" />
            <Text style={styles.title}>App Locked</Text>
          </View>

          <View style={styles.appInfo}>
            {appIcon && (
              <Image
                source={{ uri: `data:image/png;base64,${appIcon}` }}
                style={styles.appIcon}
              />
            )}
            <Text style={styles.appName} numberOfLines={1}>
              {appName}
            </Text>
          </View>

          <Text style={styles.label}>Enter password to unlock</Text>
          <TextInput
            style={[styles.input, inputFocused && styles.inputFocused]}
            placeholder="Password"
            placeholderTextColor="#666666"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setError("");
            }}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.unlockButton,
                isVerifying && styles.buttonDisabled,
              ]}
              onPress={handleUnlock}
              disabled={isVerifying}
            >
              <Text style={styles.unlockButtonText}>
                {isVerifying ? "Verifying..." : "Unlock"}
              </Text>
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
    backgroundColor: "#1A1A1A",
    borderRadius: wp(16),
    padding: wp(24),
    width: "100%",
    maxWidth: wp(320),
  },
  header: {
    alignItems: "center",
    marginBottom: hp(20),
  },
  title: {
    fontSize: fp(20),
    fontWeight: "600",
    color: "#FFFFFF",
    marginTop: hp(12),
  },
  appInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000000",
    borderRadius: wp(8),
    padding: wp(12),
    marginBottom: hp(20),
  },
  appIcon: {
    width: wp(40),
    height: wp(40),
    borderRadius: wp(8),
    marginRight: wp(12),
  },
  appName: {
    fontSize: fp(16),
    color: "#FFFFFF",
    flex: 1,
  },
  label: {
    fontSize: fp(14),
    color: "#888888",
    marginBottom: hp(8),
  },
  input: {
    backgroundColor: "#000000",
    borderRadius: wp(8),
    paddingHorizontal: wp(16),
    paddingVertical: hp(14),
    fontSize: fp(16),
    color: "#FFFFFF",
    marginBottom: hp(8),
  },
  inputFocused: {
    borderColor: "#ccc",
    borderWidth: wp(1),
  },
  errorText: {
    fontSize: fp(14),
    color: "#FF4444",
    marginBottom: hp(8),
  },
  buttons: {
    flexDirection: "row",
    marginTop: hp(16),
    gap: wp(12),
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#333333",
    borderRadius: wp(8),
    paddingVertical: hp(14),
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: fp(16),
    fontWeight: "600",
    color: "#FFFFFF",
  },
  unlockButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: wp(8),
    paddingVertical: hp(14),
    alignItems: "center",
  },
  unlockButtonText: {
    fontSize: fp(16),
    fontWeight: "600",
    color: "#000000",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
