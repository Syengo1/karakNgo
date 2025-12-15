"use client";

import ProductCard from "@/components/menu/ProductCard";
import ProductModal from "@/components/menu/ProductModal";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

// Define categories to match your Admin side
const MENU_CATEGORIES = ["All", "Matcha", "Iced Coffee", "Hot Coffee", "Sandos", "Sweets", "Mojitos"];

export default function MenuPage() {
  const [products, setProducts] = useState<any[]>([]); // Use 'any' or proper DB type
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  
  // Modal State
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Fetch from Supabase
  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true);
      // Fetch all products, order by name
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('name');
      
      if (data) setProducts(data);
      setLoading(false);
    };

    fetchMenu();
  }, []);

  const handleProductClick = (product: any) => {
    // If we have a sale price, we should probably pass that as the 'price' 
    // to the modal so the cart calculates correctly
    const effectiveProduct = {
      ...product,
      price: product.sale_price || product.base_price // Logic to use sale price if exists
    };
    
    setSelectedProduct(effectiveProduct);
    setIsModalOpen(true);
  };

  // 2. Filter Logic (Client Side)
  const filteredItems = products.filter(item => {
    if (activeCategory === "All") return true;
    return item.category === activeCategory;
  });

  return (
    <main className="min-h-screen pt-24 pb-12 px-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="mb-12 text-center space-y-4">
        <h1 className="font-serif text-5xl text-karak-black">The Menu</h1>
        <p className="text-karak-black/60 max-w-md mx-auto">
          Hand-crafted beverages and eats made for the soul (and your feed).
        </p>
      </div>

      {/* Category Tabs */}
      <div className="sticky top-20 z-30 bg-karak-cream/95 backdrop-blur-sm py-4 mb-8 -mx-6 px-6 overflow-x-auto no-scrollbar border-b border-karak-black/5">
        <div className="flex gap-3 min-w-max mx-auto justify-center">
          {MENU_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === cat
                  ? "bg-karak-black text-white shadow-md"
                  : "bg-white text-karak-black/60 hover:bg-white/80"
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
          <Loader2 className="w-8 h-8 animate-spin text-karak-orange" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <ProductCard 
              key={item.id} 
              product={item} 
              onAdd={handleProductClick} 
            />
          ))}
          
          {filteredItems.length === 0 && (
            <div className="col-span-full text-center py-12 text-karak-black/40">
              No items found in this category.
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

    </main>
  );
}