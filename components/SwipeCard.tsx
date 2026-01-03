"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useMotionValue, useTransform } from "framer-motion";

interface SwipeCardProps {
  user: {
    _id: string;
    username: string;
    age?: number;
    bio?: string;
    photos: string[];
    location?: string;
    tags?: string[];
    distanceFormatted?: string;
    commonTags?: string[];
    tagMatchScore?: number;
  };
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

export default function SwipeCard({ user, onSwipeLeft, onSwipeRight }: SwipeCardProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [exitX, setExitX] = useState(0);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = () => {
    if (exitX < -100) {
      onSwipeLeft();
    } else if (exitX > 100) {
      onSwipeRight();
    }
  };

  const handleSwipe = (direction: "left" | "right") => {
    setExitX(direction === "left" ? -200 : 200);
    setTimeout(() => {
      if (direction === "left") {
        onSwipeLeft();
      } else {
        onSwipeRight();
      }
    }, 300);
  };

  const nextPhoto = () => {
    if (user.photos.length > 0) {
      setCurrentPhotoIndex((prev) => (prev + 1) % user.photos.length);
    }
  };

  const prevPhoto = () => {
    if (user.photos.length > 0) {
      setCurrentPhotoIndex((prev) => (prev - 1 + user.photos.length) % user.photos.length);
    }
  };

  return (
    <motion.div
      className="swipe-card relative w-full max-w-md mx-auto h-[600px] rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-gray-800"
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(_, info) => {
        setExitX(info.offset.x);
        handleDragEnd();
      }}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ x: exitX, opacity: 0, transition: { duration: 0.3 } }}
    >
      {/* Photo */}
      <div className="relative w-full h-full">
        {user.photos && user.photos.length > 0 ? (
          <>
            {user.photos[currentPhotoIndex] ? (
              <Image
                src={user.photos[currentPhotoIndex]}
                alt={user.username}
                fill
                className="object-cover"
                priority
                unoptimized
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-solana-purple to-solana-blue flex items-center justify-center">
                <span className="text-white text-4xl font-bold">{user.username[0]?.toUpperCase()}</span>
              </div>
            )}
            {user.photos.length > 1 && (
              <>
                <button
                  onClick={prevPhoto}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70"
                >
                  ←
                </button>
                <button
                  onClick={nextPhoto}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70"
                >
                  →
                </button>
                <div className="absolute top-4 right-4 flex gap-1">
                  {user.photos.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1 rounded-full ${
                        index === currentPhotoIndex ? "bg-white w-4" : "bg-white/50 w-1"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
            <span className="text-white text-4xl font-bold">{user.username[0]?.toUpperCase()}</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* User info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-3xl font-bold">{user.username}</h2>
            {user.age && <span className="text-xl">{user.age}</span>}
          </div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            {user.location && (
              <p className="text-sm text-gray-200">📍 {user.location}</p>
            )}
            {user.distanceFormatted && (
              <p className="text-sm text-gray-200">📏 {user.distanceFormatted}</p>
            )}
            {user.tagMatchScore && user.tagMatchScore > 0 && (
              <p className="text-sm bg-gradient-to-r from-solana-green to-solana-blue bg-clip-text text-transparent font-bold">
                🎯 {user.tagMatchScore}% match
              </p>
            )}
          </div>
          {user.commonTags && user.commonTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {user.commonTags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-gradient-to-r from-solana-purple/30 to-solana-blue/30 backdrop-blur-sm rounded-full text-xs font-medium border border-solana-purple/50"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {user.bio && (
            <p className="text-sm line-clamp-2 mb-2 text-gray-200">{user.bio}</p>
          )}
          {user.tags && user.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {user.tags.slice(0, 5).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-white/10 backdrop-blur-sm rounded-full text-xs border border-white/20"
                >
                  {tag}
                </span>
              ))}
              {user.tags.length > 5 && (
                <span className="px-2 py-0.5 bg-white/10 backdrop-blur-sm rounded-full text-xs border border-white/20">
                  +{user.tags.length - 5}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action buttons for desktop */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-4 sm:hidden">
        <button
          onClick={() => handleSwipe("left")}
          className="bg-gray-900/90 backdrop-blur-xl text-red-400 rounded-full p-4 shadow-lg hover:scale-110 transition-transform border border-gray-700 hover:border-red-500"
        >
          ✕
        </button>
        <button
          onClick={() => handleSwipe("right")}
          className="bg-gradient-to-r from-solana-green to-solana-blue text-black rounded-full p-4 shadow-lg hover:scale-110 transition-transform hover:shadow-solana-green/50"
        >
          ♥
        </button>
      </div>
    </motion.div>
  );
}

