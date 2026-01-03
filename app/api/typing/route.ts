import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Match from "@/models/Match";

// Simple in-memory store for typing indicators
// In production, use Redis or a database
const typingUsers = new Map<string, { userId: string; matchId: string; timestamp: number }>();

// Clean up old typing indicators every 5 seconds
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of typingUsers.entries()) {
    if (now - value.timestamp > 5000) {
      typingUsers.delete(key);
    }
  }
}, 5000);

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { matchId, isTyping } = body;

    await connectDB();

    // Verify user is part of this match
    const match = await Match.findById(matchId);
    if (!match || !match.users.includes(session.user.id as any)) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    const key = `${matchId}:${session.user.id}`;

    if (isTyping) {
      typingUsers.set(key, {
        userId: session.user.id,
        matchId,
        timestamp: Date.now(),
      });
    } else {
      typingUsers.delete(key);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Typing indicator error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get("matchId");

    if (!matchId) {
      return NextResponse.json({ error: "Match ID required" }, { status: 400 });
    }

    await connectDB();

    // Verify user is part of this match
    const match = await Match.findById(matchId);
    if (!match || !match.users.includes(session.user.id as any)) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    // Get typing users for this match (excluding current user)
    const typing = Array.from(typingUsers.values())
      .filter(
        (t) =>
          t.matchId === matchId &&
          t.userId !== session.user.id &&
          Date.now() - t.timestamp < 5000
      )
      .map((t) => t.userId);

    return NextResponse.json({ typing });
  } catch (error) {
    console.error("Typing indicator fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

