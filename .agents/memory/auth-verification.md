---
name: Auth verification boundaries
description: Distinguish working sessions and RLS from public signup email delivery and redirect setup.
---

Successful login with a confirmed test account does not prove that public registration emails work.

**Why:** Browser login, logout, session persistence, and private-data tests can all pass while Supabase still generates email links with its default localhost redirect. A dashboard-save acknowledgement is not proof that the backend configuration took effect.

**How to apply:** Verify the actual generated redirect destination without sending emails or exposing confirmation tokens. Use temporary synthetic users and remove them afterward. Keep email verification enabled; distinguish tested authentication behavior from unverified email delivery and owner-controlled SMTP/redirect settings.
