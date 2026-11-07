# NexaPC

English-only PC hardware storefront backed by the existing Supabase project.
The original frontend-only scope was explicitly replaced by a backend request.

## Run and verify

- Managed web workflow: `artifacts/nexapc: web`.
- `pnpm --filter @workspace/nexapc run typecheck`
- `pnpm --filter @workspace/nexapc test`
- Backend setup and SQL tests: `supabase/README.md`.

## Architecture

- React, Vite, React Router and TanStack Query.
- Supabase Auth, PostgreSQL, row-level security and PostgREST/RPCs.
- The catalog is public; customer profiles, addresses, carts and order
  requests are private to the authenticated customer.
- The Express/API and mockup sandbox artifacts are starter services; customer
  data does not go through Express or the starter Replit database.
- Public browser config: `VITE_SUPABASE_URL` and
  `VITE_SUPABASE_PUBLISHABLE_KEY`. Never expose a Supabase service-role key.
- Account carts live in Supabase. Guest carts use localStorage and merge on
  sign-in by the greater quantity, not addition, to make retries safe.
- Orders are unpaid requests for review, not confirmed purchases or stock
  reservations. Submission is atomic and idempotent on the database.

## Content and scope

- Keep the site English-only.
- Preserve the existing design and automatically animated hero.
- Never invent prices, stock, reviews, offers, shipping charges, warranties,
  business policies or product facts. Null price/stock means pending.
- Money uses integer fils (1000 fils = 1 KWD), displayed to three decimals.
- No payment provider is connected. Legal terms and real commercial details
  still require the owner's content.
- Customer email confirmation/reset delivery requires Supabase SMTP and
  allowed redirect URL configuration; see `supabase/README.md`.
