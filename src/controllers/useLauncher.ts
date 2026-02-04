import { useEffect, useCallback, useMemo } from "react";
import { useLauncherStore } from "../stores";
import {
  getInstalledApps,
  launchApp,
  openAppInfo as nativeOpenAppInfo,
  uninstallApp as nativeUninstallApp,
  checkFirstLaunch,
  setFirstLaunchComplete as persistFirstLaunchComplete,
  getFavoritePackages,
  addFavoritePackage,
  removeFavoritePackage,
  setFavoritePackages,
  getHiddenPackages,
  addHiddenPackage,
  removeHiddenPackage,
} from "../services";
import { InstalledApp } from "../types";

export function useLauncher() {
  const {
    installedApps,
    mostUsedApps,
    hiddenApps,
    isLoading,
    showInitialSetup,
    setInstalledApps,
    setMostUsedApps,
    setIsLoading,
    setShowInitialSetup,
    setHiddenApps,
    hideApp: storeHideApp,
    unhideApp: storeUnhideApp,
    isHidden,
  } = useLauncherStore();

  const loadApps = useCallback(async () => {
    try {
      setIsLoading(true);
      const apps = await getInstalledApps();
      const sortedApps = apps.sort((a, b) =>
        a.label.toLowerCase().localeCompare(b.label.toLowerCase()),
      );
      setInstalledApps(sortedApps);

      const hiddenPackages = await getHiddenPackages();
      setHiddenApps(hiddenPackages);

      const isFirst = await checkFirstLaunch();
      if (isFirst) {
        setShowInitialSetup(true);
        setMostUsedApps([]);
        return;
      }

      const favoritePackages = await getFavoritePackages();
      const favorites: InstalledApp[] = [];
      for (const packageName of favoritePackages) {
        const app = sortedApps.find((a) => a.packageName === packageName);
        if (app) {
          favorites.push(app);
        }
      }
      setMostUsedApps(favorites);
    } catch {
    } finally {
      setIsLoading(false);
    }
  }, [
    setInstalledApps,
    setMostUsedApps,
    setIsLoading,
    setShowInitialSetup,
    setHiddenApps,
  ]);

  const openApp = useCallback(async (packageName: string) => {
    try {
      await launchApp(packageName);
    } catch {}
  }, []);

  const removeFromFavorites = useCallback(
    async (packageName: string) => {
      const updatedMostUsed = mostUsedApps.filter(
        (a) => a.packageName !== packageName,
      );
      setMostUsedApps(updatedMostUsed);
      await removeFavoritePackage(packageName);
    },
    [mostUsedApps, setMostUsedApps],
  );

  const addToFavorites = useCallback(
    async (packageName: string) => {
      if (mostUsedApps.length >= 10) return;

      const app = installedApps.find((a) => a.packageName === packageName);
      if (!app) return;

      const alreadyFavorite = mostUsedApps.some(
        (a) => a.packageName === packageName,
      );
      if (alreadyFavorite) return;

      setMostUsedApps([...mostUsedApps, app]);
      await addFavoritePackage(packageName);
    },
    [installedApps, mostUsedApps, setMostUsedApps],
  );

  const openAppInfo = useCallback((packageName: string) => {
    nativeOpenAppInfo(packageName);
  }, []);

  const uninstallApp = useCallback((packageName: string) => {
    nativeUninstallApp(packageName);
  }, []);

  const hideApp = useCallback(
    async (packageName: string) => {
      storeHideApp(packageName);
      await addHiddenPackage(packageName);
      const isFavorite = mostUsedApps.some(
        (a) => a.packageName === packageName,
      );
      if (isFavorite) {
        const updatedMostUsed = mostUsedApps.filter(
          (a) => a.packageName !== packageName,
        );
        setMostUsedApps(updatedMostUsed);
        await removeFavoritePackage(packageName);
      }
    },
    [storeHideApp, mostUsedApps, setMostUsedApps],
  );

  const unhideApp = useCallback(
    async (packageName: string) => {
      storeUnhideApp(packageName);
      await removeHiddenPackage(packageName);
    },
    [storeUnhideApp],
  );

  const visibleInstalledApps = useMemo(() => {
    return installedApps.filter((app) => !hiddenApps.has(app.packageName));
  }, [installedApps, hiddenApps]);

  const completeInitialSetup = useCallback(
    async (selectedApps: InstalledApp[]) => {
      setMostUsedApps(selectedApps);
      setShowInitialSetup(false);
      await setFavoritePackages(selectedApps.map((app) => app.packageName));
      await persistFirstLaunchComplete();
    },
    [setMostUsedApps, setShowInitialSetup],
  );

  useEffect(() => {
    loadApps();
  }, [loadApps]);

  return {
    installedApps,
    visibleInstalledApps,
    mostUsedApps,
    hiddenApps,
    isLoading,
    showInitialSetup,
    openApp,
    refreshApps: loadApps,
    removeFromFavorites,
    addToFavorites,
    openAppInfo,
    uninstallApp,
    hideApp,
    unhideApp,
    isHidden,
    completeInitialSetup,
  };
}
