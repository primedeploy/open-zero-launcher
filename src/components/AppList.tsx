import React, { useCallback, useMemo, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { InstalledApp, AppShortcut } from "../types";
import { AppContextMenu } from "./AppContextMenu";
import { Toast } from "./Toast";
import { NotificationBadge } from "./NotificationBadge";
import { getAppShortcuts, launchShortcut } from "../services";
import { wp, hp, fp } from "../utils";

type AppListProps = {
  apps: InstalledApp[];
  allApps: InstalledApp[];
  favoriteApps: InstalledApp[];
  onAppPress: (packageName: string) => void;
  onBack: () => void;
  onAddToFavorites: (packageName: string) => void;
  onRemoveFromFavorites: (packageName: string) => void;
  onOpenAppInfo: (packageName: string) => void;
  onUninstallApp: (packageName: string) => void;
  onHideApp: (packageName: string) => void;
  onUnhideApp: (packageName: string) => void;
  isHidden: (packageName: string) => boolean;
  getNotificationCount: (packageName: string) => number;
  onOpenLockApps: () => void;
  onOpenAbout: () => void;
};

type SectionData = {
  type: "header" | "app" | "feature";
  letter?: string;
  app?: InstalledApp;
  featureId?: string;
  featureLabel?: string;
  featureIcon?: keyof typeof Ionicons.glyphMap;
};

export const AppList = ({
  apps,
  allApps,
  favoriteApps,
  onAppPress,
  onBack,
  onAddToFavorites,
  onRemoveFromFavorites,
  onOpenAppInfo,
  onUninstallApp,
  onHideApp,
  onUnhideApp,
  isHidden,
  getNotificationCount,
  onOpenLockApps,
  onOpenAbout,
}: AppListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApp, setSelectedApp] = useState<InstalledApp | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [shortcuts, setShortcuts] = useState<AppShortcut[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const flatListRef = useRef<FlatList<SectionData>>(null);

  function isFavorite(packageName: string): boolean {
    return favoriteApps.some((app) => app.packageName === packageName);
  }

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

  function handleFavoriteToggle() {
    if (!selectedApp) return;

    if (isFavorite(selectedApp.packageName)) {
      onRemoveFromFavorites(selectedApp.packageName);
    } else {
      if (favoriteApps.length >= 10) {
        setToastMessage("Maximum 10 favorites allowed");
        setToastVisible(true);
        return;
      }
      onAddToFavorites(selectedApp.packageName);
    }
  }

  function hideToast() {
    setToastVisible(false);
  }

  function handleHideToggle() {
    if (!selectedApp) return;

    if (isHidden(selectedApp.packageName)) {
      onUnhideApp(selectedApp.packageName);
    } else {
      onHideApp(selectedApp.packageName);
    }
  }

  const menuOptions = selectedApp
    ? [
        {
          label: isFavorite(selectedApp.packageName)
            ? "Remove from favorites"
            : "Add to favorites",
          icon: isFavorite(selectedApp.packageName)
            ? ("star" as const)
            : ("star-outline" as const),
          onPress: handleFavoriteToggle,
        },
        {
          label: isHidden(selectedApp.packageName) ? "Unhide" : "Hide",
          icon: isHidden(selectedApp.packageName)
            ? ("eye-outline" as const)
            : ("eye-off-outline" as const),
          onPress: handleHideToggle,
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

  const filteredApps = useMemo(() => {
    const isSearching = searchQuery.trim().length > 0;

    if (isSearching) {
      const query = searchQuery.toLowerCase();
      return allApps.filter((app) => app.label.toLowerCase().includes(query));
    }

    return apps;
  }, [apps, allApps, searchQuery]);

  const sectionedData = useMemo((): SectionData[] => {
    const sections: SectionData[] = [];
    let currentLetter = "";

    for (const app of filteredApps) {
      const firstLetter = app.label.charAt(0).toUpperCase();

      if (firstLetter !== currentLetter) {
        currentLetter = firstLetter;
        sections.push({ type: "header", letter: currentLetter });
      }

      sections.push({ type: "app", app });
    }

    sections.push({ type: "header", letter: "Features" });
    sections.push({
      type: "feature",
      featureId: "lock-apps",
      featureLabel: "Lock apps",
      featureIcon: "lock-closed-outline",
    });
    sections.push({
      type: "feature",
      featureId: "visit-repo",
      featureLabel: "Visit the repository",
      featureIcon: "logo-github",
    });
    sections.push({
      type: "feature",
      featureId: "about",
      featureLabel: "About",
      featureIcon: "information-circle-outline",
    });

    return sections;
  }, [filteredApps]);

  const availableLetters = useMemo(() => {
    const letters = new Set<string>();
    for (const app of filteredApps) {
      letters.add(app.label.charAt(0).toUpperCase());
    }
    return Array.from(letters).sort();
  }, [filteredApps]);

  const letterIndices = useMemo(() => {
    const indices: Record<string, number> = {};
    sectionedData.forEach((item, index) => {
      if (item.type === "header" && item.letter) {
        indices[item.letter] = index;
      }
    });
    return indices;
  }, [sectionedData]);

  function scrollToLetter(letter: string) {
    const index = letterIndices[letter];
    if (index !== undefined && flatListRef.current) {
      flatListRef.current.scrollToIndex({ index, animated: false });
    }
  }

  function handleFeaturePress(featureId: string) {
    if (featureId === "lock-apps") {
      onOpenLockApps();
    } else if (featureId === "visit-repo") {
      Linking.openURL("https://github.com/primedeploy/open-zero-launcher");
    } else if (featureId === "about") {
      onOpenAbout();
    }
  }

  const renderItem = useCallback(
    ({ item }: { item: SectionData }) => {
      if (item.type === "header") {
        return (
          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>{item.letter}</Text>
          </View>
        );
      }

      if (item.type === "feature" && item.featureId) {
        return (
          <TouchableOpacity
            style={styles.appItem}
            onPress={() => handleFeaturePress(item.featureId!)}
            activeOpacity={0.7}
          >
            <View style={styles.featureIconContainer}>
              <Ionicons
                name={item.featureIcon || "settings-outline"}
                size={fp(24)}
                color="#FFFFFF"
              />
            </View>
            <Text style={styles.appLabel} numberOfLines={1}>
              {item.featureLabel}
            </Text>
          </TouchableOpacity>
        );
      }

      if (item.app) {
        const app = item.app;
        const notificationCount = getNotificationCount(app.packageName);
        return (
          <TouchableOpacity
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
                  style={styles.appIcon}
                />
              )}
              <NotificationBadge count={notificationCount} />
            </View>
            <Text style={styles.appLabel} numberOfLines={1}>
              {app.label}
            </Text>
          </TouchableOpacity>
        );
      }

      return null;
    },
    [onAppPress, getNotificationCount],
  );

  const keyExtractor = useCallback((item: SectionData, index: number) => {
    if (item.type === "header") {
      return `header-${item.letter}`;
    }
    if (item.type === "feature") {
      return `feature-${item.featureId}`;
    }
    return item.app?.packageName || `item-${index}`;
  }, []);

  function getItemLayout(_: unknown, index: number) {
    const itemHeight = hp(56);
    return { length: itemHeight, offset: itemHeight * index, index };
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={fp(28)} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <TextInput
            style={[
              styles.searchInput,
              searchFocused && styles.searchInputFocused,
            ]}
            placeholder="Search apps..."
            placeholderTextColor="#666666"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>
      <View style={styles.contentContainer}>
        <FlatList
          ref={flatListRef}
          data={sectionedData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          initialNumToRender={20}
          maxToRenderPerBatch={15}
          windowSize={10}
          getItemLayout={getItemLayout}
          onScrollToIndexFailed={() => {}}
          style={styles.list}
          contentContainerStyle={styles.listContent}
        />
        <View style={styles.alphabetSidebar}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.alphabetContent}
          >
            {availableLetters.map((letter) => (
              <TouchableOpacity
                key={letter}
                onPress={() => scrollToLetter(letter)}
                style={styles.letterButton}
              >
                <Text style={styles.letterText}>{letter}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
      <AppContextMenu
        visible={menuVisible}
        onClose={handleCloseMenu}
        options={menuOptions}
        appName={selectedApp?.label ?? ""}
        shortcuts={shortcuts}
        onShortcutPress={handleShortcutPress}
      />
      <Toast message={toastMessage} visible={toastVisible} onHide={hideToast} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(8),
    paddingTop: hp(8),
    paddingBottom: hp(8),
  },
  backButton: {
    padding: wp(8),
  },
  searchContainer: {
    flex: 1,
    marginLeft: wp(4),
    marginRight: wp(16),
  },
  searchInput: {
    backgroundColor: "#1A1A1A",
    borderRadius: wp(8),
    paddingHorizontal: wp(16),
    paddingVertical: hp(12),
    fontSize: fp(16),
    color: "#FFFFFF",
  },
  searchInputFocused: {
    borderColor: "#ccc",
    borderWidth: wp(1),
  },
  contentContainer: {
    flex: 1,
    flexDirection: "row",
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: hp(40),
  },
  alphabetSidebar: {
    width: wp(32),
    marginRight: wp(8),
    justifyContent: "center",
  },
  alphabetContent: {
    alignItems: "center",
    flexGrow: 1,
    justifyContent: "center",
  },
  letterButton: {
    paddingVertical: hp(6),
    paddingHorizontal: wp(6),
  },
  letterText: {
    fontSize: fp(16),
    color: "#666666",
    fontWeight: "600",
  },
  headerContainer: {
    paddingHorizontal: wp(24),
    paddingTop: hp(24),
    paddingBottom: hp(8),
  },
  headerText: {
    fontSize: fp(14),
    color: "#666666",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  appItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(12),
    paddingHorizontal: wp(24),
  },
  iconContainer: {
    position: "relative",
    marginRight: wp(16),
  },
  featureIconContainer: {
    width: wp(40),
    height: wp(40),
    borderRadius: wp(8),
    backgroundColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
    marginRight: wp(16),
  },
  appIcon: {
    width: wp(40),
    height: wp(40),
    borderRadius: wp(8),
  },
  appLabel: {
    fontSize: fp(24),
    color: "#FFFFFF",
    fontWeight: "300",
  },
});
