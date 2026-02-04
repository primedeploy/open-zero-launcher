import { create } from "zustand";
import { InstalledApp } from "../types";

type LauncherStore = {
  installedApps: InstalledApp[];
  mostUsedApps: InstalledApp[];
  hiddenApps: Set<string>;
  isLoading: boolean;
  showInitialSetup: boolean;
  setInstalledApps: (apps: InstalledApp[]) => void;
  setMostUsedApps: (apps: InstalledApp[]) => void;
  setHiddenApps: (packages: string[]) => void;
  setIsLoading: (loading: boolean) => void;
  setShowInitialSetup: (show: boolean) => void;
  incrementAppUsage: (packageName: string) => void;
  hideApp: (packageName: string) => void;
  unhideApp: (packageName: string) => void;
  isHidden: (packageName: string) => boolean;
};

export const useLauncherStore = create<LauncherStore>((set, get) => ({
  installedApps: [],
  mostUsedApps: [],
  hiddenApps: new Set<string>(),
  isLoading: true,
  showInitialSetup: false,

  setInstalledApps: (apps) => set({ installedApps: apps }),

  setMostUsedApps: (apps) => set({ mostUsedApps: apps }),

  setHiddenApps: (packages) => set({ hiddenApps: new Set(packages) }),

  setIsLoading: (loading) => set({ isLoading: loading }),

  setShowInitialSetup: (show) => set({ showInitialSetup: show }),

  incrementAppUsage: (packageName) => {
    const { installedApps, mostUsedApps } = get();
    const app = installedApps.find((a) => a.packageName === packageName);

    if (!app) return;

    const updatedMostUsed = mostUsedApps.filter(
      (a) => a.packageName !== packageName,
    );
    updatedMostUsed.unshift(app);

    set({ mostUsedApps: updatedMostUsed.slice(0, 10) });
  },

  hideApp: (packageName) => {
    const { hiddenApps, mostUsedApps } = get();
    const newHiddenApps = new Set(hiddenApps);
    newHiddenApps.add(packageName);
    const updatedMostUsed = mostUsedApps.filter(
      (a) => a.packageName !== packageName,
    );
    set({ hiddenApps: newHiddenApps, mostUsedApps: updatedMostUsed });
  },

  unhideApp: (packageName) => {
    const { hiddenApps } = get();
    const newHiddenApps = new Set(hiddenApps);
    newHiddenApps.delete(packageName);
    set({ hiddenApps: newHiddenApps });
  },

  isHidden: (packageName) => {
    return get().hiddenApps.has(packageName);
  },
}));
