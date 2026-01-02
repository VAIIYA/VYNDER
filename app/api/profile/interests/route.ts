import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Interest from "@/models/Interest";
import { z } from "zod";

const updateInterestsSchema = z.object({
  interestIds: z.array(z.string()).max(10, "Maximum 10 interests allowed"),
});

// Get user's interests
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id)
      .select("interests")
      .populate("interests", "name category icon")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ interests: user.interests || [] });
  } catch (error) {
    console.error("Interests fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Update user's interests
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { interestIds } = updateInterestsSchema.parse(body);

    await connectDB();

    // Verify all interest IDs exist and are active
    const interests = await Interest.find({
      _id: { $in: interestIds },
      isActive: true,
    });

    if (interests.length !== interestIds.length) {
      return NextResponse.json(
        { error: "One or more interests are invalid" },
        { status: 400 }
      );
    }

    // Update user's interests
    const user = await User.findByIdAndUpdate(
      session.user.id,
      { 
        $set: { 
          interests: interestIds,
          lastActive: new Date(),
        } 
      },
      { new: true }
    )
      .select("interests")
      .populate("interests", "name category icon");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ interests: user.interests });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Interests update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

