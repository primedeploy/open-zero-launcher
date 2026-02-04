import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useClock, useWeather } from "../controllers";

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
    paddingHorizontal: 24,
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
    fontSize: 64,
    fontWeight: "300",
    color: "#FFFFFF",
    letterSpacing: -2,
  },
  period: {
    fontSize: 20,
    fontWeight: "300",
    color: "#FFFFFF",
    marginLeft: 8,
    marginBottom: 10,
  },
  temperature: {
    fontSize: 32,
    fontWeight: "300",
    color: "#FFFFFF",
    marginLeft: 16,
    marginBottom: 6,
  },
  date: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "400",
    marginTop: 4,
  },
});
