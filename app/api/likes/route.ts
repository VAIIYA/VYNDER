import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Like from "@/models/Like";
import User from "@/models/User";
import { calculateDistance } from "@/lib/geolocation";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "all";

    // Get all likes where current user is the target
    const likes = await Like.find({
      toUser: session.user.id,
    })
      .populate("fromUser", "username age photos location coordinates bio verified")
      .sort({ createdAt: -1 })
      .lean();

    // Get current user for distance calculation
    const currentUser = await User.findById(session.user.id).select("coordinates").lean();

    // Process likes with additional data
    let processedLikes = likes.map((like: any) => {
      const fromUser = like.fromUser;
      let distance: number | undefined;

      // Calculate distance if both users have coordinates
      if (
        currentUser?.coordinates?.coordinates &&
        fromUser?.coordinates?.coordinates
      ) {
        distance = calculateDistance(
          currentUser.coordinates.coordinates[1], // lat
          currentUser.coordinates.coordinates[0], // lon
          fromUser.coordinates.coordinates[1], // lat
          fromUser.coordinates.coordinates[0] // lon
        );
      }

      return {
        _id: like._id,
        fromUser: {
          ...fromUser,
          distance,
          recentlyActive: like.createdAt
            ? new Date().getTime() - new Date(like.createdAt).getTime() < 24 * 60 * 60 * 1000
            : false,
        },
        createdAt: like.createdAt,
      };
    });

    // Apply filters
    if (filter === "nearby") {
      processedLikes = processedLikes.filter((like) => like.fromUser.distance && like.fromUser.distance < 50);
    } else if (filter === "hasBio") {
      processedLikes = processedLikes.filter((like) => like.fromUser.bio && like.fromUser.bio.length > 0);
    } else if (filter === "verified") {
      processedLikes = processedLikes.filter((like) => like.fromUser.verified);
    }

    return NextResponse.json({ likes: processedLikes });
  } catch (error) {
    console.error("Likes fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


