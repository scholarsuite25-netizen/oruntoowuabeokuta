import { createClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// GET /api/media
export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");

  const offset = (page - 1) * limit;

  const { data, count, error } = await supabase
    .from("media")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ media: data, total: count, page, limit });
}

// POST /api/media — upload media
export async function POST(request: NextRequest) {
  const supabase = createClient();

  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ext = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const filePath = `media/${fileName}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("uploads")
    .upload(filePath, file);

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("uploads").getPublicUrl(filePath);

  // Save record
  const { data, error: dbError } = await supabase
    .from("media")
    .insert({
      file_name: file.name,
      file_path: filePath,
      file_url: publicUrl,
      file_type: file.type,
      file_size: file.size,
      uploaded_by: user.id,
    })
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ media: data }, { status: 201 });
}
