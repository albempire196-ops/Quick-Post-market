create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid not null primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  preferred_language text,
  preferred_country text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create table if not exists public.products (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  price text not null,
  category text not null,
  country text,
  image_url text,
  contact text,
  media_urls jsonb default '[]'::jsonb,
  status text not null default 'available',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_status_check check (status in ('available', 'reserved', 'sold'))
);

alter table public.products enable row level security;

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

alter table public.favorites enable row level security;

create table if not exists public.product_reports (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reason text not null,
  details text,
  status text not null default 'open',
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint product_reports_status_check check (status in ('open', 'reviewed', 'resolved'))
);

alter table public.product_reports enable row level security;

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists update_profiles_updated_at on public.profiles;
create trigger update_profiles_updated_at
before update on public.profiles
for each row
execute function public.update_updated_at_column();

drop trigger if exists update_products_updated_at on public.products;
create trigger update_products_updated_at
before update on public.products
for each row
execute function public.update_updated_at_column();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

create or replace function public.is_product_owner(product_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.products where id = product_id and user_id = auth.uid()
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and is_admin = true
  );
$$;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_product_owner(uuid) to authenticated;

drop view if exists public.products_public;
create view public.products_public as
select id, user_id, title, description, price, category, country, image_url, media_urls, status, created_at, updated_at
from public.products;

grant select on public.products_public to anon, authenticated;

drop view if exists public.profiles_public;
create view public.profiles_public as
select id, full_name, avatar_url, created_at, updated_at
from public.profiles;

grant select on public.profiles_public to anon, authenticated;

create or replace function public.get_profile_public(profile_id uuid)
returns table(id uuid, full_name text, avatar_url text)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.full_name, p.avatar_url
  from public.profiles p
  where p.id = profile_id;
$$;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
on public.profiles for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id);

drop policy if exists "Only owners can select own products" on public.products;
create policy "Only owners can select own products"
on public.products for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Authenticated users can insert own products" on public.products;
create policy "Authenticated users can insert own products"
on public.products for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Owners can update own products" on public.products;
create policy "Owners can update own products"
on public.products for update
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Owners can delete own products" on public.products;
create policy "Owners can delete own products"
on public.products for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Admins can update any product" on public.products;
create policy "Admins can update any product"
on public.products for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete any product" on public.products;
create policy "Admins can delete any product"
on public.products for delete
to authenticated
using (public.is_admin());

drop policy if exists "Users can view own favorites" on public.favorites;
create policy "Users can view own favorites"
on public.favorites for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create own favorites" on public.favorites;
create policy "Users can create own favorites"
on public.favorites for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own favorites" on public.favorites;
create policy "Users can delete own favorites"
on public.favorites for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create own product reports" on public.product_reports;
create policy "Users can create own product reports"
on public.product_reports for insert
to authenticated
with check (auth.uid() = reporter_id);

drop policy if exists "Users can view own product reports" on public.product_reports;
create policy "Users can view own product reports"
on public.product_reports for select
to authenticated
using (auth.uid() = reporter_id);

drop policy if exists "Admins can view all product reports" on public.product_reports;
create policy "Admins can view all product reports"
on public.product_reports for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can update product reports" on public.product_reports;
create policy "Admins can update product reports"
on public.product_reports for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

insert into storage.buckets (id, name, public)
values ('product-media', 'product-media', true)
on conflict (id) do nothing;

drop policy if exists "Product media is publicly accessible" on storage.objects;
create policy "Product media is publicly accessible"
on storage.objects for select
using (bucket_id = 'product-media');

drop policy if exists "Authenticated users can upload product media" on storage.objects;
create policy "Authenticated users can upload product media"
on storage.objects for insert
with check (bucket_id = 'product-media' and auth.uid() is not null);

drop policy if exists "Users can update their own product media" on storage.objects;
create policy "Users can update their own product media"
on storage.objects for update
using (bucket_id = 'product-media' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Users can delete their own product media" on storage.objects;
create policy "Users can delete their own product media"
on storage.objects for delete
using (bucket_id = 'product-media' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Admins can delete any product media" on storage.objects;
create policy "Admins can delete any product media"
on storage.objects for delete
to authenticated
using (bucket_id = 'product-media' and public.is_admin());

alter publication supabase_realtime add table public.products;

create index if not exists favorites_user_id_idx on public.favorites(user_id);
create index if not exists favorites_product_id_idx on public.favorites(product_id);
create index if not exists product_reports_product_id_idx on public.product_reports(product_id);
create index if not exists product_reports_status_idx on public.product_reports(status);