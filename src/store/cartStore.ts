import { create } from 'zustand';

interface Product {
  id: string;
  title: string;
  price: number;
  image_url?: string;
  vendor_id?: string;
  category?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addToCart: (product: Product) => void;
  cartCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addToCart: (product) => set((state) => {
    const existingItem = state.items.find(item => item.product.id === product.id);
    if (existingItem) {
      return {
        items: state.items.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      };
    }
    return { items: [...state.items, { product, quantity: 1 }] };
  }),
  cartCount: () => {
    const { items } = get();
    return items.reduce((total, item) => total + item.quantity, 0);
  }
}));
