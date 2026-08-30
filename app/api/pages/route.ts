import { createClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// GET /api/pages
export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  let query = supabase
    .from("pages")
    .select("*, profiles(full_name)", { count: "exact" });

  if (status) query = query.eq("status", status);
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

  return NextResponse.json({ pages: data, total: count, page, limit });
}

// POST /api/pages
export async function POST(request: NextRequest) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const slug = body.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  // Check for duplicate slug
  const { data: existing } = await supabase
    .from("pages")
    .select("id")
    .eq("slug", slug)
    .single();

  const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

  const pageData = {
    title: body.title,
    slug: finalSlug,
    content: body.content || "",
    excerpt: body.excerpt || "",
    featured_image: body.featured_image || null,
    author_id: user.id,
    status: body.status || "draft",
    seo_title: body.seo_title || null,
    seo_description: body.seo_description || null,
    published_at: body.status === "published" ? new Date().toISOString() : null,
  };

  const { data, error } = await supabase
    .from("pages")
    .insert(pageData)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ page: data }, { status: 201 });
}
