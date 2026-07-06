-- Invites table for invite-only flow
create table if not exists invites (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  email text not null,
  invited_by uuid references users(id) on delete set null,
  auth_user_id uuid,
  used boolean default false,
  expires_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_invites_token on invites(token);
create index if not exists idx_invites_email on invites(email);
