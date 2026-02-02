"use client";

import React from "react";

const stories = [
  { id: 1, title: "Live now", avatar: "/images/avatars/1.webp" },
  { id: 2, title: "Sneak peek", avatar: "/images/avatars/2.webp" },
  { id: 3, title: "Creator 1", avatar: "/images/avatars/3.webp" },
  { id: 4, title: "Creator 2", avatar: "/images/avatars/4.webp" },
];

export default function StoriesBar() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-2 overflow-x-auto hide-scrollbar flex gap-3 mb-4">
      {stories.map((s) => (
        <div key={s.id} className="flex-shrink-0 w-24 h-24 rounded-full bg-gray-200 overflow-hidden relative border-2 border-white/70">
          <img src={s.avatar} alt={s.title} className="w-full h-full object-cover" />
          <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-xs text-center py-1">{s.title}</div>
        </div>
      ))}
    </div>
  );
}
