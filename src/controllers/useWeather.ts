import { useState, useEffect } from "react";
import * as Location from "expo-location";
import { fetchWeather } from "../services/weatherService";

type WeatherState = {
  temperature: number | null;
  isLoading: boolean;
};

export function useWeather(): WeatherState {
  const [temperature, setTemperature] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function getWeather() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          setIsLoading(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Low,
        });

        const temp = await fetchWeather(
          location.coords.latitude,
          location.coords.longitude,
        );

        if (isMounted) {
          setTemperature(temp);
          setIsLoading(false);
        }
      } catch {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    getWeather();

    const interval = setInterval(getWeather, 30 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return { temperature, isLoading };
}
