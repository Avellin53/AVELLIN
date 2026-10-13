import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Product {
  id: string;
  title: string;
  price: number;
  image_url?: string;
  vendor_id?: string;
  category?: string;
  description?: string;
  [key: string]: any;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  cartItems: CartItem[];
  items: CartItem[]; // alias for compatibility
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartItems: [],
      items: [],
      addToCart: (product: Product) => {
        if (!product || !product.id) return;
        set((state) => {
          const currentItems = Array.isArray(state?.cartItems) ? state.cartItems : [];
          const existingIndex = currentItems.findIndex(
            (item) => item?.product?.id === product.id
          );

          let updatedItems: CartItem[];
          if (existingIndex > -1) {
            updatedItems = currentItems.map((item, index) =>
              index === existingIndex
                ? { ...item, quantity: (item.quantity || 1) + 1 }
                : item
            );
          } else {
            updatedItems = [...currentItems, { product, quantity: 1 }];
          }

          return {
            cartItems: updatedItems,
            items: updatedItems,
          };
        });
      },
      removeFromCart: (productId: string) => {
        set((state) => {
          const currentItems = Array.isArray(state?.cartItems) ? state.cartItems : [];
          const updatedItems = currentItems.filter(
            (item) => item?.product?.id !== productId
          );
          return {
            cartItems: updatedItems,
            items: updatedItems,
          };
        });
      },
      updateQuantity: (productId: string, quantity: number) => {
        set((state) => {
          const currentItems = Array.isArray(state?.cartItems) ? state.cartItems : [];
          if (quantity <= 0) {
            const updatedItems = currentItems.filter(
              (item) => item?.product?.id !== productId
            );
            return {
              cartItems: updatedItems,
              items: updatedItems,
            };
          }
          const updatedItems = currentItems.map((item) =>
            item?.product?.id === productId ? { ...item, quantity } : item
          );
          return {
            cartItems: updatedItems,
            items: updatedItems,
          };
        });
      },
      clearCart: () => {
        set({ cartItems: [], items: [] });
      },
      cartCount: () => {
        const rawItems = get()?.cartItems;
        const items = Array.isArray(rawItems) ? rawItems : [];
        return items.reduce((total, item) => total + (item?.quantity || 0), 0);
      },
    }),
    {
      name: 'avellin_cart_storage',
      merge: (persistedState: any, currentState) => {
        const persistedItems = Array.isArray(persistedState?.cartItems)
          ? persistedState.cartItems.filter((i: any) => i && i.product)
          : Array.isArray(persistedState?.items)
          ? persistedState.items.filter((i: any) => i && i.product)
          : [];

        return {
          ...currentState,
          ...(persistedState || {}),
          cartItems: persistedItems,
          items: persistedItems,
        };
      },
    }
  )
);
