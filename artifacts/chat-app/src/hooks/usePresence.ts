import { useState, useEffect } from "react";
import { subscribeToChats } from "@/services/appwrite";

export function usePresence(userId: string) {
  // In a full implementation, we might subscribe to user presence. 
  // For now, this is a placeholder hook that just assumes the user is online.
  const [isOnline, setIsOnline] = useState(true);
  
  return { isOnline };
}
