"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useBranchStore } from "@/store/useBranchStore";
import { Search, Filter, ChevronRight, Eye, Download } from "lucide-react";

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

  // --- NEW FEATURE: EXPORT TO CSV ---
  const handleExport = () => {
    if (!filteredOrders.length) return;

    // Define CSV Headers
    const headers = ["Order ID", "Date", "Time", "Customer", "Phone", "Type", "Status", "Total (KES)", "Items"];
    
    // Map Data to Rows
    const rows = filteredOrders.map(o => [
      o.id,
      new Date(o.created_at).toLocaleDateString(),
      new Date(o.created_at).toLocaleTimeString(),
      `"${o.customer_name}"`, // Quote strings to handle commas
      o.customer_phone || "N/A",
      o.order_type,
      o.order_status,
      o.total_amount,
      `"${o.items?.map((i: any) => `${i.quantity}x ${i.name}`).join(', ') || ''}"`
    ]);

    // Construct CSV String
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    // Trigger Download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `orders_${currentBranch?.name}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto text-white h-[calc(100vh-64px)] md:h-screen flex flex-col">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-serif text-white">Order History</h1>
          <p className="text-gray-400 text-sm mt-1">
            Recent transactions for <span className="text-white font-bold">{currentBranch?.name}</span>
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
           {/* Search */}
           <div className="relative flex-1">
             <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
             <input 
               placeholder="Search orders..." 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full bg-[#222] border border-white/10 rounded-xl py-2 pl-10 text-sm focus:border-crack-orange focus:outline-none transition-colors"
             />
           </div>
           
           {/* Export Button */}
           <button 
             onClick={handleExport}
             className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all"
           >
             <Download className="w-4 h-4" /> Export CSV
           </button>
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-[#222] rounded-xl border border-white/5 overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm text-left">
            <thead className="bg-white/5 text-gray-400 uppercase text-xs sticky top-0 backdrop-blur-md z-10">
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
                    <td className="px-6 py-4 text-gray-400 whitespace-nowrap">
                    {new Date(order.created_at).toLocaleDateString()} 
                    <span className="text-xs opacity-50 block mt-0.5">{new Date(order.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-white/70">{order.id}</td>
                    <td className="px-6 py-4 font-bold text-white">{order.customer_name}</td>
                    <td className="px-6 py-4 capitalize text-gray-300">{order.order_type}</td>
                    <td className="px-6 py-4 text-crack-orange font-bold font-mono">KES {order.total_amount}</td>
                    <td className="px-6 py-4">
                        {/* Dynamic Status Badges */}
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase border ${
                            order.order_status === 'completed' ? 'border-green-500/30 text-green-400 bg-green-500/10' :
                            order.order_status === 'new' ? 'border-red-500/30 text-red-400 bg-red-500/10' :
                            'border-yellow-500/30 text-yellow-400 bg-yellow-500/10'
                        }`}>
                            {order.order_status}
                        </span>
                    </td>
                    <td className="px-6 py-4">
                    <button className="text-gray-500 hover:text-white transition-colors" title="View Details">
                        <Eye className="w-5 h-5" />
                    </button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        {filteredOrders.length === 0 && (
          <div className="p-8 text-center text-gray-500 flex-1 flex items-center justify-center flex-col">
            <Filter className="w-8 h-8 opacity-20 mb-2" />
            No orders found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}