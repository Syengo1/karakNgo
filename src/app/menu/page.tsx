"use client";

import ProductCard from "@/components/menu/ProductCard";
import ProductModal from "@/components/menu/ProductModal";
import BranchSelector from "@/components/shared/BranchSelector"; // Ensure this path is correct
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useBranchStore } from "@/store/useBranchStore";
import { Loader2, MapPin } from "lucide-react";

// Define categories to match your Admin side
const MENU_CATEGORIES = ["All", "Matcha", "Iced Coffee", "Hot Coffee", "Sandos", "Sweets", "Mojitos"];

// --- TYPE DEFINITION (Merged Global + Local) ---
export interface MergedProduct {
  id: string;
  name: string;
  category: string;
  base_price: number;
  description: string | null;
  image_url: string | null;
  tags: string[];
  
  // Local Overrides
  sale_price: number | null;
  is_bogo: boolean;
  is_available: boolean;
}

export default function MenuPage() {
  const { currentBranch, isBranchSelectorOpen, toggleBranchSelector } = useBranchStore();
  const [products, setProducts] = useState<MergedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  
  // Modal State
  const [selectedProduct, setSelectedProduct] = useState<MergedProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. SMART FETCH: Get Global Products + Local Branch Settings
  useEffect(() => {
    if (!currentBranch) {
      setLoading(false);
      return; 
    }

    const fetchMenu = async () => {
      setLoading(true);
      try {
        // Query: Get Product + Join with Branch_Products for THIS branch only
        const { data: rawData, error } = await supabase
          .from('products')
          .select(`
            *,
            branch_products!inner (
              is_available,
              is_bogo,
              sale_price
            )
          `)
          .eq('branch_products.branch_id', currentBranch.id)
          .order('name');

        if (error) throw error;

        // Transform: Flatten the data into a single usable object
        const mergedMenu: MergedProduct[] = rawData.map((p: any) => {
          const local = p.branch_products[0] || { is_available: true, is_bogo: false, sale_price: null };
          return {
            ...p,
            is_available: local.is_available,
            is_bogo: local.is_bogo,
            sale_price: local.sale_price,
          };
        });

        setProducts(mergedMenu);
      } catch (err) {
        console.error("Failed to load menu:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [currentBranch]);

  const handleProductClick = (product: MergedProduct) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // 2. Filter Logic (Client Side)
  const filteredItems = products.filter(item => {
    if (activeCategory === "All") return true;
    return item.category === activeCategory;
  });

  // 3. Fallback: If no branch is selected, prompt user
  if (!currentBranch && !loading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-crack-cream text-center">
        <h1 className="font-serif text-3xl text-crack-black mb-4">Welcome to Crack & Go</h1>
        <p className="text-crack-black/60 mb-8 max-w-md">Please select a location to see the menu and availability near you.</p>
        <button 
          onClick={() => toggleBranchSelector(true)}
          className="bg-crack-orange text-white px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform"
        >
          Select Location
        </button>
        <BranchSelector />
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-12 px-4 md:px-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="mb-8 md:mb-12 text-center space-y-3">
        <h1 className="font-serif text-4xl md:text-5xl text-crack-black">The Menu</h1>
        
        {/* Branch Indicator */}
        {currentBranch && (
          <div 
            onClick={() => toggleBranchSelector(true)}
            className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full shadow-sm text-sm text-crack-black/70 cursor-pointer hover:text-crack-orange transition-colors"
          >
            <MapPin className="w-3 h-3" />
            <span>{currentBranch.name}</span>
            <span className="text-xs text-crack-orange font-bold ml-1">Change</span>
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <div className="sticky top-20 z-30 bg-crack-cream/95 backdrop-blur-sm py-4 mb-8 -mx-4 px-4 md:-mx-6 md:px-6 overflow-x-auto no-scrollbar border-b border-crack-black/5">
        <div className="flex gap-2 md:gap-3 min-w-max mx-auto justify-center">
          {MENU_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === cat
                  ? "bg-crack-black text-white shadow-md"
                  : "bg-white text-crack-black/60 hover:bg-white/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Product Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-crack-orange" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredItems.map((item) => (
            <ProductCard 
              key={item.id} 
              product={item} 
              onAdd={() => handleProductClick(item)} 
            />
          ))}
          
          {filteredItems.length === 0 && (
            <div className="col-span-full text-center py-12 text-crack-black/40">
              No items found in this category at this location.
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <ProductModal 
        product={selectedProduct} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
      
      {/* Ensure the selector is available if they want to switch */}
      <BranchSelector />

    </main>
  );
}