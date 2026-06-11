import { useState, useEffect } from "react";
import { getFriends, subscribeToFriendRequests } from "@/services/appwrite";
import { useAppContext } from "@/contexts/AppContext";

export function useFriends() {
  const { currentUser } = useAppContext();
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.userId) {
      setLoading(false);
      return;
    }

    const fetchFriends = async () => {
      try {
        const data = await getFriends(currentUser.userId);
        setFriends(data);
      } catch (err) {
        console.error("Failed to fetch friends", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();

    const unsubscribe = subscribeToFriendRequests(currentUser.userId, () => {
      fetchFriends();
    });

    return () => unsubscribe();
  }, [currentUser?.userId]);

  return { friends, loading, setFriends };
}
