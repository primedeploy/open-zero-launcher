import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Switch,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { InstalledApp } from "../types";
import {
  getAppLockConfig,
  setAppLockEnabled,
  setAppLockPassword,
  getLockedApps,
  addLockedApp,
  removeLockedApp,
  clearAppLockPassword,
  clearAllLockedApps,
  SYSTEM_LOCKED_PACKAGES,
} from "../services";
import { Toast } from "./Toast";
import { wp, hp, fp } from "../utils";

type LockAppsScreenProps = {
  apps: InstalledApp[];
  onBack: () => void;
};

export const LockAppsScreen = ({ apps, onBack }: LockAppsScreenProps) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);
  const [lockedApps, setLockedApps] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [configVersion, setConfigVersion] = useState(0);
  const [searchFocused, setSearchFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const reloadConfig = useCallback(async () => {
    setConfigVersion((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (isEnabled) {
      setLockedApps((prev) => {
        const newSet = new Set(prev);
        SYSTEM_LOCKED_PACKAGES.forEach((pkg) => newSet.add(pkg));
        return newSet;
      });
    }
  }, [isEnabled]);

  async function loadConfig() {
    setIsLoading(true);
    const config = await getAppLockConfig();
    setIsEnabled(config.enabled);
    setHasPassword(config.hasPassword);
    const packages = await getLockedApps();
    setLockedApps(new Set(packages));
    setIsLoading(false);
  }

  async function handleToggleEnabled(value: boolean) {
    if (value && !hasPassword) {
      setShowPasswordSetup(true);
      return;
    }

    setIsEnabled(value);
    await setAppLockEnabled(value);

    if (value) {
      showToast("App lock enabled");
    } else {
      await clearAppLockPassword();
      await clearAllLockedApps();
      setHasPassword(false);
      setLockedApps(new Set());
      showToast("App lock disabled");
    }

    await reloadConfig();
  }

  async function handleSavePassword() {
    if (password.length < 4 || password.length > 21) {
      showToast("Password must be 4-21 characters");
      return;
    }

    if (password !== confirmPassword) {
      showToast("Passwords do not match");
      return;
    }

    await setAppLockPassword(password);
    setHasPassword(true);
    setIsEnabled(true);
    setShowPasswordSetup(false);
    setPassword("");
    setConfirmPassword("");
    showToast("Password set successfully");
  }

  function handleCancelPasswordSetup() {
    setShowPasswordSetup(false);
    setPassword("");
    setConfirmPassword("");
  }

  function handleChangePassword() {
    setShowPasswordSetup(true);
  }

  const handleToggleLock = useCallback(
    async (packageName: string) => {
      if (isEnabled && SYSTEM_LOCKED_PACKAGES.includes(packageName)) {
        return;
      }
      setLockedApps((prevSet) => {
        const newSet = new Set(prevSet);
        if (newSet.has(packageName)) {
          newSet.delete(packageName);
          removeLockedApp(packageName);
        } else {
          newSet.add(packageName);
          addLockedApp(packageName);
        }
        return newSet;
      });
    },
    [isEnabled],
  );

  function showToast(message: string) {
    setToastMessage(message);
    setToastVisible(true);
  }

  function hideToast() {
    setToastVisible(false);
  }

  const filteredApps = useMemo(() => {
    let result = apps;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = apps.filter((app) => app.label.toLowerCase().includes(query));
    }

    return result.sort((a, b) => {
      const aIsSystemLocked = SYSTEM_LOCKED_PACKAGES.includes(a.packageName);
      const bIsSystemLocked = SYSTEM_LOCKED_PACKAGES.includes(b.packageName);
      const aIsLocked =
        lockedApps.has(a.packageName) || (isEnabled && aIsSystemLocked);
      const bIsLocked =
        lockedApps.has(b.packageName) || (isEnabled && bIsSystemLocked);

      if (aIsLocked && !bIsLocked) return -1;
      if (!aIsLocked && bIsLocked) return 1;

      return a.label.toLowerCase().localeCompare(b.label.toLowerCase());
    });
  }, [apps, searchQuery, lockedApps, isEnabled]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={fp(28)} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Lock apps</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (showPasswordSetup) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleCancelPasswordSetup}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={fp(28)} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>
            {hasPassword ? "Change password" : "Set Password"}
          </Text>
        </View>

        <View style={styles.passwordContainer}>
          <Text style={styles.passwordLabel}>Password (4-21 characters)</Text>
          <TextInput
            key="password-input"
            style={[
              styles.passwordInput,
              passwordFocused && styles.passwordInputFocused,
            ]}
            placeholder="Enter password"
            placeholderTextColor="#666666"
            value={password}
            onChangeText={setPassword}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
            secureTextEntry
            maxLength={21}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.passwordLabel}>Confirm Password</Text>
          <TextInput
            key="confirm-password-input"
            style={[
              styles.passwordInput,
              confirmPasswordFocused && styles.passwordInputFocused,
            ]}
            placeholder="Confirm password"
            placeholderTextColor="#666666"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            onFocus={() => setConfirmPasswordFocused(true)}
            onBlur={() => setConfirmPasswordFocused(false)}
            secureTextEntry
            maxLength={21}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSavePassword}
          >
            <Text style={styles.saveButtonText}>Save Password</Text>
          </TouchableOpacity>
        </View>

        <Toast
          message={toastMessage}
          visible={toastVisible}
          onHide={hideToast}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={fp(28)} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Lock apps</Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.toggleContainer}>
          <View style={styles.toggleInfo}>
            <Ionicons name="lock-closed" size={fp(24)} color="#FFFFFF" />
            <View style={styles.toggleTextContainer}>
              <Text style={styles.toggleTitle}>Enable app lock</Text>
              <Text style={styles.toggleDescription}>
                Require password to open selected apps
              </Text>
            </View>
          </View>
          <Switch
            value={isEnabled}
            onValueChange={handleToggleEnabled}
            trackColor={{ false: "#333333", true: "#4CAF50" }}
            thumbColor={isEnabled ? "#FFFFFF" : "#888888"}
          />
        </View>

        {hasPassword && (
          <TouchableOpacity
            style={styles.changePasswordButton}
            onPress={handleChangePassword}
          >
            <Ionicons name="key-outline" size={fp(20)} color="#FFFFFF" />
            <Text style={styles.changePasswordText}>Change password</Text>
          </TouchableOpacity>
        )}

        <View style={styles.searchContainer}>
          <TextInput
            key="search-input"
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

        <Text style={styles.sectionTitle}>
          Select apps to lock (
          {lockedApps.size + (isEnabled ? SYSTEM_LOCKED_PACKAGES.length : 0)}{" "}
          selected)
        </Text>

        <View style={styles.appsList}>
          {filteredApps.map((item) => {
            const isSystemLocked = SYSTEM_LOCKED_PACKAGES.includes(
              item.packageName,
            );
            const isLocked =
              isEnabled && (lockedApps.has(item.packageName) || isSystemLocked);
            const disabled = !isEnabled || (isEnabled && isSystemLocked);
            const systemAppDisabled = !isEnabled && isSystemLocked;
            return (
              <TouchableOpacity
                key={item.packageName}
                style={styles.appItem}
                onPress={() => handleToggleLock(item.packageName)}
                activeOpacity={0.7}
                disabled={disabled}
              >
                <View
                  style={[
                    styles.checkbox,
                    disabled && styles.checkboxDisabled,
                    systemAppDisabled && styles.checkboxSystemDisabled,
                    isLocked && styles.checkboxChecked,
                  ]}
                >
                  {isLocked && (
                    <Ionicons
                      name="checkmark"
                      size={fp(18)}
                      color={isEnabled ? "#000000" : "#666666"}
                    />
                  )}
                </View>
                {item.icon && (
                  <Image
                    source={{ uri: `data:image/png;base64,${item.icon}` }}
                    style={[
                      styles.appIcon,
                      (!isEnabled || systemAppDisabled) &&
                        styles.appIconDisabled,
                    ]}
                  />
                )}
                <Text
                  style={[
                    styles.appLabel,
                    (!isEnabled || systemAppDisabled) &&
                      styles.appLabelDisabled,
                  ]}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
                {isLocked && (
                  <Ionicons
                    name="lock-closed"
                    size={fp(18)}
                    color={isEnabled ? "#FFFFFF" : "#666666"}
                  />
                )}
                {isSystemLocked && isEnabled && (
                  <Ionicons
                    name="alert-circle-outline"
                    size={fp(16)}
                    color="#FF4444"
                    style={{ marginLeft: wp(8) }}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <Toast message={toastMessage} visible={toastVisible} onHide={hideToast} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: hp(16),
    paddingHorizontal: wp(8),
    paddingBottom: hp(8),
  },
  backButton: {
    padding: wp(8),
  },
  title: {
    fontSize: fp(20),
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: wp(8),
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(24),
    paddingVertical: hp(16),
    backgroundColor: "#1A1A1A",
    marginHorizontal: wp(16),
    marginBottom: hp(8),
    borderRadius: wp(12),
  },
  toggleInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  toggleTextContainer: {
    marginLeft: wp(12),
    flex: 1,
  },
  toggleTitle: {
    fontSize: fp(16),
    fontWeight: "600",
    color: "#FFFFFF",
  },
  toggleDescription: {
    fontSize: fp(12),
    color: "#888888",
    marginTop: hp(2),
  },
  changePasswordButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(24),
    paddingVertical: hp(12),
    marginHorizontal: wp(16),
    marginBottom: hp(16),
    backgroundColor: "#1A1A1A",
    borderRadius: wp(8),
  },
  changePasswordText: {
    fontSize: fp(14),
    color: "#FFFFFF",
    marginLeft: wp(8),
  },
  searchContainer: {
    paddingHorizontal: wp(16),
    paddingBottom: hp(8),
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
  sectionTitle: {
    fontSize: fp(14),
    color: "#888888",
    paddingHorizontal: wp(24),
    paddingVertical: hp(8),
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: hp(40),
  },
  appItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(12),
    paddingHorizontal: wp(24),
  },
  checkbox: {
    width: wp(24),
    height: wp(24),
    borderRadius: wp(4),
    borderWidth: wp(2),
    borderColor: "#FFFFFF",
    marginRight: wp(16),
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#FFFFFF",
  },
  checkboxDisabled: {
    borderColor: "#444444",
    backgroundColor: "transparent",
  },
  checkboxSystemDisabled: {
    borderColor: "#666666",
    backgroundColor: "transparent",
  },
  appIcon: {
    width: wp(40),
    height: wp(40),
    borderRadius: wp(8),
    marginRight: wp(16),
  },
  appIconDisabled: {
    opacity: 0.4,
  },
  appLabel: {
    fontSize: fp(18),
    color: "#FFFFFF",
    flex: 1,
  },
  appLabelDisabled: {
    color: "#666666",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: fp(16),
    color: "#666666",
  },
  passwordContainer: {
    padding: wp(24),
  },
  passwordLabel: {
    fontSize: fp(14),
    color: "#888888",
    marginBottom: hp(8),
    marginTop: hp(16),
  },
  passwordInput: {
    backgroundColor: "#1A1A1A",
    borderRadius: wp(8),
    paddingHorizontal: wp(16),
    paddingVertical: hp(14),
    fontSize: fp(16),
    color: "#FFFFFF",
  },
  passwordInputFocused: {
    borderColor: "#ccc",
    borderWidth: wp(1),
  },
  saveButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: wp(8),
    paddingVertical: hp(14),
    alignItems: "center",
    marginTop: hp(32),
  },
  saveButtonText: {
    fontSize: fp(16),
    fontWeight: "600",
    color: "#000000",
  },
  scrollContainer: {
    flex: 1,
  },
  appsList: {
    paddingBottom: hp(20),
  },
});
