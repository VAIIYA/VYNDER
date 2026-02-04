"use client";

import { useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Flame from "@/components/Flame";
import toast from "react-hot-toast";
import { generateAuthMessage } from "@/lib/solana-auth";
import bs58 from "bs58";

export default function WalletAuthPage() {
  const router = useRouter();
  const { publicKey, signMessage, connected, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const [loading, setLoading] = useState(false);

  const handleConnect = useCallback(async () => {
    if (!connected) {
      setVisible(true);
      return;
    }

    if (!publicKey || !signMessage) {
      toast.error("Wallet not ready");
      return;
    }

    setLoading(true);

    try {
      // Generate authentication message
      const authMessage = generateAuthMessage(publicKey.toString());
      const messageBytes = new TextEncoder().encode(authMessage.message);

      // Request signature from wallet
      const signature = await signMessage(messageBytes);

      // The signature from wallet adapter is already a Uint8Array
      // Encode it to base58 for transmission
      const signatureBase58 = bs58.encode(signature);

      console.log("Signing message:", authMessage.message);
      console.log("Signature length:", signature.length);
      console.log("Public key:", publicKey.toString());

      // Authenticate with NextAuth
      const result = await signIn("credentials", {
        walletAddress: publicKey.toString(),
        signature: signatureBase58,
        message: authMessage.message,
        redirect: false,
      });

      if (result?.error) {
        console.error("Sign in error:", result.error);
        toast.error(result.error === "Invalid signature" ? "Signature verification failed. Please try again." : result.error);
      } else {
        toast.success("Connected successfully!");
        router.push("/swipe");
        router.refresh();
      }
    } catch (error: any) {
      console.error("Wallet auth error:", error);
      if (error.message?.includes("User rejected") || error.message?.includes("rejected")) {
        toast.error("Signature request cancelled");
      } else {
        toast.error(error.message || "Authentication failed");
      }
    } finally {
      setLoading(false);
    }
  }, [connected, publicKey, signMessage, setVisible, router]);

  const handleDisconnect = useCallback(async () => {
    await disconnect();
    toast.success("Wallet disconnected");
  }, [disconnect]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC] px-4 relative overflow-hidden">
      {/* Background Glows (VAIIYA style) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-vaiiya-orange/5 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] bg-vaiiya-purple/5 rounded-full blur-[150px]" />
      </div>

      <div className="w-full max-w-lg z-10">
        <div className="bg-white rounded-[48px] shadow-[0_32px_80px_rgba(0,0,0,0.06)] p-12 md:p-16 border border-[#E9EDF6]">
          <div className="flex justify-center mb-12">
            <Link href="/" className="flex flex-col items-center gap-2">
              <span className="text-4xl font-serif font-black tracking-tighter text-vaiiya-purple">VYNDER</span>
              <div className="w-8 h-1 bg-vaiiya-orange rounded-full"></div>
            </Link>
          </div>

          <h1 className="text-4xl md:text-5xl font-serif font-bold text-center mb-4 text-vaiiya-purple leading-tight">
            Connect your <span className="italic text-vaiiya-orange">identity</span>.
          </h1>
          <p className="text-center text-vaiiya-gray/60 font-medium text-lg mb-12">
            Securely sign in with your Solana digital wallet to join the community.
          </p>

          {!connected ? (
            <div className="space-y-8">
              <button
                onClick={handleConnect}
                disabled={loading}
                className="btn-vaiiya-primary w-full py-6 text-xl shadow-xl shadow-vaiiya-orange/20"
              >
                {loading ? "Connecting..." : "Connect Wallet"}
              </button>

              <div className="text-center">
                <p className="text-xs font-bold text-vaiiya-gray/30 uppercase tracking-[0.2em] mb-6">Trusted Wallets</p>
                <div className="flex justify-center gap-8 grayscale opacity-50">
                  <span className="text-sm font-bold text-vaiiya-purple">PHANTOM</span>
                  <span className="text-sm font-bold text-vaiiya-purple">SOLFLARE</span>
                  <span className="text-sm font-bold text-vaiiya-purple">TORUS</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="bg-[#F7F9FC] rounded-3xl p-8 border border-[#E9EDF6] text-center">
                <p className="text-xs font-bold text-vaiiya-gray/40 uppercase tracking-widest mb-3">Linked Address</p>
                <p className="text-sm font-mono text-vaiiya-purple font-bold break-all bg-white py-3 px-4 rounded-xl shadow-sm border border-[#E9EDF6]">
                  {publicKey?.toString()}
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleConnect}
                  disabled={loading}
                  className="btn-vaiiya-primary w-full py-6 text-xl"
                >
                  {loading ? "Signing in..." : "Finalize Sign In"}
                </button>

                <button
                  onClick={handleDisconnect}
                  className="w-full text-vaiiya-gray/40 hover:text-vaiiya-orange font-bold text-sm uppercase tracking-widest transition-colors py-4"
                >
                  Disconnect Wallet
                </button>
              </div>
            </div>
          )}

          <div className="mt-12 text-center pt-8 border-t border-[#E9EDF6]">
            <p className="text-base text-vaiiya-gray/60 font-medium">
              New to Web3?{" "}
              <a
                href="https://phantom.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-vaiiya-orange hover:text-vaiiya-purple font-bold transition-all border-b-2 border-vaiiya-orange/20 hover:border-vaiiya-purple"
              >
                Create a wallet
              </a>
            </p>
            <Link href="/" className="mt-8 block text-sm font-bold text-vaiiya-purple/40 hover:text-vaiiya-purple uppercase tracking-widest transition-colors">
              ← Return Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

