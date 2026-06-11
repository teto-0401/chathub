import { useEffect, useRef } from "react";
import { useMessages } from "@/hooks/useMessages";
import { MessageItem } from "./MessageItem";
import { ScrollArea } from "@/components/ui/scroll-area";

export function MessageList({ chatId }: { chatId: string }) {
  const { messages, loading } = useMessages(chatId);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-background">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
        トークの始まりです。
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-y-auto p-4 flex flex-col gap-4" ref={scrollRef}>
      {messages.map((msg, index) => {
        const prevMsg = index > 0 ? messages[index - 1] : null;
        const isConsecutive = prevMsg && prevMsg.senderId === msg.senderId && 
          new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() < 5 * 60000;
          
        return (
          <MessageItem 
            key={msg.$id} 
            message={msg} 
            isConsecutive={!!isConsecutive} 
          />
        );
      })}
    </div>
  );
}
