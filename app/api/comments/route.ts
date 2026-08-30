import { createClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// GET /api/comments — list comments (admin: all, public: approved only)
export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const articleId = searchParams.get("article_id");
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");

  // Check if admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("comments")
    .select("*, profiles(full_name, avatar_url), articles(title, slug)", {
      count: "exact",
    });

  // Non-admin only sees approved
  if (!user || status !== "all") {
    query = query.eq("status", "approved");
  } else if (status && status !== "all") {
    query = query.eq("status", status);
  }

  if (articleId) {
    query = query.eq("article_id", parseInt(articleId));
  }

  const offset = (page - 1) * limit;
  query = query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ comments: data, total: count, page, limit });
}

// POST /api/comments — post a comment (authenticated users only)
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const body = await request.json();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "You must be logged in to comment" },
      { status: 401 }
    );
  }

  if (!body.content?.trim()) {
    return NextResponse.json(
      { error: "Comment cannot be empty" },
      { status: 400 }
    );
  }

  if (!body.article_id) {
    return NextResponse.json(
      { error: "Article ID is required" },
      { status: 400 }
    );
  }

  // Check user profile exists
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json(
      { error: "User profile not found" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({
      article_id: body.article_id,
      user_id: user.id,
      content: body.content.trim(),
      status: "pending", // requires admin approval
    })
    .select("*, profiles(full_name, avatar_url)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ comment: data }, { status: 201 });
}

// PUT /api/comments — update comment status (admin only)
export async function PUT(request: NextRequest) {
  const supabase = createClient();
  const body = await request.json();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["superadmin", "editor"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!body.id || !body.status) {
    return NextResponse.json(
      { error: "ID and status are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("comments")
    .update({ status: body.status, updated_at: new Date().toISOString() })
    .eq("id", body.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ comment: data });
}

// DELETE /api/comments — delete comment (admin only)
export async function DELETE(request: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["superadmin", "editor"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  const { error } = await supabase.from("comments").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
