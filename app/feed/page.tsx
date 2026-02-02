"use client";

import React, { useEffect, useState } from "react";
import PostCard from "./PostCard";
import CreatorCard from "./CreatorCard";
import StoriesBar from "./StoriesBar";
import PaywallModal from "@/components/PaywallModal";

type Post = {
  id: string;
  author: { name: string; avatar?: string; handle?: string };
  content: string;
  image?: string;
  time?: string;
};

type Creator = {
  name: string;
  price?: string;
  subscribers?: number;
  handle?: string;
};

const mockPosts: Post[] = [
  { id: "p1", author: { name: "Belinda", handle: "@belinda" }, content: "Just joined Vynder! Discovering creators with amazing vibes. 🪩", time: "2h" },
  { id: "p2", author: { name: "Liam", handle: "@liam" }, content: "Behind the scenes of a photoshoot. Subscribe for more content!", image: "/images/hero_illustration.png", time: "5h" },
];

const mockCreators: Creator[] = [
  { name: "Nova Studio", price: "$5", subscribers: 1200, handle: "@novastudio" },
  { name: "Aura Creations", price: "$7", subscribers: 980, handle: "@aura" },
  { name: "PixelMuse", price: "$3", subscribers: 430, handle: "@pixel" },
];

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [paywallCreator, setPaywallCreator] = useState<Creator | null>(null);

  useEffect(() => {
    fetch('/api/feed')
      .then((r) => r.json())
      .then((data) => {
        if (data?.posts) setPosts(data.posts);
      })
      .catch(() => setPosts(mockPosts));

    fetch('/api/creators')
      .then((r) => r.json())
      .then((data) => {
        if (data?.creators) setCreators(data.creators);
      })
      .catch(() => setCreators(mockCreators));
  }, []);

  const onSubscribe = (creator: Creator) => {
    setPaywallCreator(creator);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <StoriesBar />
      <header className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="text-2xl font-bold">Vynder Feed</div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Following</span>
          <span>For You</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        <section className="md:col-span-2">
          {(posts.length ? posts : mockPosts).map((p) => (
            <PostCard key={(p as any).id} post={p as any} />
          ))}
        </section>
        <aside className="space-y-4">
          {(creators.length ? creators : mockCreators).map((c: Creator, i) => (
            <CreatorCard key={i} creator={c} onSubscribe={onSubscribe} />
          ))}
        </aside>
      </main>

      {paywallCreator && (
        <PaywallModal creator={paywallCreator} onClose={() => setPaywallCreator(null)} />
      )}
    </div>
  );
}
