import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";

export function useSocket(matchId: string | null) {
  const { data: session } = useSession();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!matchId || !session?.user?.id) return;

    // For development, connect to localhost
    // For production, you'll need to set up a separate Socket.io server
    // or use Pusher/Ably
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    
    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      query: {
        userId: session.user.id,
        matchId: matchId,
      },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected");
      setIsConnected(true);
      socket.emit("join_match", matchId);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    socket.on("user_typing", (data: { userId: string; matchId: string }) => {
      if (data.userId !== session.user.id) {
        setTypingUsers((prev) => new Set(prev).add(data.userId));
        // Clear typing after 3 seconds
        setTimeout(() => {
          setTypingUsers((prev) => {
            const newSet = new Set(prev);
            newSet.delete(data.userId);
            return newSet;
          });
        }, 3000);
      }
    });

    socket.on("user_stopped_typing", (data: { userId: string; matchId: string }) => {
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    });

    return () => {
      if (socket) {
        socket.emit("leave_match", matchId);
        socket.disconnect();
      }
    };
  }, [matchId, session?.user?.id]);

  const emitTyping = () => {
    if (socketRef.current && matchId && session?.user?.id) {
      socketRef.current.emit("typing_start", {
        matchId,
        userId: session.user.id,
      });
    }
  };

  const emitStopTyping = () => {
    if (socketRef.current && matchId && session?.user?.id) {
      socketRef.current.emit("typing_stop", {
        matchId,
        userId: session.user.id,
      });
    }
  };

  const emitNewMessage = (message: any) => {
    if (socketRef.current && matchId) {
      socketRef.current.emit("new_message", {
        matchId,
        message,
      });
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    typingUsers: Array.from(typingUsers),
    emitTyping,
    emitStopTyping,
    emitNewMessage,
  };
}

