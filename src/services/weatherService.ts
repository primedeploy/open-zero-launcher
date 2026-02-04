type WeatherResponse = {
  current: {
    temperature_2m: number;
  };
};

export async function fetchWeather(
  latitude: number,
  longitude: number,
): Promise<number | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m`;
    const response = await fetch(url);

    if (!response.ok) {
      return null;
    }

    const data: WeatherResponse = await response.json();
    return Math.round(data.current.temperature_2m);
  } catch {
    return null;
  }
}
