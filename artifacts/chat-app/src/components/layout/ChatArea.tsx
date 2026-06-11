import { useAppContext } from "@/contexts/AppContext";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";

export function ChatArea() {
  const { activeChatId } = useAppContext();

  if (!activeChatId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background/50">
        <div className="text-center text-muted-foreground flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
            <div className="w-8 h-8 rounded-full bg-primary/20" />
          </div>
          <p>チャットや友達を選択してメッセージを始めよう</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-14 border-b border-border bg-card/50 backdrop-blur flex items-center px-6 sticky top-0 z-10 shrink-0">
        <h2 className="font-semibold text-foreground">チャット</h2>
      </div>
      
      <div className="flex-1 overflow-hidden relative">
        <MessageList chatId={activeChatId} />
      </div>

      <div className="p-4 bg-background shrink-0">
        <MessageInput chatId={activeChatId} />
      </div>
    </>
  );
}
