-- Apply only after running the image-upload script and verifying its public
-- download hashes. Change only the eight known local image references.
-- Preserve descriptions, specifications, attribution, prices and stock.
update public.products as p
set details = jsonb_set(
  p.details,
  '{images}',
  (
    select jsonb_agg(
      case when image.value ->> 'src' = any(array[
        'products/logitech-superlight.png',
        'products/msi-4070.webp',
        'products/msi-g274qpf.webp',
        'products/noctua-d15.jpg',
        'products/sades-ap-frog.webp',
        'products/samsung-870-evo.jpg',
        'products/samsung-990-pro.jpg',
        'products/samsung-g5.jpg'
      ]) then jsonb_set(
        image.value, '{src}',
        to_jsonb('https://beqyrupbafgakgdgpqcg.supabase.co/storage/v1/object/public/nexapc-images/'::text || (image.value ->> 'src'))
      ) else image.value end
      order by image.position
    )
    from jsonb_array_elements(p.details -> 'images') with ordinality as image(value, position)
  ),
  false
)
where exists (
  select 1 from jsonb_array_elements(p.details -> 'images') as image
  where image ->> 'src' = any(array[
    'products/logitech-superlight.png',
    'products/msi-4070.webp',
    'products/msi-g274qpf.webp',
    'products/noctua-d15.jpg',
    'products/sades-ap-frog.webp',
    'products/samsung-870-evo.jpg',
    'products/samsung-990-pro.jpg',
    'products/samsung-g5.jpg'
  ])
);
