"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home, Coffee } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-crack-cream text-center relative overflow-hidden">
      
      {/* Background Blobs (Consistent with Home) */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-crack-orange/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-crack-sage/20 rounded-full blur-[100px] -z-10" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg mx-auto space-y-8 relative z-10"
      >
        {/* The "404" as a Sticker */}
        <div className="relative inline-block">
          <span className="font-marker text-9xl text-crack-black opacity-10 select-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-150 blur-sm">
            404
          </span>
          <h1 className="font-marker text-8xl md:text-9xl text-crack-orange rotate-[-6deg] drop-shadow-sm">
            404
          </h1>
        </div>

        <div className="space-y-4">
          <h2 className="font-serif text-3xl md:text-4xl text-crack-black">
            Spilled Milk?
          </h2>
          <p className="font-sans text-lg text-crack-black/60 leading-relaxed">
            The page you’re looking for has evaporated. It might have been moved, deleted, or never existed in the first place.
          </p>
        </div>

        {/* Smart Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <button 
            onClick={() => router.back()}
            className="px-8 py-4 rounded-full border border-crack-black/10 text-crack-black font-bold hover:bg-crack-black/5 transition-colors flex items-center justify-center gap-2 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Go Back
          </button>

          <Link href="/">
            <button className="w-full sm:w-auto px-8 py-4 bg-crack-black text-white rounded-full font-bold hover:bg-crack-orange transition-all shadow-lg flex items-center justify-center gap-2">
              <Home className="w-5 h-5" />
              Home Page
            </button>
          </Link>
        </div>

        {/* Quick Link to Menu */}
        <div className="pt-8 border-t border-crack-black/5 mt-8">
          <p className="text-sm text-crack-black/40 mb-4">Or grab a drink while you're here:</p>
          <Link 
            href="/menu" 
            className="inline-flex items-center gap-2 text-crack-orange font-bold hover:underline font-serif text-lg"
          >
            Browse the Menu <Coffee className="w-5 h-5" />
          </Link>
        </div>

      </motion.div>
    </div>
  );
}