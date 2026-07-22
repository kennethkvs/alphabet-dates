
  create table "public"."alphabet_dates" (
    "id" uuid not null default gen_random_uuid(),
    "letter" text not null,
    "title" text,
    "status" text,
    "location" text,
    "note" text,
    "scheduled_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now())
      );



  create table "public"."photos" (
    "id" uuid not null default gen_random_uuid(),
    "date_id" uuid,
    "filename" text not null,
    "medium_path" text not null,
    "image_url" text not null,
    "caption" text,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now())
      );


CREATE UNIQUE INDEX alphabet_dates_pkey ON public.alphabet_dates USING btree (id);

CREATE UNIQUE INDEX photos_pkey ON public.photos USING btree (id);

alter table "public"."alphabet_dates" add constraint "alphabet_dates_pkey" PRIMARY KEY using index "alphabet_dates_pkey";

alter table "public"."photos" add constraint "photos_pkey" PRIMARY KEY using index "photos_pkey";

alter table "public"."alphabet_dates" add constraint "alphabet_dates_status_check" CHECK ((status = ANY (ARRAY['scheduled'::text, 'completed'::text]))) not valid;

alter table "public"."alphabet_dates" validate constraint "alphabet_dates_status_check";

alter table "public"."photos" add constraint "photos_date_id_fkey" FOREIGN KEY (date_id) REFERENCES public.alphabet_dates(id) ON DELETE CASCADE not valid;

alter table "public"."photos" validate constraint "photos_date_id_fkey";

grant references on table "public"."alphabet_dates" to "anon";

grant trigger on table "public"."alphabet_dates" to "anon";

grant truncate on table "public"."alphabet_dates" to "anon";

grant references on table "public"."alphabet_dates" to "authenticated";

grant trigger on table "public"."alphabet_dates" to "authenticated";

grant truncate on table "public"."alphabet_dates" to "authenticated";

grant references on table "public"."alphabet_dates" to "service_role";

grant trigger on table "public"."alphabet_dates" to "service_role";

grant truncate on table "public"."alphabet_dates" to "service_role";

grant references on table "public"."photos" to "anon";

grant trigger on table "public"."photos" to "anon";

grant truncate on table "public"."photos" to "anon";

grant references on table "public"."photos" to "authenticated";

grant trigger on table "public"."photos" to "authenticated";

grant truncate on table "public"."photos" to "authenticated";

grant references on table "public"."photos" to "service_role";

grant trigger on table "public"."photos" to "service_role";

grant truncate on table "public"."photos" to "service_role";


