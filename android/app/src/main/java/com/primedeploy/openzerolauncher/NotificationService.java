package com.primedeploy.openzerolauncher;

import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.HashMap;
import java.util.Map;

public class NotificationService extends NotificationListenerService {
    private static NotificationService instance;
    private static Map<String, Integer> notificationCounts = new HashMap<>();
    private static NotificationListener listener;

    public interface NotificationListener {
        void onNotificationCountsChanged(Map<String, Integer> counts);
    }

    public static void setListener(NotificationListener l) {
        listener = l;
    }

    public static NotificationService getInstance() {
        return instance;
    }

    public static Map<String, Integer> getNotificationCounts() {
        return new HashMap<>(notificationCounts);
    }

    @Override
    public void onCreate() {
        super.onCreate();
        instance = this;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        instance = null;
    }

    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        updateNotificationCounts();
    }

    @Override
    public void onNotificationRemoved(StatusBarNotification sbn) {
        updateNotificationCounts();
    }

    @Override
    public void onListenerConnected() {
        super.onListenerConnected();
        updateNotificationCounts();
    }

    private void updateNotificationCounts() {
        try {
            StatusBarNotification[] activeNotifications = getActiveNotifications();
            Map<String, Integer> counts = new HashMap<>();

            if (activeNotifications != null) {
                for (StatusBarNotification sbn : activeNotifications) {
                    String packageName = sbn.getPackageName();
                    int currentCount = counts.containsKey(packageName) ? counts.get(packageName) : 0;
                    counts.put(packageName, currentCount + 1);
                }
            }

            notificationCounts = counts;

            if (listener != null) {
                listener.onNotificationCountsChanged(counts);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void refreshNotifications() {
        updateNotificationCounts();
    }
}
