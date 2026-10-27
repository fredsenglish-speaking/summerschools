-- One-step setup. Paste all of this into Supabase → SQL Editor and press Run. Safe to run twice.
--
-- Visitors read published schools and can send enquiries. Only people listed in
-- "admins" can see enquiries and add or change schools and photos.

-- Admins ----------------------------------------------------------------

create table if not exists admins (
  user_id uuid primary key references auth.users on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$;

alter table admins enable row level security;
drop policy if exists "admins read own row" on admins;
create policy "admins read own row" on admins for select using (user_id = auth.uid());

-- Schools ---------------------------------------------------------------

create table if not exists schools (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{1,80}$'),
  published boolean not null default false,
  country text not null check (country in ('usa', 'uk', 'cn', 'eu', 'tr', 'az', 'other')),
  age_min int not null check (age_min between 1 and 99),
  age_max int not null check (age_max between 1 and 99),
  duration_weeks int not null check (duration_weeks between 1 and 52),
  months int[] not null default '{}',
  price numeric(10, 2) check (price >= 0),
  currency text not null default 'USD' check (currency in ('AZN', 'USD', 'EUR', 'GBP')),
  main_photo text,
  gallery text[] not null default '{}',
  tier text not null default 'standard' check (tier in ('standard', 'top', 'premium')),
  organizer text not null default '',
  paid_until date,
  -- {"az": {"title", "city", "sessions", "description", "meals", "room", "excursions", "transfer", "included": [], "excluded": []}, "en": {...}, "ru": {...}}
  i18n jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (age_min <= age_max)
);

alter table schools enable row level security;
drop policy if exists "anyone reads published schools" on schools;
create policy "anyone reads published schools" on schools for select using (published or is_admin());
drop policy if exists "admins write schools" on schools;
create policy "admins write schools" on schools for all using (is_admin()) with check (is_admin());

-- Added later; keeps older databases in step.
alter table schools add column if not exists months int[] not null default '{}';

-- Enquiries -------------------------------------------------------------

create table if not exists inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  school_id uuid references schools on delete set null,
  school_title text not null default '' check (length(school_title) <= 200),
  parent_name text not null check (length(parent_name) between 1 and 120),
  phone text not null check (length(phone) between 5 and 40),
  child_age int check (child_age between 1 and 99),
  session text not null default '' check (length(session) <= 200),
  message text not null default '' check (length(message) <= 2000),
  locale text not null default 'az',
  handled boolean not null default false
);

alter table inquiries enable row level security;
drop policy if exists "anyone sends an enquiry" on inquiries;
create policy "anyone sends an enquiry" on inquiries for insert with check (not handled);
drop policy if exists "admins manage enquiries" on inquiries;
create policy "admins manage enquiries" on inquiries for all using (is_admin()) with check (is_admin());

create table if not exists partner_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  company text not null check (length(company) between 1 and 200),
  phone text not null check (length(phone) between 5 and 40),
  country text not null default '' check (length(country) <= 100),
  tier text not null default 'standard' check (tier in ('standard', 'top', 'premium')),
  message text not null default '' check (length(message) <= 2000),
  handled boolean not null default false
);

alter table partner_requests enable row level security;
drop policy if exists "anyone sends a partner request" on partner_requests;
create policy "anyone sends a partner request" on partner_requests for insert with check (not handled);
drop policy if exists "admins manage partner requests" on partner_requests;
create policy "admins manage partner requests" on partner_requests for all using (is_admin()) with check (is_admin());

-- Photos ----------------------------------------------------------------
-- Public bucket: anyone can view a photo by its link. Uploads are made by the
-- server with the service role key after it has checked the caller is an admin.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('school-photos', 'school-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;
