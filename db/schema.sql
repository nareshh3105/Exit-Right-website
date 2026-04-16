-- EXIT RIGHT v1 schema for Supabase PostgreSQL
create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text not null,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists stations (
  id uuid primary key default gen_random_uuid(),
  city text not null default 'Chennai',
  name text not null,
  line_code text not null default 'CMRL',
  latitude double precision not null,
  longitude double precision not null,
  popularity_index double precision not null default 0.5,
  created_at timestamptz not null default now()
);
create index if not exists idx_stations_name on stations(name);

create table if not exists exit_gates (
  id uuid primary key default gen_random_uuid(),
  station_id uuid not null references stations(id) on delete cascade,
  gate_code text not null,
  gate_name text not null,
  latitude double precision not null,
  longitude double precision not null,
  road_type text not null default 'main_road',
  lighting_score double precision not null default 0.7,
  created_at timestamptz not null default now()
);
create index if not exists idx_exit_station on exit_gates(station_id);

create table if not exists transport_modes (
  id uuid primary key default gen_random_uuid(),
  mode_key text unique not null,
  display_name text not null,
  is_active boolean not null default true
);

create table if not exists travel_paths (
  id uuid primary key default gen_random_uuid(),
  station_id uuid not null references stations(id) on delete cascade,
  exit_gate_id uuid not null references exit_gates(id) on delete cascade,
  destination_label text not null,
  distance_km double precision not null,
  baseline_time_min double precision not null,
  created_at timestamptz not null default now()
);

create table if not exists saved_locations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  label text not null,
  place_name text not null,
  latitude double precision not null,
  longitude double precision not null,
  created_at timestamptz not null default now()
);

create table if not exists recommendation_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  station_id uuid references stations(id) on delete set null,
  exit_gate_id uuid references exit_gates(id) on delete set null,
  destination_name text not null,
  destination_lat double precision not null,
  destination_lng double precision not null,
  recommended_mode text not null,
  recommendation_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references users(id) on delete cascade,
  prioritize_time boolean not null default true,
  prioritize_cost boolean not null default false,
  prioritize_safety boolean not null default true,
  notification_email boolean not null default true,
  notification_push boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists feedback_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  recommendation_id uuid references recommendation_history(id) on delete set null,
  rating integer not null check (rating between 1 and 5),
  comments text,
  created_at timestamptz not null default now()
);

create table if not exists cab_providers (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  base_fare numeric(10,2) not null,
  per_km_rate numeric(10,2) not null,
  demand_multiplier double precision not null default 1.0,
  is_active boolean not null default true
);

create table if not exists cab_price_cache (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references cab_providers(id) on delete cascade,
  route_key text not null,
  estimated_price numeric(10,2) not null,
  eta_minutes integer not null,
  fetched_at timestamptz not null default now(),
  ttl_until timestamptz not null,
  unique(provider_id, route_key)
);

create table if not exists weather_cache (
  id uuid primary key default gen_random_uuid(),
  location_key text unique not null,
  weather_main text not null,
  rain_mm double precision not null default 0,
  temp_c double precision not null default 30,
  wind_speed double precision not null default 0,
  fetched_at timestamptz not null default now(),
  ttl_until timestamptz not null
);

create table if not exists crowd_patterns (
  id uuid primary key default gen_random_uuid(),
  station_id uuid not null references stations(id) on delete cascade,
  weekday integer not null check (weekday between 0 and 6),
  hour integer not null check (hour between 0 and 23),
  crowd_level text not null check (crowd_level in ('LOW','MEDIUM','HIGH')),
  base_density double precision not null default 0.5,
  unique(station_id, weekday, hour)
);

insert into transport_modes (mode_key, display_name, is_active)
values
  ('walking', 'Walking', true),
  ('shared_auto', 'Shared Auto', true),
  ('bus', 'Bus', true),
  ('cab', 'Cab', true)
on conflict (mode_key) do nothing;

insert into cab_providers (name, base_fare, per_km_rate, demand_multiplier, is_active)
values
  ('Uber', 70, 17.5, 1.0, true),
  ('Ola', 65, 16.5, 1.0, true),
  ('Rapido', 55, 15.0, 1.0, true),
  ('Namma Yatri', 60, 15.8, 1.0, true)
on conflict (name) do nothing;
