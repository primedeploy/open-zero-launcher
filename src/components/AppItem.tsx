import React from "react";
import { TouchableOpacity, Text, StyleSheet, Image, View } from "react-native";
import { InstalledApp } from "../types";
import { wp, hp, fp } from "../utils";

type AppItemProps = {
  app: InstalledApp;
  onPress: (packageName: string) => void;
  showIcon?: boolean;
};

export const AppItem = ({ app, onPress, showIcon = false }: AppItemProps) => {
  function handlePress() {
    onPress(app.packageName);
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {showIcon && app.icon && (
        <Image
          source={{ uri: `data:image/png;base64,${app.icon}` }}
          style={styles.icon}
        />
      )}
      <Text style={styles.label} numberOfLines={1}>
        {app.label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(12),
    paddingHorizontal: wp(24),
  },
  icon: {
    width: wp(40),
    height: wp(40),
    marginRight: wp(16),
    borderRadius: wp(8),
  },
  label: {
    fontSize: fp(24),
    color: "#FFFFFF",
    fontWeight: "300",
  },
});
