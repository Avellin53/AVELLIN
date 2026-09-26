-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. profiles table (Shoppers)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  measurements jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for profiles
alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using ( auth.uid() = id );

create policy "Users can update own profile"
  on public.profiles for update
  using ( auth.uid() = id );

-- 2. vendors table (Sellers)
create table public.vendors (
  id uuid default uuid_generate_v4() primary key,
  store_name text not null,
  location text,
  is_verified boolean default false not null,
  owner_id uuid references auth.users on delete set null
);

-- RLS for vendors
alter table public.vendors enable row level security;

create policy "Anyone can read verified vendors"
  on public.vendors for select
  using ( is_verified = true );

create policy "Owners can update their vendors"
  on public.vendors for update
  using ( auth.uid() = owner_id );

-- 3. products table
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  vendor_id uuid references public.vendors on delete cascade not null,
  title text not null,
  price numeric not null,
  image_url text,
  sizing_data jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for products
alter table public.products enable row level security;

create policy "Anyone can read products"
  on public.products for select
  using ( true );

create policy "Vendors can insert their own products"
  on public.products for insert
  with check ( exists (
    select 1 from public.vendors 
    where id = vendor_id and owner_id = auth.uid()
  ) );

create policy "Vendors can update their own products"
  on public.products for update
  using ( exists (
    select 1 from public.vendors 
    where id = vendor_id and owner_id = auth.uid()
  ) );

create policy "Vendors can delete their own products"
  on public.products for delete
  using ( exists (
    select 1 from public.vendors 
    where id = vendor_id and owner_id = auth.uid()
  ) );
