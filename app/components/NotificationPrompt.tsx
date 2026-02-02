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
    <div className="fixed bottom-2 right-2 z-40 bg-white p-3 rounded shadow-md flex items-center gap-2">
      <span className="text-sm">Enable notifications for updates</span>
      <button className="px-3 py-1 rounded bg-gradient-to-r from-metamask-orange to-metamask-blue text-white text-xs" onClick={request}>Enable</button>
    </div>
  );
}
