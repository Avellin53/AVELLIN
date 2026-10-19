import { create } from 'zustand';

interface AuthModalState {
  isOpen: boolean;
  redirectUrl: string;
  actionMessage: string;
  itemTitle?: string;
  openAuthModal: (options?: { redirectUrl?: string; actionMessage?: string; itemTitle?: string }) => void;
  closeAuthModal: () => void;
}

export const useAuthModalStore = create<AuthModalState>((set) => ({
  isOpen: false,
  redirectUrl: '',
  actionMessage: 'Sign in to add items to your cart, save bespoke sizes, and checkout securely.',
  itemTitle: undefined,
  openAuthModal: (options) =>
    set({
      isOpen: true,
      redirectUrl:
        options?.redirectUrl ||
        (typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/home'),
      actionMessage:
        options?.actionMessage ||
        'Sign in to add items to your cart, save bespoke sizes, and checkout securely.',
      itemTitle: options?.itemTitle,
    }),
  closeAuthModal: () => set({ isOpen: false, itemTitle: undefined }),
}));
