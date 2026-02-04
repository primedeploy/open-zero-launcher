export type InstalledApp = {
  packageName: string;
  label: string;
  icon: string | null;
  isSystemApp: boolean;
};

export type AppShortcut = {
  id: string;
  packageName: string;
  label: string;
  longLabel?: string;
  icon?: string;
};

export type AppUsage = {
  packageName: string;
  usageCount: number;
  lastUsed: number;
};

export type LauncherState = {
  installedApps: InstalledApp[];
  mostUsedApps: InstalledApp[];
  isLoading: boolean;
};
