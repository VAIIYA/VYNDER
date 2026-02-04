import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Image from "@/models/Image";

const MAX_TAGS = 5;

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tagsParam = searchParams.get("tags") || "";
    const tags = tagsParam
      .split(",")
      .map((tag) => decodeURIComponent(tag).trim())
      .filter(Boolean)
      .slice(0, MAX_TAGS);

    if (tags.length === 0) {
      return NextResponse.json({ people: [] });
    }

    await connectDB();

    const currentUser = await User.findById(session.user.id).select("blockedUsers");
    const blockedUsers = currentUser?.blockedUsers?.map((id) => id.toString()) || [];

    const users = await User.find({
      _id: { $nin: [session.user.id, ...blockedUsers] },
      profileCompleted: true,
      tags: { $in: tags },
    })
      .select("username age photos location tags")
      .limit(30)
      .lean();

    const userIds = users.map((user) => user._id);
    let imagesByUser = new Map<string, string[]>();

    try {
      const images = await Image.find({ user: { $in: userIds } })
        .sort({ isPrimary: -1, order: 1 })
        .lean();

      images.forEach((image) => {
        const key = image.user.toString();
        if (!imagesByUser.has(key)) {
          imagesByUser.set(key, []);
        }
        imagesByUser.get(key)?.push(image.url);
      });
    } catch (error) {
      console.warn("Image collection not available:", error);
    }

    const people = users
      .map((user) => {
        const userTags = user.tags || [];
        const matchScore =
          Math.round(
            (userTags.filter((tag) => tags.includes(tag)).length / tags.length) * 100
          ) || 0;

        const images = imagesByUser.get(user._id.toString()) || [];
        const photos = images.length > 0 ? images : user.photos || [];

        return {
          _id: user._id,
          username: user.username,
          age: user.age,
          location: user.location,
          photos,
          matchScore,
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({ people });
  } catch (error) {
    console.error("People fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
