import React from "react";
import { View, StyleSheet } from "react-native";
import { wp } from "../utils";

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
    bottom: wp(2),
    right: wp(2),
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    backgroundColor: "#FF3B30",
    borderWidth: wp(1),
    borderColor: "#000000",
  },
});
