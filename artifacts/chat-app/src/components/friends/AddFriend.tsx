import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { sendFriendRequest } from "@/services/appwrite";
import { useAppContext } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";

export function AddFriend() {
  const { currentUser } = useAppContext();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [friendId, setFriendId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !friendId.trim()) return;
    
    if (friendId.trim() === currentUser.userId) {
      toast({ title: "Cannot add yourself", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await sendFriendRequest(currentUser.userId, friendId.trim());
      toast({ title: "Friend request sent!" });
      setOpen(false);
      setFriendId("");
    } catch (err: any) {
      toast({ title: "Failed to send request", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="w-8 h-8 text-sidebar-foreground hover:bg-sidebar-accent">
          <Plus className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleAdd}>
          <DialogHeader>
            <DialogTitle>Add Friend</DialogTitle>
            <DialogDescription>
              Enter your friend's user ID to send them a request.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="friendId" className="text-right">
                User ID
              </Label>
              <Input
                id="friendId"
                value={friendId}
                onChange={(e) => setFriendId(e.target.value)}
                placeholder="ABCD-EFGH-IJKL"
                className="col-span-3 font-mono"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading || !friendId.trim()}>
              {loading ? "Sending..." : "Send Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
