import { useState, useEffect } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { findUserById } from "@/services/appwrite";
import { useChats } from "@/hooks/useChats";

export function ChatArea() {
  const { activeChatId, currentUser } = useAppContext();
  const { chats } = useChats();
  const [chatName, setChatName] = useState<string>("");

  const activeChat = chats.find(c => c.$id === activeChatId);

  useEffect(() => {
    if (!activeChat || !currentUser) {
      setChatName("");
      return;
    }
    if (activeChat.type === "group") {
      setChatName(activeChat.name || "グループチャット");
      return;
    }
    const otherId = activeChat.memberIds?.find((id: string) => id !== currentUser.userId);
    if (otherId) {
      findUserById(otherId).then(user => {
        setChatName(user?.nickname || otherId);
      }).catch(() => {
        setChatName(otherId);
      });
    }
  }, [activeChat, currentUser]);

  if (!activeChatId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background/50">
        <div className="text-center text-muted-foreground flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
            <svg className="w-10 h-10 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-foreground mb-1">チャットを選択してください</p>
            <p className="text-sm">友達タブから友達を追加してトークを始めよう</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="h-14 border-b border-border bg-card/50 backdrop-blur flex items-center px-6 shrink-0">
        <div className="flex flex-col">
          <h2 className="font-semibold text-foreground leading-tight">{chatName}</h2>
          {activeChat?.type === "group" && (
            <span className="text-xs text-muted-foreground">{activeChat.memberIds?.length || 0}人のメンバー</span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <MessageList chatId={activeChatId} />
      </div>

      <div className="p-4 bg-background shrink-0">
        <MessageInput chatId={activeChatId} />
      </div>
    </div>
  );
}
