import { NativeModules, NativeEventEmitter, Platform } from "react-native";

const { NotificationModule } = NativeModules;

type NotificationCounts = Record<string, number>;
type NotificationListener = (counts: NotificationCounts) => void;

let eventEmitter: NativeEventEmitter | null = null;
let listeners: NotificationListener[] = [];

function getEventEmitter(): NativeEventEmitter | null {
  if (Platform.OS !== "android" || !NotificationModule) {
    return null;
  }
  if (!eventEmitter) {
    eventEmitter = new NativeEventEmitter(NotificationModule);
  }
  return eventEmitter;
}

export function isNotificationAccessEnabled(): Promise<boolean> {
  if (Platform.OS !== "android" || !NotificationModule) {
    return Promise.resolve(false);
  }
  return NotificationModule.isNotificationAccessEnabled();
}

export function openNotificationAccessSettings(): Promise<boolean> {
  if (Platform.OS !== "android" || !NotificationModule) {
    return Promise.resolve(false);
  }
  return NotificationModule.openNotificationAccessSettings();
}

export function getNotificationCounts(): Promise<NotificationCounts> {
  if (Platform.OS !== "android" || !NotificationModule) {
    return Promise.resolve({});
  }
  return NotificationModule.getNotificationCounts();
}

export function refreshNotifications(): Promise<boolean> {
  if (Platform.OS !== "android" || !NotificationModule) {
    return Promise.resolve(false);
  }
  return NotificationModule.refreshNotifications();
}

export function addNotificationListener(
  callback: NotificationListener,
): () => void {
  const emitter = getEventEmitter();
  if (!emitter) {
    return () => {};
  }

  listeners.push(callback);

  const subscription = emitter.addListener(
    "onNotificationCountsChanged",
    (counts: NotificationCounts) => {
      listeners.forEach((listener) => listener(counts));
    },
  );

  return () => {
    subscription.remove();
    listeners = listeners.filter((l) => l !== callback);
  };
}
