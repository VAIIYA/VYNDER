import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Image from "@/models/Image";
import User from "@/models/User";
import { z } from "zod";

const imageSchema = z.object({
  url: z.string().url("Invalid URL"),
  order: z.number().min(0).max(5),
  isPrimary: z.boolean().optional(),
});

// Get all images for current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const images = await Image.find({ user: session.user.id })
      .sort({ order: 1 })
      .lean();

    return NextResponse.json({ images });
  } catch (error) {
    console.error("Images fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Add a new image
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = imageSchema.parse(body);

    await connectDB();

    // Check if user already has 6 images
    const existingImages = await Image.countDocuments({
      user: session.user.id,
    });

    if (existingImages >= 6) {
      return NextResponse.json(
        { error: "Maximum 6 photos allowed" },
        { status: 400 }
      );
    }

    // If this is set as primary, unset other primary images
    if (validatedData.isPrimary) {
      await Image.updateMany(
        { user: session.user.id },
        { $set: { isPrimary: false } }
      );
    }

    // Create image
    const image = await Image.create({
      user: session.user.id,
      url: validatedData.url,
      order: validatedData.order,
      isPrimary: validatedData.isPrimary || false,
    });

    // Update user's photos array (legacy support)
    await User.findByIdAndUpdate(session.user.id, {
      $addToSet: { photos: validatedData.url },
    });

    return NextResponse.json({ image }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Image creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Delete an image
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get("id");

    if (!imageId) {
      return NextResponse.json(
        { error: "Image ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const image = await Image.findOne({
      _id: imageId,
      user: session.user.id,
    });

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    await Image.findByIdAndDelete(imageId);

    // Remove from user's photos array (legacy support)
    await User.findByIdAndUpdate(session.user.id, {
      $pull: { photos: image.url },
    });

    return NextResponse.json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Image deletion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}




