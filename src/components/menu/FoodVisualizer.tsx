"use client";

import { motion, AnimatePresence } from "framer-motion";

interface FoodVisualizerProps {
  stickerText: string;
}

export default function FoodVisualizer({ stickerText }: FoodVisualizerProps) {
  return (
    <div className="relative w-64 h-48 mx-auto flex items-center justify-center">
      
      {/* The Wrapper / Box Animation */}
      <motion.div
        initial={{ scale: 0.8, rotateX: 90, opacity: 0 }}
        animate={{ scale: 1, rotateX: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 15 }}
        className="relative w-full h-full bg-[#EADDCD] rounded-xl shadow-xl border-b-8 border-[#D4C5B0] overflow-hidden"
        style={{
            // Creating a "Paper Texture" using CSS gradients
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(224, 122, 95, 0.05) 10px, rgba(224, 122, 95, 0.05) 20px)`
        }}
      >
        {/* Fold lines / Texture to look like a package */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-black/5 border-b border-black/5 transform -skew-y-3 origin-top-right" />
        
        {/* The "Seal" or Label Area */}
        <AnimatePresence mode="wait">
          {stickerText && (
            <motion.div
              key={stickerText}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 bg-white px-4 py-3 shadow-md border border-black rotate-2 z-20"
            >
              <div className="w-2 h-2 rounded-full bg-crack-black absolute -top-1 left-1/2 -translate-x-1/2" /> {/* Pin hole */}
              <p className="font-bold text-xs uppercase tracking-tighter text-center leading-tight text-black">
                {stickerText}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Heat/Steam Animation (Subtle) */}
        <motion.div 
            animate={{ y: [0, -10, 0], opacity: [0, 0.5, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="absolute -top-4 right-10 w-2 h-8 bg-white/40 blur-sm rounded-full"
        />
      </motion.div>

      {/* Shadow */}
      <div className="absolute -bottom-4 left-4 right-4 h-4 bg-black/20 blur-xl rounded-full" />
    </div>
  );
}