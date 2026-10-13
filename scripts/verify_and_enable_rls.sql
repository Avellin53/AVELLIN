-- ==============================================================================
-- AVELLIN SUPABASE ROW LEVEL SECURITY (RLS) AUDIT & ENFORCEMENT SCRIPT
-- ==============================================================================
-- Run this migration in the Supabase SQL Editor to enforce strict RLS across
-- profiles, products, and security_logs tables.
-- ==============================================================================

-- 1. PROFILES TABLE RLS
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies on profiles if they exist to ensure clean recreation
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public can view vendor profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;

-- Allow users to read their own profile, public to read public vendor storefronts, and admins to read all
CREATE POLICY "Users and shoppers can read appropriate profiles"
ON public.profiles
FOR SELECT
USING (
    auth.uid() = id
    OR role = 'vendor'
    OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
    )
);

-- Users can only insert their own profile on registration
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (
    auth.uid() = id
);

-- Users can only update their OWN profile data (prevents updating other users)
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (
    auth.uid() = id
)
WITH CHECK (
    auth.uid() = id
);

-- Users can delete only their own profile
CREATE POLICY "Users can delete own profile"
ON public.profiles
FOR DELETE
USING (
    auth.uid() = id
);


-- 2. PRODUCTS TABLE RLS
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read products" ON public.products;
DROP POLICY IF EXISTS "Vendors can insert their own products" ON public.products;
DROP POLICY IF EXISTS "Vendors can update their own products" ON public.products;
DROP POLICY IF EXISTS "Vendors can delete their own products" ON public.products;

-- Anyone (including shoppers and public visitors) can view active products in the marketplace
CREATE POLICY "Anyone can read products"
ON public.products
FOR SELECT
USING (true);

-- Vendors can only insert products tied directly to their authenticated account
CREATE POLICY "Vendors can insert their own products"
ON public.products
FOR INSERT
WITH CHECK (
    vendor_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.vendors v
        WHERE v.id = vendor_id AND v.owner_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
    )
);

-- Vendors can only update their own listings; shoppers and other vendors cannot modify them
CREATE POLICY "Vendors can update their own products"
ON public.products
FOR UPDATE
USING (
    vendor_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.vendors v
        WHERE v.id = vendor_id AND v.owner_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
    )
)
WITH CHECK (
    vendor_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.vendors v
        WHERE v.id = vendor_id AND v.owner_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
    )
);

-- Vendors can only delete their own listings
CREATE POLICY "Vendors can delete their own products"
ON public.products
FOR DELETE
USING (
    vendor_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.vendors v
        WHERE v.id = vendor_id AND v.owner_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
    )
);


-- 3. SECURITY_LOGS TABLE RLS
ALTER TABLE IF EXISTS public.security_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins and service role can manage security logs" ON public.security_logs;
DROP POLICY IF EXISTS "Admins can view security logs" ON public.security_logs;
DROP POLICY IF EXISTS "Admins can update security logs" ON public.security_logs;

-- Non-admin clients (both anonymous and ordinary authenticated shoppers) cannot query security logs
CREATE POLICY "Admins can view security logs"
ON public.security_logs
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
    )
);

-- Only admins can update security log resolution status
CREATE POLICY "Admins can update security logs"
ON public.security_logs
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
    )
);

-- Note: Log insertion from the server uses the SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS safely on the backend.
