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
            <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
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
            <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
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
          <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Lock apps</Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.toggleContainer}>
          <View style={styles.toggleInfo}>
            <Ionicons name="lock-closed" size={24} color="#FFFFFF" />
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
            <Ionicons name="key-outline" size={20} color="#FFFFFF" />
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
                      size={18}
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
                    size={18}
                    color={isEnabled ? "#FFFFFF" : "#666666"}
                  />
                )}
                {isSystemLocked && isEnabled && (
                  <Ionicons
                    name="alert-circle-outline"
                    size={16}
                    color="#FF4444"
                    style={{ marginLeft: 8 }}
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
    paddingTop: 16,
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "#1A1A1A",
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  toggleInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  toggleTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  toggleDescription: {
    fontSize: 12,
    color: "#888888",
    marginTop: 2,
  },
  changePasswordButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#1A1A1A",
    borderRadius: 8,
  },
  changePasswordText: {
    fontSize: 14,
    color: "#FFFFFF",
    marginLeft: 8,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  searchInput: {
    backgroundColor: "#1A1A1A",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#FFFFFF",
  },
  searchInputFocused: {
    borderColor: "#ccc",
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 14,
    color: "#888888",
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 40,
  },
  appItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    marginRight: 16,
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
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 16,
  },
  appIconDisabled: {
    opacity: 0.4,
  },
  appLabel: {
    fontSize: 18,
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
    fontSize: 16,
    color: "#666666",
  },
  passwordContainer: {
    padding: 24,
  },
  passwordLabel: {
    fontSize: 14,
    color: "#888888",
    marginBottom: 8,
    marginTop: 16,
  },
  passwordInput: {
    backgroundColor: "#1A1A1A",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#FFFFFF",
  },
  passwordInputFocused: {
    borderColor: "#ccc",
    borderWidth: 1,
  },
  saveButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 32,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  scrollContainer: {
    flex: 1,
  },
  appsList: {
    paddingBottom: 20,
  },
});
