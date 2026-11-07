-- The owner explicitly approved the current nine prices as selling prices.
-- Keep every amount unchanged; remove only the sample-price designation.
update public.products
set details = jsonb_set(details, '{isSamplePrice}', 'false'::jsonb)
where details ->> 'isSamplePrice' = 'true'
  and price_fils is not null
returning id, price_fils, details ->> 'isSamplePrice' as sample_price;
