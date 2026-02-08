import React, { useState, useCallback, useRef, useEffect } from "react";
import { View, StyleSheet, StatusBar, PanResponder, AppState } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Clock,
  MostUsedApps,
  AppList,
  InitialSetupModal,
  AboutScreen,
  LockAppsScreen,
  UnlockModal,
  DefaultLauncherModal,
} from "../src/components";
import { useLauncher, useNotifications } from "../src/controllers";
import { InstalledApp } from "../src/types";
import {
  isAppLocked,
  getAppLockConfig,
  isDefaultLauncher,
  openDefaultLauncherSettings,
} from "../src/services";
import { hp, wp } from "../src/utils";

const SWIPE_THRESHOLD = 50;

export const HomeScreen = () => {
  const {
    mostUsedApps,
    installedApps,
    visibleInstalledApps,
    showInitialSetup,
    openApp,
    refreshApps,
    removeFromFavorites,
    addToFavorites,
    openAppInfo,
    uninstallApp,
    hideApp,
    unhideApp,
    isHidden,
    completeInitialSetup,
  } = useLauncher();
  const { getNotificationCount } = useNotifications();
  const [showAllApps, setShowAllApps] = useState(false);
  const [showLockApps, setShowLockApps] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [unlockModalVisible, setUnlockModalVisible] = useState(false);
  const [pendingApp, setPendingApp] = useState<InstalledApp | null>(null);
  const [pendingLockAppsAccess, setPendingLockAppsAccess] = useState(false);
  const [showDefaultLauncherModal, setShowDefaultLauncherModal] =
    useState(false);
  const startY = useRef(0);

  useEffect(() => {
    async function checkDefaultLauncher() {
			try {
      const isDefault = await isDefaultLauncher();
      if (!isDefault && !showInitialSetup) {
        setShowDefaultLauncherModal(true);
      }
			} catch (error) {	
				console.error("Error checking default launcher:", error);
			}
    }

    checkDefaultLauncher();

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        checkDefaultLauncher();
        refreshApps();
        setShowAllApps(false);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [showInitialSetup, refreshApps]);

  const handleSetDefaultLauncher = useCallback(async () => {
    await openDefaultLauncherSettings();
    setShowDefaultLauncherModal(false);
  }, []);

  const handleSkipDefaultLauncher = useCallback(() => {
    setShowDefaultLauncherModal(false);
  }, []);

  const handleInitialSetupComplete = useCallback(
    (selectedApps: InstalledApp[]) => {
      completeInitialSetup(selectedApps);
    },
    [completeInitialSetup],
  );

  const handleAppPress = useCallback(
    async (packageName: string) => {
      const config = await getAppLockConfig();
      if (config.enabled && config.hasPassword) {
        const locked = await isAppLocked(packageName);
        if (locked) {
          const app = installedApps.find((a) => a.packageName === packageName);
          if (app) {
            setPendingApp(app);
            setUnlockModalVisible(true);
            return;
          }
        }
      }
      openApp(packageName);
    },
    [openApp, installedApps],
  );

  const handleUnlock = useCallback(() => {
    if (pendingLockAppsAccess) {
      setShowLockApps(true);
      setPendingLockAppsAccess(false);
    } else if (pendingApp) {
      openApp(pendingApp.packageName);
    }
    setUnlockModalVisible(false);
    setPendingApp(null);
  }, [pendingApp, pendingLockAppsAccess, openApp]);

  const handleCancelUnlock = useCallback(() => {
    setUnlockModalVisible(false);
    setPendingApp(null);
    setPendingLockAppsAccess(false);
  }, []);

  const handleRemoveFromFavorites = useCallback(
    (packageName: string) => {
      removeFromFavorites(packageName);
    },
    [removeFromFavorites],
  );

  const handleAddToFavorites = useCallback(
    (packageName: string) => {
      addToFavorites(packageName);
    },
    [addToFavorites],
  );

  const handleOpenAppInfo = useCallback(
    (packageName: string) => {
      openAppInfo(packageName);
    },
    [openAppInfo],
  );

  const handleUninstallApp = useCallback(
    (packageName: string) => {
      uninstallApp(packageName);
    },
    [uninstallApp],
  );

  const handleHideApp = useCallback(
    (packageName: string) => {
      hideApp(packageName);
    },
    [hideApp],
  );

  const handleUnhideApp = useCallback(
    (packageName: string) => {
      unhideApp(packageName);
    },
    [unhideApp],
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderGrant: (_, gestureState) => {
        startY.current = gestureState.y0;
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dy } = gestureState;

        if (!showAllApps && dy < -SWIPE_THRESHOLD) {
          setShowAllApps(true);
        } else if (showAllApps && dy > SWIPE_THRESHOLD) {
          setShowAllApps(false);
        }
      },
    }),
  ).current;

  const handleBack = useCallback(() => {
    setShowAllApps(false);
  }, []);

  const handleOpenAbout = useCallback(() => {
    setShowAbout(true);
  }, []);

  const handleBackFromAbout = useCallback(() => {
    setShowAbout(false);
  }, []);

  const handleOpenLockApps = useCallback(async () => {
    const config = await getAppLockConfig();
    if (config.enabled && config.hasPassword) {
      setPendingLockAppsAccess(true);
      setUnlockModalVisible(true);
      return;
    }
    setShowLockApps(true);
  }, []);

  const handleBackFromLockApps = useCallback(() => {
    setShowLockApps(false);
  }, []);

  if (showAbout) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <SafeAreaView style={styles.screen}>
          <AboutScreen onBack={handleBackFromAbout} />
        </SafeAreaView>
      </View>
    );
  }

  if (showLockApps) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <SafeAreaView style={styles.screen}>
          <LockAppsScreen
            apps={installedApps}
            onBack={handleBackFromLockApps}
          />
        </SafeAreaView>
      </View>
    );
  }

  if (showAllApps) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <SafeAreaView style={styles.screen}>
          <AppList
            apps={visibleInstalledApps}
            allApps={installedApps}
            favoriteApps={mostUsedApps}
            onAppPress={handleAppPress}
            onBack={handleBack}
            onAddToFavorites={handleAddToFavorites}
            onRemoveFromFavorites={handleRemoveFromFavorites}
            onOpenAppInfo={handleOpenAppInfo}
            onUninstallApp={handleUninstallApp}
            onHideApp={handleHideApp}
            onUnhideApp={handleUnhideApp}
            isHidden={isHidden}
            getNotificationCount={getNotificationCount}
            onOpenLockApps={handleOpenLockApps}
            onOpenAbout={handleOpenAbout}
          />
        </SafeAreaView>
        <UnlockModal
          visible={unlockModalVisible}
          appName={
            pendingLockAppsAccess
              ? "Lock Apps Settings"
              : (pendingApp?.label ?? "")
          }
          appIcon={pendingLockAppsAccess ? null : (pendingApp?.icon ?? null)}
          onUnlock={handleUnlock}
          onCancel={handleCancelUnlock}
        />
      </View>
    );
  }

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <SafeAreaView style={styles.screen}>
        <View style={styles.homeContent}>
          <Clock />
          <MostUsedApps
            apps={mostUsedApps}
            onAppPress={handleAppPress}
            onRemoveFromFavorites={handleRemoveFromFavorites}
            onOpenAppInfo={handleOpenAppInfo}
            onUninstallApp={handleUninstallApp}
            onHideApp={handleHideApp}
            getNotificationCount={getNotificationCount}
          />
        </View>
        <View style={styles.swipeIndicator}>
          <View style={styles.indicatorLine} />
        </View>
      </SafeAreaView>
      <InitialSetupModal
        visible={showInitialSetup}
        apps={installedApps}
        onComplete={handleInitialSetupComplete}
      />
      <DefaultLauncherModal
        visible={showDefaultLauncherModal && !showInitialSetup}
        onSetDefault={handleSetDefaultLauncher}
        onSkip={handleSkipDefaultLauncher}
      />
      <UnlockModal
        visible={unlockModalVisible}
        appName={
          pendingLockAppsAccess
            ? "Lock Apps Settings"
            : (pendingApp?.label ?? "")
        }
        appIcon={pendingLockAppsAccess ? null : (pendingApp?.icon ?? null)}
        onUnlock={handleUnlock}
        onCancel={handleCancelUnlock}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  screen: {
    flex: 1,
    backgroundColor: "#000000",
  },
  homeContent: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: hp(100),
  },
  swipeIndicator: {
    position: "absolute",
    bottom: hp(40),
    left: 0,
    right: 0,
    alignItems: "center",
  },
  indicatorLine: {
    width: wp(40),
    height: hp(4),
    backgroundColor: "#333333",
    borderRadius: wp(2),
  },
});

export default HomeScreen;
