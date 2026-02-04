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
      className="vaiiya-card relative w-full h-[65vh] max-h-[550px] overflow-hidden group"
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
      <div className="relative w-full h-full overflow-hidden">
        {user.photos && user.photos.length > 0 ? (
          <>
            {user.photos[currentPhotoIndex] ? (
              <Image
                src={user.photos[currentPhotoIndex]}
                alt={user.username}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
                unoptimized
              />
            ) : (
              <div className="w-full h-full bg-[#F7F9FC] flex items-center justify-center">
                <span className="text-vaiiya-purple text-4xl font-serif">{user.username[0]?.toUpperCase()}</span>
              </div>
            )}

            {/* Photo Navigation Overlay */}
            {user.photos.length > 1 && (
              <div className="absolute inset-x-0 top-0 h-20 flex px-4 pt-4 gap-1.5 z-10">
                {user.photos.map((_, index) => (
                  <div
                    key={index}
                    className="flex-1 h-1 rounded-full overflow-hidden bg-white/30"
                  >
                    <div
                      className={`h-full bg-white transition-all duration-300 ${index === currentPhotoIndex ? 'w-full' : 'w-0'}`}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Tap controllers */}
            <div className="absolute inset-0 flex">
              <div className="flex-1 cursor-w-resize" onClick={(e) => { e.stopPropagation(); prevPhoto(); }} />
              <div className="flex-1 cursor-e-resize" onClick={(e) => { e.stopPropagation(); nextPhoto(); }} />
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-[#F7F9FC] flex items-center justify-center">
            <span className="text-vaiiya-purple text-6xl font-serif">{user.username[0]?.toUpperCase()}</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-vaiiya-purple/90 via-vaiiya-purple/20 to-transparent pointer-events-none" />

        {/* User info */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white pointer-events-none">
          <div className="flex items-end gap-3 mb-2">
            <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight">
              {user.username}{user.age && <span className="ml-2 opacity-80 font-normal">, {user.age}</span>}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-4 opacity-90 text-sm font-medium">
            {user.location && (
              <span className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-2 py-1 rounded-lg">
                📍 {user.location}
              </span>
            )}
            {user.distanceFormatted && (
              <span className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-2 py-1 rounded-lg">
                📏 {user.distanceFormatted}
              </span>
            )}
            {user.tagMatchScore && user.tagMatchScore > 0 && (
              <span className="flex items-center gap-1 bg-vaiiya-orange/80 backdrop-blur-md px-2 py-1 rounded-lg font-bold">
                🎯 {user.tagMatchScore}% Match
              </span>
            )}
          </div>

          {user.bio && (
            <p className="text-base line-clamp-2 mb-4 opacity-80 leading-relaxed max-w-[90%] font-medium">
              {user.bio}
            </p>
          )}

          {user.tags && user.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 opacity-90">
              {user.tags.slice(0, 4).map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

