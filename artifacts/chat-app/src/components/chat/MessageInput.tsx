import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Send, Image as ImageIcon, Paperclip, Smile } from "lucide-react";
import { sendMessage, uploadFile } from "@/services/appwrite";
import { useAppContext } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";

export function MessageInput({ chatId }: { chatId: string }) {
  const { currentUser } = useAppContext();
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);

  const handleSend = async () => {
    if (!content.trim() || !currentUser) return;
    setIsSending(true);
    try {
      await sendMessage(
        chatId, 
        currentUser.userId, 
        currentUser.nickname, 
        content.trim(), 
        "text"
      );
      setContent("");
    } catch (err) {
      toast({ title: "Failed to send", variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "file") => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    
    setIsSending(true);
    try {
      const fileId = await uploadFile(file);
      await sendMessage(
        chatId,
        currentUser.userId,
        currentUser.nickname,
        file.name,
        type,
        undefined,
        fileId,
        file.name
      );
    } catch (err) {
      toast({ title: "Failed to upload file", variant: "destructive" });
    } finally {
      setIsSending(false);
      if (e.target) e.target.value = "";
    }
  };

  return (
    <div className="flex items-end gap-2 bg-card rounded-xl p-2 border border-border shadow-sm">
      <div className="flex items-center gap-1 shrink-0 pb-1">
        <input 
          type="file" 
          ref={imgInputRef} 
          accept="image/*" 
          className="hidden" 
          onChange={(e) => handleFileUpload(e, "image")}
        />
        <Button 
          variant="ghost" 
          size="icon" 
          className="w-8 h-8 text-muted-foreground hover:text-foreground"
          onClick={() => imgInputRef.current?.click()}
          disabled={isSending}
        >
          <ImageIcon className="w-5 h-5" />
        </Button>

        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={(e) => handleFileUpload(e, "file")}
        />
        <Button 
          variant="ghost" 
          size="icon" 
          className="w-8 h-8 text-muted-foreground hover:text-foreground"
          onClick={() => fileInputRef.current?.click()}
          disabled={isSending}
        >
          <Paperclip className="w-5 h-5" />
        </Button>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        className="flex-1 bg-transparent border-0 resize-none outline-none py-2 text-sm text-foreground placeholder:text-muted-foreground min-h-[40px] max-h-[120px]"
        rows={1}
        disabled={isSending}
      />

      <div className="flex items-center gap-1 shrink-0 pb-1">
        <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-foreground">
          <Smile className="w-5 h-5" />
        </Button>
        <Button 
          variant="default" 
          size="icon" 
          className="w-8 h-8 rounded-lg"
          onClick={handleSend}
          disabled={isSending || !content.trim()}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
