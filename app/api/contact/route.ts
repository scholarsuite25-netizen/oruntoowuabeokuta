import { NextRequest, NextResponse } from "next/server";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM_EMAIL || "Orunto Owu <noreply@oruntoowuabeokuta.org.ng>";
const ADMIN_EMAIL = "info@oruntoowuabeokuta.org.ng";

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: RESEND_FROM, to: [to], subject, html }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email, subject, message } = body;

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json(
      { error: "Name, email, and message are required." },
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

  // Send confirmation to user
  const userHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #aa0000; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 22px;">Orunto Owu Abeokuta</h1>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border: 1px solid #ddd;">
        <h2 style="color: #333;">Message Received</h2>
        <p>Dear <strong>${name}</strong>,</p>
        <p>Thank you for contacting us. We have received your message and will respond within 24-48 hours.</p>
        <p><strong>Your message:</strong></p>
        <blockquote style="background: #fff; padding: 15px; border-left: 4px solid #aa0000; margin: 15px 0;">${message}</blockquote>
        <p>If you need immediate assistance, call us at <a href="tel:+2348037171759">+234 803 717 1759</a>.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
        <p style="color: #666; font-size: 12px;">Orunto Owu Abeokuta — Tradition · Culture · News</p>
      </div>
    </div>
  `;

  // Send to admin
  const adminHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0c0c0c; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 20px;">New Contact Message</h1>
      </div>
      <div style="background: #fff; padding: 30px; border: 1px solid #ddd;">
        <p><strong>From:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Subject:</strong> ${subject || "General Inquiry"}</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;" />
        <p>${message}</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;" />
        <p style="color: #999; font-size: 12px;">Sent via oruntoowuabeokuta.org.ng contact form</p>
      </div>
    </div>
  `;

  await Promise.all([
    sendEmail(email, "We received your message — Orunto Owu Abeokuta", userHtml),
    sendEmail(ADMIN_EMAIL, `Contact from ${name}: ${subject || "General"}`, adminHtml),
  ]);

  return NextResponse.json({ success: true, message: "Message sent successfully." });
}
