import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Interest from "@/models/Interest";

const FALLBACK = ["#travel", "#music", "#foodie", "#fitness", "#photography", "#movies", "#tech"];

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    let user = await User.findOne({ walletAddress: session.user.walletAddress })
      .select("tags interests")
      .lean();

    if (!user) {
      user = await User.findById(session.user.id)
        .select("tags interests")
        .lean();
    }

    const tags = new Set<string>();

    if (user?.tags?.length) {
      user.tags.slice(0, 10).forEach((tag) => tags.add(tag));
    }

    if (user?.interests?.length) {
      const interests = await Interest.find({ _id: { $in: user.interests } })
        .select("name")
        .lean();
      interests.forEach((interest) => {
        if (interest.name) {
          tags.add(`#${interest.name.toLowerCase().replace(/\s+/g, "")}`);
        }
      });
    }

    if (tags.size === 0) {
      FALLBACK.forEach((tag) => tags.add(tag));
    }

    return NextResponse.json({ tags: Array.from(tags).slice(0, 12) });
  } catch (error) {
    console.error("Explore suggestion error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
