"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Flame from "@/components/Flame";
import toast from "react-hot-toast";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Signed in successfully!");
        router.push("/swipe");
        router.refresh();
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-lavender px-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-red/10 rounded-full blur-3xl -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-red/10 rounded-full blur-3xl -ml-32 -mb-32" />

      <div className="w-full max-w-md z-10">
        <div className="bg-white rounded-[40px] shadow-2xl p-10 border border-white/50 backdrop-blur-sm">
          <div className="flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-2">
              <Flame className="w-10 h-10 text-brand-red" />
              <span className="text-2xl font-black tracking-tighter text-brand-red">VYNDER</span>
            </Link>
          </div>

          <h1 className="text-3xl font-serif font-bold text-center mb-2 text-brand-near-black">
            Welcome back
          </h1>
          <p className="text-center text-gray-500 mb-10">
            Sign in to continue your journey
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-bold text-brand-near-black mb-2 ml-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 bg-gray-50 text-brand-near-black placeholder-gray-400 focus:ring-4 focus:ring-brand-lavender focus:border-brand-red transition-all outline-none"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-bold text-brand-near-black mb-2 ml-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 bg-gray-50 text-brand-near-black placeholder-gray-400 focus:ring-4 focus:ring-brand-lavender focus:border-brand-red transition-all outline-none"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-near-black hover:bg-brand-red text-white font-bold py-4 rounded-2xl transition-all shadow-xl hover:shadow-brand-red/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 font-medium">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/signup"
                className="text-brand-red hover:underline font-bold transition-colors"
              >
                Join Vynder
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          <Link href="/" className="hover:text-brand-red transition-colors">← Back to home</Link>
        </div>
      </div>
    </div>
  );
}
