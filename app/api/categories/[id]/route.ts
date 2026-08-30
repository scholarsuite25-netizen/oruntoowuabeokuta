import { createClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// GET /api/categories/:id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json({ category: data });
}

// PUT /api/categories/:id
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const body = await request.json();

  const updates: Record<string, unknown> = {
    name: body.name,
    description: body.description || "",
    updated_at: new Date().toISOString(),
  };

  if (body.name) {
    updates.slug = body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  if (body.parent_id !== undefined) {
    updates.parent_id = body.parent_id || null;
  }

  if (body.sort_order !== undefined) {
    updates.sort_order = body.sort_order;
  }

  const { data, error } = await supabase
    .from("categories")
    .update(updates)
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ category: data });
}

// DELETE /api/categories/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();

  // Check if category has articles
  const { count } = await supabase
    .from("articles")
    .select("id", { count: "exact", head: true })
    .eq("category_id", params.id);

  if (count && count > 0) {
    return NextResponse.json(
      { error: `Cannot delete: ${count} articles use this category` },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
