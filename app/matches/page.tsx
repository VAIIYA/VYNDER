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
  const [sseConnected, setSseConnected] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/wallet");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      loadMatches();
      let eventSource: EventSource | null = null;
      let fallbackInterval: NodeJS.Timeout | null = null;

      const startFallbackPolling = () => {
        if (fallbackInterval) return;
        fallbackInterval = setInterval(loadMatches, 7000);
      };

      try {
        eventSource = new EventSource("/api/matches/stream");
        eventSource.onopen = () => {
          setSseConnected(true);
        };
        eventSource.addEventListener("refresh", () => {
          loadMatches();
        });
        eventSource.onerror = () => {
          setSseConnected(false);
          if (eventSource) {
            eventSource.close();
          }
          startFallbackPolling();
        };
      } catch (error) {
        console.error("SSE connection error:", error);
        startFallbackPolling();
      }

      return () => {
        if (eventSource) {
          eventSource.close();
        }
        if (fallbackInterval) {
          clearInterval(fallbackInterval);
        }
      };
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
      <div className="min-h-screen flex items-center justify-center app-shell">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-solana-purple mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen app-shell pb-20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-solana-purple via-solana-blue to-solana-green bg-clip-text text-transparent">
            Your Matches
          </h1>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500">
            <span
              className={`h-2 w-2 rounded-full ${
                sseConnected ? "bg-solana-green" : "bg-gray-600"
              }`}
            />
            {sseConnected ? "Live" : "Connecting"}
          </div>
        </div>

        {matches.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-4 text-6xl">💔</div>
            <p className="text-gray-300 text-lg mb-2">
              No matches yet
            </p>
            <p className="text-gray-500 text-sm">
              Start swiping to find your match!
            </p>
            <Link
              href="/swipe"
              className="inline-block mt-6 px-6 py-3 bg-gradient-to-r from-metamask-orange to-metamask-blue text-white rounded-full font-semibold hover:shadow-lg transition-all"
            >
              Start Swiping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => {
              const otherUser = match.users.find(
                (u) => u._id !== session?.user?.id
              );
              if (!otherUser) return null;

              return (
                <Link
                  key={match._id}
                  href={`/chat/${match._id}`}
                  className="block panel rounded-2xl p-4 hover:border-solana-purple/50 transition-all hover:shadow-lg hover:shadow-solana-purple/20"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
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
                          <span className="text-white text-xl font-bold">
                            {otherUser.username[0]?.toUpperCase()}
                          </span>
                        </div>
                      )}
                      {match.unreadCount && match.unreadCount > 0 && (
                        <div className="absolute top-0 right-0 bg-gradient-to-r from-solana-green to-solana-blue text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg">
                          {match.unreadCount}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-white truncate">
                          {otherUser.username}
                          {otherUser.age && (
                            <span className="text-gray-400 font-normal ml-1">
                              {otherUser.age}
                            </span>
                          )}
                        </h3>
                        {match.lastMessageAt && (
                          <span className="text-xs text-gray-500">
                            {(() => {
                              const date = new Date(match.lastMessageAt);
                              if (isToday(date)) {
                                return format(date, "h:mm a");
                              } else if (isYesterday(date)) {
                                return "Yesterday";
                              } else {
                                return format(date, "MMM d");
                              }
                            })()}
                          </span>
                        )}
                      </div>
                      {match.lastMessage && (
                        <p className="text-sm text-gray-400 truncate mt-1">
                          {match.lastMessage.text}
                        </p>
                      )}
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
