"use client";

import { useEffect, useState, useCallback } from "react";
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
      router.push("/auth/wallet");
    }
  }, [status, router]);

  const loadLikes = useCallback(async () => {
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
  }, [filter]);

  useEffect(() => {
    if (status === "authenticated") {
      loadLikes();
      // Poll for new likes every 10 seconds
      const interval = setInterval(loadLikes, 10000);
      return () => clearInterval(interval);
    }
  }, [status, loadLikes]);

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
    <div className="h-full bg-white relative overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-8 py-12 bg-[#F7F9FC]">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-serif text-vaiiya-purple font-bold mb-3">
              {likes.length} {likes.length === 1 ? "Admirer" : "Admirers"}
            </h1>
            <p className="text-vaiiya-gray/60 text-lg font-medium">Discover who&apos;s interested in you</p>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-vaiiya-orange uppercase tracking-widest">Premium Only</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8 pb-32">
        {/* Filters */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: "all", label: "All Admirers" },
            { id: "nearby", label: "Nearby" },
            { id: "hasBio", label: "Detailed Bios" },
            { id: "verified", label: "Verified" }
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id as any)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap border ${filter === btn.id
                ? "bg-vaiiya-purple text-white border-vaiiya-purple shadow-md"
                : "bg-white text-vaiiya-gray/60 border-[#E9EDF6] hover:border-vaiiya-purple hover:text-vaiiya-purple"
                }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Premium Call-to-Action */}
        {likes.length > 0 && (
          <div className="vaiiya-card p-10 bg-vaiiya-purple text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-vaiiya-orange/20 rounded-full blur-3xl -mr-24 -mt-24"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <h3 className="text-3xl font-serif font-bold mb-3">Reveal your matches</h3>
                <p className="text-white/70 font-medium text-lg">Don&apos;t leave them waiting. Upgrade to premium to instantly see everyone who swiped right on you.</p>
              </div>
              <button className="btn-vaiiya-primary whitespace-nowrap px-10 py-4 shadow-xl shadow-vaiiya-orange/20">
                Upgrade Now
              </button>
            </div>
          </div>
        )}

        {/* Likes Grid */}
        {likes.length === 0 ? (
          <div className="text-center py-20 vaiiya-card border-dashed">
            <div className="mb-6 text-7xl opacity-20">🤍</div>
            <h3 className="text-2xl font-serif text-vaiiya-purple font-bold mb-2">No admirers yet</h3>
            <p className="text-vaiiya-gray/50 font-medium">Keep swiping and expanding your profile!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {likes.map((like) => (
              <div
                key={like._id}
                className="vaiiya-card aspect-[3/4] overflow-hidden group relative cursor-pointer"
              >
                {/* Blurred image for non-premium */}
                <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110">
                  {like.fromUser.photos && like.fromUser.photos.length > 0 ? (
                    <Image
                      src={like.fromUser.photos[0]}
                      alt="Hidden Profile"
                      fill
                      className="object-cover blur-2xl opacity-40 grayscale"
                      unoptimized={like.fromUser.photos[0]?.startsWith("/api/images/")}
                    />
                  ) : (
                    <div className="w-full h-full bg-[#F7F9FC]" />
                  )}
                </div>

                {/* Content overlay */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end bg-gradient-to-t from-vaiiya-purple/40 to-transparent">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-bold text-xl">{like.fromUser.age || "??"}</span>
                    {like.fromUser.verified && (
                      <span className="w-6 h-6 bg-blue-500 text-white flex items-center justify-center rounded-full text-[10px] shadow-sm">✓</span>
                    )}
                  </div>
                  {like.fromUser.distance !== undefined && (
                    <p className="text-white/80 text-xs font-bold uppercase tracking-wider">
                      {like.fromUser.distance.toFixed(1)} km away
                    </p>
                  )}
                </div>

                {/* Lock icon overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl mb-4">
                    <span className="text-3xl">🔒</span>
                  </div>
                  <span className="text-vaiiya-purple font-bold text-sm uppercase tracking-widest">Unlock Profile</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Navigation />
    </div >
  );
}
