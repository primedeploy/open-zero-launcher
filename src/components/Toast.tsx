import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { wp, hp, fp } from "../utils";

type ToastProps = {
  message: string;
  visible: boolean;
  onHide: () => void;
  duration?: number;
};

export const Toast = ({
  message,
  visible,
  onHide,
  duration = 2500,
}: ToastProps) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onHide();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onHide]);

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: hp(100),
    left: wp(24),
    right: wp(24),
    backgroundColor: "#333333",
    borderRadius: wp(8),
    paddingVertical: hp(14),
    paddingHorizontal: wp(20),
    alignItems: "center",
  },
  message: {
    color: "#FFFFFF",
    fontSize: fp(14),
    textAlign: "center",
  },
});
