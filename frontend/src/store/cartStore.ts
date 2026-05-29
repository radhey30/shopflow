import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { CartItem, Product } from "../types";

interface CartState {
  items: CartItem[];
}

interface CartActions {
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

interface CartDerived {
  totalItems: () => number;
  totalPrice: () => number;
}

type CartStore = CartState & CartActions & CartDerived;

const useCartStore = create<CartStore>()(
  devtools(
    persist(
      (set, get) => ({
        items: [],

        addItem: (product, quantity = 1) => {
          const { items } = get();
          const existing = items.find((i) => i.product._id === product._id);

          if (existing) {
            set({
              items: items.map((i) =>
                i.product._id === product._id
                  ? {
                      ...i,
                      quantity: Math.min(i.quantity + quantity, product.stock),
                    }
                  : i,
              ),
            });
          } else {
            set({ items: [...items, { product, quantity }] });
          }
        },

        removeItem: (productId) => {
          set({
            items: get().items.filter((i) => i.product._id !== productId),
          });
        },

        updateQuantity: (productId, quantity) => {
          if (quantity <= 0) {
            get().removeItem(productId);
            return;
          }
          set({
            items: get().items.map((i) =>
              i.product._id === productId ? { ...i, quantity } : i,
            ),
          });
        },

        clearCart: () => set({ items: [] }),

        totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
        totalPrice: () =>
          get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
      }),
      {
        name: "cart-storage",
      },
    ),
  ),
);

export default useCartStore;