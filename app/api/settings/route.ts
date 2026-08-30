import { createClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// GET /api/settings
export async function GET() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value");

  if (error) {
    // If table doesn't exist, return defaults
    return NextResponse.json({
      settings: {
        site_title: "Orunto Owu Abeokuta",
        site_description: "Tradition, Culture & News",
        site_url: "https://oruntoowuabeokuta.org.ng",
      },
    });
  }

  const settings: Record<string, string> = {};
  if (data) {
    data.forEach((row) => {
      settings[row.key] = row.value;
    });
  }

  return NextResponse.json({ settings });
}

// POST /api/settings
export async function POST(request: NextRequest) {
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

  if (!profile || profile.role !== "superadmin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { settings } = body;

  if (!settings || typeof settings !== "object") {
    return NextResponse.json({ error: "Invalid settings" }, { status: 400 });
  }

  // Upsert each setting
  const rows = Object.entries(settings).map(([key, value]) => ({
    key,
    value: String(value),
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from("site_settings")
    .upsert(rows, { onConflict: "key" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
