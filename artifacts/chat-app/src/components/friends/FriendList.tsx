import { useFriends } from "@/hooks/useFriends";
import { FriendItem } from "./FriendItem";
import { AddFriend } from "./AddFriend";

export function FriendList() {
  const { friends, loading, setFriends } = useFriends();

  const refreshFriends = async () => {
    const { currentUser } = await import("@/contexts/AppContext").then(m => m.useAppContext());
    if (currentUser?.userId) {
      const { getFriends } = await import("@/services/appwrite");
      const data = await getFriends(currentUser.userId);
      setFriends(data);
    }
  };

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sidebar-border animate-pulse" />
            <div className="h-3 w-1/2 bg-sidebar-border rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-sidebar-border flex justify-between items-center shrink-0">
        <span className="text-sm font-medium text-sidebar-foreground">友達</span>
        <AddFriend />
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {friends.length === 0 ? (
          <div className="p-4 text-center text-sm text-sidebar-foreground/50">
            友達はまだいません。追加しよう！
          </div>
        ) : (
          friends.map(friend => (
            <FriendItem key={friend.$id} friend={friend} onUpdate={refreshFriends} />
          ))
        )}
      </div>
    </div>
  );
}
