# Production Deployment — Orunto Owu Abeokuta

**Approval:** `approve production` — 2026-08-31  
**Rollback tag:** `v2.5-prod-2026-08-31` → commit `f6bac09` (50 routes, headers+rate-limit+CI)  
**Previous rollback:** `b5aada2` (max 2 cats)

## How to go live (non-coder, 5 mins, Vercel Dashboard — no CLI needed)

1. Go to https://vercel.com → **Add New → Project** → **Import** `scholarsuite25-netizen/oruntoowuabeokuta`
   - Framework: **Next.js** (auto)
   - Root Directory: `Projects/orunto-owu` ← **important** (Project NOT root)
2. **Environment Variables** → Add (copy from your `.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://zzrfqzejbjytnxyjjbtw.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (from Supabase → Settings → API → anon key)
   - `NEXT_PUBLIC_SITE_URL` = `https://oruntoowuabeokuta.org.ng` (or your Vercel URL for preview first)
   - `RESEND_API_KEY` = (Resend → API Keys) — left empty = test mode, no live mail
   - `GEMINI_API_KEY` = `AQ....` (for Yoruba chat)
3. Click **Deploy** → wait 2-3 mins → you get **Preview URL** `https://orunto...vercel.app`
4. **Test preview:** open `/`, `/post/<slug>` (check audio left + 👁 count), `/admin/categories` (badge still), `/api/stats` JSON.
5. **Go production:** Vercel → **Domains** → add `oruntoowuabeokuta.org.ng` → follow DNS instructions → **Set as Production**.
   - Keep preview URL for future tests.

## What changed vs last prod
- Security headers + rate-limit (`middleware.ts`, `next.config.mjs`)
- Zero-cost reader stats + audio + per-category counts
- Max 2 categories enforced via `article_categories`

## If you need to roll back (1 click)
- Vercel → **Deployments** → find previous deployment → **⋯ → Promote to Production**  
- Or locally: `git checkout v2.5-prod-2026-08-31` → `git push origin main --force` (only if Vercel fails)

## Cost/privacy
- Vercel Hobby free (100GB bandwidth), Supabase free tier, no new bill.
- No secrets in git — only in Vercel Env (encrypted).

## Evidence
- Build: `npm run build` 50/50 ✓ 2026-08-31 (local)
- Git tag pushed: `v2.5-prod-2026-08-31`
- CI: `.github/workflows/ci.yml` will run on next push
