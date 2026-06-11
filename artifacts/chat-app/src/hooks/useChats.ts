import { useState, useEffect } from "react";
import { getChats, subscribeToChats } from "@/services/appwrite";
import { useAppContext } from "@/contexts/AppContext";

export function useChats() {
  const { currentUser } = useAppContext();
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.userId) {
      setLoading(false);
      return;
    }

    const fetchChats = async () => {
      try {
        const data = await getChats(currentUser.userId);
        setChats(data);
      } catch (err) {
        console.error("チャット取得に失敗", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();

    const unsubscribe = subscribeToChats(currentUser.userId, (event) => {
      // In a real app we would check event types (create, update, delete)
      // and patch the state locally. For simplicity, we just refetch or simple patch.
      fetchChats(); 
    });

    return () => unsubscribe();
  }, [currentUser?.userId]);

  return { chats, loading, setChats };
}
