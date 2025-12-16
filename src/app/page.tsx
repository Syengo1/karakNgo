import Link from "next/link";
import DealsSlider from "@/components/home/DealsSlider";
import ReviewsSection from "@/components/home/ReviewsSection";
import AboutSnippet from "@/components/home/AboutSnippet";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-crack-cream overflow-x-hidden">
      
      {/* 1. HERO SECTION */}
      {/* - min-h-dvh: Ensures it fills the full screen on mobile browsers 
         - pt-32: Pushes content down so it doesn't hide behind the navbar
      */}
      <section className="min-h-dvh flex flex-col items-center justify-center p-6 pt-32 relative">
        
        {/* Background Blobs (Atmosphere) */}
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-crack-sage/30 rounded-full blur-[100px] -z-10 animate-pulse-slow pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-crack-orange/20 rounded-full blur-[80px] -z-10 pointer-events-none" />

        {/* Content */}
        <div className="text-center space-y-8 max-w-4xl z-10 flex flex-col items-center">
          
          {/* Animated Tagline */}
          <span className="inline-block py-2 px-6 border border-crack-black/10 rounded-full text-lg md:text-xl font-marker text-crack-black/80 tracking-wide rotate-[-2deg] bg-white/40 backdrop-blur-sm shadow-sm hover:rotate-2 transition-transform cursor-default select-none">
            Nairobi's Aesthetic Sip
          </span>
          
          {/* Main Headline */}
          <h1 className="font-serif italic text-6xl md:text-8xl lg:text-9xl text-crack-black leading-[0.9] tracking-tight drop-shadow-sm">
            Crack <span className="text-crack-orange not-italic">&</span> Go
          </h1>
          
          {/* Subtext */}
          <p className="font-sans text-lg md:text-2xl text-crack-black/70 max-w-lg mx-auto leading-relaxed">
            More than just tea. It’s an emotional support beverage designed for your feed.
          </p>

          {/* CTA Button */}
          <div className="pt-4">
            <Link href="/menu">
              <button className="px-12 py-5 bg-crack-black text-crack-cream rounded-full font-sans font-bold text-lg hover:bg-crack-orange hover:scale-105 transition-all duration-300 shadow-xl shadow-crack-black/10 flex items-center gap-2 group">
                Order Now
                <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. DEALS CAROUSEL (Smart Logic) */}
      <DealsSlider />

      {/* 3. ABOUT SNIPPET (Branch Context) */}
      <AboutSnippet />

      {/* 4. REVIEWS (Interactive) */}
      <ReviewsSection />

      {/* 5. FOOTER */}
      <footer className="bg-crack-black text-crack-cream/60 py-12 text-center text-sm font-sans border-t border-white/5">
        <p className="mb-2">&copy; {new Date().getFullYear()} Crack & Go. All rights reserved.</p>
        <p className="text-xs opacity-50 flex items-center justify-center gap-2">
          <span>Designed for the Vibe</span>
          <span className="w-1 h-1 bg-crack-orange rounded-full" />
          <span>Nairobi, KE</span>
        </p>
      </footer>

    </main>
  );
}