import { useAppContext } from "@/contexts/AppContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Sidebar } from "@/components/layout/Sidebar";
import { ChatArea } from "@/components/layout/ChatArea";
import { RightPanel } from "@/components/layout/RightPanel";
import { useBrowserNotifications } from "@/hooks/useBrowserNotifications";

export default function ChatPage() {
  const { currentUser, isLoading } = useAppContext();
  useBrowserNotifications();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Usually handled by App.tsx routing, but double-check here just in case
  if (!currentUser) {
    return null; 
  }

  return (
    <AppLayout 
      sidebar={<Sidebar />}
      chatArea={<ChatArea />}
      rightPanel={<RightPanel />}
    />
  );
}
