"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, HeartIcon, ChatBubbleLeftRightIcon, UserIcon } from "@heroicons/react/24/outline";
import { HomeIcon as HomeIconSolid, HeartIcon as HeartIconSolid, ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid, UserIcon as UserIconSolid } from "@heroicons/react/24/solid";

const navItems = [
  { href: "/swipe", icon: HomeIcon, iconSolid: HomeIconSolid, label: "Discover" },
  { href: "/matches", icon: HeartIcon, iconSolid: HeartIconSolid, label: "Matches" },
  { href: "/chat", icon: ChatBubbleLeftRightIcon, iconSolid: ChatBubbleLeftRightIconSolid, label: "Messages" },
  { href: "/profile", icon: UserIcon, iconSolid: UserIconSolid, label: "Profile" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-t border-gray-800 z-50 safe-area-bottom">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          const Icon = isActive ? item.iconSolid : item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all relative ${
                isActive
                  ? "text-solana-purple"
                  : "text-gray-500"
              }`}
            >
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-solana-purple to-solana-blue rounded-b-full"></div>
              )}
              <Icon className={`w-6 h-6 transition-transform ${isActive ? "scale-110" : ""}`} />
              <span className="text-xs mt-1 hidden sm:block font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}




