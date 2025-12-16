"use client";

import { motion, AnimatePresence } from "framer-motion";

interface CupVisualizerProps {
  baseColor: string;
  milkColor: string | null;
  toppingType: 'foam' | 'whipped' | null;
  stickerText: string;
  size: 'Regular' | 'Large'; // <--- New Prop
}

export default function CupVisualizer({ 
  baseColor, 
  milkColor, 
  toppingType, 
  stickerText,
  size 
}: CupVisualizerProps) {
  
  // Height calculation based on size
  const heightClass = size === 'Large' ? 'h-72' : 'h-56';
  const widthClass = size === 'Large' ? 'w-52' : 'w-48';

  return (
    <div className={`relative mx-auto transition-all duration-500 ease-spring ${widthClass} ${heightClass} perspective-1000`}>
      {/* Cup Container */}
      <div className="relative w-full h-full bg-white/20 backdrop-blur-sm border-2 border-white/40 rounded-b-[3rem] rounded-t-lg shadow-xl overflow-hidden z-10 transition-all duration-500">
        
        {/* Liquid */}
        <motion.div 
          initial={{ height: "0%" }}
          animate={{ height: "85%" }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute bottom-2 left-2 right-2 rounded-b-[2.5rem] overflow-hidden"
          style={{ backgroundColor: baseColor }}
        >
          <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('/noise.png')]" />
          
          <AnimatePresence>
            {milkColor && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="absolute inset-0 mix-blend-overlay"
                style={{ background: `linear-gradient(to top, ${milkColor} 0%, transparent 100%)` }}
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Topping */}
        <AnimatePresence>
          {toppingType && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-[15%] left-2 right-2 h-12 bg-white/90 rounded-lg filter blur-md opacity-90"
            />
          )}
        </AnimatePresence>

        {/* Sticker (Stays centered regardless of size) */}
        <AnimatePresence mode="wait">
          {stickerText && (
            <motion.div
              key={stickerText}
              initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: -3 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 bg-white px-3 py-2 shadow-sm border border-black/80 z-20 text-center"
            >
              <p className="font-bold text-[10px] uppercase tracking-tighter leading-tight text-black line-clamp-2">
                {stickerText}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ice Cubes */}
        <div className="absolute bottom-8 left-6 w-8 h-8 bg-white/30 rounded-lg rotate-12 blur-[1px]" />
      </div>

      {/* Lid & Straw (Adjusts position automatically relative to container) */}
      <div className="absolute -top-2 left-[-5%] w-[110%] h-6 bg-white/90 rounded-full shadow-sm z-20 border border-gray-200" />
      <motion.div 
        layout // Framer Motion layout prop helps animate the straw position smoothly
        className="absolute -top-12 left-1/2 w-3 h-48 bg-crack-black/80 -z-10 rotate-[15deg] origin-bottom" 
      />
    </div>
  );
}