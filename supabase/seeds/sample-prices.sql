-- User-authorized fictional KWD prices for testing; NOT market estimates or
-- confirmed selling prices. Amounts are stored as integer fils.
-- Preserve existing owner-provided prices and leave the unspecified RAM model
-- pending. This seed is intentionally manual, never run on app startup.
update public.products as p
set price_fils = sample.fils,
    details = jsonb_set(p.details, '{isSamplePrice}', 'true'::jsonb)
from (values
  ('p-amd-ryzen7-7800x3d', 119900),
  ('p-logitech-gprox-superlight2', 44900),
  ('p-msi-g274qpf-e2', 89900),
  ('p-msi-rtx4070s-ventus2x', 219900),
  ('p-noctua-nh-d15', 34900),
  ('p-sades-ap-frog-27', 74900),
  ('p-samsung-870evo-1tb', 24900),
  ('p-samsung-990pro-2tb', 54900),
  ('p-samsung-odyssey-g5-27', 84900)
) as sample(id, fils)
where p.id = sample.id and p.price_fils is null
returning p.id, p.price_fils, p.details ->> 'isSamplePrice' as sample_price;
