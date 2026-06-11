import { ChatItem } from "./ChatItem";

interface ChatListProps {
  chats: any[];
  isLoading: boolean;
}

export function ChatList({ chats, isLoading }: ChatListProps) {
  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sidebar-border animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/2 bg-sidebar-border rounded animate-pulse" />
              <div className="h-2 w-3/4 bg-sidebar-border rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-sidebar-foreground/50">
        チャットはまだありません。トークを始めよう！
      </div>
    );
  }

  return (
    <div className="space-y-0.5 mt-2">
      {chats.map(chat => (
        <ChatItem key={chat.$id} chat={chat} />
      ))}
    </div>
  );
}
