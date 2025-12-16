"use client";

import { Plus, Zap } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { MergedProduct } from "@/app/menu/page"; // Import shared type

interface ProductCardProps {
  product: MergedProduct;
  onAdd: () => void;
}

export default function ProductCard({ product, onAdd }: ProductCardProps) {
  // Logic: Disable interaction if sold out
  const isSoldOut = !product.is_available;

  // Calculate discount for display
  const discount = product.sale_price 
    ? Math.round(((product.base_price - product.sale_price) / product.base_price) * 100)
    : 0;

  // Handler to ensure we don't trigger clicks on sold out items
  const handleClick = () => {
    if (!isSoldOut) {
      onAdd();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      onClick={handleClick}
      className={`group relative bg-white rounded-3xl p-3 md:p-4 shadow-sm border transition-all duration-300 flex flex-col h-full ${
        isSoldOut 
        ? 'border-gray-100 opacity-70 grayscale pointer-events-none cursor-not-allowed' 
        : 'border-crack-black/5 hover:shadow-xl hover:border-crack-orange/20 cursor-pointer'
      }`}
    >
      
      {/* --- 1. IMAGE SECTION --- */}
      <div className="relative aspect-square w-full mb-4 flex items-center justify-center bg-crack-cream/30 rounded-2xl overflow-hidden">
        
        {/* Marketing Badges */}
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 items-start pointer-events-none">
           {product.is_bogo && (
             <span className="bg-[#81B29A] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 backdrop-blur-sm border border-white/10">
               <Zap className="w-3 h-3 fill-current" /> BOGO
             </span>
           )}
           {product.sale_price && (
             <span className="bg-[#E07A5F] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md backdrop-blur-sm border border-white/10">
               -{discount}%
             </span>
           )}
        </div>

        {/* Product Image */}
        {product.image_url ? (
           <Image 
             src={product.image_url} 
             alt={product.name} 
             fill 
             className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-110" 
             sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
           />
        ) : (
           <div className="text-crack-orange/20 font-serif text-6xl select-none">K&G</div>
        )}

        {/* Sold Out Overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="bg-gray-800 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transform -rotate-12 shadow-lg">
              Sold Out
            </span>
          </div>
        )}

        {/* --- THE "ADD" BUTTON --- */}
        {!isSoldOut && (
          <button 
            onClick={(e) => {
              e.stopPropagation(); 
              handleClick();
            }}
            className="absolute bottom-3 right-3 z-30 w-10 h-10 bg-white text-crack-black rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform active:scale-90 md:translate-y-4 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 hover:bg-crack-orange hover:text-white"
            aria-label={`Add ${product.name} to cart`}
          >
            <Plus className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* --- 2. TEXT CONTENT --- */}
      <div className="flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-serif text-lg text-crack-black leading-tight group-hover:text-crack-orange transition-colors line-clamp-2">
              {product.name}
            </h3>
            
            {/* Price Display */}
            <div className="text-right shrink-0 flex flex-col items-end">
              {product.sale_price ? (
                <>
                  <span className="text-[10px] text-gray-400 line-through decoration-gray-400 leading-none mb-0.5">
                    {product.base_price}
                  </span>
                  <span className="font-sans font-bold text-[#E07A5F] text-sm">
                    {product.sale_price}
                  </span>
                </>
              ) : (
                <span className="font-sans font-medium text-crack-black text-sm">
                  {product.base_price}
                </span>
              )}
            </div>
          </div>
          
          <p className="text-xs text-crack-black/50 line-clamp-2 mt-1 min-h-[2.5em]">
            {product.description || "Freshly crafted for the soul."}
          </p>
        </div>

        {/* Mobile-Only Hint */}
        <div className="md:hidden pt-2">
           <span className="text-[10px] font-bold text-crack-orange uppercase tracking-wider flex items-center gap-1">
             Tap to add <Plus className="w-3 h-3" />
           </span>
        </div>
      </div>
    </motion.div>
  );
}