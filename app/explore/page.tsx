"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Navigation from "@/components/Navigation";
import toast from "react-hot-toast";

interface TagItem {
  tag: string;
  count: number;
}

interface PersonCard {
  _id: string;
  username: string;
  age?: number;
  photos: string[];
  location?: string;
  matchScore?: number;
  distanceFormatted?: string;
}

const MAX_TAGS = 5;

export default function ExplorePage() {
  const { status } = useSession();
  const router = useRouter();
  const [tags, setTags] = useState<TagItem[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [people, setPeople] = useState<PersonCard[]>([]);
  const [loadingTags, setLoadingTags] = useState(true);
  const [loadingPeople, setLoadingPeople] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/wallet");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      loadTags();
      loadSuggestions();
    }
  }, [status]);

  useEffect(() => {
    if (selectedTags.length === 0) {
      setPeople([]);
      return;
    }

    loadPeople(selectedTags);
  }, [selectedTags]);

  const loadTags = async () => {
    try {
      setLoadingTags(true);
      const response = await fetch("/api/explore/tags");
      const data = await response.json();
      if (response.ok) {
        setTags(data.tags || []);
      } else {
        toast.error(data.error || "Failed to load tags");
      }
    } catch (error) {
      console.error("Tag load error:", error);
      toast.error("Failed to load tags");
    } finally {
      setLoadingTags(false);
    }
  };

  const loadSuggestions = async () => {
    try {
      const response = await fetch("/api/explore/suggestions");
      const data = await response.json();
      if (response.ok) {
        setSuggestedTags(data.tags || []);
      }
    } catch (error) {
      console.error("Suggestion load error:", error);
    }
  };

  const loadPeople = async (selected: string[]) => {
    try {
      setLoadingPeople(true);
      const query = encodeURIComponent(selected.join(","));
      const response = await fetch(`/api/explore/people?tags=${query}`);
      const data = await response.json();
      if (response.ok) {
        setPeople(data.people || []);
      } else {
        toast.error(data.error || "Failed to load people");
      }
    } catch (error) {
      console.error("People load error:", error);
      toast.error("Failed to load people");
    } finally {
      setLoadingPeople(false);
    }
  };

  const maxCount = useMemo(() => {
    return tags.reduce((max, tag) => Math.max(max, tag.count), 1);
  }, [tags]);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags((prev) => prev.filter((t) => t !== tag));
      return;
    }
    if (selectedTags.length >= MAX_TAGS) {
      toast.error(`Select up to ${MAX_TAGS} tags`);
      return;
    }
    setSelectedTags((prev) => [...prev, tag]);
  };

  const filteredTags = useMemo(() => {
    if (!searchQuery.trim()) return tags;
    const query = searchQuery.trim().toLowerCase();
    return tags.filter((tag) => tag.tag.toLowerCase().includes(query));
  }, [tags, searchQuery]);

  if (status === "loading" || loadingTags) {
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
    <div className="min-h-screen bg-[#F7F9FC] pb-24 text-vaiiya-gray">
      <div className="safe-top px-6 pt-8 pb-6 bg-white/80 backdrop-blur-xl border-b border-[#E9EDF6] sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-vaiiya-purple tracking-tight">Explore</h1>
            <p className="text-vaiiya-gray/60 text-sm mt-1">
              Choose up to {MAX_TAGS} hashtags to surface people.
            </p>
          </div>
          <div className="h-10 w-10 rounded-full vaiiya-card flex items-center justify-center text-vaiiya-purple">
            #
          </div>
        </div>

        <div className="mt-6 vaiiya-card rounded-2xl px-4 py-3 flex items-center gap-3">
          <span className="text-vaiiya-gray/40">🔍</span>
          <input
            className="bg-transparent text-vaiiya-purple placeholder:text-vaiiya-gray/40 w-full outline-none font-medium"
            placeholder="Search tags or interests"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-[10px] uppercase tracking-widest text-vaiiya-gray/40"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="px-6 space-y-6">
        {suggestedTags.length > 0 && (
          <div className="vaiiya-card rounded-3xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-vaiiya-purple">Suggested for you</h2>
                <p className="text-xs text-vaiiya-gray/50">Based on your profile and interests.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestedTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`rounded-full px-3 py-2 text-sm font-semibold transition-all ${
                    selectedTags.includes(tag)
                      ? "bg-vaiiya-orange text-white shadow-md"
                      : "bg-white text-vaiiya-gray/70 border border-[#E9EDF6] hover:border-vaiiya-orange"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="vaiiya-card rounded-3xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-vaiiya-purple">Hashtag Cloud</h2>
              <p className="text-xs text-vaiiya-gray/50">Tap to add, tap again to remove.</p>
            </div>
            <div className="text-xs text-vaiiya-gray/50">
              {selectedTags.length}/{MAX_TAGS}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {filteredTags.map((tag) => {
              const weight = Math.max(0.6, tag.count / maxCount);
              const isSelected = selectedTags.includes(tag.tag);
              return (
                <button
                  key={tag.tag}
                  onClick={() => toggleTag(tag.tag)}
                  className={`rounded-full px-3 py-2 text-sm font-semibold transition-all ${
                    isSelected
                      ? "bg-vaiiya-orange text-white shadow-md"
                      : "bg-white text-vaiiya-gray/70 border border-[#E9EDF6] hover:border-vaiiya-orange"
                  }`}
                  style={{ fontSize: `${0.75 + weight * 0.5}rem` }}
                >
                  {tag.tag}
                </button>
              );
            })}
          </div>
        </div>

        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white"
              >
                {tag} ✕
              </button>
            ))}
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-vaiiya-purple">People for your tags</h3>
            {loadingPeople && <span className="text-xs text-vaiiya-gray/50">Loading…</span>}
          </div>

          {selectedTags.length === 0 ? (
            <div className="vaiiya-card rounded-3xl p-6 text-center text-vaiiya-gray/60">
              Select tags to reveal people who share your vibe.
            </div>
          ) : people.length === 0 && !loadingPeople ? (
            <div className="vaiiya-card rounded-3xl p-6 text-center text-vaiiya-gray/60">
              No matches yet for those tags. Try mixing in another.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {people.map((person) => (
                <div key={person._id} className="relative overflow-hidden rounded-3xl vaiiya-card">
                  <div className="relative aspect-[3/4]">
                    {person.photos?.[0] ? (
                      <Image
                        src={person.photos[0]}
                        alt={person.username}
                        fill
                        className="object-cover"
                        unoptimized={person.photos[0]?.startsWith("/api/images/")}
                      />
                    ) : (
                      <div className="w-full h-full bg-[#F7F9FC] flex items-center justify-center text-2xl font-bold text-vaiiya-purple">
                        {person.username[0]?.toUpperCase()}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-white font-semibold">
                        {person.username}
                        {person.age ? `, ${person.age}` : ""}
                      </div>
                      {person.matchScore !== undefined && (
                        <span className="text-xs text-vaiiya-orange font-semibold">
                          {person.matchScore}% match
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-300 mt-1">
                      {person.location || "Nearby"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Navigation />
    </div>
  );
}
