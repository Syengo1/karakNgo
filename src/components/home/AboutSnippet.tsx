"use client";
import { useBranchStore } from "@/store/useBranchStore";
import Link from "next/link";
import { MapPin, Clock } from "lucide-react";

export default function AboutSnippet() {
  const { currentBranch } = useBranchStore();

  // If no branch selected, show generic
  const branchName = currentBranch ? currentBranch.name : "Crack & Go";
  const branchDesc = currentBranch 
    ? `Located in the heart of ${currentBranch.name}, we serve aesthetic sips and savory bites designed for your feed.`
    : "Nairobi's premier aesthetic beverage destination. Hand-crafted drinks, made with love.";

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
       <div className="bg-crack-black text-crack-cream rounded-[3rem] p-8 md:p-16 relative overflow-hidden">
          {/* Decorative Circles */}
          <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-crack-orange/20 rounded-full blur-3xl" />

          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
             <div className="space-y-6">
                <span className="text-crack-orange font-marker text-xl rotate-[-2deg] inline-block">Who we are</span>
                <h2 className="font-serif text-4xl md:text-5xl leading-tight">
                   The {branchName} <br/> Experience
                </h2>
                <p className="text-crack-cream/70 text-lg font-sans leading-relaxed">
                   {branchDesc} We believe in community, quality ingredients, and vibes that are immaculate.
                </p>
                
                {currentBranch && (
                    <div className="flex flex-col gap-3 pt-4">
                        <div className="flex items-center gap-3 text-sm opacity-80">
                            <MapPin className="w-5 h-5 text-crack-orange" />
                            <span>41 Kabarsiran Ave (Example Address)</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm opacity-80">
                            <Clock className="w-5 h-5 text-crack-orange" />
                            <span>Open Daily: 7am - 8pm</span>
                        </div>
                    </div>
                )}

                <div className="pt-6">
                    <Link href="/about" className="inline-block border border-crack-cream/30 px-8 py-3 rounded-full hover:bg-crack-cream hover:text-crack-black transition-all font-bold">
                        Read Our Full Story
                    </Link>
                </div>
             </div>

             {/* Right Side: Image Placeholder or Design */}
             <div className="h-64 md:h-full min-h-[300px] bg-white/10 rounded-2xl border border-white/5 flex items-center justify-center backdrop-blur-sm">
                <span className="font-serif text-3xl opacity-20">K&G {currentBranch?.name || "Global"}</span>
             </div>
          </div>
       </div>
    </section>
  );
}