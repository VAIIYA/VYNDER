"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";

interface Like {
  _id: string;
  fromUser: {
    _id: string;
    username: string;
    age?: number;
    photos: string[];
    location?: string;
    verified?: boolean;
    distance?: number;
    recentlyActive?: boolean;
  };
  createdAt: string;
}

export default function LikesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [likes, setLikes] = useState<Like[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "nearby" | "hasBio" | "verified">("all");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      loadLikes();
      // Poll for new likes every 10 seconds
      const interval = setInterval(loadLikes, 10000);
      return () => clearInterval(interval);
    }
  }, [status, filter]);

  const loadLikes = async () => {
    try {
      const response = await fetch(`/api/likes?filter=${filter}`);
      const data = await response.json();

      if (response.ok) {
        setLikes(data.likes || []);
      } else {
        toast.error(data.error || "Failed to load likes");
      }
    } catch (error) {
      console.error("Error loading likes:", error);
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
    <div className="min-h-screen bg-black pb-20">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            {likes.length} {likes.length === 1 ? "Like" : "Likes"}
          </h1>
          <p className="text-gray-400 text-sm">
            Upgrade to see who already likes you
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
              filter === "all"
                ? "bg-solana-purple text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("nearby")}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
              filter === "nearby"
                ? "bg-solana-purple text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            Nearby
          </button>
          <button
            onClick={() => setFilter("hasBio")}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
              filter === "hasBio"
                ? "bg-solana-purple text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            Has Bio
          </button>
          <button
            onClick={() => setFilter("verified")}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
              filter === "verified"
                ? "bg-solana-purple text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            Photo Verified
          </button>
        </div>

        {/* Premium Banner */}
        {likes.length > 0 && (
          <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-2xl p-4 mb-6">
            <p className="text-white text-sm mb-2">
              Upgrade to see people who have already liked you.
            </p>
            <button className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold py-3 rounded-xl hover:shadow-lg hover:shadow-yellow-500/50 transition-all">
              See Who Likes You
            </button>
          </div>
        )}

        {/* Likes Grid */}
        {likes.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-4 text-6xl">💔</div>
            <p className="text-gray-300 text-lg mb-2">No likes yet</p>
            <p className="text-gray-500 text-sm">
              Start swiping to get more likes!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {likes.map((like) => (
              <div
                key={like._id}
                className="relative aspect-[3/4] rounded-2xl overflow-hidden group"
              >
                {/* Blurred image for non-premium */}
                <div className="absolute inset-0 blur-xl scale-110">
                  {like.fromUser.photos && like.fromUser.photos.length > 0 ? (
                    <Image
                      src={like.fromUser.photos[0]}
                      alt={like.fromUser.username}
                      fill
                      className="object-cover opacity-50"
                      unoptimized={like.fromUser.photos[0]?.startsWith("/api/images/")}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-solana-purple to-solana-blue" />
                  )}
                </div>

                {/* Content overlay */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col justify-end p-4">
                  <div className="bg-black/50 backdrop-blur-md rounded-lg px-3 py-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">
                        {like.fromUser.age || "?"}
                      </span>
                      {like.fromUser.verified && (
                        <span className="text-blue-400">✓</span>
                      )}
                    </div>
                  </div>
                  {like.fromUser.distance && (
                    <p className="text-white text-xs mb-1">
                      {like.fromUser.distance.toFixed(1)} miles away
                    </p>
                  )}
                  {like.fromUser.recentlyActive && (
                    <p className="text-gray-300 text-xs">Recently Active</p>
                  )}
                </div>

                {/* Premium overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🔒</div>
                    <p className="text-white text-sm font-semibold">Upgrade to see</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Navigation />
    </div>
  );
}

