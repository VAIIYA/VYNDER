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
              <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
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
          {user.location && (
            <p className="text-sm text-gray-200 mb-2">📍 {user.location}</p>
          )}
          {user.bio && (
            <p className="text-sm line-clamp-2">{user.bio}</p>
          )}
        </div>
      </div>

      {/* Action buttons for desktop */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-4 sm:hidden">
        <button
          onClick={() => handleSwipe("left")}
          className="bg-white dark:bg-gray-800 text-red-500 rounded-full p-4 shadow-lg hover:scale-110 transition-transform"
        >
          ✕
        </button>
        <button
          onClick={() => handleSwipe("right")}
          className="bg-white dark:bg-gray-800 text-green-500 rounded-full p-4 shadow-lg hover:scale-110 transition-transform"
        >
          ♥
        </button>
      </div>
    </motion.div>
  );
}

