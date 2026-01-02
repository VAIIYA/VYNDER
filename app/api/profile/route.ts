import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Image from "@/models/Image";
import { z } from "zod";

const profileUpdateSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  bio: z.string().max(500).optional(),
  age: z.number().min(18).max(100).optional(),
  gender: z.enum(["male", "female", "non-binary", "prefer-not-to-say"]).optional(),
  interestedIn: z.array(z.enum(["male", "female", "non-binary", "all"])).optional(),
  location: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  coordinates: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }).optional(),
  // Interests/Tags
  interests: z.array(z.string()).optional(), // Array of Interest IDs
  // Enhanced profile fields
  jobTitle: z.string().max(100).optional(),
  company: z.string().max(100).optional(),
  school: z.string().max(100).optional(),
  height: z.number().min(100).max(250).optional(),
  education: z.enum(["high-school", "some-college", "bachelors", "masters", "phd", "prefer-not-to-say"]).optional(),
  drinking: z.enum(["never", "socially", "often", "prefer-not-to-say"]).optional(),
  smoking: z.enum(["never", "socially", "often", "prefer-not-to-say"]).optional(),
  exercise: z.enum(["never", "sometimes", "often", "daily"]).optional(),
  kids: z.enum(["no", "yes", "want", "have", "prefer-not-to-say"]).optional(),
  pets: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  // Legacy photos (for backward compatibility)
  photos: z.array(z.string().url()).max(6).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.user.id)
      .select("-password")
      .populate("interests", "name category icon")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user's images
    const images = await Image.find({ user: session.user.id })
      .sort({ order: 1 })
      .lean();

    return NextResponse.json({ 
      user: {
        ...user,
        images, // Include images from Image model
      }
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = profileUpdateSchema.parse(body);

    await connectDB();

    // Check username uniqueness if being updated
    if (validatedData.username) {
      const existingUser = await User.findOne({
        username: validatedData.username,
        _id: { $ne: session.user.id },
      });
      if (existingUser) {
        return NextResponse.json(
          { error: "Username already taken" },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = { ...validatedData };

    // Handle interests - convert string IDs to ObjectIds
    if (validatedData.interests) {
      updateData.interests = validatedData.interests;
    }

    // Update lastActive
    updateData.lastActive = new Date();

    const user = await User.findByIdAndUpdate(
      session.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .select("-password")
      .populate("interests", "name category icon");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get updated images
    const images = await Image.find({ user: session.user.id })
      .sort({ order: 1 })
      .lean();

    return NextResponse.json({ 
      user: {
        ...user.toObject(),
        images,
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


