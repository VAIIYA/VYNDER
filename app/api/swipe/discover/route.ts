import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Like from "@/models/Like";
import Pass from "@/models/Pass";

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

    // Get one random user to show
    const users = await User.find(query)
      .select("username age bio photos location gender")
      .limit(1)
      .sort({ createdAt: -1 });

    if (users.length === 0) {
      return NextResponse.json({ user: null, message: "No more profiles" });
    }

    return NextResponse.json({ user: users[0] });
  } catch (error) {
    console.error("Discover error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

