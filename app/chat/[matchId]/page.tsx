"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Navigation from "@/components/Navigation";
import toast from "react-hot-toast";
import { format, isToday, isYesterday, isSameDay } from "date-fns";

interface Message {
  _id: string;
  sender: {
    _id: string;
    username: string;
    photos: string[];
  };
  text: string;
  read?: boolean;
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

interface GroupedMessage {
  date: string;
  messages: Message[];
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
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageIdRef = useRef<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = useCallback(async () => {
    if (!matchId) return;
    
    try {
      const response = await fetch(`/api/messages/${matchId}`);
      const data = await response.json();

      if (response.ok) {
        const newMessages = data.messages || [];
        
        // Only update if we have new messages
        if (newMessages.length > 0) {
          const lastMessageId = newMessages[newMessages.length - 1]._id;
          if (lastMessageId !== lastMessageIdRef.current) {
            setMessages(newMessages);
            lastMessageIdRef.current = lastMessageId;
          }
        } else {
          setMessages(newMessages);
        }
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  const checkTyping = useCallback(async () => {
    if (!matchId) return;
    
    try {
      const response = await fetch(`/api/typing?matchId=${matchId}`);
      const data = await response.json();
      
      if (response.ok) {
        setOtherUserTyping(data.typing && data.typing.length > 0);
      }
    } catch (error) {
      console.error("Error checking typing:", error);
    }
  }, [matchId]);

  useEffect(() => {
    if (matchId) {
      loadMessages();
      // Poll for new messages every 3 seconds (less frequent than before)
      const messageInterval = setInterval(loadMessages, 3000);
      // Check typing every 1 second
      const typingInterval = setInterval(checkTyping, 1000);
      
      return () => {
        clearInterval(messageInterval);
        clearInterval(typingInterval);
      };
    }
  }, [matchId, loadMessages, checkTyping]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      fetch("/api/typing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, isTyping: true }),
      });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      fetch("/api/typing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, isTyping: false }),
      });
    }, 2000);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || sending) return;

    const tempId = `temp-${Date.now()}`;
    const tempMessage: Message = {
      _id: tempId,
      sender: {
        _id: session?.user?.id || "",
        username: session?.user?.name || "You",
        photos: [],
      },
      text: messageText.trim(),
      read: false,
      createdAt: new Date().toISOString(),
    };

    // Optimistic update
    setMessages((prev) => [...prev, tempMessage]);
    setMessageText("");
    setIsTyping(false);
    
    // Stop typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    fetch("/api/typing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, isTyping: false }),
    });

    setSending(true);
    try {
      const response = await fetch(`/api/messages/${matchId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: messageText.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        // Replace temp message with real message
        setMessages((prev) =>
          prev.map((msg) => (msg._id === tempId ? data.message : msg))
        );
        // Reload to get updated read status
        setTimeout(loadMessages, 500);
      } else {
        // Remove temp message on error
        setMessages((prev) => prev.filter((msg) => msg._id !== tempId));
        toast.error(data.error || "Failed to send message");
      }
    } catch (error) {
      // Remove temp message on error
      setMessages((prev) => prev.filter((msg) => msg._id !== tempId));
      toast.error("An error occurred");
    } finally {
      setSending(false);
    }
  };

  // Group messages by date
  const groupMessagesByDate = (messages: Message[]): GroupedMessage[] => {
    const groups: { [key: string]: Message[] } = {};

    messages.forEach((message) => {
      const date = new Date(message.createdAt);
      let dateKey: string;

      if (isToday(date)) {
        dateKey = "Today";
      } else if (isYesterday(date)) {
        dateKey = "Yesterday";
      } else {
        dateKey = format(date, "MMMM d, yyyy");
      }

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });

    return Object.entries(groups).map(([date, msgs]) => ({
      date,
      messages: msgs,
    }));
  };

  // Group consecutive messages from same sender
  const shouldGroupWithPrevious = (
    current: Message,
    previous: Message | null,
    index: number
  ): boolean => {
    if (!previous || index === 0) return false;
    if (current.sender._id !== previous.sender._id) return false;
    
    const timeDiff =
      new Date(current.createdAt).getTime() -
      new Date(previous.createdAt).getTime();
    
    return timeDiff < 5 * 60 * 1000; // 5 minutes
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-solana-purple mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const otherUser = messages[0]?.sender?._id !== session?.user?.id 
    ? messages[0]?.sender 
    : messages.find(m => m.sender._id !== session?.user?.id)?.sender;

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="flex flex-col h-screen bg-black pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900/90 to-black/90 backdrop-blur-xl border-b border-gray-800 px-4 py-4">
        {otherUser && (
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-solana-purple/50">
              {otherUser.photos && otherUser.photos.length > 0 ? (
                <Image
                  src={otherUser.photos[0]}
                  alt={otherUser.username}
                  fill
                  className="object-cover"
                  unoptimized={otherUser.photos[0]?.startsWith("/api/images/")}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-solana-purple to-solana-blue flex items-center justify-center">
                  <span className="text-white font-bold">
                    {otherUser.username[0]?.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-white">
                {otherUser.username}
              </h2>
              {otherUserTyping && (
                <p className="text-xs text-solana-purple animate-pulse">
                  typing...
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4 hide-scrollbar bg-black"
      >
        {groupedMessages.map((group) => (
          <div key={group.date}>
            {/* Date separator */}
            <div className="flex items-center justify-center my-4">
              <div className="px-3 py-1 bg-gray-800/50 rounded-full text-xs text-gray-400">
                {group.date}
              </div>
            </div>

            {/* Messages in this group */}
            {group.messages.map((message, index) => {
              const isOwn = message.sender._id === session?.user?.id;
              const previousMessage =
                index > 0 ? group.messages[index - 1] : null;
              const shouldGroup = shouldGroupWithPrevious(
                message,
                previousMessage,
                index
              );

              return (
                <div
                  key={message._id}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"} ${
                    shouldGroup ? "mt-1" : "mt-4"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl transition-all ${
                      isOwn
                        ? "bg-gradient-to-r from-solana-purple to-solana-blue text-white shadow-lg shadow-solana-purple/30"
                        : "bg-gray-800/80 backdrop-blur-xl text-white border border-gray-700"
                    } ${message._id.startsWith("temp-") ? "opacity-70" : ""}`}
                  >
                    <p className="text-sm break-words">{message.text}</p>
                    <div className="flex items-center justify-end gap-2 mt-1">
                      <p
                        className={`text-xs ${
                          isOwn ? "text-white/70" : "text-gray-400"
                        }`}
                      >
                        {format(new Date(message.createdAt), "h:mm a")}
                      </p>
                      {isOwn && (
                        <span className="text-xs">
                          {message.read ? (
                            <span className="text-blue-300">✓✓</span>
                          ) : (
                            <span className="text-gray-400">✓</span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        
        {otherUserTyping && (
          <div className="flex justify-start mt-2">
            <div className="bg-gray-800/80 backdrop-blur-xl rounded-2xl px-4 py-2 border border-gray-700">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={sendMessage}
        className="bg-gradient-to-r from-gray-900/90 to-black/90 backdrop-blur-xl border-t border-gray-800 px-4 py-4"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => {
              setMessageText(e.target.value);
              handleTyping();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(e);
              }
            }}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 rounded-full border border-gray-700 bg-gray-800/50 text-white placeholder-gray-500 focus:ring-2 focus:ring-solana-purple focus:border-solana-purple transition-all"
          />
          <button
            type="submit"
            disabled={!messageText.trim() || sending}
            className="bg-gradient-to-r from-solana-purple to-solana-blue hover:from-solana-purple/90 hover:to-solana-blue/90 text-white rounded-full px-6 py-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-solana-purple/50"
          >
            {sending ? "..." : "Send"}
          </button>
        </div>
      </form>

      <Navigation />
    </div>
  );
}
