import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { z } from "zod";

const reportSchema = z.object({
  userId: z.string(),
  reason: z.string().min(1).max(500),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { userId, reason } = reportSchema.parse(body);

    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot report yourself" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Add to reported users if not already reported
    if (!user.reportedUsers.includes(userId as any)) {
      user.reportedUsers.push(userId as any);
      await user.save();
    }

    // In a production app, you'd also store the report reason in a separate Reports collection
    // For now, we just track that the user was reported

    return NextResponse.json({ message: "User reported successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Report error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

