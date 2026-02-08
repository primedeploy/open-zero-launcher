import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { wp, hp, fp } from "../utils";

type AboutScreenProps = {
  onBack: () => void;
};

export const AboutScreen = ({ onBack }: AboutScreenProps) => {
  const version = Constants.expoConfig?.version || "0.0.1";
  const buildNumber = Constants.expoConfig?.android?.versionCode || 1;

  function handleOpenWebsite() {
    Linking.openURL("https://primedeploy.com");
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={fp(28)} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>About</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.appName}>Open Zero Launcher</Text>
        <Text style={styles.version}>
          Version {version} (Build {buildNumber})
        </Text>

        <View style={styles.divider} />

        <Text style={styles.developedBy}>Developed by Prime Deploy</Text>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={handleOpenWebsite}
          activeOpacity={0.7}
        >
          <Ionicons name="globe-outline" size={fp(20)} color="#FFFFFF" />
          <Text style={styles.linkText}>primedeploy.com</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: hp(16),
    paddingHorizontal: wp(8),
    paddingBottom: hp(8),
  },
  backButton: {
    padding: wp(8),
  },
  title: {
    fontSize: fp(20),
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: wp(8),
  },
  content: {
    flex: 1,
    paddingHorizontal: wp(24),
    paddingTop: hp(40),
    alignItems: "center",
  },
  appName: {
    fontSize: fp(28),
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: hp(8),
  },
  version: {
    fontSize: fp(16),
    color: "#666666",
    marginBottom: hp(40),
  },
  divider: {
    width: wp(60),
    height: hp(1),
    backgroundColor: "#333333",
    marginBottom: hp(40),
  },
  developedBy: {
    fontSize: fp(18),
    color: "#FFFFFF",
    marginBottom: hp(16),
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    paddingVertical: hp(12),
    paddingHorizontal: wp(24),
    borderRadius: wp(8),
  },
  linkText: {
    fontSize: fp(16),
    color: "#FFFFFF",
    marginLeft: wp(8),
  },
});
