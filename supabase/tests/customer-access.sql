-- Run with Supabase execute_sql. All fixtures and mutations roll back.
begin;
select set_config('nexapc.test_a', gen_random_uuid()::text, true);
select set_config('nexapc.test_b', gen_random_uuid()::text, true);
select set_config('nexapc.test_product', 'test-' || gen_random_uuid()::text, true);
select set_config('nexapc.test_request', gen_random_uuid()::text, true);
insert into auth.users(id, raw_user_meta_data)
values (current_setting('nexapc.test_a')::uuid, '{"full_name":"Backend test A"}'),
       (current_setting('nexapc.test_b')::uuid, '{"full_name":"Backend test B"}');
insert into public.products(id, slug, details, price_fils, stock)
values (current_setting('nexapc.test_product'), current_setting('nexapc.test_product'),
        '{"name":"Test-only item, rolled back","isPlaceholder":false}', 12750, 5);
set local role anon;
do $$
begin
  if not exists(select 1 from public.products where id = current_setting('nexapc.test_product')) then raise exception 'Public catalog read failed'; end if;
  begin
    perform * from public.profiles;
    raise exception 'Anonymous profile access must be denied';
  exception when insufficient_privilege then null; end;
  begin
    perform public.save_cart('[]'::jsonb);
    raise exception 'Anonymous cart writes must be denied';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('nexapc.test_a'), true);
do $$
declare
  ref text;
  ref_again text;
  delivery jsonb := '{"fullName":"Test Customer","email":"test@example.invalid","phone":"50000000","governorate":"Hawalli","city":"Salmiya","block":"1","street":"Test Street","building":"1","notes":""}';
begin
  if (select count(*) from public.profiles) <> 1 then raise exception 'Profiles must be owner-only'; end if;
  update public.profiles set full_name='Updated test A' where id=auth.uid();
  insert into public.addresses(label,full_name,phone,governorate,city,block,street,building)
  values ('Test home','Test Customer','50000000','Hawalli','Salmiya','1','Test Street','1');
  perform public.set_default_address((select id from public.addresses limit 1));
  if not (select is_default from public.addresses limit 1) then raise exception 'Default address failed'; end if;
  perform public.save_cart(jsonb_build_array(jsonb_build_object('productId',current_setting('nexapc.test_product'),'quantity',2,'priceFils',1)));
  perform public.save_cart(jsonb_build_array(jsonb_build_object('productId',current_setting('nexapc.test_product'),'quantity',2)),true);
  perform public.save_cart(jsonb_build_array(jsonb_build_object('productId',current_setting('nexapc.test_product'),'quantity',2)),true);
  if (select quantity from public.cart_items) <> 2 then raise exception 'Merge retry duplicated cart'; end if;
  begin
    perform public.save_cart(jsonb_build_array(jsonb_build_object('productId',current_setting('nexapc.test_product'),'quantity',-1)));
    raise exception 'Negative quantities must be rejected';
  exception when raise_exception then
    if sqlerrm <> 'Invalid cart item' then raise; end if;
  end;
  if (select quantity from public.cart_items) <> 2 then raise exception 'Failed save lost the existing cart'; end if;
  ref := public.submit_order_request(delivery,current_setting('nexapc.test_request')::uuid);
  ref_again := public.submit_order_request(delivery,current_setting('nexapc.test_request')::uuid);
  if ref <> ref_again or (select count(*) from public.orders) <> 1 then raise exception 'Request retry created a duplicate'; end if;
  if (select subtotal_fils from public.orders) <> 25500 then raise exception 'Server must calculate price from catalog'; end if;
  if exists(select 1 from public.cart_items) then raise exception 'Submitted cart was not cleared atomically'; end if;
  if (select unit_price_fils from public.order_items) <> 12750 then raise exception 'Price snapshot incorrect'; end if;
  begin
    update public.orders set status='quoted';
    raise exception 'Customers must not set their own order status';
  exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub', current_setting('nexapc.test_b'), true);
do $$
begin
  if exists(select 1 from public.orders) or exists(select 1 from public.order_items) or exists(select 1 from public.addresses) then
    raise exception 'Cross-customer data was exposed';
  end if;
  if (select count(*) from public.profiles) <> 1 then raise exception 'Cross-customer profile exposed'; end if;
  begin
    update public.products set price_fils=1 where id=current_setting('nexapc.test_product');
    raise exception 'Customers must not change catalog prices';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
-- Changing the catalog never changes an already-submitted price snapshot.
update public.products set price_fils = null where id=current_setting('nexapc.test_product');
set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('nexapc.test_a'), true);
do $$
declare ref text;
begin
  if (select unit_price_fils from public.order_items) <> 12750 then raise exception 'Historical price changed'; end if;
  perform public.save_cart(jsonb_build_array(jsonb_build_object('productId',current_setting('nexapc.test_product'),'quantity',1)));
  ref := public.submit_order_request('{"fullName":"Test Customer","email":"test@example.invalid","phone":"50000000","governorate":"Hawalli","city":"Salmiya","block":"1","street":"Test Street","building":"1"}',gen_random_uuid());
  if (select subtotal_fils from public.orders where reference=ref) is not null then raise exception 'Unknown price must remain NULL'; end if;
end $$;
rollback;
select 'PASS: anonymous denial, owner isolation, address defaults, cart rollback, merge retries, authoritative prices, atomic submission, idempotency, price snapshots, pending prices' as result;
