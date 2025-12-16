"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useBranchStore } from "@/store/useBranchStore";
import ProductCard from "@/components/menu/ProductCard";
import ProductModal from "@/components/menu/ProductModal"; // Import Modal
import { Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { MergedProduct } from "@/app/menu/page"; // Import shared type

export default function DealsSlider() {
  const { currentBranch } = useBranchStore();
  const [deals, setDeals] = useState<MergedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [selectedProduct, setSelectedProduct] = useState<MergedProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // If no branch selected, we can't show specific deals
    if (!currentBranch) {
        setLoading(false);
        return;
    }

    const fetchDeals = async () => {
      // Fetch Products with Branch Data
      const { data: rawData } = await supabase
        .from('products')
        .select(`*, branch_products!inner(is_available, is_bogo, sale_price)`)
        .eq('branch_products.branch_id', currentBranch.id)
        .eq('branch_products.is_available', true); // Only show available

      if (rawData) {
        // Flatten and Sort
        const processed = rawData.map((p: any) => ({
          ...p,
          is_available: p.branch_products[0].is_available,
          is_bogo: p.branch_products[0].is_bogo,
          sale_price: p.branch_products[0].sale_price
        })).sort((a: any, b: any) => {
            // Logic: BOGO first, then Sale, then Best Seller tag
            if (a.is_bogo && !b.is_bogo) return -1;
            if (!a.is_bogo && b.is_bogo) return 1;
            if (a.sale_price && !b.sale_price) return -1;
            if (!a.sale_price && b.sale_price) return 1;
            const aPop = a.tags.includes('Best Seller');
            const bPop = b.tags.includes('Best Seller');
            if (aPop && !bPop) return -1;
            if (!aPop && bPop) return 1;
            return 0;
        });

        // Take top 6 items
        setDeals(processed.slice(0, 6));
      }
      setLoading(false);
    };

    fetchDeals();
  }, [currentBranch]);

  const handleProductClick = (product: MergedProduct) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  if (!currentBranch || deals.length === 0) return null;

  return (
    <section className="py-12 relative bg-white/30 backdrop-blur-sm border-y border-crack-black/5">
      <div className="max-w-7xl mx-auto px-6 mb-6 flex justify-between items-end">
        <div>
            <h2 className="font-serif text-3xl text-crack-black flex items-center gap-2">
                <Sparkles className="text-crack-orange w-6 h-6" />
                Trending at {currentBranch.name}
            </h2>
            <p className="text-crack-black/60 mt-1 font-sans">Don't miss out on today's top picks.</p>
        </div>
        <Link href="/menu" className="hidden md:block text-crack-orange font-bold hover:underline">View Full Menu →</Link>
      </div>

      {/* Slider Container */}
      <div className="overflow-x-auto no-scrollbar pb-8 px-6 -mx-4 md:px-0 md:mx-auto max-w-7xl">
        <div className="flex gap-4 w-max">
            {loading ? (
                <div className="w-full flex justify-center py-12"><Loader2 className="animate-spin text-crack-orange w-8 h-8" /></div>
            ) : (
                deals.map((item) => (
                    <div key={item.id} className="w-[280px] shrink-0 transform transition-transform hover:-translate-y-1">
                        <ProductCard 
                            product={item} 
                            onAdd={() => handleProductClick(item)} 
                        />
                    </div>
                ))
            )}
        </div>
      </div>
      
      <div className="md:hidden text-center pb-4">
        <Link href="/menu" className="text-crack-orange font-bold text-sm">View Full Menu →</Link>
      </div>

      {/* Interaction Modal */}
      <ProductModal 
        product={selectedProduct} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </section>
  );
}