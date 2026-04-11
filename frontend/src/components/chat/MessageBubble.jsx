import { format } from "date-fns";
import { Check, CheckCheck, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const statusIcons = {
  pending: <Clock className="h-3 w-3 text-muted-foreground" />,
  sent: <Check className="h-3 w-3 text-muted-foreground" />,
  delivered: <CheckCheck className="h-3 w-3 text-muted-foreground" />,
  read: <CheckCheck className="h-3 w-3 text-blue-500" />,
  failed: <AlertCircle className="h-3 w-3 text-destructive" />,
};

export default function MessageBubble({ message }) {
  const isOutgoing = message.direction === "outgoing";
  const isUnread = message.direction === "incoming" && !message.read;
  const time = message.createdAt
    ? format(new Date(message.createdAt), "HH:mm")
    : "";

  return (
    <div
      className={cn("flex mb-1", isOutgoing ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[75%] sm:max-w-[65%] rounded-lg px-3 py-2 shadow-sm",
          isOutgoing ? "rounded-tr-none" : "rounded-tl-none",
          isUnread && "ring-1 ring-primary/30",
          message.status === "failed" && "opacity-60",
        )}
        style={{
          background: isOutgoing
            ? "hsl(var(--bubble-outgoing))"
            : "hsl(var(--bubble-incoming))",
        }}
      >
        <p className="text-sm whitespace-pre-wrap break-words">
          {message.message}
        </p>
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className="text-[10px] text-muted-foreground leading-none">
            {time}
          </span>
          {isOutgoing && statusIcons[message.status || "sent"]}
          {isUnread && (
            <span className="h-2 w-2 rounded-full bg-primary inline-block ml-0.5" />
          )}
        </div>
      </div>
    </div>
  );
}
