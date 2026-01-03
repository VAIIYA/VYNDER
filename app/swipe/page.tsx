"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import SwipeCard from "@/components/SwipeCard";
import Navigation from "@/components/Navigation";
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
      router.push("/auth/signin");
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
    <div className="min-h-screen bg-black pb-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-solana-purple via-solana-blue to-solana-green bg-clip-text text-transparent">
          Discover
        </h1>

        <div className="flex justify-center items-center min-h-[600px]">
          <AnimatePresence mode="wait">
            {currentUser ? (
              <SwipeCard
                key={currentUser._id}
                user={currentUser}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
              />
            ) : (
              <div className="text-center text-gray-400">
                <div className="mb-4 text-6xl">🎯</div>
                <p className="text-xl text-white mb-2">No more profiles to show</p>
                <p className="text-sm text-gray-400">Check back later for new matches!</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <Navigation />
    </div>
  );
}




