import { createClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// DELETE /api/media/:id
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["superadmin", "editor"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get the media record to find the file path
  const { data: media, error: fetchError } = await supabase
    .from("media")
    .select("file_path")
    .eq("id", params.id)
    .single();

  if (fetchError || !media) {
    return NextResponse.json({ error: "Media not found" }, { status: 404 });
  }

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from("uploads")
    .remove([media.file_path]);

  if (storageError) {
    console.error("Storage delete error:", storageError);
  }

  // Delete from database
  const { error } = await supabase.from("media").delete().eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// PUT /api/media/:id — update metadata
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

  const updates: Record<string, unknown> = {};
  if (body.alt_text !== undefined) updates.alt_text = body.alt_text;
  if (body.caption !== undefined) updates.caption = body.caption;
  if (body.credit !== undefined) updates.credit = body.credit;

  const { data, error } = await supabase
    .from("media")
    .update(updates)
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ media: data });
}
