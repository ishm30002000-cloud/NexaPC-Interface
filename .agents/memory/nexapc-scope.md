---
name: NexaPC scope and content integrity
description: User-defined front-end-only scope and prohibition on invented commercial content.
---

NexaPC is a front-end-only UI/UX project. Do not add backend services, databases, API routes, or authentication servers. Use local files for catalog data and localStorage for the cart only; account demonstrations must not persist personal information.

**Why:** The user explicitly requested a front-end-only storefront and honest, disconnected account, order, and payment previews.

**How to apply:** Keep future changes inside this scope unless the user explicitly authorizes a backend. Prices are KWD with three decimals. Never invent product specifications, prices, stock, reviews, promotions, shipping, warranties, policies, company history, or testimonials. Missing commercial data must remain visibly pending; a missing price is not zero. Use real photos for real manufacturer products, never generated product imagery.
