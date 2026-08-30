import { createClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM_EMAIL || "Orunto Owu <noreply@oruntoowuabeokuta.org.ng>";

async function sendWelcomeEmail(email: string, name?: string) {
  if (!RESEND_API_KEY) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [email],
        subject: "Welcome to Orunto Owu Abeokuta Newsletter",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #aa0000; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 22px;">Welcome to Orunto Owu!</h1>
            </div>
            <div style="background: #f9f9f9; padding: 30px; border: 1px solid #ddd;">
              <p>Dear <strong>${name || "Friend"}</strong>,</p>
              <p>Thank you for subscribing to the Orunto Owu Abeokuta newsletter. You will now receive updates on:</p>
              <ul>
                <li>Cultural events and festivals</li>
                <li>New articles about Owu heritage</li>
                <li>Community news and announcements</li>
                <li>Publications and educational content</li>
              </ul>
              <p>Explore our website to learn more about the Orunto tradition, Owu history, and the city of Abeokuta.</p>
              <p style="text-align: center; margin: 25px 0;">
                <a href="https://oruntoowuabeokuta.org.ng" style="background: #aa0000; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Visit Our Website</a>
              </p>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
              <p style="color: #666; font-size: 12px;">
                To unsubscribe, <a href="https://oruntoowuabeokuta.org.ng/unsubscribe?email=${encodeURIComponent(email)}">click here</a>.
              </p>
            </div>
          </div>
        `,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// GET /api/subscribers — list subscribers (admin only)
export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");

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

  const offset = (page - 1) * limit;
  const { data, count, error } = await supabase
    .from("subscribers")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ subscribers: data, total: count, page, limit });
}

// POST /api/subscribers — subscribe (public)
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const body = await request.json();

  if (!body.email?.trim()) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(body.email)) {
    return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("subscribers")
    .select("id, active")
    .eq("email", body.email.toLowerCase())
    .single();

  if (existing) {
    if (existing.active) {
      return NextResponse.json(
        { error: "This email is already subscribed" },
        { status: 409 }
      );
    }
    const { data, error } = await supabase
      .from("subscribers")
      .update({ active: true, updated_at: new Date().toISOString() })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ subscriber: data, message: "Welcome back!" });
  }

  const { data, error } = await supabase
    .from("subscribers")
    .insert({
      email: body.email.toLowerCase(),
      name: body.name?.trim() || null,
      active: true,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Send welcome email (non-blocking)
  sendWelcomeEmail(body.email, body.name).catch((err) =>
    console.error("Welcome email failed:", err)
  );

  return NextResponse.json({ subscriber: data }, { status: 201 });
}

// PUT /api/subscribers — unsubscribe (public)
export async function PUT(request: NextRequest) {
  const supabase = createClient();
  const body = await request.json();

  if (!body.email?.trim()) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("subscribers")
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq("email", body.email.toLowerCase())
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Email not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ message: "Successfully unsubscribed" });
}
