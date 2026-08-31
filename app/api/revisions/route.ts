import { createClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// GET /api/revisions?article_id=xxx
export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const articleId = searchParams.get("article_id");

  if (!articleId) {
    return NextResponse.json({ error: "article_id required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("revisions")
    .select("*, profiles(full_name)")
    .eq("article_id", articleId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ revisions: data });
}

// POST /api/revisions — save a revision
export async function POST(request: NextRequest) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const { data, error } = await supabase
    .from("revisions")
    .insert({
      article_id: body.article_id,
      title: body.title,
      content: body.content,
      excerpt: body.excerpt || null,
      author_id: user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ revision: data }, { status: 201 });
}
