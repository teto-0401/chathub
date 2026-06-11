import { useAppContext } from "@/contexts/AppContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

export function ChatItem({ chat }: { chat: any }) {
  const { activeChatId, setActiveChatId, currentUser } = useAppContext();
  const isActive = activeChatId === chat.$id;

  // Derive chat name/avatar for DMs vs Groups
  let chatName = chat.name || "チャット";
  let fallback = chatName.substring(0, 2).toUpperCase();
  
  if (chat.type === "direct") {
    chatName = "ダイレクトメッセージ";
    fallback = "DM";
  }

  const timeStr = chat.lastMessageAt 
    ? formatDistanceToNow(new Date(chat.lastMessageAt), { addSuffix: true })
    : "";

  return (
    <button
      onClick={() => setActiveChatId(chat.$id)}
      className={`w-full flex items-center gap-3 p-2 rounded-md transition-colors text-left ${
        isActive ? "bg-sidebar-accent" : "hover:bg-sidebar-accent/50"
      }`}
    >
      <Avatar className="w-10 h-10 border border-sidebar-border shrink-0">
        <AvatarImage src={chat.avatarUrl} />
        <AvatarFallback className={chat.type === "group" ? "bg-primary/20 text-primary" : "bg-sidebar-border text-sidebar-foreground"}>
          {fallback}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex justify-between items-baseline mb-0.5">
          <span className="text-sm font-medium text-sidebar-foreground truncate">{chatName}</span>
          {timeStr && <span className="text-[10px] text-sidebar-foreground/50 shrink-0 ml-2">{timeStr}</span>}
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-sidebar-foreground/70 truncate">
            {chat.lastMessage || "メッセージはまだありません"}
          </span>
          {/* Example unread badge */}
          {/* <div className="w-2 h-2 rounded-full bg-primary shrink-0 ml-2" /> */}
        </div>
      </div>
    </button>
  );
}
