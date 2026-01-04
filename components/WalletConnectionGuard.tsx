"use client";

import { useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

/**
 * Component to ensure wallet connection persists and matches session
 * This runs on protected pages to maintain wallet connection
 */
export default function WalletConnectionGuard() {
  const { publicKey, connected, disconnect, connect } = useWallet();
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    // If user is authenticated but wallet is disconnected, try to reconnect
    if (status === "authenticated" && session?.user?.walletAddress) {
      const sessionWallet = (session.user as any).walletAddress;
      
      // If wallet is connected but doesn't match session, disconnect
      if (connected && publicKey && publicKey.toString() !== sessionWallet) {
        console.log("Wallet mismatch, disconnecting");
        disconnect();
      }
      
      // If wallet is not connected but session exists, the wallet should auto-connect
      // The WalletProvider's autoConnect will handle this
    }
  }, [status, session, connected, publicKey, disconnect]);

  return null; // This component doesn't render anything
}

