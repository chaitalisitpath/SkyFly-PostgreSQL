"use client";

import { useEffect, useRef, useState } from "react";
import { socket } from "@/lib/socket";

type ChatLine = {
  sender: "user" | "bot";
  text: string;
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatLine[]>([]);
  const [botTyping, setBotTyping] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);
  const botReplyTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    const onReceiveMessage = (msg: string) => {
      const clean = msg.startsWith("Bot: ") ? msg.slice(5) : msg;
      setBotTyping(true);

      if (botReplyTimerRef.current) {
        window.clearTimeout(botReplyTimerRef.current);
      }

      botReplyTimerRef.current = window.setTimeout(() => {
        setMessages((prev) => [...prev, { sender: "bot", text: clean }]);
        setBotTyping(false);
        botReplyTimerRef.current = null;
      }, 900);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("receiveMessage", onReceiveMessage);
    socket.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("receiveMessage", onReceiveMessage);
      if (botReplyTimerRef.current) {
        window.clearTimeout(botReplyTimerRef.current);
      }
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, botTyping, isOpen]);

  const sendMessage = () => {
    const trimmed = message.trim();
    if (!trimmed) return;

    socket.emit("sendMessage", trimmed);
    setMessages((prev) => [...prev, { sender: "user", text: trimmed }]);
    setMessage("");
  };

  return (
    <>
      {isOpen && (
        <section className="fixed bottom-24 right-4 z-[70] w-[calc(100vw-2rem)] max-w-sm rounded-2xl border border-slate-200 bg-white shadow-2xl sm:right-6">
          <header className="flex items-center justify-between rounded-t-2xl bg-cyan-700 px-4 py-3 text-white">
            <div>
              <p className="text-sm font-semibold">SkyFly Chat</p>
              <p className="text-xs text-cyan-100">Ask about flights and bookings</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-md px-2 py-1 text-xs font-medium hover:bg-cyan-800"
            >
              X
            </button>
          </header>

          <div className="h-72 space-y-2 overflow-y-auto bg-slate-50 p-3">
            {messages.length === 0 && (
              <p className="text-sm text-slate-500">Type a message to start chatting with the assistant.</p>
            )}

            {messages.map((msg, index) => (
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

            {botTyping && (
              <div className="flex justify-start">
                <div className="border border-slate-200 bg-white text-slate-800 rounded-lg px-3 py-2 text-sm">
                  Typing...
                </div>
              </div>
            )}

            <div ref={endOfMessagesRef} />
          </div>

          <footer className="space-y-2 border-t border-slate-200 p-3">
            <div className="flex items-center justify-between text-xs">
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
                placeholder="Type message..."
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