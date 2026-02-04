package com.primedeploy.openzerolauncher;

import android.content.ComponentName;
import android.content.Intent;
import android.os.Build;
import android.provider.Settings;
import android.text.TextUtils;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.Map;

public class NotificationModule extends ReactContextBaseJavaModule implements NotificationService.NotificationListener {
    private final ReactApplicationContext reactContext;

    NotificationModule(ReactApplicationContext context) {
        super(context);
        this.reactContext = context;
        NotificationService.setListener(this);
    }

    @Override
    public String getName() {
        return "NotificationModule";
    }

    @Override
    public void onNotificationCountsChanged(Map<String, Integer> counts) {
        WritableMap params = Arguments.createMap();
        for (Map.Entry<String, Integer> entry : counts.entrySet()) {
            params.putInt(entry.getKey(), entry.getValue());
        }
        sendEvent("onNotificationCountsChanged", params);
    }

    private void sendEvent(String eventName, WritableMap params) {
        if (reactContext.hasActiveCatalystInstance()) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
        }
    }

    @ReactMethod
    public void isNotificationAccessEnabled(Promise promise) {
        try {
            String packageName = reactContext.getPackageName();
            String flat = Settings.Secure.getString(
                reactContext.getContentResolver(),
                "enabled_notification_listeners"
            );
            
            if (flat != null && flat.contains(packageName)) {
                promise.resolve(true);
            } else {
                promise.resolve(false);
            }
        } catch (Exception e) {
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void openNotificationAccessSettings(Promise promise) {
        try {
            Intent intent = new Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            reactContext.startActivity(intent);
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void getNotificationCounts(Promise promise) {
        try {
            Map<String, Integer> counts = NotificationService.getNotificationCounts();
            WritableMap result = Arguments.createMap();
            for (Map.Entry<String, Integer> entry : counts.entrySet()) {
                result.putInt(entry.getKey(), entry.getValue());
            }
            promise.resolve(result);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void refreshNotifications(Promise promise) {
        try {
            NotificationService service = NotificationService.getInstance();
            if (service != null) {
                service.refreshNotifications();
            }
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void addListener(String eventName) {
        // Required for RN event emitter
    }

    @ReactMethod
    public void removeListeners(Integer count) {
        // Required for RN event emitter
    }
}
