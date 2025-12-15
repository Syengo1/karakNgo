"use client";

import { useCartStore } from "@/store/useCartStore";
import { useBranchStore } from "@/store/useBranchStore";
import { formatPhoneNumberForMpesa } from "@/lib/utils";
import { supabase } from "@/lib/supabase"; 
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Clock, MapPin, Smartphone, Truck, CheckCircle2, 
  Loader2, AlertCircle, CreditCard, Banknote, ShieldCheck, Zap 
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

type OrderType = 'pickup' | 'delivery';
type PaymentMethod = 'mpesa' | 'terminal'; 

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getCartTotal } = useCartStore();
  const { currentBranch } = useBranchStore();
  const [mounted, setMounted] = useState(false);

  // --- FORM STATE ---
  const [orderType, setOrderType] = useState<OrderType>('pickup');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa');
  
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [instructions, setInstructions] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  
  // --- PROCESSING STATE ---
  const [isLoading, setIsLoading] = useState(false); 
  const [isPolling, setIsPolling] = useState(false); 
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [orderRef, setOrderRef] = useState("");

  // --- SAFE REDIRECT LOGIC ---
  useEffect(() => {
    setMounted(true);
    // Only redirect if cart is empty AND we are NOT showing success screen
    // This prevents the success screen from disappearing when we clear the cart
    if (!success && items.length === 0) {
      router.push('/menu');
    }
  }, [items, router, success]);

  if (!mounted) return null;

  // --- CALCULATIONS ---
  const total = getCartTotal();
  const deliveryFee = orderType === 'delivery' ? 250 : 0;
  const finalTotal = total + deliveryFee;

  // --- HANDLERS ---

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // 1. Branch Check
    if (!currentBranch) {
       setError("Please go back and select a branch.");
       return;
    }

    // 2. Delivery Validation
    if (orderType === 'delivery' && !deliveryLocation.trim()) {
       setError("Please enter a delivery location.");
       return;
    }

    // 3. Phone Validation
    const formattedPhone = formatPhoneNumberForMpesa(phone);
    if (!formattedPhone) {
      setError("Please enter a valid Safaricom number (e.g. 0712...)");
      return;
    }

    setIsLoading(true);

    try {
        // --- 4. FOOLPROOF: LIVE STOCK CHECK ---
        // Before we take money, let's make sure the items still exist in the DB.
        const productIds = items.map(i => i.id);
        const { data: stockCheck, error: stockError } = await supabase
            .from('products')
            .select('id, name, is_available')
            .in('id', productIds);

        if (stockError) throw new Error("Could not verify stock availability.");

        // Find any item in the cart that is now unavailable in the DB
        const soldOutItem = stockCheck?.find(p => !p.is_available);
        
        if (soldOutItem) {
            setIsLoading(false);
            setError(`Sorry, "${soldOutItem.name}" just sold out! Please remove it to proceed.`);
            return; // Stop everything
        }

        // --- 5. SMART: PREPARE KITCHEN DATA (BOGO LOGIC) ---
        // We enrich the items list so the kitchen knows exactly what to do
        const kitchenItems = items.map(item => ({
            ...item,
            // If BOGO is active, we append a loud instruction for the chef
            kitchen_note: item.is_bogo ? "⚡ BOGO APPLIED: MAKE 2 ⚡" : "",
            // We can also explicitly tell them the total units to prep
            prep_quantity: item.is_bogo ? item.quantity * 2 : item.quantity
        }));

        // 6. GENERATE ORDER ID
        const newOrderId = `KG-${Math.floor(1000 + Math.random() * 9000)}`;
        
        // 7. PREPARE DB PAYLOAD
        const orderPayload = {
            id: newOrderId,
            customer_name: name,
            customer_phone: formattedPhone,
            branch_id: currentBranch.id,
            order_type: orderType,
            payment_method: paymentMethod,
            total_amount: finalTotal,
            items: kitchenItems, // <--- SAVING THE SMART ITEMS
            delivery_location: orderType === 'delivery' ? deliveryLocation : null,
            order_status: 'new',
            payment_status: 'pending' // Initially pending
        };

        // 8. SAVE TO SUPABASE (Save First Pattern)
        const { error: dbError } = await supabase
            .from('orders')
            .insert([orderPayload]);

        if (dbError) {
            console.error("DB Error:", dbError);
            throw new Error("Failed to create order record. Please try again.");
        }

        // --- PATH A: PAY AT COUNTER ---
        if (paymentMethod === 'terminal') {
            setTimeout(() => {
                setIsLoading(false);
                setSuccess(true);
                setOrderRef(newOrderId);
            }, 1000);
            return;
        }

        // --- PATH B: M-PESA STK PUSH ---
        const response = await fetch("/api/mpesa/stkpush", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                phone: formattedPhone,
                amount: finalTotal, 
                orderReference: newOrderId 
            }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || "M-Pesa request failed.");
        }

        // Success! Now we wait for PIN
        setIsLoading(false);
        setIsPolling(true);
        
        // POLL SIMULATION
        // In a real production app, you would rely on the M-Pesa Callback Webhook to update the DB.
        // For now, we wait 5s and assume success to simulate the experience.
        setTimeout(async () => {
            // Optimistically update DB status to 'paid'
            await supabase
                .from('orders')
                .update({ payment_status: 'paid' })
                .eq('id', newOrderId);

            setIsPolling(false);
            setSuccess(true);
            setOrderRef(newOrderId);
        }, 5000);

    } catch (err: any) {
        console.error(err);
        setError(err.message || "Something went wrong.");
        setIsLoading(false);
    }
  };

  if (success) {
    return <SuccessScreen name={name} orderNumber={orderRef} paymentMethod={paymentMethod} />;
  }

  return (
    <main className="min-h-screen bg-white md:bg-karak-cream flex items-center justify-center p-0 md:p-6">
      
      <div className="w-full max-w-6xl bg-white md:rounded-3xl shadow-none md:shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-screen md:min-h-[800px]">
        
        {/* --- LEFT: INPUT FORM --- */}
        <div className="w-full md:w-3/5 p-6 md:p-12 order-2 md:order-1 flex flex-col">
          <div className="mb-6">
            <Link href="/menu" className="inline-flex items-center text-sm text-karak-black/50 hover:text-karak-orange transition-colors mb-4">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Menu
            </Link>
            <h1 className="font-serif text-3xl text-karak-black">Checkout</h1>
            <p className="text-karak-black/60 text-sm mt-1">
              Ordering from <span className="font-bold text-karak-orange">{currentBranch?.name || "Select Branch"}</span>
            </p>
          </div>

          <form onSubmit={handlePayment} className="space-y-6 flex-1 flex flex-col">
            
            {/* 1. Delivery vs Pickup */}
            <section>
              <label className="text-xs font-bold uppercase text-karak-black/40 tracking-wider mb-2 block">Method</label>
              <div className="bg-karak-cream/50 p-1 rounded-xl flex">
                {(['pickup', 'delivery'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setOrderType(type)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${
                      orderType === type ? 'bg-white shadow-sm text-karak-black' : 'text-karak-black/50 hover:bg-white/50'
                    }`}
                  >
                    {type === 'pickup' ? <Clock className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
                    <span className="capitalize">{type}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* 2. Customer Info */}
            <section className="space-y-4">
              <label className="text-xs font-bold uppercase text-karak-black/40 tracking-wider block">Details</label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  required
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border-b border-karak-black/20 py-2 focus:border-karak-orange focus:outline-none bg-transparent"
                />
                
                <div className="relative">
                  <Smartphone className="absolute left-0 top-2.5 w-4 h-4 text-karak-black/30" />
                  <input 
                    required
                    type="tel"
                    placeholder="M-Pesa Number (07...)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-6 border-b border-karak-black/20 py-2 focus:border-karak-orange focus:outline-none bg-transparent font-mono"
                  />
                </div>
              </div>

              {/* Animated Delivery Input */}
              <AnimatePresence>
                {orderType === 'delivery' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <div className="relative pt-2">
                      <MapPin className="absolute left-0 top-4.5 w-4 h-4 text-karak-black/30" />
                      <input 
                        required
                        type="text"
                        placeholder="Delivery Location / Apartment"
                        value={deliveryLocation}
                        onChange={(e) => setDeliveryLocation(e.target.value)}
                        className="w-full pl-6 border-b border-karak-black/20 py-2 focus:border-karak-orange focus:outline-none bg-transparent"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* 3. Payment Method Selector */}
            <section>
              <label className="text-xs font-bold uppercase text-karak-black/40 tracking-wider mb-2 block">Payment</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('mpesa')}
                  className={`border rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${
                    paymentMethod === 'mpesa' 
                    ? 'border-green-500 bg-green-50 text-green-700 ring-1 ring-green-500' 
                    : 'border-karak-black/10 hover:border-karak-black/30 text-karak-black/60'
                  }`}
                >
                  <Smartphone className="w-6 h-6" />
                  <span className="text-sm font-bold">M-Pesa</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('terminal')}
                  className={`border rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${
                    paymentMethod === 'terminal' 
                    ? 'border-karak-black bg-karak-black/5 text-karak-black ring-1 ring-karak-black' 
                    : 'border-karak-black/10 hover:border-karak-black/30 text-karak-black/60'
                  }`}
                >
                  <div className="flex gap-1">
                    <CreditCard className="w-6 h-6" />
                    <Banknote className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold">Pay at Counter</span>
                </button>
              </div>
            </section>

            {/* 4. Instructions */}
            <textarea 
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full border border-karak-black/10 rounded-lg p-3 text-sm focus:border-karak-orange focus:outline-none bg-karak-cream/20 resize-none"
              placeholder="Notes for Barista (e.g. Extra hot)"
            />

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-100"
                >
                  <AlertCircle className="w-4 h-4" /> {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* SUBMIT BUTTON */}
            <div className="mt-auto pt-4">
              <button 
                type="submit"
                disabled={isLoading || isPolling}
                className={`w-full py-4 rounded-full font-medium text-lg transition-all shadow-lg flex items-center justify-center gap-3 relative overflow-hidden group ${
                  paymentMethod === 'mpesa' 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-karak-black hover:bg-karak-black/90 text-white'
                } disabled:opacity-70 disabled:cursor-not-allowed`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : isPolling ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                    <span className="animate-pulse">Check your Phone...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {paymentMethod === 'mpesa' ? `Pay KES ${finalTotal}` : `Place Order`}
                    </span>
                    <ShieldCheck className="w-4 h-4 opacity-70" />
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* --- RIGHT: SUMMARY --- */}
        <div className="w-full md:w-2/5 bg-karak-cream/50 md:bg-karak-black/5 p-6 md:p-12 order-1 md:order-2 border-b md:border-b-0 md:border-l border-karak-black/5">
          <h2 className="font-serif text-xl text-karak-black mb-6">Order Summary</h2>
          <div className="space-y-4 max-h-[300px] md:max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {items.map((item) => (
              <div key={item.cartId} className="flex gap-4 items-start">
                <div className={`w-16 h-16 rounded-lg shrink-0 flex items-center justify-center text-xs font-serif ${item.category.includes('Matcha') ? 'bg-karak-sage/20' : 'bg-karak-orange/20'}`}>
                  K&G
                </div>
                <div className="flex-1">
                   <div className="flex justify-between">
                     <p className="font-serif text-karak-black">{item.name}</p>
                     <p className="font-mono text-sm">KES {item.totalPrice}</p>
                   </div>
                   
                   <p className="text-xs text-karak-black/50">{item.selectedSize} {item.stickerText && `• ${item.stickerText}`}</p>
                   
                   {/* BOGO INDICATOR IN SUMMARY */}
                   {item.is_bogo && (
                     <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 text-[9px] px-1.5 py-0.5 rounded mt-1 font-bold">
                       <Zap className="w-3 h-3" /> BOGO APPLIED
                     </span>
                   )}

                   {item.selectedModifiers.length > 0 && (
                     <p className="text-[10px] text-karak-black/40 mt-1">
                       {item.selectedModifiers.map(m => m.name).join(', ')}
                     </p>
                   )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t border-dashed border-karak-black/10 mt-6 pt-6 space-y-2 text-sm text-karak-black/60">
             <div className="flex justify-between"><span>Subtotal</span><span>KES {total}</span></div>
             {orderType === 'delivery' && (
               <div className="flex justify-between"><span>Delivery</span><span>KES {deliveryFee}</span></div>
             )}
             <div className="flex justify-between items-center text-xl font-serif text-karak-black pt-4 border-t border-karak-black/5 mt-2">
               <span>Total</span>
               <span>KES {finalTotal}</span>
             </div>
          </div>
        </div>

      </div>
    </main>
  );
}

// --- SUCCESS SCREEN ---
function SuccessScreen({ name, orderNumber, paymentMethod }: { name: string, orderNumber: string, paymentMethod: PaymentMethod }) {
  const { clearCart } = useCartStore();

  // Clear the cart when the success screen is SHOWN, but don't redirect
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-karak-sage/10 flex items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-xl">
        
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
          paymentMethod === 'mpesa' ? 'bg-green-100 text-green-600' : 'bg-karak-orange/20 text-karak-orange'
        }`}>
          <CheckCircle2 className="w-10 h-10" />
        </div>
        
        <h1 className="font-serif text-3xl text-karak-black mb-2">
          {paymentMethod === 'mpesa' ? "Payment Received!" : "Order Placed!"}
        </h1>
        
        <p className="text-karak-black/60 mb-6">
          {paymentMethod === 'mpesa' 
            ? `Thanks ${name.split(' ')[0]}, your order is being prepared.`
            : `Thanks ${name.split(' ')[0]}, please pay at the counter upon pickup.`
          }
        </p>
        
        <div className="bg-karak-cream p-6 rounded-xl border border-karak-black/5 mb-8 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-karak-black/10" />
          <p className="text-xs text-karak-black/40 uppercase tracking-wider mb-2 font-bold">Order Number</p>
          <p className="font-mono text-3xl tracking-widest text-karak-black group-hover:scale-110 transition-transform duration-300">{orderNumber}</p>
          <p className="text-[10px] text-karak-black/30 mt-2">Take a screenshot of this screen</p>
        </div>

        <Link 
          href="/menu"
          className="block w-full bg-karak-black text-white py-4 rounded-full font-medium hover:bg-karak-orange transition-colors shadow-lg"
        >
          Order Something Else
        </Link>
      </div>
    </div>
  );
}