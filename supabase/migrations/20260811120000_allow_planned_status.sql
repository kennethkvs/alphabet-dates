-- The app writes 'planned', but the original constraint only allowed 'scheduled'.
-- Backfill BEFORE swapping the constraint, otherwise VALIDATE CONSTRAINT fails.
update "public"."alphabet_dates"
set "status" = 'planned'
where "status" = 'scheduled';

alter table "public"."alphabet_dates"
  drop constraint if exists "alphabet_dates_status_check";

alter table "public"."alphabet_dates"
  add constraint "alphabet_dates_status_check"
  check ("status" = any (array['planned'::text, 'completed'::text])) not valid;

alter table "public"."alphabet_dates"
  validate constraint "alphabet_dates_status_check";
