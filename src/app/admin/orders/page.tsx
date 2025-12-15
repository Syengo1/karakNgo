"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useBranchStore } from "@/store/useBranchStore";
import { Search, Filter, ChevronRight, Eye } from "lucide-react";

export default function OrderHistory() {
  const { currentBranch } = useBranchStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentBranch) return;
    const fetchOrders = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('branch_id', currentBranch.id)
        .order('created_at', { ascending: false })
        .limit(50); // Pagination limit for performance
      
      if (data) setOrders(data);
      setLoading(false);
    };
    fetchOrders();
  }, [currentBranch]);

  const filteredOrders = orders.filter(o => 
    o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    o.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-serif">Order History</h1>
        <div className="flex gap-2">
           <div className="relative">
             <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
             <input 
               placeholder="Search orders..." 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="bg-[#222] border border-white/10 rounded-lg py-2 pl-10 text-sm focus:border-karak-orange focus:outline-none w-64"
             />
           </div>
        </div>
      </div>

      <div className="bg-[#222] rounded-xl border border-white/5 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-white/5 text-gray-400 uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Order ID</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Method</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-4 text-gray-400">
                  {new Date(order.created_at).toLocaleDateString()} <span className="text-xs opacity-50">{new Date(order.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                </td>
                <td className="px-6 py-4 font-mono">{order.id}</td>
                <td className="px-6 py-4 font-bold">{order.customer_name}</td>
                <td className="px-6 py-4 capitalize">{order.order_type}</td>
                <td className="px-6 py-4 text-karak-orange font-bold">KES {order.total_amount}</td>
                <td className="px-6 py-4">
                   <span className={`px-2 py-1 rounded text-xs font-bold uppercase border ${
                      order.order_status === 'completed' ? 'border-green-500/30 text-green-400 bg-green-500/10' :
                      'border-gray-500/30 text-gray-400 bg-gray-500/10'
                   }`}>
                     {order.order_status}
                   </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-gray-500 hover:text-white transition-colors">
                    <Eye className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredOrders.length === 0 && (
          <div className="p-8 text-center text-gray-500">No orders found.</div>
        )}
      </div>
    </div>
  );
}