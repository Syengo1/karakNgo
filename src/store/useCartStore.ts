import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// 1. Define the Modifier Type
export interface Modifier {
  id: string;
  name: string;
  price: number;
  type: 'milk' | 'syrup' | 'topping' | 'shot';
}

// 2. Define the Cart Item (Matches Supabase 'products' table + Customization)
export interface CartItem {
  // --- Core Product Data (From DB) ---
  id: string;
  name: string;
  category: string;
  base_price: number;
  sale_price: number | null; // Fixes the price calculation logic
  is_bogo: boolean;          // Fixes the TS error
  tags?: string[];
  image_url: string | null;
  description?: string | null;

  // --- Customization (Barista Instructions) ---
  cartId: string; // Unique ID for this specific cart entry
  selectedModifiers: Modifier[];
  selectedSize: 'Regular' | 'Large';
  stickerText?: string;
  
  // --- Totals ---
  totalPrice: number; // (Price + Modifiers) * Quantity
  quantity: number;
}

// 3. Define the Store Actions
interface CartState {
  items: CartItem[];
  isCartOpen: boolean;
  
  // Actions
  addToCart: (item: Omit<CartItem, 'cartId'>) => void;
  removeFromCart: (cartId: string) => void;
  toggleCart: (isOpen: boolean) => void;
  clearCart: () => void;
  
  // Getters
  getCartTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,

      addToCart: (newItem) => {
        // Robust ID generation to prevent collisions
        const cartId = `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        set((state) => ({
          items: [...state.items, { ...newItem, cartId }],
          isCartOpen: true, // UX: Auto-open cart to confirm addition
        }));
      },

      removeFromCart: (cartId) => {
        set((state) => ({
          items: state.items.filter((item) => item.cartId !== cartId),
        }));
      },

      toggleCart: (isOpen) => set({ isCartOpen: isOpen }),

      clearCart: () => set({ items: [] }),

      getCartTotal: () => {
        const items = get().items;
        return items.reduce((total, item) => total + item.totalPrice, 0);
      },

      getItemCount: () => {
        return get().items.length;
      }
    }),
    {
      name: 'karak-cart-storage', // Key in LocalStorage
      storage: createJSONStorage(() => localStorage), // Explicitly use JSON storage
    }
  )
);