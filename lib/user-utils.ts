import connectDB from "./mongodb";
import User from "@/models/User";

/**
 * Get user by wallet address (PRIMARY IDENTIFIER)
 * This is the main way to identify users - walletAddress is unique and indexed
 */
export async function getUserByWalletAddress(walletAddress: string) {
  await connectDB();
  return await User.findOne({ walletAddress }).lean();
}

/**
 * Get user by MongoDB _id (derived from wallet during auth)
 * Use this when you have the session user.id
 */
export async function getUserById(userId: string) {
  await connectDB();
  return await User.findById(userId).lean();
}

/**
 * Get user by wallet address or MongoDB _id
 * Useful for flexible lookups
 */
export async function getUserByIdentifier(identifier: string) {
  await connectDB();
  // Try wallet address first (primary identifier)
  let user = await User.findOne({ walletAddress: identifier }).lean();
  if (user) return user;
  
  // Fallback to MongoDB _id
  return await User.findById(identifier).lean();
}

