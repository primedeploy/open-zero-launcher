import {
  NativeModules,
  NativeEventEmitter,
  Platform,
  Linking,
} from "react-native";
import { InstalledApp, AppShortcut } from "../types";

const { InstalledApps } = NativeModules;

export function getInstalledApps(): Promise<InstalledApp[]> {
  if (Platform.OS !== "android") {
    return Promise.resolve([]);
  }

  return InstalledApps.getInstalledApps();
}

export function launchApp(packageName: string): Promise<boolean> {
  if (Platform.OS !== "android") {
    return Promise.resolve(false);
  }

  return InstalledApps.launchApp(packageName);
}

export function openAppInfo(packageName: string): Promise<boolean> {
  if (Platform.OS !== "android") {
    return Promise.resolve(false);
  }

  return InstalledApps.openAppInfo(packageName);
}

export function uninstallApp(packageName: string): Promise<boolean> {
  if (Platform.OS !== "android") {
    return Promise.resolve(false);
  }

  return InstalledApps.uninstallApp(packageName);
}

export function getAppShortcuts(packageName: string): Promise<AppShortcut[]> {
  if (Platform.OS !== "android") {
    return Promise.resolve([]);
  }

  return InstalledApps.getAppShortcuts(packageName);
}

export function launchShortcut(
  packageName: string,
  shortcutId: string,
): Promise<boolean> {
  if (Platform.OS !== "android") {
    return Promise.resolve(false);
  }

  return InstalledApps.launchShortcut(packageName, shortcutId);
}

export function isDefaultLauncher(): Promise<boolean> {
  if (Platform.OS !== "android") {
    return Promise.resolve(false);
  }

  return InstalledApps.isDefaultLauncher();
}

export function openDefaultLauncherSettings(): Promise<boolean> {
  if (Platform.OS !== "android") {
    return Promise.resolve(false);
  }

  return InstalledApps.openDefaultLauncherSettings();
}
