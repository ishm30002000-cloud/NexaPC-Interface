-- NexaPC: Supabase Auth, public catalog and owner-only customer data.
create table public.products (
  id text primary key,
  slug text not null unique,
  details jsonb not null check (jsonb_typeof(details) = 'object'),
  price_fils integer check (price_fils >= 0),
  stock integer check (stock >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '' check (length(full_name) <= 120),
  phone text not null default '' check (phone = '' or phone ~ '^(\+965|00965)?[24569][0-9]{7}$'),
  created_at timestamptz not null default now()
);
create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  label text not null check (length(trim(label)) between 1 and 80),
  full_name text not null check (length(trim(full_name)) between 2 and 120),
  phone text not null check (phone ~ '^(\+965|00965)?[24569][0-9]{7}$'),
  governorate text not null check (governorate in ('Al Asimah (Capital)', 'Hawalli', 'Farwaniya', 'Mubarak Al-Kabeer', 'Ahmadi', 'Jahra')),
  city text not null check (length(trim(city)) between 2 and 120),
  block text not null check (length(trim(block)) between 1 and 80),
  street text not null check (length(trim(street)) between 1 and 200),
  building text not null check (length(trim(building)) between 1 and 80),
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create index addresses_user_idx on public.addresses(user_id);
create unique index addresses_one_default on public.addresses(user_id) where is_default;
create table public.cart_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null references public.products(id),
  quantity integer not null check (quantity between 1 and 99),
  primary key (user_id, product_id)
);
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default ('NX-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 16))),
  user_id uuid not null references auth.users(id) on delete cascade,
  request_key uuid not null,
  status text not null default 'awaiting_review' check (status in ('awaiting_review', 'quoted', 'cancelled')),
  delivery jsonb not null,
  subtotal_fils bigint check (subtotal_fils >= 0),
  created_at timestamptz not null default now(),
  unique (user_id, request_key)
);
create index orders_user_date_idx on public.orders(user_id, created_at desc);
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null references public.products(id),
  name text not null,
  slug text not null,
  quantity integer not null check (quantity between 1 and 99),
  unit_price_fils integer check (unit_price_fils >= 0)
);
create index order_items_order_idx on public.order_items(order_id);

alter table public.products enable row level security;
alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
create policy catalog_public_read on public.products for select to anon, authenticated using (active);
create policy profile_owner_read on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy profile_owner_update on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy addresses_owner on public.addresses for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy cart_owner_read on public.cart_items for select to authenticated using (user_id = (select auth.uid()));
create policy orders_owner_read on public.orders for select to authenticated using (user_id = (select auth.uid()));
create policy order_items_owner_read on public.order_items for select to authenticated using (
  exists (select 1 from public.orders o where o.id = order_id and o.user_id = (select auth.uid()))
);
revoke all on public.products, public.profiles, public.addresses, public.cart_items, public.orders, public.order_items from anon, authenticated;
grant select on public.products to anon, authenticated;
grant select on public.profiles, public.cart_items, public.orders, public.order_items to authenticated;
grant update(full_name, phone) on public.profiles to authenticated;
grant select, insert, update, delete on public.addresses to authenticated;

create function public.nexapc_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id, full_name)
  values (new.id, left(coalesce(new.raw_user_meta_data->>'full_name', ''), 120));
  return new;
end;
$$;
revoke all on function public.nexapc_new_user() from public, anon, authenticated;
create trigger nexapc_new_user after insert on auth.users for each row execute function public.nexapc_new_user();
insert into public.profiles(id, full_name)
select id, left(coalesce(raw_user_meta_data->>'full_name', ''), 120) from auth.users
on conflict (id) do nothing;

-- Serialize cart writes and order submission per customer. Replace or merge
-- atomically; unknown prices stay NULL and the client never supplies prices.
create function public.save_cart(p_lines jsonb, p_merge boolean default false) returns void
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  line jsonb;
  qty integer;
  pid text;
  existing integer;
  item public.products%rowtype;
begin
  if uid is null then raise exception 'Sign in to save your cart'; end if;
  perform pg_advisory_xact_lock(hashtextextended(uid::text, 0));
  if jsonb_typeof(p_lines) is distinct from 'array' or jsonb_array_length(p_lines) > 100 then
    raise exception 'Invalid cart';
  end if;
  if not p_merge then delete from public.cart_items where user_id = uid; end if;
  for line in select value from jsonb_array_elements(p_lines) loop
    if jsonb_typeof(line->'productId') is distinct from 'string'
      or jsonb_typeof(line->'quantity') is distinct from 'number'
      or (line->>'quantity') !~ '^[0-9]{1,2}$' then raise exception 'Invalid cart item'; end if;
    pid := line->>'productId';
    qty := (line->>'quantity')::integer;
    if qty < 1 or qty > 99 then raise exception 'Invalid quantity'; end if;
    select * into item from public.products where id = pid and active;
    if not found or coalesce((item.details->>'isPlaceholder')::boolean, false) then
      raise exception 'A product is no longer available';
    end if;
    existing := 0;
    if p_merge then
      select quantity into existing from public.cart_items where user_id = uid and product_id = pid;
    end if;
    -- Keep an already-saved out-of-stock line visible for removal, but never
    -- accept it as an order. Stock limits are checked again at submission.
    qty := least(99, qty + coalesce(existing, 0));
    if item.stock > 0 then qty := least(qty, item.stock); end if;
    insert into public.cart_items(user_id, product_id, quantity) values(uid, pid, qty)
    on conflict (user_id, product_id) do update set quantity = excluded.quantity;
  end loop;
end;
$$;
revoke all on function public.save_cart(jsonb, boolean) from public, anon;
grant execute on function public.save_cart(jsonb, boolean) to authenticated;

create function public.set_default_address(p_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Sign in first'; end if;
  perform pg_advisory_xact_lock(hashtextextended(uid::text, 0));
  if not exists(select 1 from public.addresses where id = p_id and user_id = uid) then raise exception 'Address not found'; end if;
  update public.addresses set is_default = false where user_id = uid and is_default;
  update public.addresses set is_default = true where id = p_id and user_id = uid;
end;
$$;
revoke all on function public.set_default_address(uuid) from public, anon;
grant execute on function public.set_default_address(uuid) to authenticated;

create function public.delete_address(p_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Sign in first'; end if;
  perform pg_advisory_xact_lock(hashtextextended(uid::text, 0));
  delete from public.addresses where id = p_id and user_id = uid;
  if not exists(select 1 from public.addresses where user_id = uid and is_default) then
    update public.addresses set is_default = true where id = (
      select id from public.addresses where user_id = uid order by created_at limit 1
    );
  end if;
end;
$$;
revoke all on function public.delete_address(uuid) from public, anon;
grant execute on function public.delete_address(uuid) to authenticated;

create function public.submit_order_request(p_delivery jsonb, p_request_key uuid) returns text
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  ref text;
  oid uuid;
  entry record;
  subtotal bigint := 0;
  unknown_price boolean := false;
  field text;
begin
  if uid is null then raise exception 'Sign in to submit an order request'; end if;
  perform pg_advisory_xact_lock(hashtextextended(uid::text, 0));
  select reference into ref from public.orders where user_id = uid and request_key = p_request_key;
  if found then return ref; end if;
  if p_request_key is null then raise exception 'A request key is required'; end if;
  if jsonb_typeof(p_delivery) is distinct from 'object' then raise exception 'Invalid delivery details'; end if;
  foreach field in array array['fullName','email','phone','governorate','city','block','street','building'] loop
    if jsonb_typeof(p_delivery->field) is distinct from 'string'
      or length(trim(p_delivery->>field)) not between 1 and 200 then
      raise exception 'Check your delivery details';
    end if;
  end loop;
  if length(trim(p_delivery->>'fullName')) < 2 or length(trim(p_delivery->>'city')) < 2
    or (p_delivery->>'phone') !~ '^(\+965|00965)?[24569][0-9]{7}$'
    or (p_delivery->>'email') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or p_delivery->>'governorate' not in ('Al Asimah (Capital)', 'Hawalli', 'Farwaniya', 'Mubarak Al-Kabeer', 'Ahmadi', 'Jahra')
    or length(coalesce(p_delivery->>'notes','')) > 300 then raise exception 'Check your delivery details'; end if;
  if not exists(select 1 from public.cart_items where user_id = uid) then raise exception 'Your saved cart is empty'; end if;
  if (select count(*) from public.orders where user_id = uid and created_at > now() - interval '1 hour') >= 10 then
    raise exception 'Too many requests. Please try again later';
  end if;
  -- Lock product rows to take one consistent price/stock snapshot.
  for entry in
    select p.*, c.quantity from public.cart_items c join public.products p on p.id = c.product_id
    where c.user_id = uid order by p.id for share of p
  loop
    if not entry.active or coalesce((entry.details->>'isPlaceholder')::boolean, false)
      or entry.stock = 0 or (entry.stock is not null and entry.quantity > entry.stock) then
      raise exception 'Availability changed. Review your cart before submitting';
    end if;
    if entry.price_fils is null then unknown_price := true;
    else subtotal := subtotal + entry.price_fils::bigint * entry.quantity; end if;
  end loop;
  insert into public.orders(user_id, request_key, delivery, subtotal_fils)
  values(uid, p_request_key, p_delivery, case when unknown_price then null else subtotal end)
  returning id, reference into oid, ref;
  insert into public.order_items(order_id, product_id, name, slug, quantity, unit_price_fils)
  select oid, p.id, p.details->>'name', p.slug, c.quantity, p.price_fils
  from public.cart_items c join public.products p on p.id = c.product_id where c.user_id = uid;
  delete from public.cart_items where user_id = uid;
  return ref;
end;
$$;
revoke all on function public.submit_order_request(jsonb, uuid) from public, anon;
grant execute on function public.submit_order_request(jsonb, uuid) to authenticated;
