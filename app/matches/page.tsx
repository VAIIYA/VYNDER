"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navigation from "@/components/Navigation";
import toast from "react-hot-toast";

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
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      loadMatches();
      // Poll for new matches every 10 seconds
      const interval = setInterval(loadMatches, 10000);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pb-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Your Matches
        </h1>

        {matches.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No matches yet
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
              Start swiping to find your match!
            </p>
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
                  className="block bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                      {otherUser.photos && otherUser.photos.length > 0 ? (
                        <Image
                          src={otherUser.photos[0]}
                          alt={otherUser.username}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                          <span className="text-white text-xl font-bold">
                            {otherUser.username[0]?.toUpperCase()}
                          </span>
                        </div>
                      )}
                      {match.unreadCount && match.unreadCount > 0 && (
                        <div className="absolute top-0 right-0 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {match.unreadCount}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {otherUser.username}
                          {otherUser.age && (
                            <span className="text-gray-500 dark:text-gray-400 font-normal ml-1">
                              {otherUser.age}
                            </span>
                          )}
                        </h3>
                        {match.lastMessageAt && (
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {new Date(match.lastMessageAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {match.lastMessage && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
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

