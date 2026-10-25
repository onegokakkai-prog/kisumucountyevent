# Kisumu County Education Festival 2026

Event website for the inaugural Kisumu County Education Festival (Kisumu Central Grounds, December 2026).

Built with Next.js (App Router), Tailwind CSS v4 and Zod.

## Develop

Needs a MongoDB database. Copy `.env.example` to `.env.local` and fill it in
(locally `MONGODB_URI=mongodb://localhost:27017`).

```bash
npm install
npm run dev     # http://localhost:3000
npm run lint
npm run build
```

## Where things live

- `src/lib/festival.ts` — all festival content: dates, venue, tracks, two-day programme, outcomes, partners, form options. Edit this file to update copy.
  - `festival.dateLabel` / `dateDetail` — set the exact dates once confirmed.
  - `brickDrive` — set `pricePerBrick`, `raised` and `target` to show the Buy-a-Brick progress bar.
- `src/app/page.tsx` — home page (sections in `src/components/home/`).
- `src/app/register/` — registration page, form, Zod schema and server action.
- `src/lib/registrations.ts` — saving and listing registrations (MongoDB, `registrations` collection).
- `src/app/admin/` — organisers' page with totals, the full list and a CSV download.
- `src/proxy.ts` — password protection for `/admin`.
- `public/partners/` — partner logos.

## Registrations

Registrations are saved to MongoDB, one per phone number (`0712…` and `+254712…` count
as the same number). A person registering a family or school group sets the group size.

Organisers see them at `/admin`, signing in at `/admin/login`. Accounts are stored in the
`admins` collection with hashed passwords. Create one, or reset its password, with:

```bash
npm run seed:admin -- organiser@example.com 'a-strong-password'
```

Until an account exists, `ADMIN_EMAIL` and `ADMIN_PASSWORD` from the environment are used.

## Deploying to Vercel

1. Create a free MongoDB Atlas cluster and copy its connection string.
2. In Network Access, allow `0.0.0.0/0` (Vercel's IP addresses change).
3. In the Vercel project settings, add `MONGODB_URI`, `MONGODB_DB` and `ADMIN_SESSION_SECRET`
   as environment variables, and create an admin with `npm run seed:admin`.
