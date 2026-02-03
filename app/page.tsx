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
    <div className="min-h-screen app-shell text-text-primary font-sans">
      {/* Mobile-first floating navigation */}
      <div className="fixed top-4 w-full z-50 px-4 safe-top flex justify-center pointer-events-none">
        <nav className="glass px-4 py-3 rounded-2xl flex justify-between items-center w-full max-w-md pointer-events-auto">
          <div className="flex items-center gap-2">
            <Flame className="w-8 h-8 text-metamask-orange" />
            <span className="text-mobile-lg font-black tracking-tighter text-gradient">VYNDER</span>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/auth/wallet" className="font-bold text-mobile-sm hover:text-metamask-blue transition-colors px-3 py-2 rounded-xl hover:bg-white/10">
              Connect
            </Link>
            <Link
              href="/auth/wallet"
              className="bg-metamask-orange text-white px-4 py-2 rounded-xl font-bold hover:bg-metamask-orange/90 transition-all active:scale-95 text-mobile-sm btn-touch"
            >
              Join
            </Link>
          </div>
        </nav>
      </div>

      {/* Hero Section: Mobile-first Web3 Dating */}
      <header className="relative pt-32 pb-16 px-4 overflow-hidden safe-top">
        {/* Background gradients */}
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-metamask-purple/10 via-background-primary to-metamask-green/10 -z-20" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-metamask-purple/20 rounded-full blur-[80px] -z-10" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-metamask-green/20 rounded-full blur-[80px] -z-10" />

        <div className="max-w-4xl mx-auto">
          <div className="z-10 text-center">
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-metamask-orange text-mobile-sm font-bold mb-6 animate-fade-in">
              <span className="animate-pulse">⚡</span>
              <span>Web3 Dating on Solana</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gradient mb-6 leading-tight">
              Dating on the Blockchain
            </h1>
            <p className="text-mobile-lg lg:text-xl text-text-secondary mb-8 max-w-2xl mx-auto leading-relaxed">
              The first PWA dating app. No app stores needed. Your wallet, your identity, your connections.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/wallet"
                className="bg-gradient-to-r from-metamask-orange to-metamask-blue text-white text-mobile-lg px-8 py-4 rounded-2xl font-bold hover:shadow-lg transition-all text-center active:scale-95 btn-touch group"
              >
                Connect Wallet <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </div>

          <div className="relative mt-12">
            {/* Mobile-first card design */}
            <div className="relative w-full aspect-[4/5] max-w-sm mx-auto">
              {/* Decorative back cards */}
              <div className="absolute top-6 left-6 w-full h-full bg-metamask-orange/10 rounded-3xl rotate-6 -z-10 border-2 border-metamask-orange/5" />
              <div className="absolute top-3 left-3 w-full h-full bg-metamask-blue/20 rounded-3xl -rotate-3 -z-5 border-2 border-metamask-blue/10" />

              <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl border-4 border-background-primary group">
                <Image
                  src="/images/meet_people_model.png"
                  alt="Featured match"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                {/* Profile info */}
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="flex gap-2 mb-3 flex-wrap">
                    <span className="glass px-3 py-1 rounded-full text-mobile-xs font-bold uppercase tracking-wider">Outdoors</span>
                    <span className="glass px-3 py-1 rounded-full text-mobile-xs font-bold uppercase tracking-wider">Music</span>
                  </div>
                  <h3 className="text-mobile-xl font-bold">Emma, 26</h3>
                  <p className="text-white/90 font-medium text-mobile-sm">Ready to find something real ✨</p>
                </div>
              </div>

              {/* Floating Web3 tag */}
              <div className="absolute -top-4 -right-4 glass p-4 rounded-2xl text-text-primary transform rotate-12 hover:rotate-0 transition-all cursor-default">
                <p className="font-black text-mobile-xs uppercase tracking-widest mb-1">Web3</p>
                <p className="font-bold text-mobile-base">Blockchain First ⚡</p>
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
