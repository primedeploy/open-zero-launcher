import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useClock, useWeather } from "../controllers";
import { wp, hp, fp } from "../utils";

export const Clock = () => {
  const { formattedTime, formattedPeriod, formattedDate } = useClock();
  const { temperature } = useWeather();

  return (
    <View style={styles.container}>
      <View style={styles.timeRow}>
        <View style={styles.timeContainer}>
          <Text style={styles.time}>{formattedTime}</Text>
          <Text style={styles.period}>{formattedPeriod}</Text>
        </View>
        {temperature !== null && (
          <Text style={styles.temperature}>{temperature}°</Text>
        )}
      </View>
      <Text style={styles.date}>{formattedDate}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-start",
    paddingHorizontal: wp(24),
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  time: {
    fontSize: fp(64),
    fontWeight: "300",
    color: "#FFFFFF",
    letterSpacing: wp(-2),
  },
  period: {
    fontSize: fp(20),
    fontWeight: "300",
    color: "#FFFFFF",
    marginLeft: wp(8),
    marginBottom: hp(10),
  },
  temperature: {
    fontSize: fp(32),
    fontWeight: "300",
    color: "#FFFFFF",
    marginLeft: wp(16),
    marginBottom: hp(6),
  },
  date: {
    fontSize: fp(18),
    color: "#FFFFFF",
    fontWeight: "400",
    marginTop: hp(4),
  },
});
