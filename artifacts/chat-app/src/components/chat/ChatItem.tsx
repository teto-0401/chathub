import { useState, useEffect } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { findUserById } from "@/services/appwrite";

export function ChatItem({ chat }: { chat: any }) {
  const { activeChatId, setActiveChatId, currentUser } = useAppContext();
  const isActive = activeChatId === chat.$id;
  const [otherNickname, setOtherNickname] = useState<string | null>(null);

  useEffect(() => {
    if (chat.type === "direct" && currentUser) {
      const otherId = chat.memberIds?.find((id: string) => id !== currentUser.userId);
      if (otherId) {
        findUserById(otherId).then(user => {
          if (user?.nickname) setOtherNickname(user.nickname);
        }).catch(() => {});
      }
    }
  }, [chat, currentUser]);

  let chatName = chat.name || "グループチャット";
  let fallback = chatName.substring(0, 2).toUpperCase();

  if (chat.type === "direct") {
    chatName = otherNickname || (chat.memberIds?.find((id: string) => id !== currentUser?.userId) || "DM");
    fallback = chatName.substring(0, 2).toUpperCase();
  }

  const timeStr = chat.createdAt
    ? formatDistanceToNow(new Date(chat.createdAt), { addSuffix: true, locale: ja })
    : "";

  return (
    <button
      onClick={() => setActiveChatId(chat.$id)}
      className={`w-full flex items-center gap-3 p-2 rounded-md transition-colors text-left ${
        isActive ? "bg-sidebar-accent" : "hover:bg-sidebar-accent/50"
      }`}
    >
      <Avatar className="w-10 h-10 border border-sidebar-border shrink-0">
        <AvatarFallback className={chat.type === "group" ? "bg-primary/20 text-primary text-sm" : "bg-sidebar-border text-sidebar-foreground text-sm"}>
          {fallback}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex justify-between items-baseline mb-0.5">
          <span className="text-sm font-medium text-sidebar-foreground truncate">{chatName}</span>
          {timeStr && <span className="text-[10px] text-sidebar-foreground/50 shrink-0 ml-2">{timeStr}</span>}
        </div>
        <span className="text-xs text-sidebar-foreground/60 truncate">
          {chat.type === "group" ? "グループ" : "ダイレクトメッセージ"}
        </span>
      </div>
    </button>
  );
}
