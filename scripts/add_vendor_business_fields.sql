-- ==============================================================================
-- AVELLIN VENDOR PROFILE BUSINESS INFORMATION MIGRATION
-- ==============================================================================
-- Run this script in your Supabase SQL Editor.
-- It expands the public.profiles table with business details, seller scoring,
-- and fulfillment ratings for verified designers.
-- ==============================================================================

ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS business_name text,
  ADD COLUMN IF NOT EXISTS business_address text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS seller_score integer DEFAULT 100,
  ADD COLUMN IF NOT EXISTS successful_sales integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shipping_speed_rating text DEFAULT 'Excellent',
  ADD COLUMN IF NOT EXISTS quality_score_rating text DEFAULT 'Excellent';

-- Ensure default values for existing vendor profiles
UPDATE public.profiles
SET 
  seller_score = COALESCE(seller_score, 100),
  successful_sales = COALESCE(successful_sales, 0),
  shipping_speed_rating = COALESCE(shipping_speed_rating, 'Excellent'),
  quality_score_rating = COALESCE(quality_score_rating, 'Excellent')
WHERE role = 'vendor';
