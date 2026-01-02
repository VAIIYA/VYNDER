"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Navigation from "@/components/Navigation";
import toast from "react-hot-toast";

interface Message {
  _id: string;
  sender: {
    _id: string;
    username: string;
    photos: string[];
  };
  text: string;
  createdAt: string;
}

interface Match {
  _id: string;
  users: Array<{
    _id: string;
    username: string;
    photos: string[];
  }>;
}

export default function ChatPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const matchId = params.matchId as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [match, setMatch] = useState<Match | null>(null);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (matchId) {
      loadMessages();
      // Poll for new messages every 2 seconds
      const interval = setInterval(loadMessages, 2000);
      return () => clearInterval(interval);
    }
  }, [matchId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = async () => {
    try {
      const response = await fetch(`/api/messages/${matchId}`);
      const data = await response.json();

      if (response.ok) {
        setMessages(data.messages || []);
        if (data.messages && data.messages.length > 0) {
          // Extract match info from first message or fetch separately
          const firstMessage = data.messages[0];
          if (firstMessage.sender) {
            // We can infer match info, but ideally we'd fetch it separately
            // For now, we'll use the messages to get user info
          }
        }
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || sending) return;

    setSending(true);
    try {
      const response = await fetch(`/api/messages/${matchId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: messageText.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessageText("");
        loadMessages();
      } else {
        toast.error(data.error || "Failed to send message");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const otherUser = messages[0]?.sender?._id !== session?.user?.id 
    ? messages[0]?.sender 
    : messages.find(m => m.sender._id !== session?.user?.id)?.sender;

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
        {otherUser && (
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden">
              {otherUser.photos && otherUser.photos.length > 0 ? (
                <Image
                  src={otherUser.photos[0]}
                  alt={otherUser.username}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                  <span className="text-white font-bold">
                    {otherUser.username[0]?.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <h2 className="font-semibold text-gray-900 dark:text-white">
              {otherUser.username}
            </h2>
          </div>
        )}
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4 hide-scrollbar"
      >
        {messages.map((message) => {
          const isOwn = message.sender._id === session?.user?.id;
          return (
            <div
              key={message._id}
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  isOwn
                    ? "bg-primary-600 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p
                  className={`text-xs mt-1 ${
                    isOwn ? "text-primary-100" : "text-gray-400"
                  }`}
                >
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={sendMessage}
        className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-4"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!messageText.trim() || sending}
            className="bg-primary-600 hover:bg-primary-700 text-white rounded-full px-6 py-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </form>

      <Navigation />
    </div>
  );
}

