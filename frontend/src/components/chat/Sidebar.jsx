import { useState } from "react";
import { useChat } from "@/context/ChatContext";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import AddContactDialog from "./AddContactDialog";
import { LogOut, Moon, Sun, UserPlus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export default function Sidebar({ onSelectUser }) {
  const { users, selectedUser, setSelectedUser, unreadCounts } = useChat();
  const { user: authUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const filtered = users.filter((u) =>
    u.user.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSelect = (phone) => {
    setSelectedUser(phone);
    onSelectUser?.(phone);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="flex flex-col h-full border-r bg-card">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="text-lg font-semibold">Chats</h1>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setAddOpen(true)}
            title="Add contact"
          >
            <UserPlus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Separator />

      {/* Contact list */}
      <ScrollArea className="flex-1">
        {filtered.length === 0 ? (
          <p className="p-4 text-center text-sm text-muted-foreground">
            {users.length === 0 ? "No contacts yet" : "No matches"}
          </p>
        ) : (
          filtered.map((u) => {
            const unread = unreadCounts[u.user] || 0;
            const isSelected = selectedUser === u.user;
            return (
              <button
                key={u.user}
                onClick={() => handleSelect(u.user)}
                className={cn(
                  "flex items-center gap-3 w-full px-4 py-3 text-left transition-colors hover:bg-accent",
                  isSelected && "bg-accent",
                )}
              >
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {u.user.slice(-2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm truncate">
                      +{u.user}
                    </span>
                    {u.lastMessageAt && (
                      <span className="text-[11px] text-muted-foreground shrink-0 ml-2">
                        {formatDistanceToNow(new Date(u.lastMessageAt), {
                          addSuffix: true,
                        })}
                      </span>
                    )}
                  </div>
                  {u.lastMessage && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {u.lastMessage}
                    </p>
                  )}
                </div>
                {unread > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-medium text-primary-foreground shrink-0">
                    {unread}
                  </span>
                )}
              </button>
            );
          })
        )}
      </ScrollArea>

      <Separator />

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-xs text-muted-foreground truncate">
          {authUser?.email}
        </span>
        <Button variant="ghost" size="icon" onClick={logout} title="Logout">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>

      <AddContactDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
