"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { useBranchStore } from "@/store/useBranchStore";

export default function AdminLogin() {
  const router = useRouter();
  const { setBranch } = useBranchStore(); // We will auto-set the global branch on login
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Authenticate with Supabase Auth
      const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !user) throw new Error("Invalid credentials");

      // 2. Identify the User & Branch (Fetch Profile)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) throw new Error("Access denied. No staff profile found.");

      // 3. Set the "Context" for the session
      // This ensures the KDS automatically loads the correct branch data
      setBranch(profile.branch_id as any);

      // 4. Redirect based on Role
      if (profile.role === 'barista') {
         router.push('/admin/kds');
      } else {
         router.push('/admin/dashboard');
      }

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111] text-white p-6 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-karak-orange/20 blur-[120px] rounded-full" />
      
      <div className="w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
            <Lock className="w-6 h-6 text-karak-orange" />
          </div>
          <h1 className="font-serif text-2xl font-bold">Karak OS</h1>
          <p className="text-gray-500 text-sm mt-1">Authorized Personnel Only</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#111] border border-white/10 rounded-lg py-3 pl-10 text-sm focus:border-karak-orange focus:outline-none transition-colors text-white"
                placeholder="manager@karak.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Password</label>
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#111] border border-white/10 rounded-lg py-3 pl-10 text-sm focus:border-karak-orange focus:outline-none transition-colors text-white"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-red-400 text-xs text-center">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-karak-orange text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Access Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}