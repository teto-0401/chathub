import { useEffect, useState } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { findUserById } from "@/services/appwrite";
import { useChats } from "@/hooks/useChats";

export function RightPanel() {
  const { activeChatId, currentUser } = useAppContext();
  const { chats } = useChats();
  const [members, setMembers] = useState<any[]>([]);

  const activeChat = chats.find(c => c.$id === activeChatId);

  useEffect(() => {
    if (!activeChat?.memberIds?.length) {
      setMembers([]);
      return;
    }
    Promise.all(
      activeChat.memberIds.map((uid: string) => findUserById(uid))
    ).then(results => {
      setMembers(results.filter(Boolean));
    }).catch(() => {});
  }, [activeChat]);

  if (!activeChatId || !activeChat) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="h-14 border-b border-border flex items-center px-4 shrink-0">
          <h3 className="font-medium text-sm text-foreground">詳細</h3>
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
          チャットを選択すると詳細が表示されます
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="h-14 border-b border-border flex items-center px-4 shrink-0">
        <h3 className="font-medium text-sm text-foreground">
          {activeChat.type === "group" ? "グループ詳細" : "ユーザー情報"}
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeChat.type === "group" && activeChat.name && (
          <div className="flex flex-col items-center mb-6 gap-2">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
              {activeChat.name.substring(0, 2).toUpperCase()}
            </div>
            <p className="font-semibold text-foreground">{activeChat.name}</p>
          </div>
        )}

        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          メンバー {members.length > 0 ? `(${members.length})` : ""}
        </p>

        <div className="space-y-2">
          {members.length === 0 ? (
            <div className="space-y-2">
              {activeChat.memberIds?.map((uid: string) => (
                <div key={uid} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs bg-secondary">{uid.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground font-mono truncate">{uid}</p>
                    {uid === currentUser?.userId && <p className="text-[10px] text-primary">あなた</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            members.map(user => (
              <div key={user.userId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-xs bg-secondary">
                    {user.nickname?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{user.nickname}</p>
                  <p className="text-[10px] text-muted-foreground font-mono truncate">{user.userId}</p>
                  {user.userId === currentUser?.userId && <p className="text-[10px] text-primary">あなた</p>}
                </div>
                <div className={`w-2 h-2 rounded-full shrink-0 ${user.isOnline ? "bg-green-400" : "bg-gray-400"}`} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
