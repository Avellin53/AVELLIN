import { create } from 'zustand';

interface LensStore {
  isAnalyzing: boolean;
  statusMessage: string;
  keywords: string[];
  lensResults: any[] | null;
  error: string | null;
  setIsAnalyzing: (loading: boolean, message?: string) => void;
  setLensResults: (products: any[] | null, keywords?: string[]) => void;
  setError: (error: string | null) => void;
  clearLensSearch: () => void;
}

export const useLensStore = create<LensStore>((set) => ({
  isAnalyzing: false,
  statusMessage: 'Ms. Ave is analyzing your photo...',
  keywords: [],
  lensResults: null,
  error: null,
  setIsAnalyzing: (loading, message = 'Ms. Ave is analyzing your photo...') =>
    set({ isAnalyzing: loading, statusMessage: message, error: null }),
  setLensResults: (products, keywords = []) =>
    set({ lensResults: products, keywords, isAnalyzing: false, error: null }),
  setError: (error) => set({ error, isAnalyzing: false }),
  clearLensSearch: () =>
    set({ lensResults: null, keywords: [], isAnalyzing: false, error: null }),
}));
