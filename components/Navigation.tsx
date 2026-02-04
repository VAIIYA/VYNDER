"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, HeartIcon, ChatBubbleLeftRightIcon, UserIcon, MapIcon, StarIcon } from "@heroicons/react/24/outline";
import { HomeIcon as HomeIconSolid, HeartIcon as HeartIconSolid, ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid, UserIcon as UserIconSolid, MapIcon as MapIconSolid, StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

const navItems = [
  { href: "/swipe", icon: HomeIcon, iconSolid: HomeIconSolid, label: "Home" },
  { href: "/explore", icon: MapIcon, iconSolid: MapIconSolid, label: "Explore" },
  { href: "/likes", icon: StarIcon, iconSolid: StarIconSolid, label: "Likes" },
  { href: "/chat", icon: ChatBubbleLeftRightIcon, iconSolid: ChatBubbleLeftRightIconSolid, label: "Chat" },
  { href: "/profile", icon: UserIcon, iconSolid: UserIconSolid, label: "Profile" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed lg:absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-[#E9EDF6] z-50 safe-area-bottom">
      <div className="flex justify-around items-center h-20 lg:h-24 px-2 max-w-lg mx-auto lg:max-w-none lg:px-12">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          const Icon = isActive ? item.iconSolid : item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all relative group ${isActive
                ? "text-vaiiya-orange"
                : "text-vaiiya-gray/60 hover:text-vaiiya-purple"
                }`}
            >
              <div className="flex flex-col items-center transition-transform group-active:scale-90">
                <Icon className={`w-6 h-6 lg:w-7 lg:h-7 transition-all ${isActive ? "scale-110" : ""}`} />
                <span className="text-[10px] lg:text-xs mt-1.5 font-bold uppercase tracking-widest">{item.label}</span>
              </div>

              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-vaiiya-orange rounded-t-full"></div>
              )}

            </Link >
          );
        })}
      </div >
    </nav >
  );
}



