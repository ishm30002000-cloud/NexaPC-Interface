-- Merge guest carts by the greater quantity, not addition. Retrying a sign-in
-- after a lost response must not duplicate the guest cart.
create or replace function public.save_cart(p_lines jsonb, p_merge boolean default false) returns void
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
  if jsonb_typeof(p_lines) is distinct from 'array' or jsonb_array_length(p_lines) > 100 then raise exception 'Invalid cart'; end if;
  if not p_merge then delete from public.cart_items where user_id = uid; end if;
  for line in select value from jsonb_array_elements(p_lines) loop
    if jsonb_typeof(line->'productId') is distinct from 'string'
      or jsonb_typeof(line->'quantity') is distinct from 'number'
      or (line->>'quantity') !~ '^[0-9]{1,2}$' then raise exception 'Invalid cart item'; end if;
    pid := line->>'productId';
    qty := (line->>'quantity')::integer;
    if qty < 1 or qty > 99 then raise exception 'Invalid quantity'; end if;
    select * into item from public.products where id = pid and active;
    if not found or coalesce((item.details->>'isPlaceholder')::boolean, false) then raise exception 'A product is no longer available'; end if;
    existing := 0;
    if p_merge then select quantity into existing from public.cart_items where user_id = uid and product_id = pid; end if;
    qty := least(99, greatest(qty, coalesce(existing, 0)));
    if item.stock > 0 then qty := least(qty, item.stock); end if;
    insert into public.cart_items(user_id, product_id, quantity) values(uid, pid, qty)
    on conflict (user_id, product_id) do update set quantity = excluded.quantity;
  end loop;
end;
$$;
