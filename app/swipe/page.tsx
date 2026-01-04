"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SwipeCard from "@/components/SwipeCard";
import Navigation from "@/components/Navigation";
import Flame from "@/components/Flame";
import toast from "react-hot-toast";
import { AnimatePresence } from "framer-motion";

interface User {
  _id: string;
  username: string;
  age?: number;
  bio?: string;
  photos: string[];
  location?: string;
}

export default function SwipePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/wallet");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      loadNextUser();
    }
  }, [status]);

  const loadNextUser = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/swipe/discover");
      const data = await response.json();

      if (response.ok) {
        if (data.user) {
          setCurrentUser(data.user);
        } else {
          setCurrentUser(null);
          toast.error("No more profiles to show");
        }
      } else {
        toast.error(data.error || "Failed to load profiles");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSwipeLeft = async () => {
    if (!currentUser || swiping) return;

    setSwiping(true);
    try {
      const response = await fetch("/api/swipe/pass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUserId: currentUser._id }),
      });

      if (response.ok) {
        loadNextUser();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to pass");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setSwiping(false);
    }
  };

  const handleSwipeRight = async () => {
    if (!currentUser || swiping) return;

    setSwiping(true);
    try {
      const response = await fetch("/api/swipe/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUserId: currentUser._id }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.match) {
          toast.success("It's a match! 🎉", { duration: 5000 });
        } else {
          toast.success("Liked!");
        }
        loadNextUser();
      } else {
        toast.error(data.error || "Failed to like");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setSwiping(false);
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
    <div className="min-h-screen bg-black pb-20 relative overflow-hidden">
      {/* Tinder-style header */}
      <div className="absolute top-0 left-0 right-0 z-10 px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-8 h-8 text-red-500" />
            <span className="text-white font-bold text-xl">vynder</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-white hover:text-solana-purple transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <button className="text-white hover:text-solana-purple transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </button>
            <button className="text-white hover:text-solana-purple transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main swipe area */}
      <div className="flex justify-center items-center min-h-screen pt-20">
        <AnimatePresence mode="wait">
          {currentUser ? (
            <SwipeCard
              key={currentUser._id}
              user={currentUser}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
            />
          ) : (
            <div className="text-center text-gray-400 max-w-md px-4">
              <div className="mb-6 text-8xl">🎯</div>
              <p className="text-2xl text-white mb-3 font-semibold">No more profiles to show</p>
              <p className="text-gray-400 mb-6">Check back later for new matches!</p>
              <Link
                href="/explore"
                className="inline-block px-6 py-3 bg-gradient-to-r from-solana-purple to-solana-blue text-white rounded-full font-semibold hover:shadow-lg hover:shadow-solana-purple/50 transition-all"
              >
                Explore Interests
              </Link>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Action buttons (mobile) */}
      {currentUser && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 flex gap-4 sm:hidden z-20">
          <button
            onClick={handleSwipeLeft}
            className="w-14 h-14 bg-gray-800 rounded-full flex items-center justify-center text-red-400 border-2 border-red-400/30 hover:bg-red-500/10 transition-all active:scale-95"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <button
            onClick={handleSwipeRight}
            className="w-14 h-14 bg-gradient-to-r from-solana-green to-solana-blue rounded-full flex items-center justify-center text-black hover:shadow-lg hover:shadow-solana-green/50 transition-all active:scale-95"
          >
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </button>
        </div>
      )}

      <Navigation />
    </div>
  );
}




