import { useEffect, useRef } from "react";
import { useChat } from "@/context/ChatContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import MessageBubble from "./MessageBubble";
import MessageComposer from "./MessageComposer";
import { Menu, MessageCircle } from "lucide-react";

export default function ChatPanel({ onMenuClick }) {
  const { selectedUser, messages, loading } = useChat();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!selectedUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
        <MessageCircle className="h-16 w-16 opacity-20" />
        <p className="text-lg">Select a conversation to start</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-card shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden shrink-0"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary text-sm">
            {selectedUser.slice(-2)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">+{selectedUser}</p>
          <p className="text-xs text-muted-foreground">WhatsApp</p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea
        className="flex-1 px-4 py-2"
        style={{ background: "hsl(var(--chat-bg))" }}
      >
        {loading ? (
          <div className="space-y-3 py-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
              >
                <Skeleton className="h-10 w-48 rounded-lg" />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            No messages yet. Say hello!
          </p>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg._id || msg.whatsappMessageId}
              message={msg}
            />
          ))
        )}
        <div ref={bottomRef} />
      </ScrollArea>

      {/* Composer */}
      <MessageComposer />
    </div>
  );
}
