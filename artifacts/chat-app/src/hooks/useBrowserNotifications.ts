import { useEffect, useCallback } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { useChats } from "@/hooks/useChats";
import { subscribeToMessages, subscribeToFriendRequests } from "@/services/appwrite";
import {
  showNotification,
  focusApp,
  hasEnabledNotifications,
} from "@/services/notification";

export function useBrowserNotifications() {
  const { currentUser, activeChatId, setActiveChatId } = useAppContext();
  const { chats } = useChats();

  const getChatName = useCallback(
    (chatId: string) => {
      const chat = chats.find((c) => c.$id === chatId);
      if (!chat) return "チャット";
      if (chat.type === "group") return chat.name || "グループチャット";
      const otherId = chat.memberIds?.find(
        (id: string) => id !== currentUser?.userId
      );
      return otherId || "ダイレクトメッセージ";
    },
    [chats, currentUser]
  );

  useEffect(() => {
    if (!currentUser?.userId || !hasEnabledNotifications()) return;

    const unsubMessages = subscribeToMessages(null, (event) => {
      const payload = event.payload;
      if (!payload) return;

      const eventType = event.events?.[0] || "";
      // Only notify on new messages, not updates
      if (!eventType.includes(".create")) return;
      // Don't notify for own messages
      if (payload.senderId === currentUser.userId) return;
      // Don't notify if the chat is currently active and visible
      if (payload.chatId === activeChatId && !document.hidden) return;

      const chatName = getChatName(payload.chatId);
      const senderName = payload.senderName || "Unknown";
      const body =
        payload.type === "text"
          ? payload.content
          : payload.type === "image"
          ? "画像が送信されました"
          : payload.type === "file"
          ? `ファイル: ${payload.fileName || payload.content}`
          : "新しいメッセージ";

      showNotification(senderName, {
        body,
        tag: `msg-${payload.chatId}`,
        data: { chatId: payload.chatId },
        onClick: () => {
          focusApp();
          setActiveChatId(payload.chatId);
        },
      });
    });

    const unsubFriends = subscribeToFriendRequests(
      currentUser.userId,
      (event) => {
        const payload = event.payload;
        if (!payload) return;

        const eventType = event.events?.[0] || "";
        if (!eventType.includes(".create")) return;

        // Only notify if the friend request is received (not sent)
        if (payload.friendId === currentUser.userId) {
          showNotification("友達申請", {
            body: `${payload.userId} から友達申請が届きました`,
            tag: `friend-${payload.$id}`,
            onClick: () => {
              focusApp();
            },
          });
        }
      }
    );

    return () => {
      unsubMessages();
      unsubFriends();
    };
  }, [currentUser?.userId, activeChatId, setActiveChatId, getChatName]);
}
