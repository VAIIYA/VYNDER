import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Like from "@/models/Like";
import Pass from "@/models/Pass";
import Match from "@/models/Match";
import { z } from "zod";

const likeSchema = z.object({
  toUserId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { toUserId } = likeSchema.parse(body);

    if (toUserId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot like yourself" },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if already liked or passed
    const existingLike = await Like.findOne({
      fromUser: session.user.id,
      toUser: toUserId,
    });
    if (existingLike) {
      return NextResponse.json({ message: "Already liked", match: false });
    }

    const existingPass = await Pass.findOne({
      fromUser: session.user.id,
      toUser: toUserId,
    });
    if (existingPass) {
      return NextResponse.json(
        { error: "Cannot like a user you've passed" },
        { status: 400 }
      );
    }

    // Create like
    await Like.create({
      fromUser: session.user.id,
      toUser: toUserId,
    });

    // Check for mutual like (match)
    const mutualLike = await Like.findOne({
      fromUser: toUserId,
      toUser: session.user.id,
    });

    if (mutualLike) {
      // Create match
      const match = await Match.create({
        users: [session.user.id, toUserId],
      });

      return NextResponse.json({
        message: "It's a match!",
        match: true,
        matchId: match._id,
      });
    }

    return NextResponse.json({ message: "Like recorded", match: false });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Like error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}





