"use client";

import React from "react";

type Creator = { name: string; price?: string; handle?: string };

export default function PaywallModal({ creator, onClose }: { creator: Creator; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 text-black">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Subscribe to {creator.name}</h3>
          <button onClick={onClose} className="text-xl">×</button>
        </div>
        <p className="text-sm mb-4">Unlock access to creator content for {creator.price ?? '$5'}/month.</p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200">Cancel</button>
          <button className="px-4 py-2 rounded bg-gradient-to-r from-metamask-orange to-metamask-blue text-white font-bold">Proceed</button>
        </div>
      </div>
    </div>
  );
}
