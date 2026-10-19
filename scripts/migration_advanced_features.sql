-- ==============================================================================
-- AVELLIN ADVANCED FEATURES MIGRATION
-- Run this in your Supabase SQL Editor
-- ==============================================================================

-- 1. Orders table enhancement
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shopper_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS split_payment BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deposit_paid BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS balance_paid BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS balance_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS stage TEXT DEFAULT 'Order Placed',
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS dispute_status TEXT DEFAULT 'none',
ADD COLUMN IF NOT EXISTS dispute_reason TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS total_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb;

-- Ensure RLS on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shoppers can view own orders"
ON public.orders FOR SELECT
USING (auth.uid() = shopper_id);

CREATE POLICY "Vendors can view assigned orders"
ON public.orders FOR SELECT
USING (auth.uid() = vendor_id);

CREATE POLICY "Shoppers can create orders"
ON public.orders FOR INSERT
WITH CHECK (auth.uid() = shopper_id);

CREATE POLICY "Shoppers and Vendors can update orders"
ON public.orders FOR UPDATE
USING (auth.uid() = shopper_id OR auth.uid() = vendor_id)
WITH CHECK (auth.uid() = shopper_id OR auth.uid() = vendor_id);

-- 2. Products table analytics counters
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS cart_adds_count INTEGER DEFAULT 0;

-- 3. Profiles table logistics location state
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'Lagos';

-- 4. Reviews table video upload URL
ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS video_url TEXT DEFAULT NULL;

-- 5. Storage policies for review-videos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'review-videos',
  'review-videos',
  true,
  15728640, -- 15MB
  ARRAY['video/mp4', 'video/quicktime', 'video/webm']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 15728640,
  allowed_mime_types = ARRAY['video/mp4', 'video/quicktime', 'video/webm'];

-- Public read access to review videos
CREATE POLICY "Public can view review videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'review-videos');

-- Authenticated users can upload review videos
CREATE POLICY "Authenticated users can upload review videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'review-videos');
