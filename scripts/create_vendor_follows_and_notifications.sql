-- ==============================================================================
-- Migration: Vendor Follows and Notifications Tables
-- Run this in Supabase SQL Editor
-- ==============================================================================

-- 1. vendor_follows table
CREATE TABLE IF NOT EXISTS public.vendor_follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shopper_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(shopper_id, vendor_id)
);

-- Indices for fast lookups
CREATE INDEX IF NOT EXISTS idx_vendor_follows_shopper ON public.vendor_follows(shopper_id);
CREATE INDEX IF NOT EXISTS idx_vendor_follows_vendor ON public.vendor_follows(vendor_id);

-- RLS for vendor_follows
ALTER TABLE public.vendor_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own follows"
  ON public.vendor_follows FOR SELECT
  USING (auth.uid() = shopper_id);

CREATE POLICY "Users can insert their own follows"
  ON public.vendor_follows FOR INSERT
  WITH CHECK (auth.uid() = shopper_id);

CREATE POLICY "Users can delete their own follows"
  ON public.vendor_follows FOR DELETE
  USING (auth.uid() = shopper_id);


-- 2. notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'system',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indices for fast user notifications query
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, created_at DESC);

-- RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all notifications"
  ON public.notifications FOR ALL
  USING (true)
  WITH CHECK (true);
