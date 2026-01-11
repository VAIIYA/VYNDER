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
      {/* Outer flame layer */}
      <path
        d="M12 2C10 4 8 6 7 8C6 10 5.5 12 6 14C6.5 16 8 17.5 10 18.5C12 19.5 14 19 15.5 17.5C17 16 18 14 18.5 12C19 10 18.5 8 17.5 6.5C16.5 5 15 4 13.5 3.5C12.5 3 12 2.5 12 2Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0.3"
      />
      {/* Inner flame layer */}
      <path
        d="M12 4.5C10.8 5.8 10 7.2 9.5 8.5C9 9.8 9 11 9.2 12.2C9.4 13.4 10 14.4 11 15C12 15.6 13 15.5 13.8 14.8C14.6 14.1 15 13 15 12C15 11 14.6 9.8 13.8 9C13 8.2 12.2 7.8 12 4.5Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0.3"
        className="opacity-80"
      />
    </svg>
  );
}


