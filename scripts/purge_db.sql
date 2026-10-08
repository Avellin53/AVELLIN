-- scripts/purge_db.sql
-- WARNING: This will completely wipe all users and their associated data.
-- Paste and run this in your Supabase SQL Editor to reset the database for live testing.

TRUNCATE TABLE auth.users CASCADE;
TRUNCATE TABLE public.profiles CASCADE;
TRUNCATE TABLE public.vendors CASCADE;
TRUNCATE TABLE public.products CASCADE;
