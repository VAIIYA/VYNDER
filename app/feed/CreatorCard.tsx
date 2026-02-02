"use client";

import Image from "next/image";

type CreatorCardProps = {
  creator: {
    name: string;
    avatar?: string;
    handle?: string;
    bio?: string;
    price?: string;
    subscribers?: number;
  };
  onSubscribe?: (creator: any) => void;
};

export default function CreatorCard({ creator, onSubscribe }: CreatorCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-4 flex items-center gap-3">
      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
        {creator.avatar ? (
          <Image src={creator.avatar} alt="creator" width={48} height={48} />
        ) : (
          <span className="block w-full h-full" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <strong>{creator.name}</strong>
          <span className="text-xs text-gray-500">{creator.handle ?? "@creator"}</span>
        </div>
        {creator.bio && <p className="text-sm text-gray-700 line-clamp-2">{creator.bio}</p>}
      </div>
      <div className="flex-shrink-0 text-right">
        <div className="text-sm">Subscribe</div>
        <div className="text-xs text-gray-500">{creator.subscribers ?? 0} subs</div>
        <button
          className="mt-2 px-3 py-1 bg-gradient-to-r from-metamask-orange to-metamask-blue text-white rounded-full text-xs font-bold"
          onClick={() => onSubscribe?.(creator)}
        >
          {creator.price ?? "$3"}/mo
        </button>
      </div>
    </div>
  );
}
