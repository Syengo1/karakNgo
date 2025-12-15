"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useBranchStore } from "@/store/useBranchStore";
import { Power, Printer, Loader2 } from "lucide-react";

export default function AdminSettings() {
  const { currentBranch } = useBranchStore();
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // 1. Fetch real status from DB on mount
  useEffect(() => {
    if (!currentBranch) return;

    const fetchStatus = async () => {
      const { data } = await supabase
        .from('branches')
        .select('is_open')
        .eq('id', currentBranch.id)
        .single();
      
      if (data) setIsOpen(data.is_open);
      setLoading(false);
    };

    fetchStatus();
  }, [currentBranch]);

  // 2. Handle Toggle
  const toggleStoreStatus = async () => {
    if (!currentBranch) return;
    setUpdating(true);
    
    const newStatus = !isOpen;
    
    // Update DB
    const { error } = await supabase
      .from('branches')
      .update({ is_open: newStatus })
      .eq('id', currentBranch.id);

    if (!error) {
      setIsOpen(newStatus);
    } else {
      alert("Failed to update store status");
    }
    setUpdating(false);
  };

  if (loading) return <div className="p-8 text-white">Loading settings...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto text-white space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-serif">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Configure {currentBranch?.name}</p>
      </div>

      <div className="grid gap-6">
        
        {/* Store Status Card */}
        <div className="bg-[#222] p-6 rounded-xl border border-white/5 flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Power className={`w-5 h-5 ${isOpen ? 'text-green-500' : 'text-red-500'}`} />
              Store Status
            </h3>
            <p className="text-sm text-gray-400">
              {isOpen 
                ? "Store is currently OPEN and accepting orders." 
                : "Store is CLOSED. Customers cannot place orders."
              }
            </p>
          </div>
          <button 
            onClick={toggleStoreStatus}
            disabled={updating}
            className={`px-6 py-3 rounded-lg font-bold transition-all flex items-center gap-2 ${
              isOpen 
              ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20' 
              : 'bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white border border-green-500/20'
            }`}
          >
            {updating && <Loader2 className="w-4 h-4 animate-spin" />}
            {isOpen ? "Close Store" : "Open Store"}
          </button>
        </div>

        {/* Printer Settings (Mock - Stays the same) */}
        <div className="bg-[#222] p-6 rounded-xl border border-white/5 space-y-4">
           <div className="flex items-center gap-2 mb-2">
             <Printer className="w-5 h-5 text-karak-orange" />
             <h3 className="font-bold text-lg">KDS Receipt Printer</h3>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <label className="text-xs uppercase font-bold text-gray-500">Printer IP</label>
                <input className="w-full bg-black/30 border border-white/10 rounded p-3 text-sm" placeholder="192.168.1.200" />
             </div>
             <div className="space-y-2">
                <label className="text-xs uppercase font-bold text-gray-500">Paper Width</label>
                <select className="w-full bg-black/30 border border-white/10 rounded p-3 text-sm">
                   <option>80mm (Standard)</option>
                   <option>58mm (Narrow)</option>
                </select>
             </div>
           </div>
           
           <div className="pt-2">
             <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded text-sm font-medium transition-colors">
               Test Print
             </button>
           </div>
        </div>

      </div>
    </div>
  );
}