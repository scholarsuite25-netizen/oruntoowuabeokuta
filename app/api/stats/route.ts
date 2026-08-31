import { createClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

// GET /api/stats — total articles, total views, views per category (zero-cost)
export async function GET() {
  const supabase = createClient();

  const [{ count: totalArticles }, { data: viewsData }, { data: catViews }] = await Promise.all([
    supabase.from("articles").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("articles").select("view_count").eq("status", "published"),
    supabase.from("article_categories").select("category_id, articles!inner(view_count,status)").eq("articles.status", "published"),
  ]);

  const totalViews = (viewsData || []).reduce((s: number, r: any) => s + (r.view_count || 0), 0);

  // Aggregate views per category
  const perCategory: Record<string, number> = {};
  (catViews || []).forEach((row: any) => {
    const cid = row.category_id;
    const vc = row.articles?.view_count || 0;
    perCategory[cid] = (perCategory[cid] || 0) + vc;
  });

  // Also counts per category (articles)
  const { data: catCounts } = await supabase.from("article_categories").select("category_id");
  const perCategoryCounts: Record<string, number> = {};
  (catCounts || []).forEach((r: any) => {
    perCategoryCounts[r.category_id] = (perCategoryCounts[r.category_id] || 0) + 1;
  });

  const { data: cats } = await supabase.from("categories").select("id,name,slug");
  const categories = (cats || []).map((c: any) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    article_count: perCategoryCounts[c.id] || 0,
    view_count: perCategory[c.id] || 0,
  }));

  return NextResponse.json({
    total_articles: totalArticles || 0,
    total_views: totalViews,
    categories,
  });
}
