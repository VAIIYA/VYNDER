import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

const FALLBACK_TAGS = [
  "#travel",
  "#music",
  "#foodie",
  "#fitness",
  "#movies",
  "#tech",
  "#gaming",
  "#photography",
  "#art",
  "#coffee",
  "#nature",
  "#books",
  "#fashion",
  "#crypto",
  "#solana",
  "#startup",
  "#sports",
  "#anime",
  "#dogs",
  "#cats",
];

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const aggregation = await User.aggregate([
      { $match: { profileCompleted: true, tags: { $exists: true, $ne: [] } } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 40 },
    ]);

    if (!aggregation.length) {
      return NextResponse.json({
        tags: FALLBACK_TAGS.map((tag) => ({ tag, count: 1 })),
      });
    }

    const tags = aggregation.map((item) => ({
      tag: item._id,
      count: item.count,
    }));

    return NextResponse.json({ tags });
  } catch (error) {
    console.error("Tags fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
