-- Run this in Supabase SQL editor after creating your project

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  forward_slug text unique,
  onboarding_complete boolean default false,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, forward_slug)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    lower(replace(substring(new.id::text, 1, 12), '-', ''))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Wardrobe items
create table public.wardrobe_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  brand text,
  category text not null,
  subcategory text,
  color text,
  color_family text,
  occasion_tags text[] default '{}',
  formality text not null default 'casual',
  season_tags text[] default '{}',
  source text not null default 'email_sync',
  retailer text,
  price_paid numeric,
  purchase_date date,
  image_url text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.wardrobe_items enable row level security;

create policy "Users can read own wardrobe"
  on public.wardrobe_items for select
  using (auth.uid() = user_id);

create policy "Users can insert own wardrobe items"
  on public.wardrobe_items for insert
  with check (auth.uid() = user_id);

create policy "Users can update own wardrobe items"
  on public.wardrobe_items for update
  using (auth.uid() = user_id);

create policy "Users can delete own wardrobe items"
  on public.wardrobe_items for delete
  using (auth.uid() = user_id);

create index wardrobe_items_user_id_idx on public.wardrobe_items(user_id);
create index wardrobe_items_category_idx on public.wardrobe_items(category);

-- Email sync log
create table public.email_syncs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  message_id text,
  from_address text,
  subject text,
  received_at timestamptz,
  retailer text,
  parsed_items integer default 0,
  raw_text text,
  created_at timestamptz default now()
);

alter table public.email_syncs enable row level security;

create policy "Users can read own email syncs"
  on public.email_syncs for select
  using (auth.uid() = user_id);

-- Service role inserts are handled server-side (bypass RLS via service key)
