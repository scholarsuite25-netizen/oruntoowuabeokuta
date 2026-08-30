import { createClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// GET /api/categories
export async function GET() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ categories: data });
}

// POST /api/categories
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const body = await request.json();

  const slug = body.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const { data, error } = await supabase
    .from("categories")
    .insert({
      name: body.name,
      slug,
      description: body.description || "",
      parent_id: body.parent_id || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ category: data }, { status: 201 });
}
