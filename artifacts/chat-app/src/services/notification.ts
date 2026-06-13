import { useAppContext } from "@/contexts/AppContext";

// ── Browser Push Notification Service ──

const STORAGE_KEY = "chat_notification_enabled";

export function getNotificationStatus(): "granted" | "denied" | "default" | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission as "granted" | "denied" | "default";
}

export function hasEnabledNotifications(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "true" && Notification.permission === "granted";
}

export function setNotificationEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, enabled ? "true" : "false");
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }
  const result = await Notification.requestPermission();
  const granted = result === "granted";
  setNotificationEnabled(granted);
  return granted;
}

interface NotifyOptions {
  body?: string;
  icon?: string;
  tag?: string;
  data?: any;
  onClick?: (notification: Notification) => void;
}

export function showNotification(title: string, options: NotifyOptions = {}): Notification | null {
  if (typeof window === "undefined" || !hasEnabledNotifications()) return null;

  const notification = new Notification(title, {
    body: options.body,
    icon: options.icon || "/favicon.svg",
    tag: options.tag || "chathub",
    data: options.data,
    requireInteraction: false,
  });

  if (options.onClick) {
    notification.onclick = () => {
      options.onClick?.(notification);
      notification.close();
    };
  }

  // Auto close after 5 seconds
  setTimeout(() => notification.close(), 5000);

  return notification;
}

// Focus the app window when notification is clicked
export function focusApp() {
  if (typeof window === "undefined") return;
  window.focus();
  // Try to bring the window to the front
  if (window.parent && window.parent !== window) {
    window.parent.focus();
  }
}
