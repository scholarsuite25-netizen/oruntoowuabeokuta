import { NextRequest, NextResponse } from "next/server";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM_EMAIL || "Orunto Owu <noreply@oruntoowuabeokuta.org.ng>";
const ADMIN_EMAIL = "info@oruntoowuabeokuta.org.ng";

interface JoinPayload {
  form_type: "member" | "volunteer" | "partner";
  full_name: string;
  email: string;
  phone?: string;
  location?: string;
  message?: string;
}

const FORM_LABELS: Record<string, string> = {
  member: "Membership Application",
  volunteer: "Volunteer Application",
  partner: "Partnership Inquiry",
};

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY not configured");
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [to],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend error:", err);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Email send error:", err);
    return false;
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { form_type, full_name, email, phone, location, message } = body as JoinPayload;

  if (!full_name?.trim() || !email?.trim()) {
    return NextResponse.json(
      { error: "Name and email are required." },
      { status: 400 }
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  const formLabel = FORM_LABELS[form_type] || "Form Submission";

  // 1. Send confirmation to user
  const userSubject = `${formLabel} — Orunto Owu Abeokuta`;
  const userHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #aa0000; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 22px;">Orunto Owu Abeokuta</h1>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border: 1px solid #ddd;">
        <h2 style="color: #333; margin-top: 0;">${formLabel} Received</h2>
        <p>Dear <strong>${full_name}</strong>,</p>
        <p>Thank you for your interest in ${formLabel.toLowerCase()} with Orunto Owu Abeokuta. We have received your application and will review it shortly.</p>
        <p><strong>What happens next:</strong></p>
        <ul>
          <li>Our team will review your application within 3-5 business days</li>
          <li>We will contact you via email or phone to discuss next steps</li>
          <li>You will receive updates about upcoming events and activities</li>
        </ul>
        <p>If you have any questions, please contact us at <a href="mailto:info@oruntoowuabeokuta.org.ng">info@oruntoowuabeokuta.org.ng</a> or call <a href="tel:+2348037171759">+234 803 717 1759</a>.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
        <p style="color: #666; font-size: 12px;">
          Orunto Owu Abeokuta — Tradition · Culture · News<br/>
          Agbole Orunto, Oke Ago-Owu, Abeokuta, Ogun State, Nigeria
        </p>
      </div>
    </div>
  `;

  // 2. Send notification to admin
  const adminSubject = `New ${formLabel}: ${full_name}`;
  const adminHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #0c0c0c; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 20px;">New ${formLabel}</h1>
      </div>
      <div style="background: #fff; padding: 30px; border: 1px solid #ddd;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Name:</td><td style="padding: 8px 0;">${full_name}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Email:</td><td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Phone:</td><td style="padding: 8px 0;">${phone || "Not provided"}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Location:</td><td style="padding: 8px 0;">${location || "Not provided"}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Type:</td><td style="padding: 8px 0;">${formLabel}</td></tr>
          ${message ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #555; vertical-align: top;">Message:</td><td style="padding: 8px 0;">${message}</td></tr>` : ""}
        </table>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">Submitted via oruntoowuabeokuta.org.ng</p>
      </div>
    </div>
  `;

  const [userSent, adminSent] = await Promise.all([
    sendEmail(email, userSubject, userHtml),
    sendEmail(ADMIN_EMAIL, adminSubject, adminHtml),
  ]);

  return NextResponse.json({
    success: true,
    message: "Your application has been submitted successfully.",
    email_sent: userSent,
    admin_notified: adminSent,
  });
}
