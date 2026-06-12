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
    setLoading(true);
    try {
      const chat = await getOrCreateDirectChat(currentUser.userId, targetUserId);
      setActiveChatId(chat.$id);
    } catch (err: any) {
      console.error("チャット開設エラー:", err);
      const msg = err?.response ? JSON.stringify(err.response) : (err?.message || "不明なエラー");
      toast({ title: "チャットの開設に失敗しました", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
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
        <AvatarFallback className="bg-sidebar-border text-sidebar-foreground text-sm">
          {fallback}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <span className="text-sm font-medium text-sidebar-foreground truncate">{displayName}</span>
        {nickname && (
          <span className="text-[10px] text-sidebar-foreground/40 font-mono truncate">{targetUserId}</span>
        )}
        <span className="text-[10px] text-sidebar-foreground/50">
          {friend.status === "accepted" ? "承認済み" : friend.status === "pending" ? (isSentByMe ? "申請中" : "申請が届いています") : friend.status}
        </span>
      </div>

      {friend.status === "pending" && !isSentByMe && (
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="w-8 h-8 text-green-400 hover:bg-green-400/20" onClick={handleAccept} disabled={loading} title="承認">
            <Check className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="w-8 h-8 text-red-400 hover:bg-red-400/20" onClick={handleReject} disabled={loading} title="拒否">
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {friend.status === "accepted" && (
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="w-8 h-8 text-sidebar-foreground hover:bg-sidebar-accent" onClick={handleMessage} disabled={loading} title="メッセージを送る">
            <MessageSquare className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
