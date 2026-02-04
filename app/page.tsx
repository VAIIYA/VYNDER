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
    <div className="min-h-screen bg-white text-vaiiya-gray font-sans overflow-x-hidden">
      {/* Navigation */}
      <div className="fixed top-0 w-full z-50 px-4 py-6 flex justify-center pointer-events-none">
        <nav className="glass px-6 py-4 rounded-full flex justify-between items-center w-full max-w-4xl pointer-events-auto border border-[#E9EDF6]">
          <div className="flex items-center gap-2">
            <Flame className="w-8 h-8 text-vaiiya-orange" />
            <span className="text-xl font-bold tracking-tight text-vaiiya-purple">VYNDER</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/auth/wallet" className="font-bold text-sm text-vaiiya-purple/70 hover:text-vaiiya-orange transition-colors">
              Sign In
            </Link>
            <Link
              href="/auth/wallet"
              className="btn-vaiiya-primary text-sm shadow-md hover:shadow-lg"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </div>

      {/* Hero Section */}
      <header className="relative pt-48 pb-24 px-6">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-vaiiya-orange/10 px-4 py-2 rounded-full text-vaiiya-orange text-xs font-bold mb-8 tracking-widest uppercase">
            <span>⚡ Next Gen Web3 Dating</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-serif text-vaiiya-purple mb-8 leading-[1.1] max-w-4xl mx-auto">
            Find your <span className="italic text-vaiiya-orange">perfect match</span> on the blockchain.
          </h1>

          <p className="text-lg md:text-xl text-vaiiya-gray/80 mb-12 max-w-2xl mx-auto leading-relaxed">
            The first decentralized dating platform built on Solana. Your wallet is your identity. Your connections are real.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/auth/wallet"
              className="btn-vaiiya-primary text-lg px-10 py-5 w-full sm:w-auto"
            >
              Connect Wallet
            </Link>
            <Link
              href="#features"
              className="btn-vaiiya-secondary text-lg px-10 py-5 w-full sm:w-auto"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Featured Card Preview */}
        <div className="mt-20 relative max-w-md mx-auto aspect-[3/4] group">
          <div className="absolute inset-0 bg-vaiiya-orange/5 rounded-[40px] rotate-6 scale-105 blur-xl -z-10 transition-transform group-hover:rotate-12" />
          <div className="vaiiya-card h-full overflow-hidden relative shadow-2xl border-4 border-white">
            <Image
              src="/images/meet_people_model.png"
              alt="Discover People"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-vaiiya-purple/80 via-transparent to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <div className="flex gap-2 mb-4">
                <span className="glass px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-vaiiya-purple">Verified</span>
                <span className="glass px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-vaiiya-purple">Creator</span>
              </div>
              <h3 className="text-3xl font-serif mb-1">Emma, 24</h3>
              <p className="opacity-90 font-medium">Digital artist & Solana native ✨</p>
            </div>
          </div>
        </div>
      </header>

      {/* Solana Section */}
      <section className="py-32 bg-[#F7F9FC] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
          <div className="relative">
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-vaiiya-orange/10 rounded-full blur-[100px]" />
            <div className="relative vaiiya-card p-4 aspect-square max-w-lg mx-auto overflow-hidden">
              <Image src="/images/hero_illustration.png" alt="Solana Tech" fill className="object-cover opacity-90" />
            </div>
          </div>

          <div>
            <h2 className="text-4xl md:text-6xl font-serif text-vaiiya-purple mb-8 leading-tight">
              Built on the speed of <span className="text-vaiiya-orange italic">Solana.</span>
            </h2>
            <p className="text-xl text-vaiiya-gray/70 mb-12 leading-relaxed">
              Experience lightning-fast interactions and minimal fees. No app stores, no censorship, just pure connection between real people on the blockchain.
            </p>

            <div className="grid grid-cols-2 gap-6 mb-12">
              <div className="vaiiya-card p-8 border-none bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">⚡</div>
                <h4 className="font-bold text-vaiiya-purple mb-2">Fastest Swipes</h4>
                <p className="text-sm text-vaiiya-gray/60">Powered by Solana&apos;s near-instant finality.</p>
              </div>
              <div className="vaiiya-card p-8 border-none bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">🔐</div>
                <h4 className="font-bold text-vaiiya-purple mb-2">Wallet ID</h4>
                <p className="text-sm text-vaiiya-gray/60">Your wallet is your identity. Full control.</p>
              </div>
            </div>

            <Link href="/auth/wallet" className="btn-vaiiya-primary inline-block">
              Start Dating Now
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-serif text-vaiiya-purple mb-24 leading-tight max-w-3xl mx-auto">
            Everything you love about dating apps, <span className="text-vaiiya-orange">reimagined</span> for Web3.
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: "🎨", title: "NFT Profiles", desc: "Showcase your digital identity and collections directly on your dating profile." },
              { icon: "🛡️", title: "Smart Verification", desc: "Automated wallet-based verification ensures you're meeting real community members." },
              { icon: "💎", title: "Direct Rewards", desc: "Interact with the community and earn rewards for meaningful connections." }
            ].map((f, i) => (
              <div key={i} className="group p-10 rounded-[40px] border border-[#E9EDF6] hover:bg-[#F7F9FC] transition-colors text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-vaiiya-orange/5 rounded-full blur-3xl translate-x-16 -translate-y-16" />
                <div className="text-5xl mb-8 group-hover:scale-110 transition-transform">{f.icon}</div>
                <h3 className="text-2xl font-serif text-vaiiya-purple mb-4">{f.title}</h3>
                <p className="text-vaiiya-gray/60 leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#F7F9FC] pt-32 pb-16 border-t border-[#E9EDF6]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12 mb-20">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Flame className="w-10 h-10 text-vaiiya-orange" />
                <span className="text-2xl font-bold text-vaiiya-purple">VYNDER</span>
              </div>
              <p className="text-vaiiya-gray/60 max-w-sm font-medium">
                The future of human connection, built on the decentralized web.
              </p>
            </div>

            <div className="flex flex-wrap gap-12 mt-4">
              <div className="space-y-4">
                <h5 className="font-bold text-xs uppercase tracking-widest text-vaiiya-purple/40">Product</h5>
                <ul className="space-y-3 font-bold text-sm text-vaiiya-purple/70">
                  <li><Link href="/" className="hover:text-vaiiya-orange transition-colors">Safety</Link></li>
                  <li><Link href="/" className="hover:text-vaiiya-orange transition-colors">Privacy</Link></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h5 className="font-bold text-xs uppercase tracking-widest text-vaiiya-purple/40">Social</h5>
                <ul className="space-y-3 font-bold text-sm text-vaiiya-purple/70">
                  <li><Link href="/" className="hover:text-vaiiya-orange transition-colors">Twitter</Link></li>
                  <li><Link href="/" className="hover:text-vaiiya-orange transition-colors">Telegram</Link></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-[#E9EDF6] flex flex-col md:flex-row justify-between items-center gap-8 text-xs font-bold uppercase tracking-widest text-vaiiya-purple/30">
            <p>© 2026 VYNDER. ALL RIGHTS RESERVED.</p>
            <div className="flex gap-10">
              <Link href="/" className="hover:text-vaiiya-orange transition-colors">Terms of Service</Link>
              <Link href="/" className="hover:text-vaiiya-orange transition-colors">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
// Force rebuild
