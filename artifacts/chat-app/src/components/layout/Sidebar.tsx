import { useState } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useChats } from "@/hooks/useChats";
import { Settings, Users, MessageSquare } from "lucide-react";
import { ChatList } from "@/components/chat/ChatList";
import { FriendList } from "@/components/friends/FriendList";

export function Sidebar() {
  const { currentUser } = useAppContext();
  const { chats, loading: chatsLoading } = useChats();
  const [activeTab, setActiveTab] = useState("chats");

  if (!currentUser) return null;

  return (
    <>
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        <h1 className="font-bold text-lg text-sidebar-primary tracking-tight">ChatHub</h1>
        <Button variant="ghost" size="icon" className="text-sidebar-foreground">
          <Settings className="w-5 h-5" />
        </Button>
      </div>

      <div className="px-4 py-2">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-2 bg-sidebar-accent">
            <TabsTrigger value="chats" className="data-[state=active]:bg-sidebar text-xs py-1.5">
              <MessageSquare className="w-4 h-4 mr-2" />
              Chats
            </TabsTrigger>
            <TabsTrigger value="friends" className="data-[state=active]:bg-sidebar text-xs py-1.5">
              <Users className="w-4 h-4 mr-2" />
              Friends
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ScrollArea className="flex-1 px-2">
        {activeTab === "chats" && (
          <ChatList chats={chats} isLoading={chatsLoading} />
        )}
        {activeTab === "friends" && (
          <FriendList />
        )}
      </ScrollArea>

      <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/50 flex items-center gap-3">
        <Avatar className="w-10 h-10 border border-sidebar-border shadow-sm">
          <AvatarImage src={currentUser.avatarUrl} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {currentUser.nickname.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate text-sidebar-foreground">{currentUser.nickname}</p>
          <p className="text-xs text-sidebar-foreground/70 truncate">{currentUser.userId}</p>
        </div>
      </div>
    </>
  );
}
