"use client";

import { useEffect, useState } from "react";

export default function NotificationPrompt() {
  const [permission, setPermission] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission((Notification as any).permission);
    }
  }, []);

  const request = async () => {
    if (!("Notification" in window)) return;
    const perm = await Notification.requestPermission();
    setPermission(perm);
  };

  if (permission === 'granted') return null;

  return (
    <div className="fixed bottom-24 right-4 z-40 vaiiya-card p-4 flex items-center gap-4 animate-in slide-in-from-bottom-5">
      <span className="text-sm font-bold text-vaiiya-purple">Stay updated</span>
      <button
        className="btn-vaiiya-primary px-4 py-1.5 text-xs"
        onClick={request}
      >
        Enable
      </button>
    </div>
  );
}
