"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Mail, ShieldCheck, AlertCircle } from "lucide-react";
import { useBranchStore } from "@/store/useBranchStore";

export default function AdminLogin() {
  const router = useRouter();
  // USE THE NEW ACTION
  const { setBranchById } = useBranchStore(); 
  
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

      if (authError || !user) throw new Error("Invalid email or password.");

      // 2. Identify the User & Branch
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        throw new Error("Access denied. No staff profile linked to this user.");
      }

      // 3. SECURE CONTEXT SETTING
      // We fetch the branch details to ensure the branch actually exists
      const success = await setBranchById(profile.branch_id);
      
      if (!success) {
        throw new Error(`Configuration Error: Branch '${profile.branch_id}' not found. Contact Super Admin.`);
      }

      // 4. Redirect
      if (profile.role === 'barista') {
         router.push('/admin/kds');
      } else {
         router.push('/admin/dashboard');
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111] text-white p-6 relative overflow-hidden">
      
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-crack-orange/20 blur-[120px] rounded-full" />
      
      <div className="w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
            <Lock className="w-6 h-6 text-crack-orange" />
          </div>
          <h1 className="font-serif text-2xl font-bold">Crack OS</h1>
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
                className="w-full bg-[#111] border border-white/10 rounded-lg py-3 pl-10 text-sm focus:border-crack-orange focus:outline-none transition-colors text-white"
                placeholder="manager@crack.com"
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
                className="w-full bg-[#111] border border-white/10 rounded-lg py-3 pl-10 text-sm focus:border-crack-orange focus:outline-none transition-colors text-white"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-red-400 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-crack-orange hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Access Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}