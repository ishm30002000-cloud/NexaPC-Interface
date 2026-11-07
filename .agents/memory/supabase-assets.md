---
name: Supabase asset migration
description: Keep image migrations safe when database access and Storage access differ.
---

Use Supabase Storage for NexaPC's website pictures. Keep the existing pictures and references working until every remote upload has been verified.

**Why:** The user wants the catalog and website pictures in Supabase. The connected database-management integration does not provide file-upload access; a database migration succeeding does not prove Storage access works.

**How to apply:** Use a server-only Supabase credential through the secure secrets flow for Storage operations. Validate the credential format without printing it. Never weaken Storage policies as a workaround. Verify public downloads and file hashes before changing product image references or removing local originals.

For credential setup, distinguish a database connection string, a public API key, and a privileged server API key. Do not treat confirmation of an existing secret as proof that its value changed.

**Why:** Repeated secure-field confirmations did not resolve the credential mismatch; direct guidance to the separate `service_role` row and editing the existing Secrets entry did.

**How to apply:** Point to Supabase Settings → API Keys → Legacy API Keys → `service_role` when using legacy credentials, then Replit Secrets → Edit → Update Secret. Check both format and server permissions without displaying any credential.
