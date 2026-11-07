---
name: Supabase asset migration
description: Keep image migrations safe when database access and Storage access differ.
---

Use Supabase Storage for NexaPC's website pictures. Keep the existing pictures and references working until every remote upload has been verified.

**Why:** The user wants the catalog and website pictures in Supabase. The connected database-management integration does not provide file-upload access; a database migration succeeding does not prove Storage access works.

**How to apply:** Use a server-only Supabase credential through the secure secrets flow for Storage operations. Validate the credential format without printing it. Never weaken Storage policies as a workaround. Verify public downloads and file hashes before changing product image references or removing local originals.
