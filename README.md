This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Alphabet Dates (Supabase) Setup

This project includes a scaffold for an "Alphabet Dates" feature using Supabase for auth, Postgres, and storage. To get started:

1. Create a Supabase project at https://app.supabase.com and create a Storage bucket named `alphabet-dates`.
2. Copy your Supabase project URL and anon/service keys into `.env.local` (see `.env.local.example`).
3. Run `npm install` to install new dependencies (`@supabase/supabase-js`, `sharp`).
4. Start the dev server:

```bash
npm run dev
```

API endpoints added (server-side):

- `POST /api/uploads` — proxy upload endpoint that resizes images (150px thumbnail, 800px medium) and stores private variants in Supabase Storage.
- `GET/POST /api/alphabet` — simple list/create endpoints for alphabet dates.

You'll need to create the `alphabet_dates` and `photos` tables in your Supabase project. A minimal schema:

```sql
create table alphabet_dates (
	id uuid primary key default uuid_generate_v4(),
	letter text,
	title text,
	description text,
	scheduled_at timestamptz,
	completed_at timestamptz,
	created_at timestamptz default now()
);

create table photos (
	id uuid primary key default uuid_generate_v4(),
	date_id uuid references alphabet_dates(id) on delete cascade,
	filename text,
	thumb_path text,
	medium_path text,
	original_path text,
	caption text,
	created_at timestamptz default now()
);
```

The upload route stores images privately — the server returns signed URLs for temporary access. Adjust expiration or bucket policies as needed.

### Applying the database schema

A SQL migration is included at `supabase/migrations/001_init.sql`. You can apply it in one of two ways:

- Use the Supabase SQL editor: open your project in the Supabase dashboard, go to SQL Editor, paste the file contents, and run it.
- Or use the Supabase CLI (if installed):

```bash
# log in with `supabase login` then
supabase db query < supabase/migrations/001_init.sql
```

After running the migration, create a Storage bucket named `alphabet-dates` in the Supabase dashboard (Storage → Buckets). The upload endpoint expects that bucket name.
