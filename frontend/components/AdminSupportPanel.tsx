"use client";

import { useEffect, useMemo, useState } from "react";
import { socket } from "@/lib/socket";
import { getCurrentUser } from "@/lib/auth";

type SupportConversation = {
  sessionId: string;
  userId: number | null;
  lastMessage: string;
  lastMessageAt: string;
};

type SupportHistoryItem = {
  id?: number;
  sender: "USER" | "BOT";
  message: string;
  userId: number | null;
  createdAt: string;
};

type SupportMessage = {
  userId: number;
  text: string;
  senderRole: "USER" | "ADMIN";
  senderName?: string;
  createdAt: string;
};

type ChatLine = {
  senderRole: "USER" | "ADMIN";
  text: string;
  createdAt: string;
};

export default function AdminSupportPanel() {
  const [isConnected, setIsConnected] = useState(false);
  const [conversations, setConversations] = useState<SupportConversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatLine[]>([]);
  const [draft, setDraft] = useState("");

  const currentUser = getCurrentUser();

  useEffect(() => {
    const onConnect = () => {
      setIsConnected(true);
      socket.emit("registerAdmin");
      socket.emit("requestSupportConversations");
    };

    const onDisconnect = () => setIsConnected(false);

    const onSupportConversations = (items: SupportConversation[]) => {
      const sorted = [...(items || [])].sort(
        (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
      );
      setConversations(sorted);
      if (!selectedUserId && sorted.length && sorted[0].userId) {
        setSelectedUserId(sorted[0].userId);
      }
    };

    const onSupportHistory = (history: SupportHistoryItem[]) => {
      const mapped: ChatLine[] = (history || []).map((item) => {
        const isAdminMessage = item.sender === "BOT";
        const text = isAdminMessage ? item.message.replace(/^\[ADMIN\]\s*/, "") : item.message;
        return {
          senderRole: isAdminMessage ? "ADMIN" : "USER",
          text,
          createdAt: item.createdAt,
        };
      });
      setMessages(mapped);
    };

    const onSupportMessage = (msg: SupportMessage) => {
      if (!selectedUserId || msg.userId !== selectedUserId) {
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          senderRole: msg.senderRole,
          text: msg.text,
          createdAt: msg.createdAt,
        },
      ]);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("supportConversations", onSupportConversations);
    socket.on("supportHistory", onSupportHistory);
    socket.on("supportMessage", onSupportMessage);

    socket.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("supportConversations", onSupportConversations);
      socket.off("supportHistory", onSupportHistory);
      socket.off("supportMessage", onSupportMessage);
    };
  }, [selectedUserId]);

  useEffect(() => {
    if (selectedUserId) {
      socket.emit("joinSupportRoom", { userId: selectedUserId });
    }
  }, [selectedUserId]);

  const selectedConversation = useMemo(
    () => conversations.find((item) => item.userId === selectedUserId) || null,
    [conversations, selectedUserId],
  );

  const sendMessage = () => {
    const trimmed = draft.trim();
    if (!trimmed || !selectedUserId) {
      return;
    }

    socket.emit("sendSupportMessage", {
      userId: selectedUserId,
      text: trimmed,
      senderRole: "ADMIN",
      senderName: currentUser?.name || "Support Agent",
    });

    setMessages((prev) => [
      ...prev,
      {
        senderRole: "ADMIN",
        text: trimmed,
        createdAt: new Date().toISOString(),
      },
    ]);
    setDraft("");
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-900">Human Support Chat</h2>
        <p className="text-slate-600 mt-1">Handle user-to-admin live conversations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
            <p className="text-sm font-semibold text-slate-800">Support Requests</p>
            <p className="text-xs text-slate-500">{isConnected ? "Connected" : "Disconnected"}</p>
          </div>
          <div className="max-h-[520px] overflow-y-auto">
            {conversations.length === 0 ? (
              <p className="p-4 text-sm text-slate-500">No support conversations yet.</p>
            ) : (
              conversations.map((item) => (
                <button
                  key={item.sessionId}
                  onClick={() => item.userId && setSelectedUserId(item.userId)}
                  className={`w-full text-left p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                    selectedUserId === item.userId ? "bg-blue-50" : "bg-white"
                  }`}
                >
                  <p className="text-sm font-semibold text-slate-900">User #{item.userId ?? "Unknown"}</p>
                  <p className="text-xs text-slate-600 mt-1 truncate">{item.lastMessage}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{new Date(item.lastMessageAt).toLocaleString()}</p>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2 border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
            <p className="text-sm font-semibold text-slate-800">
              {selectedConversation ? `Chat with User #${selectedConversation.userId}` : "Select a conversation"}
            </p>
          </div>

          <div className="h-[420px] overflow-y-auto p-4 bg-slate-50 space-y-2">
            {messages.length === 0 ? (
              <p className="text-sm text-slate-500">No messages in this conversation.</p>
            ) : (
              messages.map((msg, index) => (
                <div key={`${msg.createdAt}-${index}`} className={`flex ${msg.senderRole === "ADMIN" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                      msg.senderRole === "ADMIN"
                        ? "bg-blue-600 text-white"
                        : "bg-white border border-slate-200 text-slate-800"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-slate-200 bg-white flex gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={selectedUserId ? "Type support reply..." : "Select a conversation first"}
              disabled={!selectedUserId}
              className="flex-1 h-10 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-blue-600 disabled:bg-slate-100"
            />
            <button
              onClick={sendMessage}
              disabled={!selectedUserId}
              className="h-10 px-4 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:bg-slate-300"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
