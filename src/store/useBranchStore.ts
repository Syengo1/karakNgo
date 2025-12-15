import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

// 1. Define the Branch Type (Matching DB)
export interface Branch {
  id: string;
  name: string;
  is_open: boolean;
}

interface BranchState {
  // State
  currentBranch: Branch | null;
  branches: Branch[]; // List of all available branches
  isBranchSelectorOpen: boolean;
  isLoading: boolean;

  // Actions
  setBranch: (branch: Branch) => void;
  setBranchById: (branchId: string) => Promise<void>;
  fetchBranches: () => Promise<void>;
  refreshCurrentBranch: () => Promise<void>; // Critical for checking "is_open" in real-time
  toggleBranchSelector: (isOpen: boolean) => void;
}

export const useBranchStore = create<BranchState>()(
  persist(
    (set, get) => ({
      currentBranch: null,
      branches: [],
      isBranchSelectorOpen: false,
      isLoading: false,

      // Set the branch directly (optimistic)
      setBranch: (branch) => {
        set({ 
          currentBranch: branch,
          isBranchSelectorOpen: false 
        });
      },

      // Set branch by ID (useful for Admin login auto-setting)
      setBranchById: async (branchId) => {
        try {
          const { data, error } = await supabase
            .from('branches')
            .select('*')
            .eq('id', branchId)
            .single();

          if (data && !error) {
            set({ currentBranch: data });
          }
        } catch (err) {
          console.error("Failed to set branch by ID:", err);
        }
      },

      // Load all branches for the Selector UI
      fetchBranches: async () => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase
            .from('branches')
            .select('*')
            .order('name');
          
          if (data && !error) {
            set({ branches: data });
          }
        } catch (err) {
          console.error("Failed to fetch branches:", err);
        } finally {
          set({ isLoading: false });
        }
      },

      // Re-fetch the *current* branch to check if it's still open
      // Call this when the user attempts to Checkout
      refreshCurrentBranch: async () => {
        const current = get().currentBranch;
        if (!current) return;

        try {
          const { data } = await supabase
            .from('branches')
            .select('*')
            .eq('id', current.id)
            .single();
          
          if (data) {
            // Only update if status changed to avoid re-renders
            if (data.is_open !== current.is_open) {
               set({ currentBranch: data });
            }
          }
        } catch (err) {
          console.error("Failed to refresh branch status");
        }
      },

      toggleBranchSelector: (isOpen) => set({ isBranchSelectorOpen: isOpen }),
    }),
    {
      name: 'karak-branch-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist the current branch selection, not the full list or loading state
      partialize: (state) => ({ currentBranch: state.currentBranch }),
    }
  )
);