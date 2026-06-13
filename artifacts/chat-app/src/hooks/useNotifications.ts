import { useState, useEffect } from "react";
import { useAppContext } from "@/contexts/AppContext";
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  subscribeToNotifications,
} from "@/services/appwrite";

export function useNotifications() {
  const { currentUser } = useAppContext();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.userId) {
      setLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      try {
        const [data, count] = await Promise.all([
          getNotifications(currentUser.userId),
          getUnreadNotificationCount(currentUser.userId),
        ]);
        setNotifications(data);
        setUnreadCount(count);
      } catch (err) {
        console.error("通知取得に失敗", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    const unsubscribe = subscribeToNotifications(currentUser.userId, (event) => {
      const eventType = event.events[0] || "";
      const payload = event.payload;

      if (eventType.includes(".create")) {
        setNotifications((prev) => [payload, ...prev]);
        if (!payload.isRead) {
          setUnreadCount((prev) => prev + 1);
        }
      } else if (eventType.includes(".update")) {
        setNotifications((prev) =>
          prev.map((n) => (n.$id === payload.$id ? payload : n))
        );
        if (payload.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      } else if (eventType.includes(".delete")) {
        setNotifications((prev) => prev.filter((n) => n.$id !== payload.$id));
      }
    });

    return () => unsubscribe();
  }, [currentUser?.userId]);

  const markAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.$id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("通知既読化に失敗", err);
    }
  };

  const markAllRead = async () => {
    try {
      await markAllNotificationsAsRead(currentUser!.userId, notifications);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error("全通知既読化に失敗", err);
    }
  };

  return { notifications, unreadCount, loading, markAsRead, markAllRead };
}
