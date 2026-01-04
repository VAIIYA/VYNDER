import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Pass from "@/models/Pass";
import Like from "@/models/Like";
import { z } from "zod";

const passSchema = z.object({
  toUserId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { toUserId } = passSchema.parse(body);

    if (toUserId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot pass on yourself" },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if already passed or liked
    const existingPass = await Pass.findOne({
      fromUser: session.user.id,
      toUser: toUserId,
    });
    if (existingPass) {
      return NextResponse.json({ message: "Already passed" });
    }

    const existingLike = await Like.findOne({
      fromUser: session.user.id,
      toUser: toUserId,
    });
    if (existingLike) {
      return NextResponse.json(
        { error: "Cannot pass on a user you've liked" },
        { status: 400 }
      );
    }

    // Create pass
    await Pass.create({
      fromUser: session.user.id,
      toUser: toUserId,
    });

    return NextResponse.json({ message: "Pass recorded" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Pass error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}






