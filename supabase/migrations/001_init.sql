-- Supabase initial schema for Alphabet Dates
-- Creates tables: users, alphabet_dates, photos

-- Enable pgcrypto for gen_random_uuid()
create extension if not exists pgcrypto;

-- Users (minimal schema for invite-only flow)
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  invited_by uuid references users(id) on delete set null,
  created_at timestamptz default now()
);

-- Alphabet dates
create table if not exists alphabet_dates (
  id uuid primary key default gen_random_uuid(),
  letter text not null,
  title text not null,
  description text,
  scheduled_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_alphabet_dates_letter on alphabet_dates(letter);

-- Photos metadata
create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  date_id uuid references alphabet_dates(id) on delete cascade,
  filename text not null,
  thumb_path text not null,
  medium_path text not null,
  original_path text not null,
  caption text,
  created_at timestamptz default now()
);

create index if not exists idx_photos_date_id on photos(date_id);
