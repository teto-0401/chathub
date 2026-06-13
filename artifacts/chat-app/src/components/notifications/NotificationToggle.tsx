import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, BellDot } from "lucide-react";
import {
  requestNotificationPermission,
  getNotificationStatus,
  hasEnabledNotifications,
  setNotificationEnabled,
} from "@/services/notification";

export function NotificationToggle() {
  const [status, setStatus] = useState<"granted" | "denied" | "default" | "unsupported">("default");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const s = getNotificationStatus();
    const e = hasEnabledNotifications();
    setStatus(s);
    setEnabled(e);
  }, []);

  const handleClick = async () => {
    const currentStatus = getNotificationStatus();
    if (currentStatus === "unsupported") return;

    if (currentStatus === "denied") {
      // Permission was denied, can't change from browser
      alert("通知権限が拒否されています。ブラウザの設定から通知を有効化してください。");
      return;
    }

    if (enabled) {
      // Disable
      setNotificationEnabled(false);
      setEnabled(false);
      return;
    }

    // Enable: request permission
    const granted = await requestNotificationPermission();
    setStatus(getNotificationStatus());
    setEnabled(granted);
  };

  const icon =
    status === "unsupported" ? (
      <BellOff className="w-5 h-5 text-muted-foreground" />
    ) : status === "denied" ? (
      <BellOff className="w-5 h-5 text-red-400" />
    ) : enabled ? (
      <BellDot className="w-5 h-5 text-primary" />
    ) : (
      <Bell className="w-5 h-5 text-muted-foreground" />
    );

  const title =
    status === "unsupported"
      ? "ブラウザ通知に非対応"
      : status === "denied"
      ? "通知権限が拒否されています"
      : enabled
      ? "ブラウザ通知有効"
      : "ブラウザ通知を有効化";

  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-sidebar-foreground hover:bg-sidebar-accent"
      onClick={handleClick}
      title={title}
      disabled={status === "unsupported"}
    >
      {icon}
    </Button>
  );
}
