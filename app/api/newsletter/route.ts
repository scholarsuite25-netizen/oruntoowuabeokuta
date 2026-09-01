import { createClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const getResend = () => new Resend(process.env.RESEND_API_KEY || "re_placeholder_for_build");
const FROM_EMAIL = process.env.FROM_EMAIL || "newsletter@oruntoowuabeokuta.org.ng";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://oruntoowuabeokuta.org.ng";

// POST /api/newsletter — send newsletter to all active subscribers
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const body = await request.json();

  // Auth check
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

  if (!body.subject?.trim() || !body.content?.trim()) {
    return NextResponse.json(
      { error: "Subject and content are required" },
      { status: 400 }
    );
  }

  // Get active subscribers
  const { data: subscribers, error: subError } = await supabase
    .from("subscribers")
    .select("email, name")
    .eq("active", true);

  if (subError) {
    return NextResponse.json({ error: subError.message }, { status: 500 });
  }

  if (!subscribers || subscribers.length === 0) {
    return NextResponse.json(
      { error: "No active subscribers" },
      { status: 400 }
    );
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      {
        error:
          "Resend API key not configured. Add RESEND_API_KEY to .env.local",
      },
      { status: 500 }
    );
  }

  // Build email HTML
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f6f8fa; }
        .container { max-width: 600px; margin: 0 auto; background: #fff; }
        .header { background: #aa0000; padding: 32px 24px; text-align: center; }
        .header h1 { color: #fff; font-size: 22px; margin: 0; }
        .content { padding: 32px 24px; color: #333; line-height: 1.7; }
        .content h2 { color: #0c0c0c; font-size: 20px; margin-top: 0; }
        .btn { display: inline-block; background: #aa0000; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; margin: 16px 0; }
        .footer { padding: 24px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; }
        .footer a { color: #aa0000; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Orunto Owu Abeokuta</h1>
        </div>
        <div class="content">
          <h2>${body.subject}</h2>
          ${body.content}
        </div>
        <div class="footer">
          <p>You're receiving this because you subscribed to Orunto Owu Abeokuta newsletter.</p>
          <p><a href="${SITE_URL}/unsubscribe">Unsubscribe</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  const resend = getResend();
  // Send in batches (Resend limit: 500 per batch for free tier)
  const batchSize = 100;
  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (let i = 0; i < subscribers.length; i += batchSize) {
    const batch = subscribers.slice(i, i + batchSize);

    const results = await Promise.allSettled(
      batch.map((sub) =>
        resend.emails.send({
          from: `Orunto Owu Abeokuta <${FROM_EMAIL}>`,
          to: sub.email,
          subject: body.subject,
          html: htmlContent,
        })
      )
    );

    results.forEach((result, idx) => {
      if (result.status === "fulfilled") {
        sent++;
      } else {
        failed++;
        errors.push(`${batch[idx].email}: ${result.reason}`);
      }
    });
  }

  // Log newsletter
  await supabase.from("email_log").insert({
    subject: body.subject,
    content: body.content,
    sent_count: sent,
    failed_count: failed,
    sent_by: user.id,
  });

  return NextResponse.json({
    message: `Newsletter sent: ${sent} delivered, ${failed} failed`,
    sent,
    failed,
    errors: errors.length > 0 ? errors.slice(0, 5) : undefined,
  });
}
