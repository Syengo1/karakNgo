"use client";

import { useCartStore } from "@/store/useCartStore";
import { AnimatePresence, motion } from "framer-motion";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function CartDrawer() {
  const { items, isCartOpen, toggleCart, removeFromCart } = useCartStore();
  const [isClient, setIsClient] = useState(false);

  // Hydration fix
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  // Calculations
  const subtotal = items.reduce((acc, item) => acc + item.totalPrice, 0);
  const tax = subtotal * 0.16; // 16% VAT example
  const total = subtotal; // Assuming prices are inclusive, but let's just show Total for simplicity

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* 1. Backdrop (Click to close) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => toggleCart(false)}
            className="fixed inset-0 bg-crack-black/60 backdrop-blur-sm z-[100]"
          />

          {/* 2. The Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-crack-cream z-[101] shadow-2xl flex flex-col border-l border-crack-black/5"
          >
            
            {/* Header */}
            <div className="p-6 border-b border-crack-black/5 flex items-center justify-between bg-white/50 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-crack-orange" />
                <h2 className="font-serif text-2xl text-crack-black">Your Order</h2>
                <span className="bg-crack-black text-white text-xs font-bold px-2 py-1 rounded-full">
                  {items.length}
                </span>
              </div>
              <button 
                onClick={() => toggleCart(false)}
                className="p-2 hover:bg-crack-black/5 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-crack-black/60" />
              </button>
            </div>

            {/* Scrollable Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                  <div className="w-20 h-20 bg-crack-black/5 rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-10 h-10 text-crack-black/30" />
                  </div>
                  <p className="font-serif text-xl text-crack-black">Your bag is empty</p>
                  <p className="text-sm font-sans max-w-[200px]">
                    Go find your emotional support beverage.
                  </p>
                  <button 
                    onClick={() => toggleCart(false)}
                    className="mt-4 text-crack-orange font-bold hover:underline"
                  >
                    Start Ordering
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={item.cartId}
                    className="group relative bg-white rounded-2xl p-4 shadow-sm border border-crack-black/5 flex gap-4 transition-all hover:shadow-md"
                  >
                    {/* Visual Thumbnail (Color coded) */}
                    <div className={`w-20 h-24 rounded-xl flex items-center justify-center relative overflow-hidden shrink-0 ${
                       item.category.includes('Matcha') ? 'bg-crack-sage/20' : 'bg-crack-orange/20'
                    }`}>
                      <div className="font-serif text-2xl text-crack-black/20 font-bold">K&G</div>
                      {/* Mini Sticker Badge */}
                      {item.stickerText && (
                         <div className="absolute bottom-2 inset-x-2 bg-white text-[8px] text-center py-1 border border-black/10 rotate-[-2deg] truncate">
                           {item.stickerText}
                         </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-serif text-lg text-crack-black leading-tight truncate pr-2">
                            {item.name}
                          </h3>
                          <p className="font-sans font-bold text-sm">
                            {item.totalPrice}
                          </p>
                        </div>
                        <p className="text-xs text-crack-black/50 mt-1 uppercase tracking-wider font-bold">
                          {item.selectedSize}
                        </p>
                        {/* Modifiers List */}
                        {item.selectedModifiers.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.selectedModifiers.map(mod => (
                              <span key={mod.id} className="text-[10px] bg-crack-cream px-1.5 py-0.5 rounded text-crack-black/70">
                                + {mod.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between mt-3">
                         {/* Remove Button */}
                         <button 
                           onClick={() => removeFromCart(item.cartId)}
                           className="text-xs text-red-400 flex items-center gap-1 hover:text-red-600 transition-colors"
                         >
                           <Trash2 className="w-3 h-3" /> Remove
                         </button>
                         
                         {/* (Future: Qty controls could go here) */}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer: Totals & Checkout */}
            {items.length > 0 && (
              <div className="p-6 bg-white border-t border-crack-black/5 space-y-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-crack-black/60">
                    <span>Subtotal</span>
                    <span>KES {subtotal}</span>
                  </div>
                  <div className="flex justify-between items-center text-xl font-serif text-crack-black pt-2 border-t border-dashed border-crack-black/10">
                    <span>Total</span>
                    <span>KES {total}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  onClick={() => toggleCart(false)} // Close drawer on click
                  className="w-full bg-crack-black text-white py-4 rounded-full font-medium text-lg hover:bg-crack-orange transition-all shadow-lg flex items-center justify-center gap-2 group"
                >
                  <span>Checkout</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <p className="text-[10px] text-center text-crack-black/40">
                  Secure checkout powered by M-Pesa
                </p>
              </div>
            )}
            
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}