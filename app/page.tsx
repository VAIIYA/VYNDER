import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Flame from "@/components/Flame";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/swipe");
  }

  return (
    <div className="min-h-screen bg-white text-brand-black font-sans selection:bg-brand-yellow selection:text-brand-black">
      {/* Floating Pill Navigation */}
      <div className="fixed top-8 w-full z-50 px-6 flex justify-center pointer-events-none">
        <nav className="bg-white/70 backdrop-blur-2xl border border-white/40 px-6 py-3 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.1)] flex justify-between items-center w-full max-w-4xl pointer-events-auto transition-all hover:shadow-[0_12px_48px_rgba(0,0,0,0.15)]">
          <div className="flex items-center gap-2">
            <Flame className="w-9 h-9 text-brand-red" />
            <span className="text-xl font-black tracking-tighter text-brand-red hidden sm:block">VYNDER</span>
          </div>

          <div className="flex items-center gap-4 lg:gap-6">
            <Link href="/auth/signin" className="font-bold text-sm lg:text-base hover:text-brand-red transition-colors px-2">
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="bg-brand-black text-white px-6 py-2.5 rounded-full font-bold hover:bg-brand-red transition-all shadow-md active:scale-95 text-sm lg:text-base"
            >
              Join
            </Link>
          </div>
        </nav>
      </div>

      {/* Hero Section: Hybrid Badoo/Bumble */}
      <header className="relative pt-48 pb-24 lg:pt-64 lg:pb-40 overflow-hidden">
        {/* Warm Background Gradient inspired by Bumble */}
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-brand-lavender via-white to-brand-yellow-light/30 -z-20" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-yellow/20 rounded-full blur-[100px] -z-10" />

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div className="z-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-brand-yellow/30 px-4 py-1.5 rounded-full text-brand-black text-sm font-bold mb-6 animate-fade-in">
              <span className="animate-pulse">🐝</span>
              <span>100% Verified Connections</span>
            </div>
            <h1 className="text-6xl lg:text-[92px] font-serif font-bold text-brand-red mb-8 leading-[0.9] tracking-tight">
              Love on <br className="hidden lg:block" /> your terms.
            </h1>
            <p className="text-xl lg:text-2xl text-gray-700 mb-12 max-w-xl mx-auto lg:mx-0 font-medium leading-[1.4]">
              Vynder is where kindness and confidence meet. Find people who are ready to build something real.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/auth/signup"
                className="bg-brand-black text-white text-lg lg:text-xl px-12 py-5 rounded-full font-bold hover:bg-brand-yellow hover:text-brand-black transition-all shadow-2xl hover:shadow-brand-yellow/30 text-center active:scale-95 group"
              >
                Get Started <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <button className="flex items-center justify-center gap-3 bg-white/50 backdrop-blur-md border border-white/60 text-brand-black text-lg lg:text-xl px-12 py-5 rounded-full font-bold hover:bg-white transition-all shadow-lg active:scale-95">
                <span>Try Demo</span>
              </button>
            </div>
          </div>

          <div className="relative">
            {/* Stacked Card Design inspired by Bumble */}
            <div className="relative w-full aspect-[4/5] max-w-[450px] lg:max-w-[550px] mx-auto">
              {/* Decorative back card */}
              <div className="absolute top-12 left-12 w-full h-full bg-brand-red/10 rounded-[50px] rotate-6 -z-10 border-2 border-brand-red/5" />
              <div className="absolute top-6 left-6 w-full h-full bg-brand-yellow/20 rounded-[50px] -rotate-3 -z-5 border-2 border-brand-yellow/10" />

              <div className="relative w-full h-full rounded-[48px] overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.15)] border-[8px] border-white group">
                <Image
                  src="/images/meet_people_model.png"
                  alt="Featured match"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Interest Badges UI */}
                <div className="absolute bottom-10 left-10 text-white">
                  <div className="flex gap-2 mb-4">
                    <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Outdoors</span>
                    <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Music</span>
                  </div>
                  <h3 className="text-3xl font-bold">Emma, 26</h3>
                  <p className="text-white/80 font-medium">Ready to find something real ✨</p>
                </div>
              </div>

              {/* Floating Bumble-style interactive tag */}
              <div className="absolute -top-8 -right-8 bg-brand-yellow p-6 rounded-3xl shadow-2xl text-brand-black transform rotate-12 hover:rotate-0 transition-all cursor-default scale-90 lg:scale-100">
                <p className="font-black text-xs uppercase tracking-widest mb-1">Status</p>
                <p className="font-bold text-xl">Let&apos;s Coffee! ☕</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Bumble-Inspired Yellow Section: The Warmth of Vynder */}
      <section className="py-24 bg-brand-yellow px-6 text-brand-black overflow-hidden relative">
        <div className="absolute -left-20 top-0 text-[200px] font-black opacity-[0.03] select-none pointer-events-none">
          VYNDER
        </div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative h-[400px] lg:h-[600px] flex items-center justify-center">
            <div className="absolute inset-0 bg-white/20 rounded-[80px] rotate-3 blur-2xl" />
            <div className="relative w-full h-full bg-white rounded-[60px] p-4 shadow-2xl overflow-hidden border-8 border-brand-yellow-light/50">
              <Image src="/images/hero_illustration.png" alt="Happy Community" fill className="object-cover" />
            </div>
            {/* Dynamic Stats Bubbles */}
            <div className="absolute top-10 -right-10 bg-brand-black text-brand-yellow px-6 py-4 rounded-3xl shadow-2xl transform -rotate-3 animate-bounce-slow">
              <p className="font-black text-2xl">4.9/5</p>
              <p className="text-xs font-bold uppercase">Top Rated App</p>
            </div>
          </div>

          <div>
            <h2 className="text-5xl lg:text-7xl font-serif font-bold mb-8 leading-tight">
              We&apos;ve changed <br /> the rules.
            </h2>
            <p className="text-xl lg:text-2xl opacity-90 mb-10 leading-relaxed font-medium">
              We empower you to make the first move. Kindness is at our core, ensuring every connection starts with respect and equality.
            </p>
            <div className="grid grid-cols-2 gap-6 mb-12">
              <div className="bg-white/20 p-6 rounded-[32px] border border-white/30">
                <span className="text-4xl block mb-4">👑</span>
                <p className="font-bold">Ladies First</p>
              </div>
              <div className="bg-white/20 p-6 rounded-[32px] border border-white/30">
                <span className="text-4xl block mb-4">🛡️</span>
                <p className="font-bold">Zero Harassment</p>
              </div>
            </div>
            <Link
              href="/auth/signup"
              className="inline-block bg-brand-black text-white px-12 py-5 rounded-full font-bold hover:bg-white hover:text-brand-black transition-all shadow-xl active:scale-95"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Safety Section: Badoo/Bumble Hybrid */}
      <section className="py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-6xl font-serif font-bold mb-8 tracking-tight">
            Safety first, second, and always.
          </h2>
          <p className="text-xl text-gray-500 mb-20 max-w-2xl mx-auto">
            Your safety is our #1 priority. We’ve built a safer way to meet new people.
          </p>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: "🛡️", title: "Video Chat", desc: "Get to know your matches safely before meeting in person." },
              { icon: "🔒", title: "Private Mode", desc: "You control who sees your profile and when you are visible." },
              { icon: "💬", title: "Bumble Safety", desc: "Dedicated support team and smart filters to keep you safe." }
            ].map((feature, idx) => (
              <div key={idx} className="group p-10 rounded-[48px] bg-brand-lavender/10 hover:bg-brand-lavender/20 transition-all border border-transparent hover:border-brand-lavender/30 cursor-default">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-4xl shadow-lg mb-8 mx-auto group-hover:scale-110 transition-transform duration-500">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-500 font-medium leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer: Hybrid Professional */}
      <footer className="bg-white pt-24 pb-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20">
            <div className="col-span-2 md:col-span-4 lg:col-span-1">
              <div className="flex items-center gap-2 mb-8">
                <Flame className="w-10 h-10 text-brand-red" />
                <span className="text-2xl font-black tracking-tighter text-brand-red">VYNDER</span>
              </div>
              <p className="text-gray-500 font-medium mb-8">
                Bringing people closer since 2026.
              </p>

              {/* Language Selector Pill */}
              <button className="flex items-center justify-between w-full max-w-[220px] px-6 py-3 bg-gray-50 border border-gray-100 rounded-full hover:border-brand-yellow transition-all group font-bold text-xs uppercase tracking-widest">
                <span>English (UK)</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>

            <div>
              <h4 className="font-bold text-sm lg:text-base uppercase tracking-widest mb-8 text-gray-400">Date</h4>
              <ul className="space-y-4 font-bold text-[15px]">
                <li><Link href="/" className="hover:text-brand-yellow transition-colors">Start Dating</Link></li>
                <li><Link href="/" className="hover:text-brand-yellow transition-colors">Profile Tips</Link></li>
                <li><Link href="/" className="hover:text-brand-yellow transition-colors">Safety Tips</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm lg:text-base uppercase tracking-widest mb-8 text-gray-400">Legal</h4>
              <ul className="space-y-4 font-bold text-[15px]">
                <li><Link href="/" className="hover:text-brand-yellow transition-colors">Privacy</Link></li>
                <li><Link href="/" className="hover:text-brand-yellow transition-colors">Terms</Link></li>
                <li><Link href="/" className="hover:text-brand-yellow transition-colors">Cookies</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm lg:text-base uppercase tracking-widest mb-8 text-gray-400">Connect</h4>
              <ul className="space-y-4 font-bold text-[15px]">
                <li><Link href="/" className="hover:text-brand-yellow transition-colors">Instagram</Link></li>
                <li><Link href="/" className="hover:text-brand-yellow transition-colors">TikTok</Link></li>
                <li><Link href="/" className="hover:text-brand-yellow transition-colors">Twitter</Link></li>
              </ul>
            </div>

            <div className="col-span-2 lg:col-span-1">
              <h4 className="font-bold text-sm lg:text-base uppercase tracking-widest mb-8 text-gray-400">Download</h4>
              <div className="space-y-3">
                <div className="w-full h-12 bg-black rounded-xl flex items-center justify-center text-white font-bold gap-2 cursor-pointer hover:bg-brand-red transition-colors">
                  <span>App Store</span>
                </div>
                <div className="w-full h-12 bg-black rounded-xl flex items-center justify-center text-white font-bold gap-2 cursor-pointer hover:bg-brand-red transition-colors">
                  <span>Google Play</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 text-gray-400 text-xs font-bold uppercase tracking-widest">
            <p>© 2026 Vynder Inc. All rights reserved.</p>
            <div className="flex gap-8">
              <Link href="/" className="hover:text-brand-red transition-colors">Press</Link>
              <Link href="/" className="hover:text-brand-red transition-colors">Careers</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
