import { createClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://oruntoowuabeokuta.org.ng";

// POST /api/social — auto-post to social media
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

  const { title, slug, excerpt, platforms } = body;
  const articleUrl = `${SITE_URL}/post/${slug}`;
  const text = excerpt
    ? `${title}\n\n${excerpt}\n\nRead more: ${articleUrl}`
    : `${title}\n\nRead more: ${articleUrl}`;

  const results: Record<string, { ok: boolean; error?: string }> = {};

  // Facebook
  if (platforms?.includes("facebook") && process.env.FACEBOOK_PAGE_TOKEN) {
    try {
      const res = await fetch(
        `https://graph.facebook.com/v19.0/me/feed`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            access_token: process.env.FACEBOOK_PAGE_TOKEN,
          }),
        }
      );
      const data = await res.json();
      results.facebook = res.ok
        ? { ok: true }
        : { ok: false, error: data.error?.message || "Failed" };
    } catch (e) {
      results.facebook = { ok: false, error: "Connection error" };
    }
  }

  // X (Twitter)
  if (platforms?.includes("twitter") && process.env.TWITTER_BEARER_TOKEN) {
    try {
      // OAuth 2.0 tweet creation
      const res = await fetch("https://api.twitter.com/2/tweets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
        },
        body: JSON.stringify({
          text: text.length > 280 ? text.slice(0, 277) + "..." : text,
        }),
      });
      const data = await res.json();
      results.twitter = res.ok
        ? { ok: true }
        : { ok: false, error: data.errors?.[0]?.message || "Failed" };
    } catch (e) {
      results.twitter = { ok: false, error: "Connection error" };
    }
  }

  // Instagram (requires Facebook Graph API business account)
  if (platforms?.includes("instagram") && process.env.INSTAGRAM_ACCOUNT_ID && process.env.FACEBOOK_PAGE_TOKEN) {
    try {
      // Instagram requires a media container first, then publish
      // Step 1: Create media container
      const containerRes = await fetch(
        `https://graph.facebook.com/v19.0/${process.env.INSTAGRAM_ACCOUNT_ID}/media`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            caption: text.length > 2200 ? text.slice(0, 2197) + "..." : text,
            image_url: body.image_url || `${SITE_URL}/images/logo.png`,
            access_token: process.env.FACEBOOK_PAGE_TOKEN,
          }),
        }
      );
      const container = await containerRes.json();

      if (container.id) {
        // Step 2: Publish
        const pubRes = await fetch(
          `https://graph.facebook.com/v19.0/${process.env.INSTAGRAM_ACCOUNT_ID}/media_publish`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              creation_id: container.id,
              access_token: process.env.FACEBOOK_PAGE_TOKEN,
            }),
          }
        );
        const pub = await pubRes.json();
        results.instagram = pubRes.ok
          ? { ok: true }
          : { ok: false, error: pub.error?.message || "Failed" };
      } else {
        results.instagram = {
          ok: false,
          error: container.error?.message || "Container creation failed",
        };
      }
    } catch (e) {
      results.instagram = { ok: false, error: "Connection error" };
    }
  }

  // Log social posts
  for (const [platform, result] of Object.entries(results)) {
    await supabase.from("social_posts").insert({
      platform,
      article_url: articleUrl,
      content: text,
      status: result.ok ? "posted" : "failed",
      error_message: result.error || null,
      posted_by: user.id,
    });
  }

  return NextResponse.json({ results });
}
