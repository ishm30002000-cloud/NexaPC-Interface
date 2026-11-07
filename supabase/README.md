# NexaPC Supabase backend

The existing Supabase project is the backend: Auth handles accounts, PostgREST
serves the catalog and owner-protected customer records, and PostgreSQL RPCs
handle atomic cart and order operations. The starter Express service is not
used for customer data. There is no Replit database dependency for NexaPC.

## Configuration

The browser uses these **public** environment values:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Never use a service-role key in a `VITE_` variable or frontend bundle.
Row-level security and explicit table/function permissions enforce access.

### Email confirmation and password reset

Email/password authentication and email confirmation are enabled on Supabase.
The app implements sign-up, login, sign-out, reset-link requests, reset completion
and authenticated password changes. Email delivery and redirect configuration
are project-owner settings, not frontend code:

1. In Supabase **Authentication → URL Configuration**, set the Site URL to the
   app's current origin.
2. Add the exact app URLs ending in `/auth/callback` and `/reset-password` to
   the allowed redirect URLs. For an app mounted under a subpath, include that
   prefix as well. Add development and published origins separately.
3. In **Authentication → Email → SMTP Settings**, configure a verified email
   sender for customer-facing email. Supabase's default mail service is for
   testing and only sends to pre-authorized organization team addresses.
4. Test a real confirmation email and reset email with an address you control.
   Do not turn off verification just to work around delivery restrictions.

Official references:
- [Redirect URL configuration](https://supabase.com/docs/guides/auth/redirect-urls)
- [Custom SMTP and default-mail restrictions](https://supabase.com/docs/guides/auth/auth-smtp)

## Data and access

- `products`: public read for active products; no customer writes. `details`
  holds product copy/specifications; canonical price and stock are the
  `price_fils` and `stock` columns. A null value means pending, never zero.
- `profiles`: created by an Auth trigger; customers can read/edit only their
  own name and phone. Email remains the Supabase Auth account's email.
- `addresses`: owner-only CRUD, with one default address per customer.
- `cart_items`: owner-only reads; writes go through `save_cart`.
- `orders`, `order_items`: owner-only reads. Customers cannot insert records
  directly, alter prices, change statuses, or read another customer's request.

Manage real catalog prices, stock, product copy and order statuses in the
Supabase Table Editor until a separate store-management interface is built.
Prices are integer fils: 12.750 KWD = 12750 fils.

## Website pictures

The **`nexapc-images`** Supabase Storage bucket contains all 10 existing image
assets: eight product photos, the hero background, and the favicon. Downloads
are public; anonymous and customer uploads/edits are not enabled. Its file
limit is 5 MiB and accepted types are JPEG, PNG, WebP, SVG and GIF.

Product image URLs live in `products.details.images`; the hero and favicon use
the same bucket. Missing product photos remain explicitly pending. The original
local files are retained as migration inputs, not runtime fallbacks.

The server-only migration requires `SUPABASE_STORAGE_SERVICE_ROLE_KEY` in
Secrets. Use a full project `service_role` key or server secret key, never the
public `anon`/publishable key, a database connection string, or a signing secret.
It validates permissions, refuses to overwrite differing objects, and verifies
SHA-256 hashes through public downloads before writing its manifest.

```sh
pnpm --filter @workspace/scripts run migrate:nexapc-images
```

Migration `202611070004_product_storage_images.sql` switches the original
product photo paths only after uploads are verified. It preserves the rest of
each product record and is safe to reapply.

## Backend operations

- `save_cart(p_lines, p_merge)`: validates product IDs and integer quantities,
  locks per customer, replaces or merges atomically. Guest merges keep the
  greater quantity for duplicate products so retrying cannot duplicate items.
- `set_default_address(p_id)`, `delete_address(p_id)`: operate only on the
  authenticated customer's addresses.
- `submit_order_request(p_delivery, p_request_key)`: authenticates the customer,
  reads the saved cart, checks availability, snapshots database prices and
  product names, creates a request and clears the saved cart in one transaction.
  Retrying the same customer/request key returns the existing reference.
  It permits at most 10 new requests per customer per hour.

Requests start as `awaiting_review`. They are **not paid purchases**, do not
reserve stock and do not imply confirmed delivery charges. No payment gateway,
card collection, shipping pricing or notification provider is configured.

## Migrations and verification

`migrations/` is the schema history applied to the existing Supabase project.
Do not run the starter Drizzle/Replit DB push command against a different
database expecting it to update Supabase.

`tests/customer-access.sql` runs SQL assertions in a rollback-only transaction.
It checks anonymous denial, owner isolation, address defaults, cart rollback,
idempotent merging and submission, server-owned prices, historical snapshots,
and null-price preservation. Run it through the Supabase SQL connection as the
project owner; it creates no permanent test customers or products.

The Supabase advisor flags the authenticated `SECURITY DEFINER` RPCs by design.
They intentionally expose only these validated operations, derive ownership
from `auth.uid()`, use an empty `search_path`, and deny anonymous execution.
See [the advisor explanation](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable).

Frontend checks:

```sh
pnpm --filter @workspace/nexapc run typecheck
pnpm --filter @workspace/nexapc test
```
