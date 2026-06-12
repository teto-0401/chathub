// @refresh reset
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { client } from "@/services/appwrite/client";
import { ensureAnonymousSession } from "@/services/appwrite/auth";
import { findUserById, updatePresence } from "@/services/appwrite/database";
import { getOrCreateUserId } from "@/lib/userId";

interface CurrentUser {
  userId: string;
  nickname: string;
  avatarUrl?: string;
  appwriteId?: string;
}

interface AppContextValue {
  currentUser: CurrentUser | null;
  setCurrentUser: (user: CurrentUser | null) => void;
  isLoading: boolean;
  theme: "light" | "dark";
  toggleTheme: () => void;
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  useEffect(() => {
    // Theme setup
    const savedTheme = localStorage.getItem("chat_theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
    }
    
    // Auth & Init
    const init = async () => {
      try {
        // Ping the Appwrite backend to verify the setup
        client.ping();
        await ensureAnonymousSession();
        const storedId = getOrCreateUserId();
        const userDoc = await findUserById(storedId);
        
        if (userDoc) {
          setCurrentUser({
            userId: userDoc.userId,
            nickname: userDoc.nickname,
            avatarUrl: userDoc.avatarUrl,
            appwriteId: userDoc.$id
          });
          
          await updatePresence(userDoc.$id, true);
        }
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    init();
    
    // Handle unmount presence
    return () => {
      if (currentUser?.appwriteId) {
        updatePresence(currentUser.appwriteId, false).catch(console.error);
      }
    };
  }, []);

  // Update theme class
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("chat_theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === "dark" ? "light" : "dark");

  const value = {
    currentUser,
    setCurrentUser,
    isLoading,
    theme,
    toggleTheme,
    activeChatId,
    setActiveChatId
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
