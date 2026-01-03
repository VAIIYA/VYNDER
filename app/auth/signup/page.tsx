"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          username: formData.username,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Registration failed");
        return;
      }

      toast.success("Account created! Please sign in.");
      router.push("/auth/signin");
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-lavender px-4 relative overflow-hidden py-12">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-brand-red/10 rounded-full blur-3xl -ml-32 -mt-32" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-brand-red/10 rounded-full blur-3xl -mr-32 -mb-32" />

      <div className="w-full max-w-md z-10">
        <div className="bg-white rounded-[40px] shadow-2xl p-10 border border-white/50 backdrop-blur-sm">
          <div className="flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-brand-red rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
                <span className="text-white font-bold text-2xl">V</span>
              </div>
              <span className="text-2xl font-black tracking-tighter text-brand-red">VYNDER</span>
            </Link>
          </div>

          <h1 className="text-3xl font-serif font-bold text-center mb-2 text-brand-near-black">
            Join the journey
          </h1>
          <p className="text-center text-gray-500 mb-8">
            Create your account to start matching
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-bold text-brand-near-black mb-1.5 ml-1"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                required
                minLength={3}
                maxLength={30}
                className="w-full px-5 py-3.5 rounded-2xl border-2 border-gray-100 bg-gray-50 text-brand-near-black placeholder-gray-400 focus:ring-4 focus:ring-brand-lavender focus:border-brand-red transition-all outline-none"
                placeholder="Choose a username"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-bold text-brand-near-black mb-1.5 ml-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                className="w-full px-5 py-3.5 rounded-2xl border-2 border-gray-100 bg-gray-50 text-brand-near-black placeholder-gray-400 focus:ring-4 focus:ring-brand-lavender focus:border-brand-red transition-all outline-none"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-bold text-brand-near-black mb-1.5 ml-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                minLength={6}
                className="w-full px-5 py-3.5 rounded-2xl border-2 border-gray-100 bg-gray-50 text-brand-near-black placeholder-gray-400 focus:ring-4 focus:ring-brand-lavender focus:border-brand-red transition-all outline-none"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-bold text-brand-near-black mb-1.5 ml-1"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                required
                className="w-full px-5 py-3.5 rounded-2xl border-2 border-gray-100 bg-gray-50 text-brand-near-black placeholder-gray-400 focus:ring-4 focus:ring-brand-lavender focus:border-brand-red transition-all outline-none"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-near-black hover:bg-brand-red text-white font-bold py-4 rounded-2xl transition-all shadow-xl hover:shadow-brand-red/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] mt-4"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-gray-100 pt-8">
            <p className="text-sm text-gray-500 font-medium">
              Already have an account?{" "}
              <Link
                href="/auth/signin"
                className="text-brand-red hover:underline font-bold transition-colors"
              >
                Sign in instead
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
