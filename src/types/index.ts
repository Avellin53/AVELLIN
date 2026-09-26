export interface Vendor {
  id: string;
  name: string;
  location: string;
  isVerified: boolean;
}

export interface SizingData {
  recommendedSize: string;
  fitPercentage: number;
  metrics: {
    bust: string;
    shoulders: string;
    waist: string;
    length: string;
  };
}

export interface Product {
  id: string;
  vendorId: string;
  vendor?: Vendor;
  title: string;
  price: number;
  priceFormatted: string;
  imageUrl: string;
  sizingData: SizingData;
  tags: string[];
  badge?: string;
  badgeType?: 'ai' | 'eco' | 'trending';
  rating: number;
  reviewsCount: number;
  editorialNotes: string;
  specs: {
    material: string;
    lining: string;
    hardware: string;
    care: string;
  };
  sizes: string[];
}

export interface UserProfile {
  id: string;
  measurements: {
    bust: number;
    waist: number;
    hips: number;
  };
  savedItems: string[];
}
