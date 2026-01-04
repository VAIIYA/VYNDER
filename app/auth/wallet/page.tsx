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
      const signatureBase58 = bs58.encode(signature);

      // Authenticate with NextAuth
      const result = await signIn("credentials", {
        walletAddress: publicKey.toString(),
        signature: signatureBase58,
        message: authMessage.message,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Connected successfully!");
        router.push("/swipe");
        router.refresh();
      }
    } catch (error: any) {
      console.error("Wallet auth error:", error);
      if (error.message?.includes("User rejected")) {
        toast.error("Signature request cancelled");
      } else {
        toast.error("Authentication failed");
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
    <div className="min-h-screen flex items-center justify-center bg-brand-lavender px-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-red/10 rounded-full blur-3xl -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-red/10 rounded-full blur-3xl -ml-32 -mb-32" />

      <div className="w-full max-w-md z-10">
        <div className="bg-white rounded-[40px] shadow-2xl p-10 border border-white/50 backdrop-blur-sm">
          <div className="flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-2">
              <Flame className="w-10 h-10 text-brand-red transform rotate-3" />
              <span className="text-2xl font-black tracking-tighter text-brand-red">VYNDER</span>
            </Link>
          </div>

          <h1 className="text-3xl font-serif font-bold text-center mb-2 text-brand-near-black">
            Connect Your Wallet
          </h1>
          <p className="text-center text-gray-500 mb-10">
            Sign in with your Solana wallet to continue
          </p>

          {!connected ? (
            <div className="space-y-6">
              <button
                onClick={handleConnect}
                disabled={loading}
                className="w-full bg-gradient-to-r from-solana-purple to-solana-blue hover:from-solana-purple/90 hover:to-solana-blue/90 text-white font-bold py-4 rounded-2xl transition-all shadow-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {loading ? "Connecting..." : "Connect Wallet"}
              </button>

              <div className="text-center text-sm text-gray-500">
                <p className="mb-2">Supported wallets:</p>
                <div className="flex justify-center gap-4 text-xs">
                  <span>Phantom</span>
                  <span>Solflare</span>
                  <span>Torus</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-solana-purple/10 to-solana-blue/10 rounded-2xl p-4 border border-solana-purple/20">
                <p className="text-xs text-gray-500 mb-1">Connected Wallet</p>
                <p className="text-sm font-mono text-brand-near-black break-all">
                  {publicKey?.toString()}
                </p>
              </div>

              <button
                onClick={handleConnect}
                disabled={loading}
                className="w-full bg-gradient-to-r from-solana-purple to-solana-blue hover:from-solana-purple/90 hover:to-solana-blue/90 text-white font-bold py-4 rounded-2xl transition-all shadow-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {loading ? "Signing in..." : "Sign In with Wallet"}
              </button>

              <button
                onClick={handleDisconnect}
                className="w-full bg-gray-100 hover:bg-gray-200 text-brand-near-black font-bold py-3 rounded-2xl transition-all"
              >
                Disconnect Wallet
              </button>
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 font-medium">
              New to Solana?{" "}
              <a
                href="https://phantom.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-red hover:underline font-bold transition-colors"
              >
                Get a wallet
              </a>
            </p>
          </div>

          <div className="mt-6 text-center text-gray-500 text-sm">
            <Link href="/" className="hover:text-brand-red transition-colors">← Back to home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

