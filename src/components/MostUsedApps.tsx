import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Image } from "react-native";
import { InstalledApp, AppShortcut } from "../types";
import { AppContextMenu } from "./AppContextMenu";
import { NotificationBadge } from "./NotificationBadge";
import { getAppShortcuts, launchShortcut } from "../services";

type MostUsedAppsProps = {
  apps: InstalledApp[];
  onAppPress: (packageName: string) => void;
  onRemoveFromFavorites: (packageName: string) => void;
  onOpenAppInfo: (packageName: string) => void;
  onUninstallApp: (packageName: string) => void;
  onHideApp: (packageName: string) => void;
  getNotificationCount: (packageName: string) => number;
};

export const MostUsedApps = ({
  apps,
  onAppPress,
  onRemoveFromFavorites,
  onOpenAppInfo,
  onUninstallApp,
  onHideApp,
  getNotificationCount,
}: MostUsedAppsProps) => {
  const [selectedApp, setSelectedApp] = useState<InstalledApp | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [shortcuts, setShortcuts] = useState<AppShortcut[]>([]);

  async function handleLongPress(app: InstalledApp) {
    setSelectedApp(app);
    setMenuVisible(true);
    try {
      const appShortcuts = await getAppShortcuts(app.packageName);
      setShortcuts(appShortcuts);
    } catch {
      setShortcuts([]);
    }
  }

  function handleCloseMenu() {
    setMenuVisible(false);
    setSelectedApp(null);
    setShortcuts([]);
  }

  async function handleShortcutPress(shortcut: AppShortcut) {
    try {
      await launchShortcut(shortcut.packageName, shortcut.id);
    } catch {}
  }

  const menuOptions = selectedApp
    ? [
        {
          label: "Remove from favorites",
          icon: "star-outline" as const,
          onPress: () => onRemoveFromFavorites(selectedApp.packageName),
        },
        {
          label: "Hide",
          icon: "eye-off-outline" as const,
          onPress: () => onHideApp(selectedApp.packageName),
        },
        {
          label: "App info",
          icon: "information-circle-outline" as const,
          onPress: () => onOpenAppInfo(selectedApp.packageName),
        },
        ...(!selectedApp.isSystemApp
          ? [
              {
                label: "Uninstall",
                icon: "trash-outline" as const,
                onPress: () => onUninstallApp(selectedApp.packageName),
                destructive: true,
              },
            ]
          : []),
      ]
    : [];

  return (
    <View style={styles.container}>
      {apps.map((app) => (
        <TouchableOpacity
          key={app.packageName}
          style={styles.appItem}
          onPress={() => onAppPress(app.packageName)}
          onLongPress={() => handleLongPress(app)}
          activeOpacity={0.7}
          delayLongPress={400}
        >
          <View style={styles.iconContainer}>
            {app.icon && (
              <Image
                source={{ uri: `data:image/png;base64,${app.icon}` }}
                style={styles.icon}
              />
            )}
            <NotificationBadge count={getNotificationCount(app.packageName)} />
          </View>
          <Text style={styles.label} numberOfLines={1}>
            {app.label}
          </Text>
        </TouchableOpacity>
      ))}
      <AppContextMenu
        visible={menuVisible}
        onClose={handleCloseMenu}
        options={menuOptions}
        appName={selectedApp?.label ?? ""}
        shortcuts={shortcuts}
        onShortcutPress={handleShortcutPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 32,
  },
  appItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  iconContainer: {
    position: "relative",
    marginRight: 16,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  label: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "300",
  },
});
