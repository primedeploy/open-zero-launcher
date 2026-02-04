import { useState, useEffect, useCallback } from "react";
import {
  isNotificationAccessEnabled,
  openNotificationAccessSettings,
  getNotificationCounts,
  addNotificationListener,
} from "../services";

type NotificationCounts = Record<string, number>;

export function useNotifications() {
  const [notificationCounts, setNotificationCounts] =
    useState<NotificationCounts>({});
  const [hasAccess, setHasAccess] = useState(false);

  const checkAccess = useCallback(async () => {
    const enabled = await isNotificationAccessEnabled();
    setHasAccess(enabled);
    return enabled;
  }, []);

  const requestAccess = useCallback(async () => {
    await openNotificationAccessSettings();
  }, []);

  const loadCounts = useCallback(async () => {
    const counts = await getNotificationCounts();
    setNotificationCounts(counts);
  }, []);

  function getNotificationCount(packageName: string): number {
    return notificationCounts[packageName] || 0;
  }

  useEffect(() => {
    checkAccess().then((enabled) => {
      if (enabled) {
        loadCounts();
      }
    });
  }, [checkAccess, loadCounts]);

  useEffect(() => {
    const unsubscribe = addNotificationListener((counts) => {
      setNotificationCounts(counts);
    });

    return unsubscribe;
  }, []);

  return {
    notificationCounts,
    hasAccess,
    checkAccess,
    requestAccess,
    getNotificationCount,
    refreshCounts: loadCounts,
  };
}
