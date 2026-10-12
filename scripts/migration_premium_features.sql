-- scripts/migration_premium_features.sql
-- Migration for 5 AVELLIN Premium Features:
-- 1. Size Passport (Bespoke measurement hub)
-- 2. Owambe Drops (Flash sales)
-- 3. Color Theory Profile
-- 4. Avellin Black VIP Loyalty System

-- 1. Size Passport, Color Profile, and Loyalty fields on public.profiles
ALTER TABLE IF EXISTS public.profiles
ADD COLUMN IF NOT EXISTS size_passport JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS color_profile JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS loyalty_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS vip_tier TEXT DEFAULT 'Member';

-- 2. Flash Sale fields on public.products
ALTER TABLE IF EXISTS public.products
ADD COLUMN IF NOT EXISTS is_flash_sale BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS flash_sale_end TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- 3. Helpful indices
CREATE INDEX IF NOT EXISTS idx_products_flash_sale ON public.products(is_flash_sale, flash_sale_end) WHERE is_flash_sale = true;
CREATE INDEX IF NOT EXISTS idx_profiles_loyalty_points ON public.profiles(loyalty_points);
