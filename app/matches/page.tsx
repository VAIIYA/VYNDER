"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navigation from "@/components/Navigation";
import toast from "react-hot-toast";
import { format, isToday, isYesterday } from "date-fns";

interface Match {
  _id: string;
  users: Array<{
    _id: string;
    username: string;
    photos: string[];
    age?: number;
    bio?: string;
    location?: string;
  }>;
  lastMessage?: {
    text: string;
    createdAt: string;
  };
  lastMessageAt?: string;
  unreadCount?: number;
}

export default function MatchesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/wallet");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      loadMatches();
      // Poll for new matches every 5 seconds (more frequent for better UX)
      const interval = setInterval(loadMatches, 5000);
      return () => clearInterval(interval);
    }
  }, [status]);

  const loadMatches = async () => {
    try {
      const response = await fetch("/api/matches");
      const data = await response.json();

      if (response.ok) {
        setMatches(data.matches || []);
      } else {
        toast.error(data.error || "Failed to load matches");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-solana-purple mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white relative overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-8 py-12 bg-[#F7F9FC]">
        <h1 className="text-5xl font-serif text-vaiiya-purple font-bold mb-3">Matches</h1>
        <p className="text-vaiiya-gray/60 text-lg font-medium">Your potential connections & conversations</p>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-4 pb-32">
        {matches.length === 0 ? (
          <div className="text-center py-20 vaiiya-card border-dashed">
            <div className="mb-6 text-7xl opacity-20">💬</div>
            <h3 className="text-2xl font-serif text-vaiiya-purple font-bold mb-2">No conversations yet</h3>
            <p className="text-vaiiya-gray/50 font-medium">Start swiping to find your first match!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => {
              const otherUser = match.users.find(
                (u) => u._id !== (session as any)?.user?.id
              );
              if (!otherUser) return null;

              return (
                <Link
                  key={match._id}
                  href={`/chat/${match._id}`}
                  className="block vaiiya-card p-6 hover:bg-[#F7F9FC] transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <div className="flex items-center gap-6">
                    <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0 border-2 border-[#E9EDF6]">
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
                          <span className="text-vaiiya-purple text-2xl font-bold">
                            {otherUser.username[0]?.toUpperCase()}
                          </span>
                        </div>
                      )}
                      {match.unreadCount && match.unreadCount > 0 && (
                        <div className="absolute top-0 right-0 bg-vaiiya-orange text-white text-[10px] rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-md border-2 border-white">
                          {match.unreadCount}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-xl font-serif font-bold text-vaiiya-purple truncate">
                          {otherUser.username}
                          {otherUser.age && (
                            <span className="text-vaiiya-gray/40 font-normal ml-2 text-sm">
                              {otherUser.age}
                            </span>
                          )}
                        </h3>
                        {match.lastMessageAt && (
                          <span className="text-xs font-bold text-vaiiya-gray/40 uppercase tracking-widest">
                            {(() => {
                              const date = new Date(match.lastMessageAt);
                              if (isToday(date)) return format(date, "h:mm a");
                              if (isYesterday(date)) return "Yesterday";
                              return format(date, "MMM d");
                            })()}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className={`text-base truncate ${match.unreadCount && match.unreadCount > 0 ? 'text-vaiiya-purple font-bold' : 'text-vaiiya-gray/60 font-medium'}`}>
                          {match.lastMessage ? match.lastMessage.text : "No messages yet"}
                        </p>
                        {match.unreadCount && match.unreadCount > 0 && (
                          <div className="w-2 h-2 bg-vaiiya-orange rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <Navigation />
    </div>
  );
}




