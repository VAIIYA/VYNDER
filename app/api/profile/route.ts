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
  // User-defined tags
  tags: z.array(z.string()).max(20).optional(),
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
    
    let user;
    try {
      user = await User.findById(session.user.id)
        .populate("interests", "name category icon")
        .lean();
    } catch (populateError) {
      // If populate fails (e.g., interests collection doesn't exist), try without populate
      console.warn("Populate interests failed, fetching without:", populateError);
      user = await User.findById(session.user.id)
        .lean();
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user's images (handle if Image collection doesn't exist yet)
    let images: any[] = [];
    try {
      images = await Image.find({ user: session.user.id })
        .sort({ order: 1 })
        .lean();
    } catch (imageError) {
      // Image collection might not exist yet, use legacy photos array
      console.warn("Image collection not found, using legacy photos:", imageError);
      images = [];
    }

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

    let user;
    try {
      user = await User.findByIdAndUpdate(
        session.user.id,
        { $set: updateData },
        { new: true, runValidators: true }
      )
        .populate("interests", "name category icon");
    } catch (populateError) {
      // If populate fails, try without populate
      console.warn("Populate interests failed, updating without:", populateError);
      user = await User.findByIdAndUpdate(
        session.user.id,
        { $set: updateData },
        { new: true, runValidators: true }
      )
;
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Recalculate profile completion percentage (since pre-save hook doesn't run with findByIdAndUpdate)
    const completionPercentage = user.calculateProfileCompletion();
    user.profileCompletionPercentage = completionPercentage;
    user.profileCompleted = completionPercentage >= 80;
    
    // Save to persist the calculated percentage
    await user.save();
    
    // Reload user to get updated data
    try {
      user = await User.findById(session.user.id)
        .populate("interests", "name category icon");
    } catch (populateError) {
      user = await User.findById(session.user.id)
;
    }

    // Get updated images (handle if Image collection doesn't exist yet)
    let images: any[] = [];
    try {
      images = await Image.find({ user: session.user.id })
        .sort({ order: 1 })
        .lean();
    } catch (imageError) {
      console.warn("Image collection not found:", imageError);
      images = [];
    }

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


