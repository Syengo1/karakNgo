import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

// 1. Define the Branch Type (Matches DB exactly)
export interface Branch {
  id: string; // Dynamic ID from DB
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
  setBranchById: (branchId: string) => Promise<boolean>;
  fetchBranches: () => Promise<void>;
  toggleBranchSelector: (isOpen: boolean) => void;
}

export const useBranchStore = create<BranchState>()(
  persist(
    (set, get) => ({
      currentBranch: null,
      branches: [],
      isBranchSelectorOpen: false,
      isLoading: false,

      // Set the branch directly (Used by BranchSelector)
      setBranch: (branch) => {
        set({ 
          currentBranch: branch,
          isBranchSelectorOpen: false 
        });
      },

      // Set branch by ID (Used by Admin Login)
      setBranchById: async (branchId) => {
        try {
          const { data, error } = await supabase
            .from('branches')
            .select('*')
            .eq('id', branchId)
            .single();

          if (data && !error) {
            set({ currentBranch: data });
            return true;
          }
          console.error(`Branch '${branchId}' not found in database.`);
          return false;
        } catch (err) {
          console.error("Failed to set branch by ID:", err);
          return false;
        }
      },

      // Load all branches from DB (Used by BranchSelector)
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

      toggleBranchSelector: (isOpen) => set({ isBranchSelectorOpen: isOpen }),
    }),
    {
      name: 'crack-branch-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist the user's choice
      partialize: (state) => ({ currentBranch: state.currentBranch }),
      // Versioning to force clear old cache
      version: 2, 
      migrate: (persistedState: any, version) => {
        if (version < 2) {
          // Wipe old state if version is old
          return { currentBranch: null, branches: [], isBranchSelectorOpen: true, isLoading: false };
        }
        return persistedState;
      },
    }
  )
);