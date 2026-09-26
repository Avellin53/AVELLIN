import { Product, Vendor } from '../types';

const vendors: Record<string, Vendor> = {
  v1: { id: 'v1', name: 'STUDIO KOYA', location: 'LAGOS', isVerified: true },
  v2: { id: 'v2', name: 'TARI SKIN', location: 'ACCRA', isVerified: true },
  v3: { id: 'v3', name: 'NALI', location: 'DAKAR', isVerified: true },
  v4: { id: 'v4', name: 'KENTE CO', location: 'NAIROBI', isVerified: true },
};

const mockProducts: Product[] = [
  {
    id: '1',
    vendorId: 'v1',
    vendor: vendors['v1'],
    title: 'Architectural Terracotta Blazer',
    price: 145000,
    priceFormatted: '₦145,000',
    imageUrl: '/placeholder',
    sizingData: {
      recommendedSize: 'M',
      fitPercentage: 98,
      metrics: { bust: 'Exact', shoulders: 'Perfect', waist: 'Exact', length: '+1.0 cm' }
    },
    tags: ['fashion', 'blazer', 'terracotta'],
    badge: '✨ 98% Fits You',
    badgeType: 'ai',
    rating: 4.9,
    reviewsCount: 38,
    editorialNotes: 'Crafted in the heart of Lagos, this architectural piece explores volume and structure through a minimalist lens. The terracotta hue nods to traditional clay artistry while maintaining a stark, modern silhouette.',
    specs: {
      material: '100% Woven Linen',
      lining: 'Light Silk Blend',
      hardware: 'Handcrafted Brass',
      care: 'Dry Clean Only'
    },
    sizes: ['XS', 'S', 'M', 'L', 'XL']
  },
  {
    id: '2',
    vendorId: 'v2',
    vendor: vendors['v2'],
    title: 'Shea Butter Cleanser',
    price: 12500,
    priceFormatted: '₦12,500',
    imageUrl: '/placeholder',
    sizingData: { recommendedSize: 'One Size', fitPercentage: 100, metrics: { bust: '-', shoulders: '-', waist: '-', length: '-' } },
    tags: ['beauty', 'skincare'],
    badge: 'Clean Formula',
    badgeType: 'eco',
    rating: 4.8,
    reviewsCount: 112,
    editorialNotes: 'A gentle everyday cleanser.',
    specs: { material: 'Organic Shea', lining: 'None', hardware: 'None', care: 'Store cool' },
    sizes: ['One Size']
  },
  {
    id: '3',
    vendorId: 'v3',
    vendor: vendors['v3'],
    title: 'Handwoven Rafia Tote',
    price: 45000,
    priceFormatted: '₦45,000',
    imageUrl: '/placeholder',
    sizingData: { recommendedSize: 'OS', fitPercentage: 100, metrics: { bust: '-', shoulders: '-', waist: '-', length: '-' } },
    tags: ['accessories', 'bag'],
    badge: 'Trending',
    badgeType: 'trending',
    rating: 5.0,
    reviewsCount: 24,
    editorialNotes: 'Handwoven in Dakar.',
    specs: { material: '100% Rafia', lining: 'Cotton', hardware: 'None', care: 'Wipe clean' },
    sizes: ['OS']
  },
  {
    id: '4',
    vendorId: 'v4',
    vendor: vendors['v4'],
    title: 'Indigo Dye Denim Jacket',
    price: 98000,
    priceFormatted: '₦98,000',
    imageUrl: '/placeholder',
    sizingData: {
      recommendedSize: 'L',
      fitPercentage: 95,
      metrics: { bust: 'Exact', shoulders: 'Good', waist: 'Loose', length: 'Exact' }
    },
    tags: ['fashion', 'denim'],
    badge: '✨ 95% Fits You',
    badgeType: 'ai',
    rating: 4.7,
    reviewsCount: 15,
    editorialNotes: 'Traditional indigo dye techniques on heavy denim.',
    specs: { material: '100% Cotton Denim', lining: 'None', hardware: 'Brass buttons', care: 'Machine wash cold' },
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: '5',
    vendorId: 'v1',
    vendor: vendors['v1'],
    title: 'Brass Fold Earrings',
    price: 22000,
    priceFormatted: '₦22,000',
    imageUrl: '/placeholder',
    sizingData: { recommendedSize: 'OS', fitPercentage: 100, metrics: { bust: '-', shoulders: '-', waist: '-', length: '-' } },
    tags: ['accessories', 'jewelry'],
    rating: 4.9,
    reviewsCount: 8,
    editorialNotes: 'Handmade brass earrings.',
    specs: { material: 'Brass', lining: 'None', hardware: 'Brass', care: 'Polish regularly' },
    sizes: ['OS']
  },
  {
    id: '6',
    vendorId: 'v1',
    vendor: vendors['v1'],
    title: 'Mini Raffia Top Handle',
    price: 68000,
    priceFormatted: '₦68,000',
    imageUrl: '/placeholder',
    sizingData: { recommendedSize: 'OS', fitPercentage: 100, metrics: { bust: '-', shoulders: '-', waist: '-', length: '-' } },
    tags: ['accessories', 'bag'],
    rating: 4.6,
    reviewsCount: 12,
    editorialNotes: 'Compact and elegant.',
    specs: { material: 'Raffia & Leather', lining: 'Suede', hardware: 'Gold-plated', care: 'Keep dry' },
    sizes: ['OS']
  }
];

export async function fetchFeedProducts(): Promise<Product[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockProducts.slice(0, 4);
}

export async function fetchProductById(id: string): Promise<Product | null> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockProducts.find(p => p.id === id) || null;
}

export async function fetchCrossSellProducts(): Promise<Product[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return [mockProducts[4], mockProducts[5]];
}
