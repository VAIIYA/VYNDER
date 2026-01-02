import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Match from "@/models/Match";
import User from "@/models/User";
import Message from "@/models/Message";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const matches = await Match.find({
      users: session.user.id,
    })
      .populate("users", "username photos age bio location")
      .populate("lastMessage")
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .lean();

    // Filter out current user from each match's users array
    const validMatches = matches
      .map((match) => ({
        ...match,
        users: (match.users as any[]).filter(
          (user: any) => user._id.toString() !== session.user.id
        ),
      }))
      .filter((match) => match.users && match.users.length > 0);

    // Get unread message counts for each match
    const matchesWithUnread = await Promise.all(
      validMatches.map(async (match) => {
        const unreadCount = await Message.countDocuments({
          match: match._id,
          sender: { $ne: session.user.id },
          read: false,
        });

        return {
          ...match,
          unreadCount,
        };
      })
    );

    return NextResponse.json({ matches: matchesWithUnread });
  } catch (error) {
    console.error("Matches fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

