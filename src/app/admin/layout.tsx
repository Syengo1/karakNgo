"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, Coffee, Receipt, LogOut, Settings, Flame, Menu, X 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 1. Auth Guard
  useEffect(() => {
    const checkUser = async () => {
      if (pathname === '/admin/login') {
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/admin/login');
        return;
      }

      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(data);
      setLoading(false);
    };

    checkUser();
  }, [pathname, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  if (loading) return <div className="min-h-screen bg-[#111] flex items-center justify-center text-white/20">Loading OS...</div>;
  
  if (pathname === '/admin/login') return <>{children}</>;

  const NavContent = () => (
    <>
      <div className="p-6 border-b border-white/10">
        <h2 className="font-serif text-xl font-bold flex items-center gap-2 text-white">
          <span className="text-crack-orange">Crack</span> OS
        </h2>
        <div className="mt-4 bg-white/5 rounded-lg p-3">
            <p className="text-sm font-bold truncate text-white">{profile?.full_name || 'Staff'}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wide mt-0.5">
              {profile?.branch_id} Branch
            </p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <NavItem href="/admin/dashboard" icon={LayoutDashboard} label="Overview" active={pathname === '/admin/dashboard'} onClick={() => setIsMobileMenuOpen(false)} />
        <NavItem href="/admin/kds" icon={Flame} label="Kitchen Display" active={pathname === '/admin/kds'} onClick={() => setIsMobileMenuOpen(false)} />
        <NavItem href="/admin/menu" icon={Coffee} label="Menu Manager" active={pathname === '/admin/menu'} onClick={() => setIsMobileMenuOpen(false)} />
        <NavItem href="/admin/orders" icon={Receipt} label="Order History" active={pathname === '/admin/orders'} onClick={() => setIsMobileMenuOpen(false)} />
      </nav>

      <div className="p-4 border-t border-white/10 space-y-2">
        <NavItem href="/admin/settings" icon={Settings} label="Settings" active={pathname === '/admin/settings'} onClick={() => setIsMobileMenuOpen(false)} />
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-900/10 transition-colors"
        >
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-[#111] text-white font-sans">
      
      {/* --- MOBILE HEADER (Visible only on small screens) --- */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#1a1a1a] border-b border-white/10 flex items-center justify-between px-4 z-40">
        <span className="font-serif text-lg font-bold text-white"><span className="text-crack-orange">Crack</span> OS</span>
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-white">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* --- DESKTOP SIDEBAR (Hidden on mobile) --- */}
      <aside className="hidden md:flex w-64 border-r border-white/10 flex-col fixed h-full bg-[#111] z-20">
        <NavContent />
      </aside>

      {/* --- MOBILE DRAWER (Slide over) --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 z-50 md:hidden backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-3/4 max-w-xs bg-[#161616] border-r border-white/10 z-[60] md:hidden flex flex-col h-full shadow-2xl"
            >
              <NavContent />
              <button 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="absolute top-4 right-4 p-2 text-gray-400"
              >
                <X className="w-6 h-6" />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- MAIN CONTENT AREA --- */}
      {/* Added pt-16 for mobile to account for the header, removed ml-64 on mobile */}
      <main className="flex-1 min-h-screen bg-[#161616] pt-16 md:pt-0 md:ml-64 w-full">
        {children}
      </main>
    </div>
  );
}

function NavItem({ href, icon: Icon, label, active, onClick }: any) {
  return (
    <Link 
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
        active 
        ? 'bg-crack-orange text-white shadow-lg shadow-crack-orange/20' 
        : 'text-gray-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon className="w-5 h-5" /> {label}
    </Link>
  );
}