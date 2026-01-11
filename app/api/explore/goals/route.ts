import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get user counts for different relationship goals
    // This is a simplified version - in production, you'd track this in user profiles
    const totalUsers = await User.countDocuments({ profileCompleted: true });

    const goals = [
      {
        name: "Long-term partner",
        icon: "🌹",
        userCount: Math.floor(totalUsers * 0.4), // Mock: 40% of users
        color: "#A855F7", // Purple
      },
      {
        name: "Serious Daters",
        icon: "🦢",
        userCount: Math.floor(totalUsers * 0.3), // Mock: 30% of users
        color: "#F97316", // Orange
      },
      {
        name: "Free Tonight",
        icon: "🌙",
        userCount: Math.floor(totalUsers * 0.2), // Mock: 20% of users
        color: "#A855F7", // Purple
      },
      {
        name: "Something Casual",
        icon: "☕",
        userCount: Math.floor(totalUsers * 0.1), // Mock: 10% of users
        color: "#EF4444", // Red
      },
    ];

    return NextResponse.json({ goals });
  } catch (error) {
    console.error("Explore goals error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}



