import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppShortcut } from "../types";

type ContextMenuOption = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  destructive?: boolean;
};

type AppContextMenuProps = {
  visible: boolean;
  onClose: () => void;
  options: ContextMenuOption[];
  appName: string;
  shortcuts?: AppShortcut[];
  onShortcutPress?: (shortcut: AppShortcut) => void;
};

export const AppContextMenu = ({
  visible,
  onClose,
  options,
  appName,
  shortcuts = [],
  onShortcutPress,
}: AppContextMenuProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.menuContainer}>
              <Text style={styles.appName} numberOfLines={1}>
                {appName}
              </Text>
              <View style={styles.divider} />
              <ScrollView style={styles.scrollContainer} bounces={false}>
                {shortcuts.length > 0 && (
                  <>
                    {shortcuts.map((shortcut) => (
                      <TouchableOpacity
                        key={shortcut.id}
                        style={styles.menuItem}
                        onPress={() => {
                          onShortcutPress?.(shortcut);
                          onClose();
                        }}
                      >
                        {shortcut.icon ? (
                          <Image
                            source={{
                              uri: `data:image/png;base64,${shortcut.icon}`,
                            }}
                            style={styles.shortcutIcon}
                          />
                        ) : (
                          <Ionicons
                            name="arrow-forward-circle-outline"
                            size={20}
                            color="#FFFFFF"
                          />
                        )}
                        <Text style={styles.menuText} numberOfLines={1}>
                          {shortcut.longLabel || shortcut.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                    <View style={styles.divider} />
                  </>
                )}
                {options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.menuItem}
                    onPress={() => {
                      option.onPress();
                      onClose();
                    }}
                  >
                    <Ionicons
                      name={option.icon}
                      size={20}
                      color={option.destructive ? "#FF4444" : "#FFFFFF"}
                    />
                    <Text
                      style={[
                        styles.menuText,
                        option.destructive && styles.destructiveText,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuContainer: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    minWidth: 220,
    maxWidth: 300,
    maxHeight: "70%",
    paddingVertical: 8,
  },
  scrollContainer: {
    flexGrow: 0,
  },
  appName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#333333",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuText: {
    fontSize: 16,
    color: "#FFFFFF",
    marginLeft: 12,
    flex: 1,
  },
  destructiveText: {
    color: "#FF4444",
  },
  shortcutIcon: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
});
