# Security, Backup & DevOps — Orunto Owu Abeokuta (Student Edition)
Non-coder summary: what protects the site, what backs it up, what to do next.

## What is already protecting you (no action needed now)
- **Login wall:** `middleware.ts` blocks `/admin` unless logged in + role superadmin/editor.
- **Database lock (RLS):** Supabase blocks reads/writes by role — public can only see published articles.
- **Safe headers:** `next.config.mjs` now sends `nosniff`, `SAMEORIGIN`, `HSTS` on every page.
- **Spam throttle:** `middleware.ts` limits `/api/views` 30/min, `/api/comments` 10/min, `/api/join` 5/min per visitor (free, no paid service).
- **Max 2 categories** stops spammy categorization.

## Backup — what you have
- **Git = backup:** every `git push` to GitHub `scholarsuite25-netizen/oruntoowuabeokuta` is a full copy. Tag a version before big changes: `git tag v2.5-2026-08-31`.
- **Supabase auto-backup:** daily on free tier. Manual: Dashboard → Database → Backups → create snapshot before big SQL.
- **Need weekly extra (free):** In Supabase SQL Editor run: `pg_dump` or just keep `supabase-schema.sql` + `data/*.json` in git (already done).

## Anti-hacking — free next steps when ready
1. **Cloudflare free** in front of `oruntoowuabeokuta.org.ng` (WAF + DDoS). Turn on “I’m Under Attack” only if attacked.
2. **Turnstile** (free Cloudflare) on Register/Join forms to block bots — add later, no code now.
3. Keep `npm audit` clean — `ci.yml` runs it on every push.

## DevOps — how code goes live
- You code → `git push` → GitHub Action `ci.yml` builds `npm run build` → if green, Vercel auto-deploys.
- Vercel has **Preview** (every branch) → you check → **Promote to Production** with one click (needs your approve per governance).
- Cron `vercel.json` publishes scheduled articles every 5 mins — no manual job.

## External integrations — what you actually need
| Service | When | Cost | Action today |
|---------|------|------|--------------|
| Vercel | Hosting + preview | Free | Already wired |
| Supabase | DB/auth/storage | Free | Already wired — run patch in `SUPABASE_MIGRATION_STEPS.md` |
| Resend | Email (join/subscribe) | Free 3k/mo, 100/day | Needs domain verify: Supabase → add DNS TXT at your registrar for `oruntoowuabeokuta.org.ng` — test mode until verified (safe per Student Safety) |
| Cloudflare | WAF | Free | Optional later |
| Sentry free | Error alerts | Free 5k events | Optional — add `SENTRY_DSN` later |
| Cloudinary | Images | Not needed | Supabase Storage already does it free |

**No payments, no analytics, no extra cloud** added unless you approve — simplest stack wins.

## Your to-do (copy-paste)
- Verify Resend domain when ready (Supabase will show DNS records).
- After preview looks good, tell me “approve production” and I’ll promote.

