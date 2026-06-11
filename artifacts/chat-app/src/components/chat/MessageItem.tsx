import { useAppContext } from "@/contexts/AppContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { getFilePreviewUrl } from "@/services/appwrite/storage";

export function MessageItem({ message, isConsecutive }: { message: any, isConsecutive: boolean }) {
  const { currentUser } = useAppContext();
  const isMine = message.senderId === currentUser?.userId;

  const timeStr = format(new Date(message.createdAt), "HH:mm");

  return (
    <div className={`flex gap-3 max-w-[85%] ${isMine ? "ml-auto flex-row-reverse" : ""}`}>
      {!isMine && (
        <div className="w-8 shrink-0 flex flex-col items-center">
          {!isConsecutive && (
            <Avatar className="w-8 h-8">
              <AvatarFallback className="text-[10px] bg-secondary text-secondary-foreground">
                {message.senderName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      )}
      
      <div className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
        {!isConsecutive && !isMine && (
          <span className="text-xs text-muted-foreground mb-1 ml-1 font-medium">{message.senderName}</span>
        )}
        
        <div className="flex items-end gap-2 group">
          {isMine && <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity pb-1">{timeStr}</span>}
          
          <div className={`px-3 py-2 rounded-2xl text-sm ${
            isMine 
              ? "bg-primary text-primary-foreground rounded-tr-sm" 
              : "bg-secondary text-secondary-foreground rounded-tl-sm"
          }`}>
            {message.type === "image" && message.fileId ? (
              <img 
                src={getFilePreviewUrl(message.fileId)} 
                alt="添付ファイル" 
                className="max-w-[200px] rounded-md mb-2"
              />
            ) : message.type === "file" && message.fileName ? (
              <div className="flex items-center gap-2 bg-background/20 p-2 rounded-md mb-2">
                <div className="text-xs underline">{message.fileName}</div>
              </div>
            ) : null}
            
            {message.content && (
              <div className="break-words whitespace-pre-wrap">{message.content}</div>
            )}
          </div>
          
          {!isMine && <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity pb-1">{timeStr}</span>}
        </div>
      </div>
    </div>
  );
}
