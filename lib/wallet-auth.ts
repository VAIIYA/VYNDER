import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "./mongodb";
import User from "@/models/User";
import { verifyWalletSignature, isValidSolanaAddress } from "./solana-auth";

export const walletAuthOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Solana Wallet",
      credentials: {
        walletAddress: { label: "Wallet Address", type: "text" },
        signature: { label: "Signature", type: "text" },
        message: { label: "Message", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.walletAddress || !credentials?.signature || !credentials?.message) {
          throw new Error("Missing wallet credentials");
        }

        try {
          // Validate wallet address
          if (!isValidSolanaAddress(credentials.walletAddress)) {
            throw new Error("Invalid Solana wallet address");
          }

          // Verify signature
          console.log("Verifying signature for wallet:", credentials.walletAddress);
          const isValid = await verifyWalletSignature(
            credentials.message,
            credentials.signature,
            credentials.walletAddress
          );

          console.log("Signature verification result:", isValid);

          if (!isValid) {
            console.error("Signature verification failed");
            throw new Error("Invalid signature");
          }

          await connectDB();

          // Find or create user
          let user = await User.findOne({ walletAddress: credentials.walletAddress });

          if (!user) {
            // Create new user with wallet address
            user = await User.create({
              walletAddress: credentials.walletAddress,
              username: `user_${credentials.walletAddress.slice(0, 8)}`, // Default username
              profileCompleted: false,
              profileCompletionPercentage: 0,
              isVerified: false,
              interests: [],
              tags: [],
              photos: [],
              blockedUsers: [],
              reportedUsers: [],
            });
          } else {
            // Update last active
            user.lastActive = new Date();
            await user.save();
          }

          return {
            id: user._id.toString(),
            walletAddress: user.walletAddress,
            name: user.username,
          };
        } catch (error: any) {
          console.error("Wallet auth error:", error);
          throw new Error(error.message || "Authentication failed");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.walletAddress = (user as any).walletAddress;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).walletAddress = token.walletAddress as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/wallet",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development",
  debug: process.env.NODE_ENV === "development",
};

