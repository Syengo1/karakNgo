"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useBranchStore } from "@/store/useBranchStore";
import { 
  Plus, Search, Image as ImageIcon, Save, Trash2, X, Loader2, UploadCloud, 
  Tag, Percent, Zap, Eye, EyeOff, Filter, Globe, MapPin
} from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

// --- TYPES ---
interface Product {
  id: string;
  name: string;
  category: string;
  base_price: number;     // Global Price
  description: string | null;
  image_url: string | null;
  tags: string[];
  
  // Local Branch Overrides (Joined Data)
  sale_price: number | null; 
  is_bogo: boolean;
  is_available: boolean;
}

const CATEGORIES = ["All", "Matcha", "Iced Coffee", "Hot Coffee", "Sandos", "Sweets", "Mojitos"];
const MARKETING_TAGS = ["Best Seller", "Aesthetic", "Signature", "Spicy", "Mild", "Vegan", "New"];

export default function MenuManager() {
  const { currentBranch } = useBranchStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Drawer States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // --- 1. SMART DATA FETCHING ---
  const fetchProducts = async () => {
    if (!currentBranch) return;
    setLoading(true);

    try {
      // Fetch Global Products + Left Join with Current Branch Settings
      const { data: rawProducts, error } = await supabase
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

      // Merge Data (Local settings override logic)
      const merged: Product[] = rawProducts.map((p: any) => {
        const local = p.branch_products[0] || { is_available: true, is_bogo: false, sale_price: null };
        return {
          ...p,
          is_available: local.is_available,
          is_bogo: local.is_bogo,
          sale_price: local.sale_price,
        };
      });
      
      setProducts(merged);
    } catch (err) {
      console.error("Error fetching menu:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [currentBranch]);

  // --- ACTIONS ---

  const handleCreate = () => {
    setEditingProduct(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsDrawerOpen(true);
  };

  // Toggle LOCAL Availability Only
  const toggleAvailability = async (product: Product) => {
    if (!currentBranch) return;
    
    // Optimistic Update
    const newStatus = !product.is_available;
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_available: newStatus } : p));

    await supabase
      .from('branch_products')
      .update({ is_available: newStatus })
      .eq('branch_id', currentBranch.id)
      .eq('product_id', product.id);
  };

  // Delete GLOBAL Product (Dangerous Action)
  const handleDelete = async (product: Product) => {
    if (!confirm(`⚠️ WARNING ⚠️\n\nDeleting "${product.name}" will remove it from ALL branches globally.\n\nAre you sure?`)) return;
    
    if (product.image_url) {
      const fileName = product.image_url.split('/').pop();
      if (fileName) await supabase.storage.from('products').remove([fileName]);
    }

    await supabase.from('products').delete().eq('id', product.id);
    fetchProducts();
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!currentBranch) return (
    <div className="flex items-center justify-center h-screen bg-[#111] text-white">
      <div className="text-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-crack-orange mx-auto" />
        <p>Loading Branch Context...</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto text-white h-screen flex flex-col">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-serif text-white">Menu Manager</h1>
          <div className="flex items-center gap-2 mt-1 text-gray-400 text-sm">
            <Globe className="w-4 h-4" />
            <span>Managing Inventory for:</span>
            <span className="text-crack-orange font-bold bg-crack-orange/10 px-2 py-0.5 rounded border border-crack-orange/20">
              {currentBranch.name}
            </span>
          </div>
        </div>
        <button 
          onClick={handleCreate}
          className="bg-crack-orange hover:bg-[#c96d53] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-crack-orange/20"
        >
          <Plus className="w-5 h-5" /> Add Product
        </button>
      </div>

      {/* CONTROLS */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search products..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#222] border border-white/10 rounded-xl py-3 pl-12 text-white focus:border-crack-orange focus:outline-none transition-colors"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedCategory === cat 
                ? 'bg-crack-cream text-crack-black shadow-md' 
                : 'bg-[#222] text-gray-400 hover:bg-[#333]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* GRID */}
      {loading ? (
        <div className="flex-1 flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin text-crack-orange" /></div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
             {filteredProducts.map((product) => (
               <ProductCard 
                 key={product.id} 
                 product={product} 
                 onEdit={() => handleEdit(product)} 
                 onDelete={() => handleDelete(product)}
                 onToggleStatus={() => toggleAvailability(product)}
               />
             ))}
             
             {filteredProducts.length === 0 && (
               <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500 gap-4 opacity-50">
                 <Filter className="w-12 h-12" />
                 <p>No products found matching your filters.</p>
                 <button onClick={() => { setSearch(""); setSelectedCategory("All"); }} className="text-crack-orange hover:underline text-sm">Clear filters</button>
               </div>
             )}
          </div>
        </div>
      )}

      {/* DRAWER */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 right-0 w-full max-w-xl bg-[#1a1a1a] border-l border-white/10 shadow-2xl z-50 flex flex-col"
            >
               <ProductForm 
                 product={editingProduct} 
                 branchId={currentBranch.id}
                 onClose={() => setIsDrawerOpen(false)} 
                 onSuccess={() => { setIsDrawerOpen(false); fetchProducts(); }}
               />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function ProductCard({ product, onEdit, onDelete, onToggleStatus }: { product: Product, onEdit: any, onDelete: any, onToggleStatus: any }) {
  const discount = product.sale_price 
    ? Math.round(((product.base_price - product.sale_price) / product.base_price) * 100)
    : 0;

  return (
    <div className={`bg-[#222] rounded-xl overflow-hidden border transition-all group relative ${
      !product.is_available ? 'border-red-500/30 opacity-75 grayscale-[0.5]' : 'border-white/5 hover:border-white/20'
    }`}>
      
      {/* Visual Status Overlay */}
      {!product.is_available && (
        <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
          <div className="border-2 border-white/50 px-4 py-2 rounded-lg transform -rotate-12 bg-black/50 shadow-xl">
            <p className="text-white font-bold uppercase tracking-[0.2em] text-xs">Sold Out</p>
          </div>
        </div>
      )}

      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
         {product.is_bogo && (
           <span className="bg-crack-sage text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 border border-white/10 backdrop-blur-md">
             <Zap className="w-3 h-3 fill-current" /> BOGO
           </span>
         )}
         {product.sale_price && (
           <span className="bg-crack-orange text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg border border-white/10 backdrop-blur-md">
             -{discount}%
           </span>
         )}
      </div>

      {/* Toggle Availability Button */}
      <button 
        onClick={(e) => { e.stopPropagation(); onToggleStatus(); }}
        className={`absolute top-3 right-3 z-30 p-2 rounded-full backdrop-blur-md transition-all shadow-lg ${
          product.is_available 
          ? 'bg-black/40 text-white hover:bg-white hover:text-black' 
          : 'bg-white text-black hover:bg-black/40 hover:text-white'
        }`}
        title={product.is_available ? "Mark as Sold Out" : "Mark as Available"}
      >
        {product.is_available ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
      </button>

      {/* Image */}
      <div className="h-48 w-full bg-[#111] relative flex items-center justify-center overflow-hidden">
        {product.image_url ? (
          <Image src={product.image_url} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-600">
            <ImageIcon className="w-8 h-8" />
            <span className="text-xs uppercase tracking-widest">No Image</span>
          </div>
        )}
        
        {/* Price Tag */}
        <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-2.5 py-1.5 rounded-lg text-xs font-mono text-white text-right z-10 border border-white/10 shadow-lg">
           {product.sale_price ? (
             <div className="flex flex-col items-end leading-none">
               <span className="line-through opacity-50 text-[9px] mb-0.5">KES {product.base_price}</span>
               <span className="text-crack-orange font-bold">KES {product.sale_price}</span>
             </div>
           ) : (
             <span>KES {product.base_price}</span>
           )}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
         <div className="mb-3 min-h-[4rem]">
            <div className="flex flex-wrap gap-1.5 mb-2">
               <span className="text-[9px] bg-crack-orange/10 text-crack-orange font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border border-crack-orange/20">
                 {product.category}
               </span>
               {product.tags.slice(0, 2).map(tag => (
                 <span key={tag} className="text-[9px] bg-white/5 text-gray-300 px-1.5 py-0.5 rounded border border-white/5">
                   {tag}
                 </span>
               ))}
            </div>
            <h3 className="font-bold text-lg leading-tight text-white">{product.name}</h3>
         </div>
         
         <div className="flex gap-2 pt-4 border-t border-white/5">
            <button onClick={onEdit} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg text-sm font-medium transition-colors">
              Edit Details
            </button>
            <button onClick={onDelete} className="px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors" title="Delete Global Product">
              <Trash2 className="w-4 h-4" />
            </button>
         </div>
      </div>
    </div>
  );
}

// --- FORM COMPONENT ---
function ProductForm({ product, branchId, onClose, onSuccess }: { product: Product | null, branchId: string, onClose: () => void, onSuccess: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: product?.name || "",
    category: product?.category || CATEGORIES[1], 
    base_price: product?.base_price || 650,
    sale_price: product?.sale_price || "",
    is_bogo: product?.is_bogo || false,
    is_available: product?.is_available ?? true,
    tags: product?.tags || [] as string[],
    description: product?.description || "",
    image_url: product?.image_url || "",
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setIsLoading(true);
    const file = e.target.files[0];
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`; 
    
    try {
      const { error } = await supabase.storage.from('products').upload(fileName, file);
      if (error) throw error;
      const { data } = supabase.storage.from('products').getPublicUrl(fileName);
      setFormData(prev => ({ ...prev, image_url: data.publicUrl }));
    } catch { alert('Error uploading image.'); } 
    finally { setIsLoading(false); }
  };

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const salePrice = formData.sale_price ? Number(formData.sale_price) : null;

    try {
      let productId = product?.id;

      // 1. UPDATE/CREATE GLOBAL PRODUCT CATALOG
      const globalData = {
        name: formData.name,
        category: formData.category,
        base_price: formData.base_price,
        description: formData.description,
        image_url: formData.image_url,
        tags: formData.tags
      };

      if (product) {
        // Edit Global
        await supabase.from('products').update(globalData).eq('id', productId);
      } else {
        // Create Global
        const { data, error } = await supabase.from('products').insert([globalData]).select().single();
        if (error) throw error;
        productId = data.id;

        // AUTO-LINK NEW PRODUCT TO ALL BRANCHES
        const { data: allBranches } = await supabase.from('branches').select('id');
        if (allBranches) {
           const links = allBranches.map(b => ({
             branch_id: b.id,
             product_id: productId,
             is_available: true, 
             is_bogo: false,
             sale_price: null
           }));
           await supabase.from('branch_products').insert(links);
        }
      }

      // 2. UPDATE LOCAL INVENTORY (For Current Branch)
      if (productId) {
        await supabase
          .from('branch_products')
          .update({
            is_available: formData.is_available,
            is_bogo: formData.is_bogo,
            sale_price: salePrice
          })
          .eq('branch_id', branchId)
          .eq('product_id', productId);
      }

      onSuccess();
    } catch (err) {
      console.error(err);
      alert("Failed to save product.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1a1a1a]">
       {/* DRAWER HEADER */}
       <div className="flex justify-between items-center mb-6 pb-6 border-b border-white/5 p-8 pb-0">
          <div>
            <h2 className="text-2xl font-bold font-serif text-white">{product ? "Edit Product" : "New Product"}</h2>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">
              {product?.id ? `Global ID: ${product.id.split('-')[0]}...` : "Catalog Mode"}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-400 hover:text-white" />
          </button>
       </div>

       {/* SCROLLABLE FORM */}
       <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-4 space-y-8">
          
          {/* Section: Local Status */}
          <div className="space-y-4">
             <h3 className="text-xs font-bold uppercase text-crack-orange tracking-widest flex items-center gap-2">
               <MapPin className="w-3 h-3" /> {branchId} Inventory Settings
             </h3>
             
             {/* Availability Toggle */}
             <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                <div>
                   <p className="font-bold text-sm text-white">Availability Status</p>
                   <p className="text-xs text-gray-500">{formData.is_available ? "Visible on menu" : "Hidden / Sold Out"}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, is_available: !prev.is_available }))}
                  className={`w-12 h-6 rounded-full relative transition-colors ${formData.is_available ? 'bg-green-600' : 'bg-gray-700'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${formData.is_available ? 'left-7' : 'left-1'}`} />
                </button>
             </div>

             {/* Local Deals */}
             <div className="bg-white/5 p-5 rounded-xl space-y-5 border border-white/5">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                   <div className="flex items-center gap-2 text-crack-sage font-bold text-sm"><Zap className="w-4 h-4" /> BOGO Offer</div>
                   <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, is_bogo: !prev.is_bogo }))}
                      className={`w-10 h-5 rounded-full relative transition-colors ${formData.is_bogo ? 'bg-crack-sage' : 'bg-gray-700'}`}
                   >
                      <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${formData.is_bogo ? 'left-6' : 'left-1'}`} />
                   </button>
                </div>
                
                <div>
                   <label className="text-xs uppercase text-crack-orange font-bold mb-2 block">Local Sale Price Override</label>
                   <div className="relative">
                     <span className="absolute left-3 top-3 text-gray-500 text-sm">KES</span>
                     <input 
                       type="number" 
                       value={formData.sale_price} 
                       onChange={e => setFormData({...formData, sale_price: e.target.value})} 
                       className="w-full bg-[#222] border border-crack-orange/30 rounded-xl p-3 pl-12 text-white focus:border-crack-orange outline-none placeholder:text-gray-600" 
                       placeholder="Leave empty for base price" 
                     />
                   </div>
                </div>
             </div>
          </div>

          <hr className="border-white/10" />

          {/* Section: Global Data */}
          <div className="space-y-4">
             <h3 className="text-xs font-bold uppercase text-gray-500 tracking-widest flex items-center gap-2">
               <Globe className="w-3 h-3" /> Global Catalog Data
             </h3>

             {/* Image */}
             <div 
               onClick={() => fileInputRef.current?.click()}
               className="w-full h-48 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-crack-orange/50 transition-all relative overflow-hidden bg-black/20 group"
             >
               {formData.image_url ? (
                 <>
                   <Image src={formData.image_url} alt="Preview" fill className="object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                   <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                     <p className="text-white font-bold flex items-center gap-2"><UploadCloud className="w-5 h-5" /> Change Photo</p>
                   </div>
                 </>
               ) : (
                 <div className="text-center text-gray-500"><UploadCloud className="w-8 h-8 mx-auto mb-2" />Upload Global Photo</div>
               )}
               <input ref={fileInputRef} type="file" className="hidden" onChange={handleImageUpload} />
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                   <label className="text-xs uppercase text-gray-500 font-bold mb-1 block">Product Name</label>
                   <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#222] border border-white/10 rounded-xl p-3 text-white focus:border-crack-orange outline-none" />
                </div>
                <div>
                   <label className="text-xs uppercase text-gray-500 font-bold mb-1 block">Global Base Price</label>
                   <input type="number" required value={formData.base_price} onChange={e => setFormData({...formData, base_price: Number(e.target.value)})} className="w-full bg-[#222] border border-white/10 rounded-xl p-3 text-white focus:border-crack-orange outline-none" />
                </div>
             </div>

             {/* RESTORED CATEGORY GRID (Easy to Use!) */}
             <div>
                <label className="text-xs uppercase text-gray-500 font-bold mb-2 block">Category</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                   {CATEGORIES.filter(c => c !== "All").map(cat => (
                     <button
                       key={cat}
                       type="button"
                       onClick={() => setFormData({...formData, category: cat})}
                       className={`text-xs py-3 rounded-lg border transition-all font-medium ${
                         formData.category === cat 
                         ? 'bg-white text-black border-white shadow-lg' 
                         : 'border-white/10 text-gray-400 hover:bg-white/5 hover:text-white'
                       }`}
                     >
                       {cat}
                     </button>
                   ))}
                </div>
             </div>

             <div>
                <label className="text-xs uppercase text-gray-500 font-bold mb-1 block">Description</label>
                <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-[#222] border border-white/10 rounded-xl p-3 text-white focus:border-crack-orange outline-none resize-none" placeholder="Describe the flavors..." />
             </div>

             <div>
                <label className="text-xs uppercase text-gray-500 font-bold mb-2 block">Marketing Tags</label>
                <div className="flex flex-wrap gap-2">
                  {MARKETING_TAGS.map(tag => (
                     <button key={tag} type="button" onClick={() => toggleTag(tag)} className={`text-xs px-3 py-1.5 rounded-full border transition-all ${formData.tags.includes(tag) ? 'bg-crack-orange text-white border-crack-orange' : 'border-white/10 text-gray-500'}`}>{tag}</button>
                  ))}
                </div>
             </div>
          </div>

          <div className="h-24" />
       </form>

       {/* STICKY FOOTER */}
       <div className="p-6 bg-[#1a1a1a] border-t border-white/5 sticky bottom-0 z-10">
          <button 
            type="submit"
            onClick={handleSubmit} 
            disabled={isLoading}
            className="w-full bg-crack-orange hover:bg-[#c96d53] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-crack-orange/20"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Changes</>}
          </button>
       </div>
    </div>
  );
}