-- Seeds one blank chapter per letter (A-Z) into alphabet_dates.
-- Run automatically by `supabase db reset`, or manually via:
--   supabase db query -f supabase/seed.sql --linked or --local
insert into "public"."alphabet_dates" ("letter")
select chr(64 + n)
from generate_series(1, 26) as n
where not exists (
  select 1
  from "public"."alphabet_dates" ad
  where ad."letter" = chr(64 + n)
);
