"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, Coffee, Receipt, LogOut, Settings, Flame 
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  // 1. Auth Guard (Middleware-like Logic)
  useEffect(() => {
    const checkUser = async () => {
      // Allow login page to load without check
      if (pathname === '/admin/login') {
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/admin/login');
        return;
      }

      // Fetch Profile Details
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

  if (loading) return <div className="min-h-screen bg-black" />; // Loading state
  
  // If on login page, render without sidebar
  if (pathname === '/admin/login') return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-[#111] text-white font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-white/10 flex flex-col fixed h-full bg-[#111] z-20">
        <div className="p-6 border-b border-white/10">
          <h2 className="font-serif text-xl font-bold flex items-center gap-2">
            <span className="text-crack-orange">Crack</span> OS
          </h2>
          <div className="mt-4 bg-white/5 rounded-lg p-3">
             <p className="text-sm font-bold truncate">{profile?.full_name || 'Staff'}</p>
             <p className="text-xs text-gray-500 uppercase tracking-wide mt-0.5">
               {profile?.branch_id} Branch
             </p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavItem href="/admin/dashboard" icon={LayoutDashboard} label="Overview" active={pathname === '/admin/dashboard'} />
          <NavItem href="/admin/kds" icon={Flame} label="Kitchen Display" active={pathname === '/admin/kds'} />
          <NavItem href="/admin/menu" icon={Coffee} label="Menu Manager" active={pathname === '/admin/menu'} />
          <NavItem href="/admin/orders" icon={Receipt} label="Order History" active={pathname === '/admin/orders'} />
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <NavItem href="/admin/settings" icon={Settings} label="Settings" active={pathname === '/admin/settings'} />
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-900/10 transition-colors"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 ml-64 min-h-screen bg-[#161616]">
        {children}
      </main>
    </div>
  );
}

function NavItem({ href, icon: Icon, label, active }: any) {
  return (
    <Link 
      href={href}
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