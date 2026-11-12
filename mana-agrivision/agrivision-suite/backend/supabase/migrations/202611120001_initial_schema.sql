-- Mana Agrivision: Supabase PostgreSQL schema
create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  phone text,
  state text,
  language text default 'en',
  level text not null default 'beginner' check (level in ('beginner','intermediate','expert')),
  role text not null default 'farmer' check (role in ('farmer','expert','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


create table if not exists public.farms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_farms_user_created on public.farms(user_id, created_at desc);
drop trigger if exists trg_farms_updated_at on public.farms;
create trigger trg_farms_updated_at before update on public.farms for each row execute function public.set_updated_at();

create table if not exists public.crops (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_crops_user_created on public.crops(user_id, created_at desc);
drop trigger if exists trg_crops_updated_at on public.crops;
create trigger trg_crops_updated_at before update on public.crops for each row execute function public.set_updated_at();

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_tasks_user_created on public.tasks(user_id, created_at desc);
drop trigger if exists trg_tasks_updated_at on public.tasks;
create trigger trg_tasks_updated_at before update on public.tasks for each row execute function public.set_updated_at();

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_expenses_user_created on public.expenses(user_id, created_at desc);
drop trigger if exists trg_expenses_updated_at on public.expenses;
create trigger trg_expenses_updated_at before update on public.expenses for each row execute function public.set_updated_at();

create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_inventory_user_created on public.inventory(user_id, created_at desc);
drop trigger if exists trg_inventory_updated_at on public.inventory;
create trigger trg_inventory_updated_at before update on public.inventory for each row execute function public.set_updated_at();

create table if not exists public.soil_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_soil_records_user_created on public.soil_records(user_id, created_at desc);
drop trigger if exists trg_soil_records_updated_at on public.soil_records;
create trigger trg_soil_records_updated_at before update on public.soil_records for each row execute function public.set_updated_at();

create table if not exists public.harvests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_harvests_user_created on public.harvests(user_id, created_at desc);
drop trigger if exists trg_harvests_updated_at on public.harvests;
create trigger trg_harvests_updated_at before update on public.harvests for each row execute function public.set_updated_at();

create table if not exists public.market_watchlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_market_watchlist_user_created on public.market_watchlist(user_id, created_at desc);
drop trigger if exists trg_market_watchlist_updated_at on public.market_watchlist;
create trigger trg_market_watchlist_updated_at before update on public.market_watchlist for each row execute function public.set_updated_at();

create table if not exists public.learning_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_learning_progress_user_created on public.learning_progress(user_id, created_at desc);
drop trigger if exists trg_learning_progress_updated_at on public.learning_progress;
create trigger trg_learning_progress_updated_at before update on public.learning_progress for each row execute function public.set_updated_at();

create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_community_posts_user_created on public.community_posts(user_id, created_at desc);
drop trigger if exists trg_community_posts_updated_at on public.community_posts;
create trigger trg_community_posts_updated_at before update on public.community_posts for each row execute function public.set_updated_at();

create table if not exists public.expert_questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_expert_questions_user_created on public.expert_questions(user_id, created_at desc);
drop trigger if exists trg_expert_questions_updated_at on public.expert_questions;
create trigger trg_expert_questions_updated_at before update on public.expert_questions for each row execute function public.set_updated_at();

create table if not exists public.disease_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_disease_reports_user_created on public.disease_reports(user_id, created_at desc);
drop trigger if exists trg_disease_reports_updated_at on public.disease_reports;
create trigger trg_disease_reports_updated_at before update on public.disease_reports for each row execute function public.set_updated_at();

create table if not exists public.assistant_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_assistant_messages_user_created on public.assistant_messages(user_id, created_at desc);
drop trigger if exists trg_assistant_messages_updated_at on public.assistant_messages;
create trigger trg_assistant_messages_updated_at before update on public.assistant_messages for each row execute function public.set_updated_at();

create table if not exists public.saved_schemes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_saved_schemes_user_created on public.saved_schemes(user_id, created_at desc);
drop trigger if exists trg_saved_schemes_updated_at on public.saved_schemes;
create trigger trg_saved_schemes_updated_at before update on public.saved_schemes for each row execute function public.set_updated_at();

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_notifications_user_created on public.notifications(user_id, created_at desc);
drop trigger if exists trg_notifications_updated_at on public.notifications;
create trigger trg_notifications_updated_at before update on public.notifications for each row execute function public.set_updated_at();

create table if not exists public.community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_community_comments_post on public.community_comments(post_id, created_at);
create table if not exists public.community_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(post_id,user_id)
);
create table if not exists public.learning_resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  topic text,
  level text check (level in ('beginner','intermediate','expert')),
  language text default 'en',
  resource_type text default 'article',
  url text,
  published boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.government_schemes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  state text default 'All India',
  crops text[] default '{}',
  category text,
  eligibility text,
  benefits text,
  required_documents text[] default '{}',
  official_url text,
  deadline date,
  last_verified_at date,
  published boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references public.profiles(id) on delete set null,
  title text not null,
  description text,
  category text,
  price numeric(12,2),
  unit text,
  location text,
  contact_method text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.marketplace_user_listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_marketplace_user_listings_user_created on public.marketplace_user_listings(user_id, created_at desc);
alter table public.marketplace_user_listings enable row level security;

-- RLS is enabled as defense in depth. The backend uses the service-role key and enforces
-- ownership in every protected query; never expose that key to the browser.
alter table public.profiles enable row level security;
alter table public.farms enable row level security;
alter table public.crops enable row level security;
alter table public.tasks enable row level security;
alter table public.expenses enable row level security;
alter table public.inventory enable row level security;
alter table public.soil_records enable row level security;
alter table public.harvests enable row level security;
alter table public.market_watchlist enable row level security;
alter table public.learning_progress enable row level security;
alter table public.community_posts enable row level security;
alter table public.expert_questions enable row level security;
alter table public.disease_reports enable row level security;
alter table public.assistant_messages enable row level security;
alter table public.saved_schemes enable row level security;
alter table public.notifications enable row level security;
alter table public.community_comments enable row level security;
alter table public.community_likes enable row level security;
