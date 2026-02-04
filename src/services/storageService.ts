import AsyncStorage from "@react-native-async-storage/async-storage";

const FIRST_LAUNCH_KEY = "@open_fast_launcher:first_launch_complete";

export async function checkFirstLaunch(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(FIRST_LAUNCH_KEY);
    return value !== "true";
  } catch {
    return true;
  }
}

export async function setFirstLaunchComplete(): Promise<void> {
  try {
    await AsyncStorage.setItem(FIRST_LAUNCH_KEY, "true");
  } catch {}
}
