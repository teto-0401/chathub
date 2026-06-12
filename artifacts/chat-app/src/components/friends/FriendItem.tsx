import { useState, useEffect } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, Check, X } from "lucide-react";
import { getOrCreateDirectChat, acceptFriendRequest, rejectFriendRequest, findUserById } from "@/services/appwrite";
import { useToast } from "@/hooks/use-toast";

export function FriendItem({ friend, onUpdate }: { friend: any; onUpdate?: () => void }) {
  const { currentUser, setActiveChatId } = useAppContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [nickname, setNickname] = useState<string | null>(null);

  const isSentByMe = friend.userId === currentUser?.userId;
  const targetUserId = isSentByMe ? friend.friendId : friend.userId;

  useEffect(() => {
    findUserById(targetUserId).then(user => {
      if (user?.nickname) setNickname(user.nickname);
    }).catch(() => {});
  }, [targetUserId]);

  const displayName = nickname || targetUserId;
  const fallback = displayName.substring(0, 2).toUpperCase();

  const handleMessage = async () => {
    if (!currentUser) return;
    try {
      const chat = await getOrCreateDirectChat(currentUser.userId, targetUserId);
      setActiveChatId(chat.$id);
    } catch (err) {
      toast({ title: "チャットの開設に失敗しました", variant: "destructive" });
    }
  };

  const handleAccept = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      await acceptFriendRequest(friend.$id);
      toast({ title: "友達申請を承認しました" });
      onUpdate?.();
    } catch (err) {
      toast({ title: "承認に失敗しました", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      await rejectFriendRequest(friend.$id);
      toast({ title: "友達申請を拒否しました" });
      onUpdate?.();
    } catch (err) {
      toast({ title: "拒否に失敗しました", variant: "destructive" });
    } finally {
      setLoading(false);
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
        {nickname && (
          <span className="text-[10px] text-sidebar-foreground/40 font-mono truncate">{targetUserId}</span>
        )}
        <span className="text-[10px] text-sidebar-foreground/50 capitalize">
          {friend.status === "accepted" ? "承認済み" : friend.status === "pending" ? "申請中" : friend.status}
        </span>
      </div>

      {friend.status === "pending" && !isSentByMe && (
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="w-8 h-8 text-green-400 hover:bg-green-400/20" onClick={handleAccept} disabled={loading}>
            <Check className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="w-8 h-8 text-red-400 hover:bg-red-400/20" onClick={handleReject} disabled={loading}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

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
