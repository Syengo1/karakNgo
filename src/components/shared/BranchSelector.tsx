"use client";

import { useBranchStore } from "@/store/useBranchStore";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Check, Loader2, Lock } from "lucide-react";
import { useEffect, useState } from "react";

export default function BranchSelector() {
  const { 
    currentBranch, 
    branches, 
    setBranch, 
    fetchBranches,
    isBranchSelectorOpen, 
    toggleBranchSelector,
    isLoading 
  } = useBranchStore();
  
  const [mounted, setMounted] = useState(false);

  // Fetch real branches on mount
  useEffect(() => {
    setMounted(true);
    fetchBranches();
  }, [fetchBranches]);

  const shouldShow = mounted && (!currentBranch || isBranchSelectorOpen);

  if (!shouldShow) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-crack-black/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="bg-crack-cream w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-crack-black/5"
        >
          <div className="bg-crack-orange p-6 text-center">
            <h2 className="font-serif text-2xl text-white">Choose Location</h2>
            <p className="text-white/80 text-sm mt-1 font-sans">
              Select your nearest Crack & Go to see what's brewing.
            </p>
          </div>

          <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
            {isLoading && branches.length === 0 ? (
               <div className="flex justify-center py-8 text-crack-black/50">
                 <Loader2 className="w-6 h-6 animate-spin" />
               </div>
            ) : (
              branches.map((branch) => (
                <button
                  key={branch.id}
                  onClick={() => setBranch(branch)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 group ${
                    currentBranch?.id === branch.id
                      ? "border-crack-orange bg-crack-orange/10"
                      : "border-crack-black/10 hover:border-crack-orange/50 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${
                      currentBranch?.id === branch.id ? "bg-crack-orange text-white" : "bg-crack-black/5 text-crack-black"
                    }`}>
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-serif text-lg text-crack-black">{branch.name}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {branch.is_open ? (
                          <span className="text-xs text-green-600 font-bold uppercase tracking-wider bg-green-100 px-1.5 py-0.5 rounded">Open Now</span>
                        ) : (
                          <span className="text-xs text-red-500 font-bold uppercase tracking-wider bg-red-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Closed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {currentBranch?.id === branch.id && <Check className="w-5 h-5 text-crack-orange" />}
                </button>
              ))
            )}
          </div>

          {currentBranch && (
            <div className="p-4 bg-crack-black/5 text-center">
              <button 
                onClick={() => toggleBranchSelector(false)}
                className="text-sm text-crack-black/60 hover:text-crack-black underline font-sans"
              >
                Dismiss
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}