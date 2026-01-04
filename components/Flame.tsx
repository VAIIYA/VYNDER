import React from "react";

interface FlameProps {
  className?: string;
}

export default function Flame({ className = "w-8 h-8" }: FlameProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.5-1.5-2.5-1.5-4C9.5 4.5 8 3 8 3S6.5 4.5 6.5 8c0 1.5-1.5 2.5-1.5 4a2.5 2.5 0 0 0 2.5 2.5Z"
        fill="currentColor"
      />
      <path
        d="M15.5 14.5A2.5 2.5 0 0 0 18 12c0-1.5-1.5-2.5-1.5-4C16.5 4.5 15 3 15 3s-1.5 1.5-1.5 5c0 1.5-1.5 2.5-1.5 4a2.5 2.5 0 0 0 2.5 2.5Z"
        fill="currentColor"
      />
      <path
        d="M12 21c-2.5 0-4.5-2-4.5-4.5 0-1 .5-2 1-3l3.5-6 3.5 6c.5 1 1 2 1 3 0 2.5-2 4.5-4.5 4.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

