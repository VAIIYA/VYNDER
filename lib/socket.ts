import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";

let io: SocketIOServer | null = null;

export function initSocketIO(httpServer?: HTTPServer): SocketIOServer {
  if (io) {
    return io;
  }

  io = new SocketIOServer(httpServer || {
    path: "/api/socket",
    addTrailingSlash: false,
  }, {
    cors: {
      origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Join match room
    socket.on("join_match", (matchId: string) => {
      socket.join(`match:${matchId}`);
      console.log(`Socket ${socket.id} joined match:${matchId}`);
    });

    // Leave match room
    socket.on("leave_match", (matchId: string) => {
      socket.leave(`match:${matchId}`);
      console.log(`Socket ${socket.id} left match:${matchId}`);
    });

    // Handle typing indicator
    socket.on("typing_start", (data: { matchId: string; userId: string }) => {
      socket.to(`match:${data.matchId}`).emit("user_typing", {
        userId: data.userId,
        matchId: data.matchId,
      });
    });

    socket.on("typing_stop", (data: { matchId: string; userId: string }) => {
      socket.to(`match:${data.matchId}`).emit("user_stopped_typing", {
        userId: data.userId,
        matchId: data.matchId,
      });
    });

    // Handle new message
    socket.on("new_message", (data: { matchId: string; message: any }) => {
      socket.to(`match:${data.matchId}`).emit("message_received", {
        matchId: data.matchId,
        message: data.message,
      });
    });

    // Handle message read
    socket.on("message_read", (data: { matchId: string; messageIds: string[] }) => {
      socket.to(`match:${data.matchId}`).emit("messages_read", {
        matchId: data.matchId,
        messageIds: data.messageIds,
      });
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
}

export function getSocketIO(): SocketIOServer | null {
  return io;
}

// Note: Socket.io server initialization is handled separately
// For Next.js App Router, use client-side connections via useSocket hook
// This file provides utility functions for socket management

