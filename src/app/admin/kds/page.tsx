"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useBranchStore } from "@/store/useBranchStore";
import { Clock, CheckCircle, Flame, RefreshCw, Coffee, AlertTriangle, Zap, Megaphone, Volume2, VolumeX } from "lucide-react"; // Added Volume icons
import { motion, AnimatePresence } from "framer-motion";

// --- TYPES ---
interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  prep_quantity?: number;
  kitchen_note?: string;
  selectedSize: string;
  selectedModifiers: { name: string }[];
  stickerText?: string;
  is_bogo?: boolean;
}

interface Order {
  id: string;
  customer_name: string;
  items: OrderItem[];
  order_status: 'new' | 'preparing' | 'ready' | 'completed';
  payment_status: string;
  created_at: string;
  branch_id: string;
}

export default function KitchenDisplaySystem() {
  const { currentBranch } = useBranchStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  // --- PERSISTENT SOUND STATE ---
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    // 1. Load preference from LocalStorage on mount
    const saved = localStorage.getItem("kds_sound_enabled");
    if (saved === "true") setSoundEnabled(true);
  }, []);

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    localStorage.setItem("kds_sound_enabled", String(newState));
    
    // Play a test beep so they know it works
    if (newState) {
        const audio = new Audio('/sounds/ding.mp3'); 
        audio.play().catch(() => {}); 
    }
  };

  // --- AUDIO LOGIC ---
  const playAlert = () => {
    if (!soundEnabled) return;
    try {
      const audio = new Audio('/sounds/ding.mp3'); 
      audio.play().catch(e => console.log("Audio interaction required first"));
    } catch (e) { console.error("Audio error", e); }
  };

  // --- DATA SYNC ---
  useEffect(() => {
    if (!currentBranch) return;

    const fetchOrders = async () => {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('branch_id', currentBranch.id)
        .neq('order_status', 'completed')
        .order('created_at', { ascending: true });
      
      if (data) setOrders(data as Order[]);
      setLoading(false);
    };

    fetchOrders();

    const channel = supabase
      .channel('kds-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.new.branch_id === currentBranch.id) {
          setOrders(prev => [...prev, payload.new as Order]);
          playAlert(); // <--- Trigger Sound
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.new.branch_id === currentBranch.id) {
           setOrders(prev => {
             if (payload.new.order_status === 'completed') {
               return prev.filter(o => o.id !== payload.new.id);
             }
             return prev.map(o => o.id === payload.new.id ? payload.new as Order : o);
           });
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentBranch, soundEnabled]); // Depend on soundEnabled so listener gets fresh state

  const updateStatus = async (id: string, nextStatus: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, order_status: nextStatus as any } : o));
    await supabase.from('orders').update({ order_status: nextStatus }).eq('id', id);
  };

  const newOrders = orders.filter(o => o.order_status === 'new');
  const preparingOrders = orders.filter(o => o.order_status === 'preparing');
  const readyOrders = orders.filter(o => o.order_status === 'ready');

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
      <RefreshCw className="w-8 h-8 animate-spin text-karak-orange" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#111] text-white font-sans flex flex-col h-screen overflow-hidden">
      
      {/* HEADER */}
      <header className="h-16 bg-[#1a1a1a] border-b border-white/10 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="bg-karak-orange/20 p-2 rounded-lg">
            <Flame className="w-5 h-5 text-karak-orange" />
          </div>
          <div>
             <h1 className="text-lg font-bold tracking-wide leading-none">KDS VIEW</h1>
             <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">{currentBranch?.name}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
           {/* Sound Toggle (Persisted) */}
           <button 
             onClick={toggleSound}
             className={`text-xs px-3 py-1.5 rounded-full border flex items-center gap-2 transition-all ${
               soundEnabled ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-white/5 text-gray-500 border-white/10'
             }`}
           >
             {soundEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
             {soundEnabled ? "Sound ON" : "Sound OFF"}
           </button>

           <div className="h-8 w-[1px] bg-white/10" />
           
           <div className="font-mono text-xl text-white">
             {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
           </div>
        </div>
      </header>

      {/* BOARD */}
      <main className="flex-1 p-4 overflow-x-auto">
        <div className="grid grid-cols-3 gap-4 h-full min-w-[1000px]">
          <Column title="New Orders" color="red" orders={newOrders} onNext={(id) => updateStatus(id, 'preparing')} emptyMsg="No pending orders" />
          <Column title="Preparing" color="yellow" orders={preparingOrders} onNext={(id) => updateStatus(id, 'ready')} emptyMsg="Kitchen is clear" />
          <Column title="Ready for Pickup" color="green" orders={readyOrders} onNext={(id) => updateStatus(id, 'completed')} emptyMsg="Nothing to serve" isLast />
        </div>
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS (Keep existing Column & Ticket components as they are) ---
// (Copy the Column and Ticket components from the previous KDS code here, 
//  they don't need changes logic-wise, just ensure they are included in the file)
interface ColumnProps {
  title: string;
  color: 'red' | 'yellow' | 'green';
  orders: Order[];
  onNext: (id: string) => void;
  emptyMsg: string;
  isLast?: boolean;
}

function Column({ title, color, orders, onNext, emptyMsg, isLast }: ColumnProps) {
  const styles = {
    red: "border-red-500/50 bg-red-500/10 text-red-400",
    yellow: "border-yellow-500/50 bg-yellow-500/10 text-yellow-400",
    green: "border-green-500/50 bg-green-500/10 text-green-400",
  }[color];

  const textColor = styles.split(' ')[2];

  return (
    <div className="flex flex-col h-full bg-[#1a1a1a] rounded-xl border border-white/5 overflow-hidden">
      <div className={`p-3 border-b border-white/5 flex justify-between items-center ${color === 'red' && orders.length > 0 ? 'bg-red-900/10' : ''}`}>
        <h2 className={`font-bold uppercase tracking-wider text-xs ${textColor}`}>{title}</h2>
        <span className="bg-white/10 px-2 py-0.5 rounded text-xs font-mono text-white">{orders.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {orders.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-white/20 space-y-2">
                <Coffee className="w-8 h-8 opacity-50" />
                <p className="text-xs font-medium">{emptyMsg}</p>
             </div>
          ) : (
            orders.map((order) => (
              <Ticket key={order.id} order={order} onNext={onNext} isLast={isLast} color={color} />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

interface TicketProps {
  order: Order;
  onNext: (id: string) => void;
  isLast?: boolean;
  color: 'red' | 'yellow' | 'green';
}

function Ticket({ order, onNext, isLast, color }: TicketProps) {
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  useEffect(() => {
    const updateTime = () => {
      const diff = Date.now() - new Date(order.created_at).getTime();
      setElapsedMinutes(Math.floor(diff / 60000));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [order.created_at]);

  const isLate = elapsedMinutes > 15;

  let borderColor = "";
  if (color === 'red') borderColor = "border-red-500";
  if (color === 'yellow') borderColor = "border-yellow-500";
  if (color === 'green') borderColor = "border-green-500";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`bg-[#222] rounded-lg overflow-hidden border-l-4 shadow-lg flex flex-col ${borderColor} ${isLate && color !== 'green' ? 'ring-2 ring-red-500 animate-pulse-slow' : ''}`}
    >
      <div className={`p-3 flex justify-between items-center ${isLate && color !== 'green' ? 'bg-red-500/10' : 'bg-white/5'}`}>
        <div className="flex items-center gap-2">
           <span className="font-mono text-lg font-bold text-white">#{order.id.split('-')[1]}</span>
           {isLate && color !== 'green' && <AlertTriangle className="w-4 h-4 text-red-500" />}
        </div>
        <div className={`flex items-center gap-1 text-xs font-mono px-2 py-1 rounded ${isLate && color !== 'green' ? 'bg-red-500 text-white' : 'bg-white/10 text-gray-300'}`}>
           <Clock className="w-3 h-3" />
           <span>{elapsedMinutes}m</span>
        </div>
      </div>
      
      <div className="px-3 py-2 border-b border-white/5">
         <p className="text-sm font-bold text-white truncate">{order.customer_name}</p>
         <p className="text-[10px] text-gray-500 uppercase tracking-wider">{order.items.length} Items</p>
      </div>

      <div className="p-3 space-y-3 flex-1">
        {order.items.map((item, idx) => (
          <div key={idx} className="text-sm border-b border-white/5 pb-2 last:border-0 last:pb-0">
             <div className="flex items-start justify-between">
                <span className="font-bold text-white text-base">
                  {item.prep_quantity || item.quantity}x {item.name}
                </span>
             </div>
             
             {(item.is_bogo || item.kitchen_note) && (
               <div className="mt-1 bg-purple-900/50 border border-purple-500/30 rounded px-2 py-1 flex items-center gap-2">
                 <Zap className="w-3 h-3 text-purple-400" />
                 <span className="text-[10px] font-bold text-purple-200 uppercase tracking-wider">
                   {item.kitchen_note || "BOGO: Make 2"}
                 </span>
               </div>
             )}

             <div className="text-gray-400 text-xs mt-1 ml-4 space-y-0.5 border-l-2 border-white/10 pl-2">
                {item.selectedSize !== 'Regular' && <p className="text-karak-orange">• {item.selectedSize}</p>}
                {item.selectedModifiers?.map((m, i) => <p key={i}>• {m.name}</p>)}
                {item.stickerText && <p className="text-white/60 italic">"{item.stickerText}"</p>}
             </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => onNext(order.id)}
        className={`w-full py-3 font-bold text-xs tracking-widest uppercase transition-colors flex items-center justify-center gap-2 text-white mt-auto ${
           color === 'red' ? 'bg-red-600 hover:bg-red-500' : 
           color === 'yellow' ? 'bg-yellow-600 hover:bg-yellow-500' : 
           'bg-green-600 hover:bg-green-500'
        }`}
      >
        {isLast ? (
          <><CheckCircle className="w-4 h-4" /> Complete</>
        ) : (
          "Next Stage"
        )}
      </button>
    </motion.div>
  );
}