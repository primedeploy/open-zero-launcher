package com.primedeploy.openzerolauncher;

import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Handler;
import android.os.Looper;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;

public class AutostartModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;

    AutostartModule(ReactApplicationContext context) {
        super(context);
        this.reactContext = context;
    }

    @Override
    public String getName() {
        return "AutostartModule";
    }

    @ReactMethod
    public void launchAutostartApps(ReadableArray packageNames, Promise promise) {
        try {
            PackageManager pm = reactContext.getPackageManager();
            Handler handler = new Handler(Looper.getMainLooper());
            
            for (int i = 0; i < packageNames.size(); i++) {
                final String packageName = packageNames.getString(i);
                final int delay = i * 1500;
                
                handler.postDelayed(() -> {
                    try {
                        Intent launchIntent = pm.getLaunchIntentForPackage(packageName);
                        if (launchIntent != null) {
                            launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                            reactContext.startActivity(launchIntent);
                        }
                    } catch (Exception e) {
                    }
                }, delay);
            }
            
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }
}
