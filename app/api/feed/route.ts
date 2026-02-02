import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Post from '@/models/Post';
import Creator from '@/models/Creator';

export async function GET() {
  try {
    await connectDB();
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(12)
      .populate('author');
    return NextResponse.json({ posts });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to load feed' }, { status: 500 });
  }
}
