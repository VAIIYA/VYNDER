import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Message from "@/models/Message";
import Match from "@/models/Match";
import { z } from "zod";

const messageSchema = z.object({
  text: z.string().min(1).max(1000),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { matchId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Verify user is part of this match
    const match = await Match.findById(params.matchId);
    if (!match || !match.users.includes(session.user.id as any)) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    const messages = await Message.find({ match: params.matchId })
      .populate("sender", "username photos")
      .sort({ createdAt: 1 })
      .lean();

    // Mark messages as read
    await Message.updateMany(
      {
        match: params.matchId,
        sender: { $ne: session.user.id },
        read: false,
      },
      { read: true, readAt: new Date() }
    );

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Messages fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { matchId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { text } = messageSchema.parse(body);

    await connectDB();

    // Verify user is part of this match
    const match = await Match.findById(params.matchId);
    if (!match || !match.users.includes(session.user.id as any)) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    // Create message
    const message = await Message.create({
      match: params.matchId,
      sender: session.user.id,
      text: text.trim(),
    });

    // Update match's last message
    await Match.findByIdAndUpdate(params.matchId, {
      lastMessage: message._id,
      lastMessageAt: new Date(),
    });

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "username photos")
      .lean();

    return NextResponse.json({ message: populatedMessage }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Message send error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


