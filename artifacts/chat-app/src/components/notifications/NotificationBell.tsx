import { useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { useAppContext } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell, BellDot, MessageSquare, UserPlus, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";

const TYPE_ICON: Record<string, React.ReactNode> = {
  message: <MessageSquare className="w-4 h-4 text-primary" />,
  friend_request: <UserPlus className="w-4 h-4 text-amber-400" />,
  friend_accepted: <Check className="w-4 h-4 text-green-400" />,
};

const TYPE_LABEL: Record<string, string> = {
  message: "新着メッセージ",
  friend_request: "友達申請",
  friend_accepted: "友達承認",
};

export function NotificationBell() {
  const { currentUser, setActiveChatId } = useAppContext();
  const { notifications, unreadCount, loading, markAsRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);

  if (!currentUser) return null;

  const handleNotificationClick = (n: any) => {
    if (!n.isRead) markAsRead(n.$id);
    if (n.chatId) setActiveChatId(n.chatId);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-sidebar-foreground hover:bg-sidebar-accent">
          {unreadCount > 0 ? (
            <BellDot className="w-5 h-5" />
          ) : (
            <Bell className="w-5 h-5" />
          )}
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-sidebar">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <h3 className="font-semibold text-sm text-foreground">通知</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground" onClick={markAllRead}>
              全て既読
            </Button>
          )}
        </div>
        <ScrollArea className="h-64">
          {loading && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              読み込み中...
            </div>
          )}
          {!loading && notifications.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              通知はありません
            </div>
          )}
          <div className="divide-y divide-border">
            {notifications.map((n) => (
              <button
                key={n.$id}
                className={`w-full text-left flex items-start gap-3 p-3 transition-colors hover:bg-secondary/50 ${
                  !n.isRead ? "bg-primary/5" : ""
                }`}
                onClick={() => handleNotificationClick(n)}
              >
                <div className="mt-0.5 shrink-0">{TYPE_ICON[n.type] || <Bell className="w-4 h-4" />}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {n.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {n.body}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: ja })}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      {TYPE_LABEL[n.type] || n.type}
                    </span>
                  </div>
                </div>
                {!n.isRead && (
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
