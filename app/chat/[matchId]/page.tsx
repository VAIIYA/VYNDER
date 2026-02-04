"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
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
    <div className="h-full bg-white relative overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-md border-b border-[#E9EDF6] px-6 py-4 z-20 sticky top-0">
        {otherUser && (
          <div className="flex items-center gap-4">
            <Link href="/matches" className="p-2 -ml-2 text-vaiiya-purple hover:text-vaiiya-orange transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#E9EDF6]">
              {otherUser.photos && otherUser.photos.length > 0 ? (
                <Image
                  src={otherUser.photos[0]}
                  alt={otherUser.username}
                  fill
                  className="object-cover"
                  unoptimized={otherUser.photos[0]?.startsWith("/api/images/")}
                />
              ) : (
                <div className="w-full h-full bg-[#F7F9FC] flex items-center justify-center">
                  <span className="text-vaiiya-purple font-bold">
                    {otherUser.username[0]?.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-serif font-bold text-vaiiya-purple tracking-tight">
                {otherUser.username}
              </h2>
              {otherUserTyping ? (
                <p className="text-xs font-bold text-vaiiya-orange uppercase tracking-widest animate-pulse">
                  typing...
                </p>
              ) : (
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span className="text-[10px] font-bold text-vaiiya-gray/40 uppercase tracking-widest">Active Now</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-6 py-8 space-y-8 bg-white hide-scrollbar"
      >
        {groupedMessages.map((group) => (
          <div key={group.date}>
            {/* Date separator */}
            <div className="flex items-center justify-center my-10">
              <div className="px-6 py-1.5 bg-[#F7F9FC] border border-[#E9EDF6] rounded-full text-[10px] font-bold text-vaiiya-gray/40 uppercase tracking-widest">
                {group.date}
              </div>
            </div>

            {/* Messages in this group */}
            {group.messages.map((message, index) => {
              const isOwn = message.sender._id === session?.user?.id;
              const previousMessage = index > 0 ? group.messages[index - 1] : null;
              const shouldGroup = shouldGroupWithPrevious(message, previousMessage, index);

              return (
                <div
                  key={message._id}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"} ${shouldGroup ? "mt-1.5" : "mt-6"
                    }`}
                >
                  <div className="flex flex-col gap-1 max-w-[80%] lg:max-w-[70%]">
                    <div
                      className={`px-5 py-3 rounded-[24px] shadow-sm transition-all ${isOwn
                        ? "bg-vaiiya-orange text-white rounded-tr-none"
                        : "bg-[#F7F9FC] text-vaiiya-purple border border-[#E9EDF6] rounded-tl-none"
                        } ${message._id.startsWith("temp-") ? "opacity-50" : ""}`}
                    >
                      <p className="text-base font-medium leading-relaxed break-words">{message.text}</p>
                    </div>
                    <div className={`flex items-center gap-2 px-1 ${isOwn ? "justify-end" : "justify-start"}`}>
                      <p className="text-[10px] font-bold text-vaiiya-gray/30 uppercase tracking-widest">
                        {format(new Date(message.createdAt), "h:mm a")}
                      </p>
                      {isOwn && (
                        <span className="text-[10px] font-bold text-vaiiya-orange uppercase">
                          {message.read ? "Seen" : "Sent"}
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
          <div className="flex justify-start mt-4">
            <div className="bg-[#F7F9FC] border border-[#E9EDF6] rounded-[24px] rounded-tl-none px-5 py-3 flex gap-1.5">
              <div className="w-1.5 h-1.5 bg-vaiiya-orange rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
              <div className="w-1.5 h-1.5 bg-vaiiya-orange rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
              <div className="w-1.5 h-1.5 bg-vaiiya-orange rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Input */}
      <div className="p-6 bg-white border-t border-[#E9EDF6] pb-32">
        <form
          onSubmit={sendMessage}
          className="flex gap-4 items-end"
        >
          <div className="flex-1 relative group">
            <textarea
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
              rows={1}
              placeholder="Write a message..."
              className="w-full px-6 py-4 bg-[#F7F9FC] border border-[#E9EDF6] rounded-[24px] focus:outline-none focus:border-vaiiya-orange transition-colors font-medium resize-none max-h-32"
            />
          </div>
          <button
            type="submit"
            disabled={!messageText.trim() || sending}
            className="w-14 h-14 bg-vaiiya-orange flex items-center justify-center text-white rounded-full shadow-lg shadow-vaiiya-orange/20 hover:scale-110 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale disabled:scale-100"
          >
            {sending ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <svg className="w-6 h-6 rotate-45 transform -translate-y-0.5 -translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            )}
          </button>
        </form>
      </div>

      <Navigation />
    </div>
  );
}
