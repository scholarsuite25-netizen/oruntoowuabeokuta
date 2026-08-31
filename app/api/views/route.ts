import { createClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// POST /api/views — increment view count for article (zero-cost, dedup via client hash)
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const body = await request.json();
  const { slug, article_id, viewer_hash } = body;

  if (!slug && !article_id) {
    return NextResponse.json({ error: "slug or article_id required" }, { status: 400 });
  }

  // Resolve article id from slug if needed
  let id = article_id as string | undefined;
  if (!id && slug) {
    const { data } = await supabase.from("articles").select("id").eq("slug", slug).single();
    if (!data) return NextResponse.json({ error: "Article not found" }, { status: 404 });
    id = data.id;
  }

  // Optional dedup: if viewer_hash provided, check recent view (24h) to avoid double count
  if (viewer_hash && id) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: recent } = await supabase
      .from("article_views")
      .select("id")
      .eq("article_id", id)
      .eq("viewer_hash", viewer_hash)
      .gte("created_at", since)
      .limit(1);
    if (recent && recent.length > 0) {
      const { data: art } = await supabase.from("articles").select("view_count").eq("id", id).single();
      return NextResponse.json({ view_count: art?.view_count ?? 0, deduped: true });
    }
    await supabase.from("article_views").insert({ article_id: id, viewer_hash });
  }

  // Atomic increment via RPC fallback to read+update
  const { data: cur } = await supabase.from("articles").select("view_count").eq("id", id!).single();
  const next = (cur?.view_count ?? 0) + 1;
  await supabase.from("articles").update({ view_count: next }).eq("id", id!);

  return NextResponse.json({ view_count: next });
}

// GET /api/views?slug=xxx or ?article_id=xxx — get view count
export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const article_id = searchParams.get("article_id");
  if (!slug && !article_id) return NextResponse.json({ error: "slug or article_id required" }, { status: 400 });
  let id = article_id;
  if (!id && slug) {
    const { data } = await supabase.from("articles").select("id,view_count").eq("slug", slug).single();
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ view_count: data.view_count ?? 0 });
  }
  const { data } = await supabase.from("articles").select("view_count").eq("id", id!).single();
  return NextResponse.json({ view_count: data?.view_count ?? 0 });
}
