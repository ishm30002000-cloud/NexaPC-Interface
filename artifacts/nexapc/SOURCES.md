# NexaPC asset and data sources

## Product photos (real, not AI-generated)
| Product | File | Source |
|---|---|---|
| SADES AP-FROG 27" QHD gaming monitor | public/products/sades-ap-frog.webp (copied from attached_assets/product-references/sades-ap-frog.webp) | Retro Games Kuwait listing image: https://retrogameskw.com/cdn/shop/files/sades-27-qhdhdmi-21180hz-03msflat-gaming-monitor-ap-frog-gaming-monitor-sades-445714.webp?v=1745847070&width=1280 |

Listing title used for SADES facts: "SADES 27" QHD / HDMI 2.1 / 180Hz / 0.3ms / Flat gaming monitor AP-FROG" (retailer-provided; manufacturer datasheet still needed).

## Additional sourced product photos
Exact image source URLs are recorded beside each image in `src/data/products.ts`.
- Samsung 990 PRO 2TB and 870 EVO 1TB: Samsung official product galleries.
- Samsung Odyssey G5 27-inch: Newcomme distributor gallery, LC27G55T regional variant. Confirm the intended regional SKU before launch.
- MSI G274QPF E2: Versus product image.
- MSI RTX 4070 SUPER VENTUS 2X OC: MSI official product image.
- Noctua NH-D15: Density retailer product image.
- Logitech G PRO X SUPERLIGHT 2: Logitech official product gallery.

Confirm permission to publish third-party distributor and retailer images before commercial launch.

## Product photos MISSING (UI shows an explicit "Photo pending" frame)
- AMD Ryzen 7 7800X3D
- RAM placeholder entry (no model chosen)

## Spec references (one per product, also stored in `reference` in src/data/products.ts)
- Samsung 990 PRO: https://semiconductor.samsung.com/consumer-storage/internal-ssd/990-pro/
- Samsung 870 EVO: https://semiconductor.samsung.com/consumer-storage/internal-ssd/870evo/
- Samsung Odyssey G5: https://www.samsung.com/levant/monitors/gaming/odyssey-g5-27-inch-144hz-curved-wqhd-lc27g55tqbmxzn/
- MSI G274QPF E2: https://www.msi.com/Monitor/G274QPF-E2
- MSI RTX 4070 SUPER VENTUS 2X OC: https://www.msi.com/Graphics-Card/GeForce-RTX-4070-SUPER-12G-VENTUS-2X-OC
- Noctua NH-D15: https://noctua.at/en/nh-d15
- AMD Ryzen 7 7800X3D: https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-7-7800x3d.html
- Logitech G PRO X SUPERLIGHT 2: https://www.logitechg.com/products/gaming-mice/pro-x2-superlight-wireless-mouse.html
Specs were entered from published manufacturer figures and should be re-verified against these pages before launch.

## Non-product imagery
- public/hero-abstract.jpg: original abstract AI-generated technology graphic (no products depicted).

## Still needed from the owner
- Prices (KWD) and stock for every product (all currently null: "Price pending" / "Availability pending").
- Real manufacturer photos for the products listed above (ideally multiple angles, WebP/AVIF + fallback).
- Exact RAM model to replace the placeholder entry; full SADES AP-FROG manufacturer specs (panel type etc.).
- Terms and Conditions and Privacy text; shipping fees, discounts, delivery and return policies (none shown).
