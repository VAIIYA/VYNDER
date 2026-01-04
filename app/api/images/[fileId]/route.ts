import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";

// Use GridFSBucket from mongoose's bundled mongodb
const GridFSBucket = mongoose.mongo.GridFSBucket;
const ObjectId = mongoose.Types.ObjectId;

export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    await connectDB();

    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json(
        { error: "Database connection not available" },
        { status: 500 }
      );
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(params.fileId)) {
      return NextResponse.json({ error: "Invalid file ID" }, { status: 400 });
    }

    const fileId = new mongoose.Types.ObjectId(params.fileId);

    // Create GridFS bucket
    const bucket = new GridFSBucket(db, { bucketName: "photos" });

    // Check if file exists
    const files = await bucket.find({ _id: fileId }).toArray();
    if (files.length === 0) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const file = files[0];

    // Get file stream
    const downloadStream = bucket.openDownloadStream(fileId);

    // Convert stream to buffer
    const chunks: Buffer[] = [];
    downloadStream.on("data", (chunk) => chunks.push(chunk));
    downloadStream.on("end", () => {
      // This won't work in this context, we need to use a different approach
    });

    // Use a promise to handle the stream
    const buffer = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      downloadStream.on("data", (chunk) => chunks.push(chunk));
      downloadStream.on("end", () => resolve(Buffer.concat(chunks)));
      downloadStream.on("error", reject);
    });

    // Convert Buffer to Uint8Array for NextResponse
    const uint8Array = new Uint8Array(buffer);

    // Return image with proper headers
    return new NextResponse(uint8Array, {
      headers: {
        "Content-Type": file.contentType || "image/jpeg",
        "Content-Length": file.length.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Image retrieval error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve image" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json(
        { error: "Database connection not available" },
        { status: 500 }
      );
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(params.fileId)) {
      return NextResponse.json({ error: "Invalid file ID" }, { status: 400 });
    }

    const fileId = new mongoose.Types.ObjectId(params.fileId);

    // Create GridFS bucket
    const bucket = new GridFSBucket(db, { bucketName: "photos" });

    // Check if file exists and belongs to user
    const files = await bucket.find({ _id: fileId }).toArray();
    if (files.length === 0) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const file = files[0];
    
    // Verify ownership (check metadata)
    if (file.metadata?.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized to delete this file" },
        { status: 403 }
      );
    }

    // Delete file from GridFS
    await bucket.delete(fileId);

    return NextResponse.json({ success: true, message: "File deleted" });
  } catch (error) {
    console.error("Image deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}

