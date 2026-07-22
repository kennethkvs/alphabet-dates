create table "public"."photos" (
    "id" uuid primary key default gen_random_uuid(),
    "date_id" uuid references "public"."alphabet_dates" ("id") on delete cascade,
    "filename" text not null,
    "medium_path" text not null,
    "image_url" text default null,
    "caption" text default null,
    "created_at" timestamp with time zone default timezone('utc'::text, now()) not null
);