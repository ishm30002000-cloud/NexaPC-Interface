---
name: NexaPC scope and content integrity
description: Supabase backend authorization, English-only scope, and prohibition on invented commercial content.
---

The user authorized converting NexaPC from a front-end preview into a working backend using their existing Supabase project. Supabase is the chosen database.

**Why:** The user explicitly requested a backend and database in Supabase, then selected the existing project. This supersedes the earlier front-end-only limitation.

**How to apply:** Use Supabase for persistence rather than introducing a different database. Preserve the English storefront. Prices are KWD with three decimals. Never invent product specifications, stock, reviews, promotions, shipping, warranties, policies, company history, or testimonials. Missing commercial data must remain visibly pending; a missing price is not zero. Use real photos for real manufacturer products, never generated product imagery.

The user authorized sample prices for the current catalog, not confirmed selling prices.

**Why:** The user selected “Use sample prices” after being told that sample prices would be clearly labeled for testing.

**How to apply:** Keep sample pricing visibly distinguished from genuine selling prices. Do not treat this as permission to invent stock or other commercial claims. Leave unspecified product models pending. Use owner-provided prices when converting the catalog to real selling prices.

The website should support English only, without an Arabic language switch.

**Why:** The user explicitly changed the bilingual request to English-only.

**How to apply:** Keep the storefront in English with left-to-right layout unless the user requests another change.
