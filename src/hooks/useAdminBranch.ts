"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useAdminBranch() {
  const [branchId, setBranchId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminBranch = async () => {
      // 1. Get Logged In User
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      // 2. Get Their Assigned Branch directly from DB
      const { data: profile } = await supabase
        .from('profiles')
        .select('branch_id')
        .eq('id', user.id)
        .single();

      if (profile) {
        setBranchId(profile.branch_id);
      }
      setLoading(false);
    };

    fetchAdminBranch();
  }, []);

  return { branchId, loading };
}