-- The order API accepts delivery JSON, never arbitrary unbounded documents.
alter table public.orders add constraint order_delivery_bounded
  check (jsonb_typeof(delivery) = 'object' and octet_length(delivery::text) <= 4096);
