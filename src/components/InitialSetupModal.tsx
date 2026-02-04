import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { InstalledApp } from "../types";

type InitialSetupModalProps = {
  visible: boolean;
  apps: InstalledApp[];
  onComplete: (selectedApps: InstalledApp[]) => void;
};

const MAX_SELECTION = 10;

export const InitialSetupModal = ({
  visible,
  apps,
  onComplete,
}: InitialSetupModalProps) => {
  const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const filteredApps = useMemo(() => {
    if (!searchQuery.trim()) return apps;
    const query = searchQuery.toLowerCase();
    return apps.filter((app) => app.label.toLowerCase().includes(query));
  }, [apps, searchQuery]);

  function handleToggleApp(packageName: string) {
    const newSelected = new Set(selectedApps);

    if (newSelected.has(packageName)) {
      newSelected.delete(packageName);
    } else {
      if (newSelected.size >= MAX_SELECTION) return;
      newSelected.add(packageName);
    }

    setSelectedApps(newSelected);
  }

  function handleConfirm() {
    const selected = apps.filter((app) => selectedApps.has(app.packageName));
    onComplete(selected);
  }

  function renderItem({ item }: { item: InstalledApp }) {
    const isSelected = selectedApps.has(item.packageName);
    const isDisabled = !isSelected && selectedApps.size >= MAX_SELECTION;

    return (
      <TouchableOpacity
        style={[styles.appItem, isDisabled && styles.appItemDisabled]}
        onPress={() => handleToggleApp(item.packageName)}
        activeOpacity={0.7}
        disabled={isDisabled}
      >
        <View style={styles.checkbox}>
          {isSelected && (
            <Ionicons name="checkmark" size={18} color="#FFFFFF" />
          )}
        </View>
        {item.icon && (
          <Image
            source={{ uri: `data:image/png;base64,${item.icon}` }}
            style={styles.appIcon}
          />
        )}
        <Text
          style={[styles.appLabel, isDisabled && styles.appLabelDisabled]}
          numberOfLines={1}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <Modal visible={visible} animationType="fade" transparent={false}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Choose your favorite apps</Text>
          <Text style={styles.subtitle}>
            Select up to {MAX_SELECTION} apps ({selectedApps.size}/
            {MAX_SELECTION})
          </Text>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
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

        <FlatList
          data={filteredApps}
          renderItem={renderItem}
          keyExtractor={(item) => item.packageName}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.confirmButton,
              selectedApps.size < 3 && styles.confirmButtonDisabled,
            ]}
            onPress={handleConfirm}
            disabled={selectedApps.size < 3}
            activeOpacity={0.7}
          >
            <Text style={styles.confirmButtonText}>
              {selectedApps.size < 3
                ? "Select at least 3 apps"
                : `Confirm (${selectedApps.size})`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
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
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  appItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  appItemDisabled: {
    opacity: 0.4,
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
  appIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 16,
  },
  appLabel: {
    fontSize: 18,
    color: "#FFFFFF",
    flex: 1,
  },
  appLabelDisabled: {
    color: "#666666",
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingBottom: 40,
  },
  confirmButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
  },
  confirmButtonDisabled: {
    backgroundColor: "#333333",
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
});
