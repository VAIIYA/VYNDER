import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Like from "@/models/Like";
import Pass from "@/models/Pass";
import Image from "@/models/Image";
import {
  calculateDistance,
  formatDistance,
  calculateTagMatchScore,
  findCommonTags,
} from "@/lib/geolocation";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const currentUser = await User.findById(session.user.id);
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const requiredCompletion = 60;
    if ((currentUser.profileCompletionPercentage || 0) < requiredCompletion) {
      return NextResponse.json(
        {
          error: "Profile incomplete",
          profileCompletionPercentage: currentUser.profileCompletionPercentage || 0,
          requiredCompletion,
        },
        { status: 403 }
      );
    }

    // Get all users that current user has liked or passed
    const likedUsers = await Like.find({
      fromUser: session.user.id,
    }).select("toUser");
    const passedUsers = await Pass.find({
      fromUser: session.user.id,
    }).select("toUser");

    const excludedUserIds = [
      session.user.id,
      ...likedUsers.map((like) => like.toUser.toString()),
      ...passedUsers.map((pass) => pass.toUser.toString()),
      ...currentUser.blockedUsers.map((id) => id.toString()),
    ];

    // Get users who are interested in current user's gender (mutual interest)
    let candidateUserIds: string[] = [];
    if (currentUser.gender) {
      const usersInterestedInMe = await User.find({
        $or: [
          { interestedIn: currentUser.gender },
          { interestedIn: "all" },
        ],
      }).select("_id");
      candidateUserIds = usersInterestedInMe.map((u) => u._id.toString());
    } else {
      // If current user hasn't set gender, show all users
      const allUsers = await User.find({}).select("_id");
      candidateUserIds = allUsers.map((u) => u._id.toString());
    }

    // Filter out excluded users
    const validUserIds = candidateUserIds.filter(
      (id) => !excludedUserIds.includes(id)
    );

    if (validUserIds.length === 0) {
      return NextResponse.json({ user: null, message: "No more profiles" });
    }

    // Build query for potential matches
    const query: any = {
      _id: { $in: validUserIds },
      profileCompleted: true,
    };

    // Filter by interestedIn (who current user wants to see)
    const interestedIn = currentUser.interestedIn || [];
    if (interestedIn.length > 0 && !interestedIn.includes("all")) {
      query.gender = { $in: interestedIn };
    }

    // Get users to show with enhanced profile data
    // Prioritize users with shared tags and nearby location
    let users;
    try {
      users = await User.find(query)
        .select(
          "username age bio photos location city country gender interests tags jobTitle company school height education drinking smoking exercise kids pets languages coordinates lastActive"
        )
        .populate("interests", "name category icon")
        .limit(10) // Get more candidates to sort by match quality
        .sort({ createdAt: -1 });
    } catch (populateError) {
      // If populate fails, try without populate
      console.warn("Populate interests failed, fetching without:", populateError);
      users = await User.find(query)
        .select(
          "username age bio photos location city country gender interests tags jobTitle company school height education drinking smoking exercise kids pets languages coordinates lastActive"
        )
        .limit(10)
        .sort({ createdAt: -1 });
    }

    if (users.length === 0) {
      return NextResponse.json({ user: null, message: "No more profiles" });
    }

    // Score and sort users by match quality (tags + distance)
    const scoredUsers = users.map((user) => {
      let score = 0;
      let distance: number | null = null;
      let distanceFormatted = "";
      let tagMatchScore = 0;
      let commonTags: string[] = [];

      // Calculate tag match score
      if (currentUser.tags && currentUser.tags.length > 0 && user.tags && user.tags.length > 0) {
        commonTags = findCommonTags(
          currentUser.tags || [],
          user.tags || []
        );
        tagMatchScore = calculateTagMatchScore(
          currentUser.tags || [],
          user.tags || []
        );
        score += tagMatchScore * 2; // Weight tags heavily
      }

      // Calculate distance if both users have coordinates
      if (
        currentUser.coordinates?.latitude &&
        currentUser.coordinates?.longitude &&
        user.coordinates?.latitude &&
        user.coordinates?.longitude
      ) {
        distance = calculateDistance(
          {
            latitude: currentUser.coordinates.latitude,
            longitude: currentUser.coordinates.longitude,
          },
          {
            latitude: user.coordinates.latitude,
            longitude: user.coordinates.longitude,
          }
        );
        distanceFormatted = formatDistance(distance);
        // Prefer closer users (inverse distance scoring)
        if (distance < 5) score += 50; // Very close
        else if (distance < 25) score += 30; // Close
        else if (distance < 50) score += 15; // Medium distance
        else if (distance < 100) score += 5; // Far
      }

      return {
        user,
        score,
        distance,
        distanceFormatted,
        tagMatchScore,
        commonTags,
      };
    });

    // Sort by score (highest first) and pick the best match
    scoredUsers.sort((a, b) => b.score - a.score);
    const bestMatch = scoredUsers[0];
    const user = bestMatch.user;

    // Get user's images from Image model (handle if collection doesn't exist)
    let images: any[] = [];
    try {
      images = await Image.find({ user: user._id })
        .sort({ order: 1 })
        .lean();
    } catch (imageError) {
      console.warn("Image collection not found, using legacy photos:", imageError);
      images = [];
    }

    // Use images from Image model if available, otherwise fall back to photos array
    const userPhotos = images.length > 0 
      ? images.map((img) => img.url)
      : (user.photos || []);

    // Calculate interest match score if current user has interests
    let interestMatchScore = 0;
    try {
      if (currentUser.interests && currentUser.interests.length > 0 && user.interests) {
        const currentUserInterestIds = currentUser.interests.map((id: any) => 
          id?.toString ? id.toString() : String(id)
        );
        const userInterestIds = (Array.isArray(user.interests) ? user.interests : []).map((int: any) => 
          typeof int === 'object' && int?._id ? int._id.toString() : String(int)
        );
        const commonInterests = currentUserInterestIds.filter((id: string) => 
          userInterestIds.includes(id)
        );
        if (currentUserInterestIds.length > 0 || userInterestIds.length > 0) {
          interestMatchScore = (commonInterests.length / Math.max(currentUserInterestIds.length, userInterestIds.length, 1)) * 100;
        }
      }
    } catch (interestError) {
      console.warn("Error calculating interest match score:", interestError);
      interestMatchScore = 0;
    }

    return NextResponse.json({ 
      user: {
        ...user.toObject(),
        photos: userPhotos,
        images, // Include full image objects
        interestMatchScore: Math.round(interestMatchScore),
        tagMatchScore: bestMatch.tagMatchScore,
        commonTags: bestMatch.commonTags,
        distance: bestMatch.distance,
        distanceFormatted: bestMatch.distanceFormatted,
      }
    });
  } catch (error) {
    console.error("Discover error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
