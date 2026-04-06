"use client";

import { useEffect, useRef, useState } from "react";
import { socket } from "@/lib/socket";
import { getCurrentUser } from "@/lib/auth";

type ChatMode = "BOT" | "HUMAN";

type ChatLine = {
  sender: "user" | "bot";
  text: string;
};

type SupportHistoryItem = {
  sender: "USER" | "BOT";
  message: string;
  createdAt: string;
};

type SupportRealtimeMessage = {
  userId: number;
  text: string;
  senderRole: "USER" | "ADMIN";
  createdAt: string;
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<ChatMode>("BOT");
  const [botMessages, setBotMessages] = useState<ChatLine[]>([]);
  const [supportMessages, setSupportMessages] = useState<ChatLine[]>([]);
  const [botTyping, setBotTyping] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);

  const currentUser = getCurrentUser();
  const currentMessages = mode === "BOT" ? botMessages : supportMessages;

  useEffect(() => {
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    const onBotTyping = (typing: boolean) => setBotTyping(Boolean(typing));

    const onReceiveMessage = (msg: string) => {
      const clean = msg.startsWith("Bot: ") ? msg.slice(5) : msg;
      setBotMessages((prev) => [...prev, { sender: "bot", text: clean }]);
      setBotTyping(false);
    };

    const onSupportHistory = (history: SupportHistoryItem[]) => {
      const mapped: ChatLine[] = (history || []).map((item) => {
        const isAdmin = item.sender === "BOT";
        return {
          sender: isAdmin ? "bot" : "user",
          text: isAdmin ? item.message.replace(/^\[ADMIN\]\s*/, "") : item.message,
        };
      });
      setSupportMessages(mapped);
    };

    const onSupportMessage = (msg: SupportRealtimeMessage) => {
      if (!currentUser?.id || msg.userId !== currentUser.id) {
        return;
      }

      setSupportMessages((prev) => [
        ...prev,
        {
          sender: msg.senderRole === "ADMIN" ? "bot" : "user",
          text: msg.text,
        },
      ]);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("botTyping", onBotTyping);
    socket.on("receiveMessage", onReceiveMessage);
    socket.on("supportHistory", onSupportHistory);
    socket.on("supportMessage", onSupportMessage);

    socket.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("botTyping", onBotTyping);
      socket.off("receiveMessage", onReceiveMessage);
      socket.off("supportHistory", onSupportHistory);
      socket.off("supportMessage", onSupportMessage);
      socket.disconnect();
    };
  }, [currentUser?.id]);

  useEffect(() => {
    if (mode === "HUMAN" && currentUser?.id && isConnected) {
      socket.emit("requestHumanSupport", {
        userId: currentUser.id,
        userName: currentUser.name,
      });
    }
  }, [mode, currentUser?.id, currentUser?.name, isConnected]);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages, botTyping, isOpen, mode]);

  const sendMessage = () => {
    const trimmed = message.trim();
    if (!trimmed) return;

    if (mode === "BOT") {
      setBotTyping(true);
      socket.emit("sendMessage", trimmed);
      setBotMessages((prev) => [...prev, { sender: "user", text: trimmed }]);
      setMessage("");
      return;
    }

    if (!currentUser?.id) {
      return;
    }

    socket.emit("sendSupportMessage", {
      userId: currentUser.id,
      text: trimmed,
      senderRole: "USER",
      senderName: currentUser.name,
    });
    setSupportMessages((prev) => [...prev, { sender: "user", text: trimmed }]);
    setMessage("");
  };

  return (
    <>
      {isOpen && (
        <section className="fixed bottom-24 right-4 z-[70] w-[calc(100vw-2rem)] max-w-sm rounded-2xl border border-slate-200 bg-white shadow-2xl sm:right-6">
          <header className="rounded-t-2xl bg-cyan-700 px-4 py-3 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">SkyFly Chat</p>
                <p className="text-xs text-cyan-100">
                  {mode === "BOT" ? "Ask AI about flights and bookings" : "Live support with human agent"}
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-md px-2 py-1 text-xs font-medium hover:bg-cyan-800"
              >
                X
              </button>
            </div>
            <div className="mt-3 flex rounded-lg bg-cyan-800 p-1">
              <button
                onClick={() => setMode("BOT")}
                className={`flex-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                  mode === "BOT" ? "bg-white text-cyan-800" : "text-cyan-100"
                }`}
              >
                AI Assistant
              </button>
              <button
                onClick={() => setMode("HUMAN")}
                className={`flex-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                  mode === "HUMAN" ? "bg-white text-cyan-800" : "text-cyan-100"
                }`}
              >
                Human Support
              </button>
            </div>
          </header>

          <div className="h-72 space-y-2 overflow-y-auto bg-slate-50 p-3">
            {currentMessages.length === 0 && (
              <p className="text-sm text-slate-500">
                {mode === "BOT"
                  ? "Type a message to start chatting with the assistant."
                  : "Start typing to request help from a support agent."}
              </p>
            )}

            {currentMessages.map((msg, index) => (
              <div
                key={`${msg.sender}-${index}`}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    msg.sender === "user"
                      ? "bg-cyan-700 text-white"
                      : "border border-slate-200 bg-white text-slate-800"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {mode === "BOT" && botTyping && (
              <div className="flex justify-start">
                <div className="border border-slate-200 bg-white text-slate-800 rounded-lg px-3 py-2 text-sm">
                  Typing...
                </div>
              </div>
            )}

            <div ref={endOfMessagesRef} />
          </div>

          <footer className="space-y-2 border-t border-slate-200 p-3">
            <div className="text-xs text-slate-500">
              {isConnected
                ? mode === "BOT"
                  ? "Connected to AI assistant"
                  : "Connected to support channel"
                : "Connecting..."}
            </div>
            <div className="flex gap-2">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={mode === "BOT" ? "Type message..." : "Type message for support..."}
                className="h-10 flex-1 rounded-md border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-cyan-600"
              />
              <button
                onClick={sendMessage}
                className="h-10 rounded-md bg-cyan-700 px-4 text-sm font-medium text-white hover:bg-cyan-800"
              >
                Send
              </button>
            </div>
          </footer>
        </section>
      )}

      <button
        aria-label="Open chat"
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-4 z-[80] flex h-14 w-14 items-center justify-center rounded-full bg-cyan-700 text-white shadow-xl transition hover:scale-105 hover:bg-cyan-800 sm:right-6"
      >
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 10h8M8 14h5" strokeLinecap="round" strokeLinejoin="round" />
          <path
            d="M7 18l-4 3V5a2 2 0 012-2h14a2 2 0 012 2v11a2 2 0 01-2 2H7z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </>
  );
}
