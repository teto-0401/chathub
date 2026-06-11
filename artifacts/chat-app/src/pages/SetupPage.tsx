import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrCreateUserId } from "@/lib/userId";
import { upsertUser, findUserById } from "@/services/appwrite";
import { useAppContext } from "@/contexts/AppContext";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SetupPage() {
  const [, setLocation] = useLocation();
  const { setCurrentUser } = useAppContext();
  const { toast } = useToast();
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const userId = getOrCreateUserId();

  const handleCopy = () => {
    navigator.clipboard.writeText(userId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim().length < 2) {
      toast({
        title: "Invalid nickname",
        description: "Nickname must be at least 2 characters.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const userDoc = await upsertUser(userId, nickname.trim());
      setCurrentUser({
        userId: userDoc.userId,
        nickname: userDoc.nickname,
        avatarUrl: userDoc.avatarUrl,
        appwriteId: userDoc.$id
      });
      setLocation("/");
    } catch (error) {
      console.error(error);
      toast({
        title: "Setup failed",
        description: "Failed to connect to Appwrite or save your profile. Ensure environment variables and DB collections are configured.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md bg-card border-border shadow-lg">
        <CardHeader className="space-y-2 pb-6 text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-2">
            <span className="text-primary-foreground font-bold text-xl">C</span>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">Welcome to ChatHub</CardTitle>
          <CardDescription className="text-muted-foreground">
            No registration required. Set a nickname to jump right in.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Your Anonymous ID</Label>
              <div className="flex gap-2">
                <Input 
                  value={userId} 
                  readOnly 
                  className="bg-secondary/50 font-mono text-sm border-transparent focus-visible:ring-0" 
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon" 
                  onClick={handleCopy}
                  className="shrink-0"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nickname" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Nickname</Label>
              <Input 
                id="nickname" 
                placeholder="e.g. Maverick" 
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={32}
                autoFocus
                className="bg-background border-border"
              />
            </div>

            <div className="bg-secondary/30 p-4 rounded-lg border border-border/50 text-xs text-muted-foreground space-y-3">
              <p className="font-semibold text-foreground">Appwrite Setup Required</p>
              <div>
                <p className="font-medium text-foreground/80 mb-1">1. Add Web Platform</p>
                <p>In Appwrite Console → Project Settings → Platforms → Add Platform → Web. Set hostname to <span className="font-mono bg-background/50 px-1 rounded">*</span> (wildcard) or your domain.</p>
              </div>
              <div>
                <p className="font-medium text-foreground/80 mb-1">2. Create Database</p>
                <p>Create a database with ID: <span className="font-mono bg-background/50 px-1 rounded">chat-db</span></p>
              </div>
              <div>
                <p className="font-medium text-foreground/80 mb-1">3. Create Collections (in chat-db)</p>
                <p className="mb-1">Create these collections with <strong>Any</strong> read/write permissions:</p>
                <ul className="list-disc list-inside ml-2 space-y-0.5 opacity-80">
                  <li><span className="font-mono">users</span> — userId, nickname, avatarUrl, isOnline, lastSeenAt, createdAt</li>
                  <li><span className="font-mono">friends</span> — userId, friendId, status, createdAt</li>
                  <li><span className="font-mono">chats</span> — type, name, avatarUrl, memberIds[], lastMessage, lastMessageAt, createdBy, createdAt</li>
                  <li><span className="font-mono">messages</span> — chatId, senderId, senderName, type, content, fileId, fileName, replyToId, reactions, editedAt, deletedAt, isPinned, readBy[], createdAt</li>
                  <li><span className="font-mono">notifications</span> — userId, type, title, body, chatId, isRead, createdAt</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-foreground/80 mb-1">4. Create Storage Bucket</p>
                <p>Create a bucket with ID: <span className="font-mono bg-background/50 px-1 rounded">chat-files</span> with Any read/write permissions.</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full font-semibold" 
              disabled={loading || nickname.trim().length < 2}
            >
              {loading ? "Joining..." : "Start Chatting"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
