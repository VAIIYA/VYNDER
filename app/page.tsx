import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Flame from "@/components/Flame";

// Landing page component

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
            <Flame className="w-9 h-9 text-[#9945FF]" />
            <span className="text-xl font-black tracking-tighter bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-transparent hidden sm:block">VYNDER</span>
          </div>

          <div className="flex items-center gap-4 lg:gap-6">
            <Link href="/auth/wallet" className="font-bold text-sm lg:text-base hover:text-brand-red transition-colors px-2">
              Connect Wallet
            </Link>
            <Link
              href="/auth/wallet"
              className="bg-brand-black text-white px-6 py-2.5 rounded-full font-bold hover:bg-brand-red transition-all shadow-md active:scale-95 text-sm lg:text-base"
            >
              Join
            </Link>
          </div>
        </nav>
      </div>

      {/* Hero Section: Solana-Powered */}
      <header className="relative pt-48 pb-24 lg:pt-64 lg:pb-40 overflow-hidden">
        {/* Solana Background Gradient */}
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-[#9945FF]/10 via-white to-[#14F195]/10 -z-20" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#9945FF]/20 rounded-full blur-[100px] -z-10" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#14F195]/20 rounded-full blur-[100px] -z-10" />

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div className="z-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#9945FF]/20 to-[#14F195]/20 px-4 py-1.5 rounded-full text-[#9945FF] text-sm font-bold mb-6 animate-fade-in border border-[#9945FF]/30">
              <span className="animate-pulse">⚡</span>
              <span>Powered by Solana Blockchain</span>
            </div>
            <h1 className="text-6xl lg:text-[92px] font-serif font-bold bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-transparent mb-8 leading-[0.9] tracking-tight">
              Dating on <br className="hidden lg:block" /> the Blockchain.
            </h1>
            <p className="text-xl lg:text-2xl text-gray-700 mb-12 max-w-xl mx-auto lg:mx-0 font-medium leading-[1.4]">
              The first web3 PWA dating app built on Solana. No app stores needed. Your wallet, your identity, your connections. Experience the future of dating.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/auth/wallet"
                className="bg-gradient-to-r from-[#9945FF] to-[#14F195] text-white text-lg lg:text-xl px-12 py-5 rounded-full font-bold hover:from-[#9945FF]/90 hover:to-[#14F195]/90 transition-all shadow-2xl hover:shadow-[#9945FF]/30 text-center active:scale-95 group"
              >
                Connect Wallet <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
              </Link>
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

              {/* Floating Solana-style interactive tag */}
              <div className="absolute -top-8 -right-8 bg-gradient-to-r from-[#9945FF] to-[#14F195] p-6 rounded-3xl shadow-2xl text-white transform rotate-12 hover:rotate-0 transition-all cursor-default scale-90 lg:scale-100">
                <p className="font-black text-xs uppercase tracking-widest mb-1">Web3</p>
                <p className="font-bold text-xl">Blockchain First ⚡</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Solana-Powered Section */}
      <section className="py-24 bg-gradient-to-br from-[#9945FF] via-[#9945FF]/80 to-[#14F195] px-6 text-white overflow-hidden relative">
        <div className="absolute -left-20 top-0 text-[200px] font-black opacity-[0.05] select-none pointer-events-none">
          SOLANA
        </div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative h-[400px] lg:h-[600px] flex items-center justify-center">
            <div className="absolute inset-0 bg-white/10 rounded-[80px] rotate-3 blur-2xl" />
            <div className="relative w-full h-full bg-white/10 backdrop-blur-md rounded-[60px] p-4 shadow-2xl overflow-hidden border-8 border-white/20">
              <Image src="/images/hero_illustration.png" alt="Solana Community" fill className="object-cover opacity-90" />
            </div>
            {/* Dynamic Stats Bubbles */}
            <div className="absolute top-10 -right-10 bg-white/20 backdrop-blur-md text-white px-6 py-4 rounded-3xl shadow-2xl transform -rotate-3 animate-bounce-slow border border-white/30">
              <p className="font-black text-2xl">⚡</p>
              <p className="text-xs font-bold uppercase">Web3 Native</p>
            </div>
          </div>

          <div>
            <h2 className="text-5xl lg:text-7xl font-serif font-bold mb-8 leading-tight">
              Built on <br /> Solana.
            </h2>
            <p className="text-xl lg:text-2xl opacity-90 mb-10 leading-relaxed font-medium">
              Experience the future of dating. No app stores. No middlemen. Just your Solana wallet connecting you to real people. Fast, secure, and truly decentralized.
            </p>
            <div className="grid grid-cols-2 gap-6 mb-12">
              <div className="bg-white/20 backdrop-blur-md p-6 rounded-[32px] border border-white/30">
                <span className="text-4xl block mb-4">⚡</span>
                <p className="font-bold">Lightning Fast</p>
                <p className="text-sm opacity-80 mt-2">Solana speed</p>
              </div>
              <div className="bg-white/20 backdrop-blur-md p-6 rounded-[32px] border border-white/30">
                <span className="text-4xl block mb-4">🔐</span>
                <p className="font-bold">Your Wallet</p>
                <p className="text-sm opacity-80 mt-2">Your identity</p>
              </div>
            </div>
            <Link
              href="/auth/wallet"
              className="inline-block bg-white text-[#9945FF] px-12 py-5 rounded-full font-bold hover:bg-white/90 transition-all shadow-xl active:scale-95"
            >
              Connect Your Wallet
            </Link>
          </div>
        </div>
      </section>

      {/* Solana Features Section */}
      <section className="py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-6xl font-serif font-bold mb-8 tracking-tight bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-transparent">
            Web3 Dating. No App Store Required.
          </h2>
          <p className="text-xl text-gray-500 mb-20 max-w-2xl mx-auto">
            The first Progressive Web App dating platform built on Solana. Install directly from your browser. Your wallet, your data, your connections.
          </p>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: "⚡", title: "Blockchain First", desc: "Built on Solana. Your wallet is your identity. No app stores needed." },
              { icon: "🔒", title: "Private Mode", desc: "You control who sees your profile and when you are visible." },
              { icon: "💬", title: "Solana Safety", desc: "Decentralized verification and smart filters powered by blockchain." }
            ].map((feature, idx) => (
              <div key={idx} className="group p-10 rounded-[48px] bg-gradient-to-br from-[#9945FF]/10 to-[#14F195]/10 hover:from-[#9945FF]/20 hover:to-[#14F195]/20 transition-all border border-transparent hover:border-[#9945FF]/30 cursor-default">
                <div className="w-20 h-20 bg-gradient-to-br from-[#9945FF] to-[#14F195] rounded-3xl flex items-center justify-center text-4xl shadow-lg mb-8 mx-auto group-hover:scale-110 transition-transform duration-500">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-transparent">{feature.title}</h3>
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
                <Flame className="w-10 h-10 text-[#9945FF]" />
                <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-[#9945FF] to-[#14F195] bg-clip-text text-transparent">VYNDER</span>
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
              <h4 className="font-bold text-sm lg:text-base uppercase tracking-widest mb-8 text-gray-400">Install PWA</h4>
              <div className="space-y-3">
                <div className="w-full h-12 bg-gradient-to-r from-[#9945FF] to-[#14F195] rounded-xl flex items-center justify-center text-white font-bold gap-2 cursor-pointer hover:from-[#9945FF]/90 hover:to-[#14F195]/90 transition-all shadow-lg">
                  <span>⚡ Install Now</span>
                </div>
                <p className="text-xs text-gray-400 text-center mt-2">No app store needed</p>
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
// Force rebuild
