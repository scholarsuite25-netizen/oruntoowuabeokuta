import { createClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// GET /api/articles — list articles
export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);

  const status = searchParams.get("status");
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  let query = supabase
    .from("articles")
    .select("*, profiles(full_name), categories(name, slug)", { count: "exact" });

  if (status) query = query.eq("status", status);
  if (category) query = query.eq("category_id", parseInt(category));
  if (search) {
    query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
  }

  const offset = (page - 1) * limit;
  query = query
    .order("created_at", { ascending: false })
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

  // Generate slug from title
  const slug = body.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const article = {
    title: body.title,
    slug,
    content: body.content || "",
    excerpt: body.excerpt || "",
    featured_image: body.featured_image || null,
    author_id: user.id,
    category_id: body.category_id || null,
    status: body.status || "draft",
    published_at:
      body.status === "published" ? new Date().toISOString() : null,
  };

  const { data, error } = await supabase
    .from("articles")
    .insert(article)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ article: data }, { status: 201 });
}
