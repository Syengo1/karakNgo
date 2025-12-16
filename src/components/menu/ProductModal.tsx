"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, ArrowRight, Zap, Percent, Trash2 } from "lucide-react";
import { MODIFIERS, STICKER_PHRASES } from "@/lib/menu-data";
import { useCartStore, Modifier } from "@/store/useCartStore";
import CupVisualizer from "./CupVisualizer";
import FoodVisualizer from "./FoodVisualizer";
import { MergedProduct } from "@/app/menu/page"; // Import Shared Type

interface ProductModalProps {
  product: MergedProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

// -- HELPERS --
const isDrink = (category: string) => {
  const drinkKeywords = ['Matcha', 'Coffee', 'Latte', 'Mojitos', 'Milkshakes', 'Tea', 'Drinks'];
  return drinkKeywords.some(keyword => category.includes(keyword) || keyword.includes(category));
};

const getBaseColor = (category: string) => {
  if (category.includes('Matcha')) return '#81B29A';
  if (category.includes('Coffee') || category.includes('Latte')) return '#78350F'; 
  if (category.includes('Mojito')) return '#F2CC8F';
  if (category.includes('Strawberry')) return '#FFB7B2';
  return '#E07A5F';
};

export default function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  
  // -- STATE --
  const [size, setSize] = useState<'Regular' | 'Large'>('Regular');
  const [selectedModifiers, setSelectedModifiers] = useState<Modifier[]>([]);
  const [customSticker, setCustomSticker] = useState("");

  // Reset state
  useEffect(() => {
    if (isOpen) {
      setSize('Regular');
      setSelectedModifiers([]);
      setCustomSticker(STICKER_PHRASES[0]);
    }
  }, [isOpen, product]);

  if (!product) return null;

  // -- LOGIC --
  const isProductDrink = isDrink(product.category);
  // Smart Price: Use sale_price if it exists, otherwise base_price
  const startingPrice = product.sale_price ?? product.base_price;
  
  const modifiersPrice = selectedModifiers.reduce((acc, mod) => acc + mod.price, 0);
  const sizePrice = size === 'Large' ? 100 : 0;
  const totalPrice = startingPrice + modifiersPrice + sizePrice;

  const discountPercent = product.sale_price 
    ? Math.round(((product.base_price - product.sale_price) / product.base_price) * 100)
    : 0;

  // Visuals
  const baseColor = getBaseColor(product.category);
  const hasMilk = selectedModifiers.find(m => m.type === 'milk');
  const milkColor = hasMilk ? '#FDE6D5' : null;
  const hasTopping = selectedModifiers.find(m => m.type === 'topping');

  const handleModifierToggle = (mod: Modifier) => {
    setSelectedModifiers(prev => {
      if (mod.type === 'milk') {
        const exists = prev.find(m => m.id === mod.id);
        const othersRemoved = prev.filter(m => m.type !== 'milk');
        return exists ? othersRemoved : [...othersRemoved, mod];
      }
      return prev.find(m => m.id === mod.id)
        ? prev.filter(m => m.id !== mod.id)
        : [...prev, mod];
    });
  };

  const handleDiscard = () => {
    if (selectedModifiers.length > 0 || size === 'Large' || customSticker !== STICKER_PHRASES[0]) {
        if (confirm("Discard your changes?")) onClose();
    } else {
        onClose();
    }
  };

  const handleConfirm = () => {
    addToCart({
      ...product,
      // Ensure we explicitly pass the active status values to the cart
      sale_price: product.sale_price,
      is_bogo: product.is_bogo,
      
      selectedModifiers,
      selectedSize: size,
      stickerText: customSticker,
      totalPrice,
      quantity: 1,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center pointer-events-none">
          
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleDiscard}
            className="fixed inset-0 bg-crack-black/80 backdrop-blur-md pointer-events-auto"
          />

          <motion.div 
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative pointer-events-auto bg-crack-cream w-full max-w-4xl h-[85dvh] md:h-[650px] rounded-t-[2rem] md:rounded-[2rem] overflow-hidden flex flex-col md:flex-row shadow-2xl"
          >
            
            {/* VISUALIZER */}
            <div className="w-full md:w-5/12 h-[35%] md:h-full bg-crack-orange/10 relative flex flex-col items-center justify-center overflow-hidden shrink-0 border-b md:border-b-0 md:border-r border-crack-black/5">
               
               <div className="absolute top-4 left-4 z-20 flex gap-2">
                  {product.is_bogo && (
                    <span className="bg-[#81B29A] text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1">
                      <Zap className="w-3 h-3 fill-current" /> BOGO
                    </span>
                  )}
                  {product.sale_price && (
                    <span className="bg-[#E07A5F] text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1">
                      <Percent className="w-3 h-3" /> {discountPercent}% OFF
                    </span>
                  )}
               </div>

               <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] transition-colors duration-500 opacity-60 ${isProductDrink ? 'bg-crack-orange/20' : 'bg-crack-sage/20'}`} />
               
               <div className="relative z-10 transform scale-75 md:scale-110 transition-all duration-500 mt-2 md:mt-0">
                 {isProductDrink ? (
                   <CupVisualizer 
                     baseColor={baseColor}
                     milkColor={milkColor}
                     toppingType={hasTopping ? 'foam' : null}
                     stickerText={customSticker}
                     size={size}
                   />
                 ) : (
                   <FoodVisualizer stickerText={customSticker} />
                 )}
               </div>

               <div className="md:hidden absolute bottom-2 left-0 right-0 text-center px-6">
                 <h2 className="font-serif text-lg text-crack-black leading-tight drop-shadow-sm truncate">{product.name}</h2>
               </div>
            </div>


            {/* CONTROLS */}
            <div className="w-full md:w-7/12 flex flex-col flex-1 h-full bg-white relative z-20 min-h-0">
              
              <div className="hidden md:flex p-8 pb-4 border-b border-crack-black/5 justify-between items-start shrink-0">
                <div>
                  <h2 className="font-serif text-3xl text-crack-black mb-1">{product.name}</h2>
                  <p className="text-sm text-crack-black/50">{product.category}</p>
                </div>
                <button onClick={handleDiscard} className="p-2 hover:bg-crack-black/5 rounded-full transition-colors">
                  <X className="w-6 h-6 text-crack-black/50" />
                </button>
              </div>

              <button onClick={handleDiscard} className="md:hidden absolute top-4 right-4 z-30 p-2 bg-white/50 backdrop-blur-md rounded-full shadow-sm text-crack-black/70">
                <X className="w-5 h-5" />
              </button>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                
                {/* Size */}
                <section>
                  <label className="text-xs font-bold uppercase text-crack-black/40 mb-3 block tracking-wider">Size</label>
                  <div className="flex bg-crack-cream rounded-xl p-1.5 w-full">
                    {['Regular', 'Large'].map((s) => (
                      <button
                        key={s}
                        onClick={() => setSize(s as any)}
                        className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                          size === s ? 'bg-white shadow-sm text-crack-black scale-[1.02]' : 'text-crack-black/50 hover:bg-white/50'
                        }`}
                      >
                        {s} <span className="opacity-60 text-xs ml-1">{s === 'Large' && isProductDrink ? '(+100)' : ''}</span>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Milk */}
                {isProductDrink && (
                  <section>
                    <label className="text-xs font-bold uppercase text-crack-black/40 mb-3 block tracking-wider">Milk Alternative (+120)</label>
                    <div className="grid grid-cols-2 gap-3">
                      {MODIFIERS.milks.map((mod) => {
                        const isSelected = !!selectedModifiers.find(m => m.id === mod.id);
                        return (
                          <button
                            key={mod.id}
                            onClick={() => handleModifierToggle(mod)}
                            className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all text-left flex justify-between items-center ${
                              isSelected
                              ? 'border-crack-black bg-crack-black text-white shadow-md'
                              : 'border-crack-black/10 text-crack-black/70 hover:border-crack-black/30'
                            }`}
                          >
                            {mod.name.replace(' Milk', '')}
                            {isSelected && <Check className="w-4 h-4" />}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* Sticker */}
                <section>
                  <label className="text-xs font-bold uppercase text-crack-black/40 mb-3 block tracking-wider">Sticker Vibe</label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {STICKER_PHRASES.map((phrase) => (
                      <button
                        key={phrase}
                        onClick={() => setCustomSticker(phrase)}
                        className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${
                          customSticker === phrase
                          ? 'bg-crack-orange text-white border-crack-orange shadow-sm'
                          : 'bg-white border-crack-black/10 text-crack-black/60 hover:border-crack-orange/50'
                        }`}
                      >
                        {phrase}
                      </button>
                    ))}
                  </div>
                  <input 
                    className="w-full bg-crack-cream/30 border border-crack-black/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-crack-orange focus:ring-1 focus:ring-crack-orange transition-all placeholder:text-crack-black/30"
                    placeholder="Type your own vibe..."
                    value={customSticker}
                    onChange={(e) => setCustomSticker(e.target.value)}
                    maxLength={20}
                  />
                </section>
                
                <div className="h-4" /> 
              </div>

              {/* FOOTER */}
              <div className="p-4 md:p-6 bg-white border-t border-crack-black/5 shrink-0 pb-safe">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleDiscard}
                    className="w-14 h-14 rounded-full border border-red-100 bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 hover:border-red-200 transition-colors shrink-0 active:scale-90"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>

                  <button 
                    onClick={handleConfirm}
                    className="flex-1 bg-crack-black text-white h-14 rounded-full font-medium text-lg hover:bg-crack-orange transition-all shadow-lg flex items-center justify-between px-6 group active:scale-95"
                  >
                    <span className="flex flex-col items-start leading-none">
                      <span className="text-[10px] opacity-70 uppercase tracking-wide font-bold">Total</span>
                      <span>KES {totalPrice}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      Add <ArrowRight className="w-5 h-5" />
                    </span>
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}