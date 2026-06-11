import { useAppContext } from "@/contexts/AppContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, MoreVertical } from "lucide-react";
import { getOrCreateDirectChat } from "@/services/appwrite";
import { useToast } from "@/hooks/use-toast";

export function FriendItem({ friend }: { friend: any }) {
  const { currentUser, setActiveChatId } = useAppContext();
  const { toast } = useToast();

  const isSentByMe = friend.userId === currentUser?.userId;
  const targetUserId = isSentByMe ? friend.friendId : friend.userId;
  // In a real app we'd fetch the actual user doc of the friend to get their nickname and avatar.
  // For now we just display the ID.
  const displayName = targetUserId;
  const fallback = displayName.substring(0, 2).toUpperCase();

  const handleMessage = async () => {
    if (!currentUser) return;
    try {
      const chat = await getOrCreateDirectChat(currentUser.userId, targetUserId);
      setActiveChatId(chat.$id);
    } catch (err) {
      toast({ title: "Failed to open chat", variant: "destructive" });
    }
  };

  return (
    <div className="w-full flex items-center gap-3 p-2 rounded-md transition-colors hover:bg-sidebar-accent/50 group">
      <Avatar className="w-10 h-10 border border-sidebar-border shrink-0">
        <AvatarFallback className="bg-sidebar-border text-sidebar-foreground">
          {fallback}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <span className="text-sm font-medium text-sidebar-foreground truncate">{displayName}</span>
        <span className="text-[10px] text-sidebar-foreground/50 capitalize">{friend.status}</span>
      </div>

      {friend.status === "accepted" && (
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="w-8 h-8 text-sidebar-foreground hover:bg-sidebar-accent" onClick={handleMessage}>
            <MessageSquare className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
