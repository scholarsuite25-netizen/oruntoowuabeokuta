# Supabase Migration — Step-by-Step (Zero-Cost)

Project: `zzrfqzejbjytnxyjjbtw` — https://zzrfqzejbjytnxyjjbtw.supabase.co

This doc covers **all** Supabase actions you must do manually (free tier). No CLI required — use Dashboard SQL Editor.

## 0) Backup first (1 min)
1. Open https://app.supabase.com → your project `zzrfqzejbjytnxyjjbtw`
2. Left nav → **Database → Backups** (or Settings → Database)
3. If manual backup button exists, create snapshot. Otherwise note: Supabase daily backups are automatic on free tier.

## 1) Apply full schema (if you have NOT run supabase-schema.sql before)
1. Left nav → **SQL Editor** → **New query**
2. Open file `supabase-schema.sql` in this repo (root of orunto-owu)
3. Copy **entire** file → paste into SQL Editor → **Run**
4. Expect `Success. No rows returned` — new tables created: `article_categories`, `article_views`, column `view_count` added to `articles`.

## 2) Incremental patch (if you ALREADY ran previous schema)
If you already ran the earlier schema (before view tracking), run ONLY this patch:

```sql
-- Add view_count if missing
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='articles' AND column_name='view_count') THEN
    ALTER TABLE articles ADD COLUMN view_count INT DEFAULT 0;
  END IF;
END $$;

-- Create article_views table
CREATE TABLE IF NOT EXISTS article_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  viewer_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_article_views_article ON article_views(article_id);
CREATE INDEX IF NOT EXISTS idx_article_views_hash ON article_views(viewer_hash);

ALTER TABLE article_views ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Views public insert" ON article_views;
DROP POLICY IF EXISTS "Views public read" ON article_views;
DROP POLICY IF EXISTS "Views admin manage" ON article_views;
CREATE POLICY "Views public insert" ON article_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Views public read" ON article_views FOR SELECT USING (true);
CREATE POLICY "Views admin manage" ON article_views FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin','editor'))
);

-- Fix max 2 categories: ensure junction exists (already in full schema)
CREATE TABLE IF NOT EXISTS article_categories (
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, category_id)
);
ALTER TABLE article_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Article categories public read" ON article_categories;
CREATE POLICY "Article categories public read" ON article_categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Article categories admin manage" ON article_categories;
CREATE POLICY "Article categories admin manage" ON article_categories FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('superadmin','editor'))
);
```

Paste into SQL Editor → **Run**.

## 3) Verify (run these checks)
```sql
select count(*) as articles from articles;
select count(*) as categories from categories;
select count(*) as article_cats from article_categories;
select count(*) as views from article_views;
select slug, view_count from articles order by view_count desc limit 5;
select c.name, count(ac.article_id) as cnt from categories c left join article_categories ac on ac.category_id=c.id group by c.name order by cnt desc;
```

## 4) What you do NOT need to do (handled by code)
- No API keys to create for views/audio — Web Speech API is browser-native (zero cost).
- No extra Supabase service to enable.
- No Vercel env change for stats/views — uses existing SUPABASE_URL/ANON_KEY from `.env.local` (already set).

## 5) After SQL, confirm in app
1. `npm run build` should pass (now 50 routes).
2. Visit `/admin` → dashboard should show **Total Reads** stat.
3. Visit `/` → StatsBar shows total articles + reads + per-category counts.
4. Visit `/post/<any-slug>` → AudioReader (Play/Pause on left) + view count in meta + ViewTracker auto-increment (dedup per browser via localStorage 24h).

## 6) If you see errors
- `relation article_views does not exist` → re-run patch section 2.
- `column view_count does not exist` → re-run view_count DO block.
- `policy already exists` → `DROP POLICY IF EXISTS` lines handle it.

All features are **zero-cost**: browser localStorage + Supabase free tier + Web Speech API (no external TTS bill).
