-- ==============================================================================
-- AVELLIN SUPABASE RLS: PUBLIC READ ACCESS FOR PRODUCTS
-- ==============================================================================
-- Run this migration in the Supabase SQL Editor.
-- It ensures unauthenticated visitors ('anon' role) and signed-in shoppers
-- ('authenticated' role) can query and browse all products in the catalog.
-- ==============================================================================

-- 1. Ensure Row Level Security is active on the products table
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;

-- 2. Drop any existing conflicting or restrictive SELECT policies on products
DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
DROP POLICY IF EXISTS "Anyone can read products" ON public.products;
DROP POLICY IF EXISTS "Public can view products" ON public.products;
DROP POLICY IF EXISTS "Public read access for products" ON public.products;

-- 3. Create the policy explicitly granting SELECT to anon and authenticated roles
CREATE POLICY "Allow public read access to products"
ON public.products
FOR SELECT
TO anon, authenticated
USING (true);
