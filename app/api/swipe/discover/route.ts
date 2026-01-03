import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Like from "@/models/Like";
import Pass from "@/models/Pass";
import Image from "@/models/Image";

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

    // Get one random user to show with enhanced profile data
    let users;
    try {
      users = await User.find(query)
        .select(
          "username age bio photos location city country gender interests jobTitle company school height education drinking smoking exercise kids pets languages coordinates lastActive"
        )
        .populate("interests", "name category icon")
        .limit(1)
        .sort({ createdAt: -1 });
    } catch (populateError) {
      // If populate fails, try without populate
      console.warn("Populate interests failed, fetching without:", populateError);
      users = await User.find(query)
        .select(
          "username age bio photos location city country gender interests jobTitle company school height education drinking smoking exercise kids pets languages coordinates lastActive"
        )
        .limit(1)
        .sort({ createdAt: -1 });
    }

    if (users.length === 0) {
      return NextResponse.json({ user: null, message: "No more profiles" });
    }

    const user = users[0];
    
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

