import React from "react";
import { View, Text, StyleSheet } from "react-native";

type NotificationBadgeProps = {
  count: number;
};

export const NotificationBadge = ({ count }: NotificationBadgeProps) => {
  if (count <= 0) return null;

  return <View style={styles.dot} />;
};

const styles = StyleSheet.create({
  dot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF3B30",
    borderWidth: 1,
    borderColor: "#000000",
  },
});
