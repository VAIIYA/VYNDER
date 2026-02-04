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
  userCount?: number;
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
    <div className="h-full bg-white relative overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-8 py-12 bg-[#F7F9FC]">
        <h1 className="text-5xl font-serif text-vaiiya-purple font-bold mb-3">Explore</h1>
        <p className="text-vaiiya-gray/60 text-lg font-medium">Discover connections through shared passions</p>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-12 pb-32">
        {/* Goal-driven dating */}
        {goalCategories.length > 0 && (
          <section>
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-3xl font-serif text-vaiiya-purple font-bold">Intentions</h2>
                <p className="text-vaiiya-gray/50 font-medium">What are you looking for today?</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {goalCategories.map((goal, index) => (
                <Link
                  key={index}
                  href={`/explore/goal/${goal.name.toLowerCase().replace(/\s+/g, "-")}`}
                  className="relative group h-48 rounded-[32px] overflow-hidden vaiiya-card border-none shadow-md hover:shadow-xl transition-all duration-500"
                >
                  <div className="absolute inset-0 opacity-10 transition-opacity group-hover:opacity-20" style={{ backgroundColor: goal.color }}></div>
                  <div className="relative h-full p-8 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <span className="text-5xl">{goal.icon}</span>
                      <div className="bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-vaiiya-purple shadow-sm">
                        {goal.userCount} active
                      </div>
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-vaiiya-purple">{goal.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Shared interests */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-3xl font-serif text-vaiiya-purple font-bold">Interests</h2>
              <p className="text-vaiiya-gray/50 font-medium">People who love what you love</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {interests.map((interest, index) => (
              <Link
                key={interest._id}
                href={`/explore/interest/${interest._id}`}
                className="vaiiya-card p-6 flex flex-col items-center text-center gap-4 hover:bg-[#F7F9FC] transition-all hover:scale-[1.02] cursor-pointer group"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#F7F9FC] group-hover:bg-white flex items-center justify-center text-3xl shadow-sm transition-colors">
                  {interest.icon || "✨"}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-vaiiya-purple mb-1">{interest.name}</h3>
                  <p className="text-xs font-bold text-vaiiya-orange uppercase tracking-wider">{interest.userCount || 0} members</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Similar lifestyles */}
        <section className="pb-12">
          <div className="vaiiya-card bg-vaiiya-purple p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-vaiiya-orange/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="relative z-10">
              <span className="text-5xl mb-6 block">👶</span>
              <h2 className="text-4xl font-serif font-bold mb-4">Lifestyles</h2>
              <p className="text-white/70 text-lg font-medium mb-8 max-w-md">Filter by life plans and future goals to find your long-term partner.</p>
              <Link href="/explore/lifestyle/wants-kids" className="btn-vaiiya-primary inline-block">
                Explore Lifestyles
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Navigation />
    </div>
  );
}
