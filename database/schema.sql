-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ==============================================================================
-- 1. profiles table (Shoppers, Vendors, Admins)
-- ==============================================================================
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  name text,
  email text,
  phone text,
  role text default 'shopper', -- 'shopper' | 'vendor' | 'admin'
  measurements jsonb default '{}'::jsonb,
  size_passport jsonb default null,
  color_profile jsonb default null,
  loyalty_points integer default 0,
  vip_tier text default 'Member',
  addresses jsonb default '[]'::jsonb,
  state text default 'Lagos',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for profiles
alter table public.profiles enable row level security;

create policy "Users and shoppers can read appropriate profiles"
  on public.profiles for select
  using (
    auth.uid() = id
    or role = 'vendor'
    or exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "Users can insert own profile"
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile"
  on public.profiles for update
  using ( auth.uid() = id )
  with check ( auth.uid() = id );

create policy "Users can delete own profile"
  on public.profiles for delete
  using ( auth.uid() = id );

-- ==============================================================================
-- 2. vendors table (Sellers)
-- ==============================================================================
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

-- ==============================================================================
-- 3. products table
-- ==============================================================================
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  vendor_id uuid not null,
  title text not null,
  price numeric not null,
  category text,
  image_url text,
  description text,
  biometrics jsonb default '{}'::jsonb,
  stock integer default 1,
  is_flash_sale boolean default false,
  flash_sale_end timestamp with time zone default null,
  views_count integer default 0,
  cart_adds_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for products
alter table public.products enable row level security;

create policy "Anyone can read products"
  on public.products for select
  using ( true );

create policy "Vendors can insert their own products"
  on public.products for insert
  with check (
    vendor_id = auth.uid()
    or exists (
      select 1 from public.vendors v where v.id = vendor_id and v.owner_id = auth.uid()
    )
    or exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "Vendors can update their own products"
  on public.products for update
  using (
    vendor_id = auth.uid()
    or exists (
      select 1 from public.vendors v where v.id = vendor_id and v.owner_id = auth.uid()
    )
    or exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    vendor_id = auth.uid()
    or exists (
      select 1 from public.vendors v where v.id = vendor_id and v.owner_id = auth.uid()
    )
    or exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "Vendors can delete their own products"
  on public.products for delete
  using (
    vendor_id = auth.uid()
    or exists (
      select 1 from public.vendors v where v.id = vendor_id and v.owner_id = auth.uid()
    )
    or exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ==============================================================================
-- 4. security_logs table
-- ==============================================================================
create table if not exists public.security_logs (
  id uuid default gen_random_uuid() primary key,
  event_type text not null,
  details jsonb default '{}'::jsonb,
  ip_address text,
  status text default 'unresolved',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for security_logs
alter table public.security_logs enable row level security;

create policy "Admins can view security logs"
  on public.security_logs for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "Admins can update security logs"
  on public.security_logs for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- ==============================================================================
-- 5. vendor_follows table
-- ==============================================================================
create table if not exists public.vendor_follows (
  id uuid default gen_random_uuid() primary key,
  shopper_id uuid references auth.users on delete cascade not null,
  vendor_id uuid references public.profiles on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(shopper_id, vendor_id)
);

alter table public.vendor_follows enable row level security;

create policy "Users can view their own follows"
  on public.vendor_follows for select
  using ( auth.uid() = shopper_id );

create policy "Users can insert their own follows"
  on public.vendor_follows for insert
  with check ( auth.uid() = shopper_id );

create policy "Users can delete their own follows"
  on public.vendor_follows for delete
  using ( auth.uid() = shopper_id );

-- ==============================================================================
-- 6. notifications table
-- ==============================================================================
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  message text not null,
  type text default 'system',
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.notifications enable row level security;

create policy "Users can view their own notifications"
  on public.notifications for select
  using ( auth.uid() = user_id );

create policy "Users can update their own notifications"
  on public.notifications for update
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );

create policy "Users can insert their own notifications"
  on public.notifications for insert
  with check ( auth.uid() = user_id );

create policy "Service role can manage all notifications"
  on public.notifications for all
  using ( true )
  with check ( true );

-- ==============================================================================
-- 7. orders table
-- ==============================================================================
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  shopper_id uuid references auth.users(id) on delete cascade not null,
  vendor_id uuid references public.profiles(id) on delete set null,
  product_id uuid references public.products(id) on delete set null,
  status text default 'pending',
  split_payment boolean default false,
  deposit_paid boolean default false,
  balance_paid boolean default false,
  deposit_amount numeric default 0,
  balance_amount numeric default 0,
  stage text default 'Order Placed',
  delivered_at timestamp with time zone default null,
  dispute_status text default 'none',
  dispute_reason text default null,
  total_amount numeric default 0,
  items jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.orders enable row level security;

create policy "Shoppers can view own orders"
  on public.orders for select
  using ( auth.uid() = shopper_id );

create policy "Vendors can view assigned orders"
  on public.orders for select
  using ( auth.uid() = vendor_id );

create policy "Shoppers can create orders"
  on public.orders for insert
  with check ( auth.uid() = shopper_id );

create policy "Shoppers and Vendors can update orders"
  on public.orders for update
  using ( auth.uid() = shopper_id or auth.uid() = vendor_id )
  with check ( auth.uid() = shopper_id or auth.uid() = vendor_id );

-- ==============================================================================
-- 8. reviews table
-- ==============================================================================
create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references public.products(id) on delete cascade not null,
  shopper_id uuid references auth.users(id) on delete cascade not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text not null,
  video_url text default null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.reviews enable row level security;

create policy "Anyone can read reviews"
  on public.reviews for select
  using ( true );

create policy "Authenticated users can create reviews"
  on public.reviews for insert
  with check ( auth.uid() = shopper_id );


