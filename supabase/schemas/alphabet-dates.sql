create table "public"."alphabet_dates" (
    "id" uuid primary key default gen_random_uuid(),
    "letter" text not null,
    "title" text default null,
    "status" text check ("status" in ('scheduled', 'completed')) default null,
    "location" text default null,
    "note" text default null,
    "scheduled_at" timestamp with time zone default null,
    "completed_at" timestamp with time zone default null,
    "created_at" timestamp with time zone default timezone('utc'::text, now()) not null
);