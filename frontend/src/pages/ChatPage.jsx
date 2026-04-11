import { ChatProvider } from "@/context/ChatContext";
import Sidebar from "@/components/chat/Sidebar";
import ChatPanel from "@/components/chat/ChatPanel";
import { useState } from "react";

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <ChatProvider>
      <div className="flex h-screen bg-background overflow-hidden">
        {/* Sidebar — full on desktop, overlay on mobile */}
        <div
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 fixed md:relative z-30 md:z-auto w-80 lg:w-96 h-full transition-transform duration-200 ease-in-out`}
        >
          <Sidebar onSelectUser={() => setSidebarOpen(false)} />
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Chat panel */}
        <div className="flex-1 flex flex-col min-w-0">
          <ChatPanel onMenuClick={() => setSidebarOpen(true)} />
        </div>
      </div>
    </ChatProvider>
  );
}
