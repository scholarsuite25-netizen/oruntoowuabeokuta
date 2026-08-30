import { createClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// GET /api/pages/:id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("pages")
    .select("*, profiles(full_name)")
    .eq("id", params.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json({ page: data });
}

// PUT /api/pages/:id
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (body.title !== undefined) {
    updates.title = body.title;
    updates.slug = body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }
  if (body.content !== undefined) updates.content = body.content;
  if (body.excerpt !== undefined) updates.excerpt = body.excerpt;
  if (body.featured_image !== undefined) updates.featured_image = body.featured_image;
  if (body.status !== undefined) updates.status = body.status;
  if (body.seo_title !== undefined) updates.seo_title = body.seo_title;
  if (body.seo_description !== undefined) updates.seo_description = body.seo_description;

  if (body.status === "published") {
    updates.published_at = body.published_at || new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("pages")
    .update(updates)
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ page: data });
}

// DELETE /api/pages/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase.from("pages").delete().eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
