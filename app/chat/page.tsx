"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";

export default function ChatListPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      router.push("/matches");
    }
  }, [status, router]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navigation />
    </div>
  );
}


