import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import connectDB from "@/lib/mongodb";
import { generateAuthMessage, isValidSolanaAddress } from "@/lib/solana-auth";
import AuthNonce from "@/models/AuthNonce";

const nonceSchema = z.object({
  walletAddress: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress } = nonceSchema.parse(body);

    if (!isValidSolanaAddress(walletAddress)) {
      return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 });
    }

    await connectDB();

    const issuedAt = Date.now();
    const expiresAt = issuedAt + 5 * 60 * 1000; // 5 minutes
    const nonce = crypto.randomBytes(16).toString("hex");

    await AuthNonce.findOneAndUpdate(
      { walletAddress },
      {
        walletAddress,
        nonce,
        issuedAt: new Date(issuedAt),
        expiresAt: new Date(expiresAt),
      },
      { upsert: true, new: true }
    );

    const authMessage = generateAuthMessage(walletAddress, nonce, issuedAt, expiresAt);

    return NextResponse.json({
      message: authMessage.message,
      issuedAt,
      expiresAt,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }

    console.error("Nonce issue error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
