import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Interest from "@/models/Interest";

// Get all active interests
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const interests = await Interest.find({ isActive: true })
      .sort({ category: 1, name: 1 })
      .lean();

    // Group by category
    const grouped = interests.reduce((acc: any, interest) => {
      const category = interest.category || "other";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(interest);
      return acc;
    }, {});

    return NextResponse.json({
      interests: grouped,
      all: interests,
    });
  } catch (error) {
    console.error("Interests fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Create a new interest (admin only - for seeding)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, category, icon } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Interest name is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const interest = await Interest.create({
      name: name.toLowerCase().trim(),
      category: category || "other",
      icon: icon || "",
      isActive: true,
    });

    return NextResponse.json({ interest }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Interest already exists" },
        { status: 400 }
      );
    }
    console.error("Interest creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

