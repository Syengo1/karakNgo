"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useBranchStore } from "@/store/useBranchStore";
import { 
  TrendingUp, ShoppingBag, DollarSign, ArrowUpRight, 
  Star, AlertTriangle, CheckCircle2, XCircle, Package 
} from "lucide-react";

export default function AdminDashboard() {
  const { currentBranch } = useBranchStore();
  
  // --- STATE ---
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    avgValue: 0,
    topItem: "—"
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [branchStatus, setBranchStatus] = useState<boolean>(true); // Default open
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentBranch) return;

    const fetchDashboardData = async () => {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      
      // 1. SALES STATS (Existing Logic)
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('branch_id', currentBranch.id)
        .gte('created_at', today)
        .order('created_at', { ascending: false });

      if (orders) {
        const totalRev = orders.reduce((acc, o) => acc + o.total_amount, 0);
        const count = orders.length;
        
        // Calculate Top Item
        const itemCounts: Record<string, number> = {};
        orders.flatMap(o => o.items).forEach((i: any) => {
          itemCounts[i.name] = (itemCounts[i.name] || 0) + i.quantity;
        });
        const bestSeller = Object.entries(itemCounts).sort((a, b) => b[1] - a[1])[0];

        setStats({
          revenue: totalRev,
          orders: count,
          avgValue: count > 0 ? Math.round(totalRev / count) : 0,
          topItem: bestSeller ? bestSeller[0] : "No sales yet"
        });

        setRecentOrders(orders.slice(0, 5));
      }

      // 2. INVENTORY HEALTH (New Logic)
      // Fetch items that are tracking stock AND are low (< 5)
      const { data: stockData } = await supabase
        .from('branch_products')
        .select(`
          stock_quantity, 
          products (name)
        `)
        .eq('branch_id', currentBranch.id)
        .eq('track_stock', true)
        .lte('stock_quantity', 5); // Threshold

      if (stockData) {
        // Flatten the data structure
        const lowStock = stockData.map((item: any) => ({
          name: item.products?.name || "Unknown Item",
          count: item.stock_quantity
        }));
        setLowStockItems(lowStock);
      }

      // 3. LIVE STORE STATUS (New Logic)
      const { data: branchData } = await supabase
        .from('branches')
        .select('is_open')
        .eq('id', currentBranch.id)
        .single();
        
      if (branchData) setBranchStatus(branchData.is_open);

      setLoading(false);
    };

    fetchDashboardData();
    
    // Auto-refresh every 30s
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [currentBranch]);

  if (loading) return <div className="p-8 text-gray-500">Loading analytics...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      
      {/* HEADER WITH STATUS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif text-white">Overview</h1>
          <p className="text-gray-400 text-sm mt-1">
            Performance for <span className="text-white font-bold">{currentBranch?.name}</span>
          </p>
        </div>
        
        {/* Status Badges */}
        <div className="flex items-center gap-3">
           <div className={`px-4 py-2 rounded-full flex items-center gap-2 text-xs font-bold uppercase tracking-wider border ${
             branchStatus 
             ? 'bg-green-500/10 text-green-400 border-green-500/20' 
             : 'bg-red-500/10 text-red-400 border-red-500/20'
           }`}>
             {branchStatus ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
             {branchStatus ? "Store Open" : "Store Closed"}
           </div>
           
           <div className="flex items-center gap-2 text-xs font-mono text-gray-500 bg-white/5 px-3 py-2 rounded-full border border-white/5">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
             LIVE
           </div>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Today's Revenue" 
          value={`KES ${stats.revenue.toLocaleString()}`} 
          icon={DollarSign} 
          trend="Daily Total" // Simplified label
          color="green"
        />
        <StatCard 
          title="Total Orders" 
          value={stats.orders} 
          icon={ShoppingBag} 
          color="blue"
        />
        <StatCard 
          title="Avg. Order Value" 
          value={`KES ${stats.avgValue}`} 
          icon={TrendingUp} 
          color="orange"
        />
        <StatCard 
          title="Best Seller" 
          value={stats.topItem} 
          icon={Star} 
          color="purple"
          isText
        />
      </div>

      {/* LOW STOCK ALERT (Conditional) */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-900/10 border border-red-500/20 rounded-xl p-6 animate-in fade-in slide-in-from-bottom-4">
           <div className="flex items-center gap-2 mb-4 text-red-400">
             <AlertTriangle className="w-5 h-5" />
             <h3 className="font-bold">Inventory Alert: Low Stock</h3>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {lowStockItems.map((item, i) => (
                <div key={i} className="flex justify-between items-center bg-black/20 p-3 rounded-lg border border-red-500/10">
                   <div className="flex items-center gap-2">
                     <Package className="w-4 h-4 text-gray-500" />
                     <span className="text-sm text-white font-medium truncate">{item.name}</span>
                   </div>
                   <span className="text-xs font-bold bg-red-500 text-white px-2 py-1 rounded min-w-[3rem] text-center">
                     {item.count} left
                   </span>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* RECENT ACTIVITY */}
      <div className="bg-[#222] rounded-xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h3 className="font-bold text-lg text-white">Recent Activity</h3>
          {/* Fixed color class name */}
          <button className="text-xs text-crack-orange hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/5 text-gray-400 uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs">
                    {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </td>
                  <td className="px-6 py-4 font-mono text-white">{order.id}</td>
                  <td className="px-6 py-4">{order.customer_name}</td>
                  <td className="px-6 py-4 truncate max-w-[200px]">
                    {order.items.length} items ({order.items.map((i: any) => i.name).join(', ')})
                  </td>
                  <td className="px-6 py-4 font-bold text-white">KES {order.total_amount}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                      order.order_status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      order.order_status === 'new' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {order.order_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, color, isText }: any) {
  const colors = {
    green: "bg-green-500/20 text-green-400",
    blue: "bg-blue-500/20 text-blue-400",
    orange: "bg-orange-500/20 text-orange-400",
    purple: "bg-purple-500/20 text-purple-400",
  }[color as string] || "bg-gray-500/20";

  return (
    <div className="bg-[#222] p-6 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-lg ${colors}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className="text-xs text-green-400 flex items-center gap-1 bg-green-500/10 px-2 py-1 rounded">
            {trend} <ArrowUpRight className="w-3 h-3" />
          </span>
        )}
      </div>
      <div>
        <p className="text-gray-400 text-xs uppercase tracking-wider font-bold">{title}</p>
        <h3 className={`mt-1 font-bold text-white ${isText ? 'text-xl truncate' : 'text-3xl font-mono'}`}>
          {value}
        </h3>
      </div>
    </div>
  );
}