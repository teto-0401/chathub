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
        title: "ニックネームが短い",
        description: "ニックネームは2文字以上必要です。",
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
        title: "設定に失敗しました",
        description: "Appwriteとの接続またはプロフィール保存に失敗しました。環境変数やDBコレクションの設定を確認してください。",
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
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">ChatHubへようこそ</CardTitle>
          <CardDescription className="text-muted-foreground">
            ユーザー登録不要。ニックネームを設定してすぐに始めよう。
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">あなたのID</Label>
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
              <Label htmlFor="nickname" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">ニックネーム</Label>
              <Input 
                id="nickname" 
                placeholder="例：タロウ" 
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={32}
                autoFocus
                className="bg-background border-border"
              />
            </div>

            <div className="bg-secondary/30 p-4 rounded-lg border border-border/50 text-xs text-muted-foreground space-y-3">
              <p className="font-semibold text-foreground">Appwrite設定が必要です</p>
              <div>
                <p className="font-medium text-foreground/80 mb-1">1. Webプラットフォームを追加</p>
                <p>Appwrite Console → Project Settings → Platforms → Add Platform → Web 。ホスト名を <span className="font-mono bg-background/50 px-1 rounded">*</span> (ワイルドカード) またはドメインで設定。</p>
              </div>
              <div>
                <p className="font-medium text-foreground/80 mb-1">2. データベースを作成</p>
                <p>ID: <span className="font-mono bg-background/50 px-1 rounded">chat-db</span> のデータベースを作成。</p>
              </div>
              <div>
                <p className="font-medium text-foreground/80 mb-1">3. コレクションを作成（chat-db内）</p>
                <p className="mb-1">以下のコレクションを、<strong>誰でも読み書き可能（Any）</strong>で作成。</p>
                <ul className="list-disc list-inside ml-2 space-y-0.5 opacity-80">
                  <li><span className="font-mono">users</span> — userId, nickname, avatarUrl, isOnline, lastSeenAt, createdAt</li>
                  <li><span className="font-mono">friends</span> — userId, friendId, status, createdAt</li>
                  <li><span className="font-mono">chats</span> — type, name, avatarUrl, memberIds[], lastMessage, lastMessageAt, createdBy, createdAt</li>
                  <li><span className="font-mono">messages</span> — chatId, senderId, senderName, type, content, fileId, fileName, replyToId, reactions, editedAt, deletedAt, isPinned, readBy[], createdAt</li>
                  <li><span className="font-mono">notifications</span> — userId, type, title, body, chatId, isRead, createdAt</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-foreground/80 mb-1">4. ストレージバケットを作成</p>
                <p>ID: <span className="font-mono bg-background/50 px-1 rounded">chat-files</span> 、権限は誰でも読み書き可能で作成。</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full font-semibold" 
              disabled={loading || nickname.trim().length < 2}
            >
              {loading ? "参加中..." : "チャットを始める"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
