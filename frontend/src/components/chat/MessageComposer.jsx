import { useState } from "react";
import { useChat } from "@/context/ChatContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

export default function MessageComposer() {
  const [text, setText] = useState("");
  const { sendMessage } = useChat();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(text);
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 px-4 py-3 border-t bg-card shrink-0"
    >
      <Input
        placeholder="Type a message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1"
        autoComplete="off"
        autoFocus
      />
      <Button
        type="submit"
        size="icon"
        disabled={!text.trim()}
        className="shrink-0"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
