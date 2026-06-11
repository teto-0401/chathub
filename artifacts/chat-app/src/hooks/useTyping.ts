import { useState, useEffect } from "react";
// Placeholder for typing status
export function useTyping(chatId: string | null) {
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  
  return { typingUsers };
}
