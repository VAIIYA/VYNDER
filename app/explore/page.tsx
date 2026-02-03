"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";

interface InterestCategory {
  _id: string;
  name: string;
  category: string;
  icon?: string;
  color?: string;
}

interface GoalCategory {
  name: string;
  icon: string;
  userCount: number;
  color: string;
}

export default function ExplorePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [interests, setInterests] = useState<InterestCategory[]>([]);
  const [goalCategories, setGoalCategories] = useState<GoalCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/wallet");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      loadExploreData();
    }
  }, [status]);

  const loadExploreData = async () => {
    try {
      setLoading(true);
      const [interestsRes, goalsRes] = await Promise.all([
        fetch("/api/interests"),
        fetch("/api/explore/goals"),
      ]);

      const interestsData = await interestsRes.json();
      const goalsData = await goalsRes.json();

      if (interestsRes.ok && interestsData.interests) {
        // Flatten interests
        const allInterests: InterestCategory[] = [];
        Object.values(interestsData.interests).forEach((categoryInterests: any) => {
          categoryInterests.forEach((interest: any) => {
            allInterests.push({
              ...interest,
            });
          });
        });
        setInterests(allInterests.slice(0, 12)); // Show top 12
      }

      if (goalsRes.ok && goalsData.goals) {
        setGoalCategories(goalsData.goals);
      }
    } catch (error) {
      console.error("Error loading explore data:", error);
      toast.error("Failed to load explore content");
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

  const categoryColors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-green-500",
  ];

  return (
    <div className="min-h-screen app-shell pb-20">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to Explore</h1>
          <p className="text-gray-400">Find people with similar interests and goals</p>
        </div>

        {/* Goal-driven dating */}
        {goalCategories.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-2">Goal-driven dating</h2>
            <p className="text-gray-400 text-sm mb-4">Find people with similar relationship goals</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {goalCategories.map((goal, index) => (
                <Link
                  key={index}
                  href={`/explore/goal/${goal.name.toLowerCase().replace(/\s+/g, "-")}`}
                  className="relative rounded-2xl p-6 text-white overflow-hidden group hover:scale-[1.02] transition-transform"
                  style={{ backgroundColor: goal.color }}
                >
                  <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm rounded-lg px-3 py-1 text-xs uppercase tracking-widest">
                    Trending
                  </div>
                  <div className="text-6xl mb-4">{goal.icon}</div>
                  <h3 className="text-2xl font-bold">{goal.name}</h3>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Shared interests or hobbies */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-2">Shared interests or hobbies</h2>
          <p className="text-gray-400 text-sm mb-4">Find people with similar interests</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {interests.map((interest, index) => {
              const colorClass = categoryColors[index % categoryColors.length];
              return (
                <Link
                  key={interest._id}
                  href={`/explore/interest/${interest._id}`}
                  className={`relative ${colorClass} rounded-2xl aspect-square p-4 text-white overflow-hidden group hover:scale-[1.05] transition-transform`}
                >
                  <div className="absolute top-2 right-2 bg-black/30 backdrop-blur-sm rounded-lg px-2 py-1 text-[10px] uppercase tracking-widest">
                    Hot
                  </div>
                  <div className="flex flex-col h-full justify-end">
                    {interest.icon && (
                      <div className="text-4xl mb-2">{interest.icon}</div>
                    )}
                    <h3 className="text-lg font-semibold">{interest.name}</h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Similar plans and lifestyles */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-2">Similar plans and lifestyles</h2>
          <p className="text-gray-400 text-sm mb-4">Find people with similar life goals</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/explore/lifestyle/wants-kids"
              className="relative bg-purple-600 rounded-2xl p-6 text-white overflow-hidden group hover:scale-[1.02] transition-transform"
            >
              <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm rounded-lg px-3 py-1 text-xs uppercase tracking-widest">
                Popular
              </div>
              <div className="text-6xl mb-4">👶</div>
              <h3 className="text-2xl font-bold mb-2">Wants Kids</h3>
              <button className="mt-4 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 text-sm font-semibold hover:bg-white/30 transition-colors">
                TRY NOW
              </button>
            </Link>
          </div>
        </div>
      </div>
      <Navigation />
    </div>
  );
}
