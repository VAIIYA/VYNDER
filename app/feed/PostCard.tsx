"use client";

import Image from "next/image";
import { HeartIcon, ChatBubbleLeftIcon, GiftIcon } from "@heroicons/react/24/outline";

type PostCardProps = {
  post: {
    id: string;
    author: { name: string; avatar?: string; handle?: string };
    content: string;
    image?: string;
    time?: string;
  };
};

export default function PostCard({ post }: PostCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-4 flex space-x-3">
      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
        {post.author.avatar ? (
          <Image src={post.author.avatar} alt="avatar" width={40} height={40} />
        ) : (
          <span className="block w-full h-full" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="font-semibold">{post.author.name}</div>
          <span className="text-xs text-gray-500">{post.time ?? "now"}</span>
        </div>
        <p className="mt-1 text-sm text-gray-800 leading-relaxed">{post.content}</p>
        {post.image && (
          <div className="mt-2 rounded-lg overflow-hidden h-40 bg-gray-100 w-full relative">
            <Image src={post.image} alt="post image" fill style={{ objectFit: "cover" }} />
          </div>
        )}
        <div className="mt-3 flex gap-6 text-gray-600">
          <button className="inline-flex items-center space-x-1 hover:text-red-500">
            <HeartIcon className="w-5 h-5" />
            <span className="text-xs">Like</span>
          </button>
          <button className="inline-flex items-center space-x-1 hover:text-blue-500">
            <ChatBubbleLeftIcon className="w-5 h-5" />
            <span className="text-xs">Comment</span>
          </button>
          <button className="inline-flex items-center space-x-1 hover:text-green-500">
            <GiftIcon className="w-5 h-5" />
            <span className="text-xs">Tip</span>
          </button>
        </div>
      </div>
    </div>
  );
}
