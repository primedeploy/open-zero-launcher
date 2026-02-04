package com.primedeploy.openzerolauncher;

import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.content.pm.ShortcutInfo;
import android.content.pm.LauncherApps;
import android.content.Context;
import android.os.UserHandle;
import android.os.Process;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.net.Uri;
import android.provider.Settings;
import android.util.Base64;
import android.os.Build;
import android.content.ComponentName;
import android.app.role.RoleManager;
import android.app.Activity;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import java.io.ByteArrayOutputStream;
import java.util.List;

public class InstalledAppsModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;

    InstalledAppsModule(ReactApplicationContext context) {
        super(context);
        this.reactContext = context;
    }

    @Override
    public String getName() {
        return "InstalledApps";
    }

    private String drawableToBase64(Drawable drawable) {
        try {
            Bitmap bitmap;
            if (drawable instanceof BitmapDrawable) {
                bitmap = ((BitmapDrawable) drawable).getBitmap();
            } else {
                int width = drawable.getIntrinsicWidth();
                int height = drawable.getIntrinsicHeight();
                if (width <= 0) width = 48;
                if (height <= 0) height = 48;
                bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888);
                Canvas canvas = new Canvas(bitmap);
                drawable.setBounds(0, 0, canvas.getWidth(), canvas.getHeight());
                drawable.draw(canvas);
            }

            ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
            bitmap.compress(Bitmap.CompressFormat.PNG, 100, byteArrayOutputStream);
            byte[] byteArray = byteArrayOutputStream.toByteArray();
            return Base64.encodeToString(byteArray, Base64.NO_WRAP);
        } catch (Exception e) {
            return null;
        }
    }

    @ReactMethod
    public void getInstalledApps(Promise promise) {
        try {
            PackageManager pm = reactContext.getPackageManager();
            Intent mainIntent = new Intent(Intent.ACTION_MAIN, null);
            mainIntent.addCategory(Intent.CATEGORY_LAUNCHER);

            List<ResolveInfo> resolveInfos = pm.queryIntentActivities(mainIntent, 0);
            WritableArray apps = Arguments.createArray();

            String myPackage = reactContext.getPackageName();

            for (ResolveInfo resolveInfo : resolveInfos) {
                String packageName = resolveInfo.activityInfo.packageName;
                
                if (packageName.equals(myPackage)) {
                    continue;
                }

                WritableMap app = Arguments.createMap();
                app.putString("packageName", packageName);
                app.putString("label", resolveInfo.loadLabel(pm).toString());
                
                try {
                    Drawable icon = resolveInfo.loadIcon(pm);
                    String iconBase64 = drawableToBase64(icon);
                    app.putString("icon", iconBase64);
                } catch (Exception e) {
                    app.putNull("icon");
                }

                try {
                    ApplicationInfo appInfo = pm.getApplicationInfo(packageName, 0);
                    boolean isSystemApp = (appInfo.flags & ApplicationInfo.FLAG_SYSTEM) != 0;
                    app.putBoolean("isSystemApp", isSystemApp);
                } catch (Exception e) {
                    app.putBoolean("isSystemApp", false);
                }

                apps.pushMap(app);
            }

            promise.resolve(apps);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void launchApp(String packageName, Promise promise) {
        try {
            PackageManager pm = reactContext.getPackageManager();
            Intent launchIntent = pm.getLaunchIntentForPackage(packageName);
            
            if (launchIntent != null) {
                launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                reactContext.startActivity(launchIntent);
                promise.resolve(true);
            } else {
                promise.reject("ERROR", "Could not launch app");
            }
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void openAppInfo(String packageName, Promise promise) {
        try {
            Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
            intent.setData(Uri.parse("package:" + packageName));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            reactContext.startActivity(intent);
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void uninstallApp(String packageName, Promise promise) {
        try {
            Intent intent = new Intent(Intent.ACTION_DELETE);
            intent.setData(Uri.parse("package:" + packageName));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            reactContext.startActivity(intent);
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void getAppShortcuts(String packageName, Promise promise) {
        try {
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.N_MR1) {
                promise.resolve(Arguments.createArray());
                return;
            }

            LauncherApps launcherApps = (LauncherApps) reactContext.getSystemService(Context.LAUNCHER_APPS_SERVICE);
            if (launcherApps == null) {
                promise.resolve(Arguments.createArray());
                return;
            }

            UserHandle userHandle = Process.myUserHandle();
            
            if (!launcherApps.hasShortcutHostPermission()) {
                promise.resolve(Arguments.createArray());
                return;
            }

            LauncherApps.ShortcutQuery query = new LauncherApps.ShortcutQuery();
            query.setQueryFlags(
                LauncherApps.ShortcutQuery.FLAG_MATCH_DYNAMIC |
                LauncherApps.ShortcutQuery.FLAG_MATCH_MANIFEST |
                LauncherApps.ShortcutQuery.FLAG_MATCH_PINNED
            );
            query.setPackage(packageName);

            List<ShortcutInfo> shortcuts = launcherApps.getShortcuts(query, userHandle);
            WritableArray result = Arguments.createArray();

            if (shortcuts != null) {
                for (ShortcutInfo shortcut : shortcuts) {
                    if (shortcut.isEnabled()) {
                        WritableMap shortcutMap = Arguments.createMap();
                        shortcutMap.putString("id", shortcut.getId());
                        shortcutMap.putString("packageName", shortcut.getPackage());
                        
                        CharSequence label = shortcut.getShortLabel();
                        shortcutMap.putString("label", label != null ? label.toString() : "Shortcut");
                        
                        CharSequence longLabel = shortcut.getLongLabel();
                        if (longLabel != null && longLabel.length() > 0) {
                            shortcutMap.putString("longLabel", longLabel.toString());
                        }

                        try {
                            Drawable icon = launcherApps.getShortcutIconDrawable(shortcut, 0);
                            if (icon != null) {
                                String iconBase64 = drawableToBase64(icon);
                                shortcutMap.putString("icon", iconBase64);
                            }
                        } catch (Exception e) {
                            // Icon not available
                        }

                        result.pushMap(shortcutMap);
                    }
                }
            }

            promise.resolve(result);
        } catch (Exception e) {
            promise.resolve(Arguments.createArray());
        }
    }

    @ReactMethod
    public void launchShortcut(String packageName, String shortcutId, Promise promise) {
        try {
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.N_MR1) {
                promise.reject("ERROR", "Shortcuts not supported on this Android version");
                return;
            }

            LauncherApps launcherApps = (LauncherApps) reactContext.getSystemService(Context.LAUNCHER_APPS_SERVICE);
            if (launcherApps == null) {
                promise.reject("ERROR", "LauncherApps service not available");
                return;
            }

            UserHandle userHandle = Process.myUserHandle();
            launcherApps.startShortcut(packageName, shortcutId, null, null, userHandle);
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void isDefaultLauncher(Promise promise) {
        try {
            PackageManager pm = reactContext.getPackageManager();
            Intent intent = new Intent(Intent.ACTION_MAIN);
            intent.addCategory(Intent.CATEGORY_HOME);
            ResolveInfo resolveInfo = pm.resolveActivity(intent, PackageManager.MATCH_DEFAULT_ONLY);
            
            if (resolveInfo != null) {
                String currentDefault = resolveInfo.activityInfo.packageName;
                String myPackage = reactContext.getPackageName();
                promise.resolve(currentDefault.equals(myPackage));
            } else {
                promise.resolve(false);
            }
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void openDefaultLauncherSettings(Promise promise) {
        try {
            Activity currentActivity = getCurrentActivity();
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                RoleManager roleManager = (RoleManager) reactContext.getSystemService(Context.ROLE_SERVICE);
                if (roleManager != null && roleManager.isRoleAvailable(RoleManager.ROLE_HOME)) {
                    if (!roleManager.isRoleHeld(RoleManager.ROLE_HOME)) {
                        Intent intent = roleManager.createRequestRoleIntent(RoleManager.ROLE_HOME);
                        if (currentActivity != null) {
                            currentActivity.startActivityForResult(intent, 1001);
                        } else {
                            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                            reactContext.startActivity(intent);
                        }
                        promise.resolve(true);
                        return;
                    }
                }
            }
            
            Intent intent = new Intent(Intent.ACTION_MAIN);
            intent.addCategory(Intent.CATEGORY_HOME);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            
            Intent chooser = Intent.createChooser(intent, "Select Home App");
            chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            reactContext.startActivity(chooser);
            promise.resolve(true);
        } catch (Exception e) {
            try {
                Intent intent = new Intent(Settings.ACTION_HOME_SETTINGS);
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                reactContext.startActivity(intent);
                promise.resolve(true);
            } catch (Exception ex) {
                promise.reject("ERROR", ex.getMessage());
            }
        }
    }
}
