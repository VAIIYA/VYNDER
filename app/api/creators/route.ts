import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Creator from '@/models/Creator';

export async function GET() {
  try {
    await connectDB();
    const creators = await Creator.find().limit(10);
    return NextResponse.json({ creators });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to load creators' }, { status: 500 });
  }
}
