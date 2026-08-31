import { createClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// GET /api/articles — list articles
export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);

  const status = searchParams.get("status");
  const category = searchParams.get("category");
  const author = searchParams.get("author");
  const search = searchParams.get("search");
  const tag = searchParams.get("tag");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const sort = searchParams.get("sort") || "created_at";
  const order = searchParams.get("order") || "desc";

  let query = supabase
    .from("articles")
    .select("*, profiles(full_name, avatar_url), article_categories(category_id), article_tags(tags(name, slug))", { count: "exact" });

  if (status) query = query.eq("status", status);
  // Category filtering via article_categories junction table
  if (category) {
    query = query.eq("article_categories.category_id", category);
  }
  if (author) query = query.eq("author_id", author);
  if (search) {
    query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%,excerpt.ilike.%${search}%`);
  }

  const offset = (page - 1) * limit;
  query = query
    .order(sort, { ascending: order === "asc" })
    .range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ articles: data, total: count, page, limit });
}

// POST /api/articles — create article
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const body = await request.json();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["superadmin", "editor", "author"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Generate slug from title
  const slug = body.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  // Check for duplicate slug
  const { data: existing } = await supabase
    .from("articles")
    .select("id")
    .eq("slug", slug)
    .single();

  const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

  // Validate categories (max 2 per article) BEFORE creating article
  if (body.categories && Array.isArray(body.categories) && body.categories.length > 2) {
    return NextResponse.json({ error: "Maximum 2 categories allowed per article" }, { status: 400 });
  }

  const article = {
    title: body.title,
    slug: finalSlug,
    content: body.content || "",
    excerpt: body.excerpt || "",
    featured_image: body.featured_image || null,
    featured_image_alt: body.featured_image_alt || null,
    featured_image_caption: body.featured_image_caption || null,
    author_id: user.id,
    status: body.status || "draft",
    published_at: body.status === "published" ? new Date().toISOString() : null,
    scheduled_at: body.scheduled_at || null,
    seo_title: body.seo_title || null,
    seo_description: body.seo_description || null,
    seo_keywords: body.seo_keywords || null,
    canonical_url: body.canonical_url || null,
    og_image: body.og_image || null,
    og_title: body.og_title || null,
    og_description: body.og_description || null,
    social_title: body.social_title || null,
    social_description: body.social_description || null,
    allow_indexing: body.allow_indexing !== false,
  };

  const { data, error } = await supabase
    .from("articles")
    .insert(article)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Handle tags
  if (body.tags && Array.isArray(body.tags) && data) {
    const tagRelations = body.tags.map((tagId: string) => ({
      article_id: data.id,
      tag_id: tagId,
    }));
    await supabase.from("article_tags").insert(tagRelations);
  }

  // Handle categories (max 2 per article)
  if (body.categories && Array.isArray(body.categories)) {
    // Insert category relations (already validated to be <= 2)
    const categoryRelations = body.categories.map((catId: string) => ({
      article_id: data.id,
      category_id: catId,
    }));
    await supabase.from("article_categories").insert(categoryRelations);
  }

  return NextResponse.json({ article: data }, { status: 201 });
}