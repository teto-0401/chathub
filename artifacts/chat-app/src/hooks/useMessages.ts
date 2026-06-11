import { useState, useEffect } from "react";
import { getMessages, subscribeToMessages } from "@/services/appwrite";

export function useMessages(chatId: string | null) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      return;
    }

    setLoading(true);
    const fetchMessages = async () => {
      try {
        const data = await getMessages(chatId);
        setMessages(data);
      } catch (err) {
        console.error("Failed to fetch messages", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    const unsubscribe = subscribeToMessages(chatId, (event) => {
      const payload = event.payload;
      const eventType = event.events[0]; // e.g. databases.*.documents.*.create
      
      setMessages(prev => {
        if (eventType.includes(".create")) {
          if (prev.find(m => m.$id === payload.$id)) return prev;
          return [...prev, payload];
        } else if (eventType.includes(".update")) {
          return prev.map(m => m.$id === payload.$id ? payload : m);
        } else if (eventType.includes(".delete")) {
          return prev.filter(m => m.$id !== payload.$id);
        }
        return prev;
      });
    });

    return () => unsubscribe();
  }, [chatId]);

  return { messages, setMessages, loading };
}
