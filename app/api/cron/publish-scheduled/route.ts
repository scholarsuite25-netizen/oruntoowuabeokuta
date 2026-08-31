import { createClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

// GET /api/cron/publish-scheduled — publish scheduled articles
// This endpoint should be called by a cron job (e.g., Vercel Cron, GitHub Actions, or external cron)
export async function GET() {
  const supabase = createClient();

  // Find articles that are scheduled and due for publishing
  const now = new Date().toISOString();

  const { data: scheduledArticles, error } = await supabase
    .from("articles")
    .select("id, title, slug, scheduled_at")
    .eq("status", "scheduled")
    .lte("scheduled_at", now);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!scheduledArticles || scheduledArticles.length === 0) {
    return NextResponse.json({
      message: "No articles to publish",
      published: 0,
    });
  }

  let publishedCount = 0;
  const errors: string[] = [];

  for (const article of scheduledArticles) {
    const { error: publishError } = await supabase
      .from("articles")
      .update({
        status: "published",
        published_at: article.scheduled_at || now,
        updated_at: now,
      })
      .eq("id", article.id);

    if (publishError) {
      errors.push(`Failed to publish "${article.title}": ${publishError.message}`);
    } else {
      publishedCount++;

      // Auto-post to social media
      const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://oruntoowuabeokuta.org.ng";
      const socialPlatforms: string[] = [];
      if (process.env.FACEBOOK_PAGE_TOKEN) socialPlatforms.push("facebook");
      if (process.env.TWITTER_BEARER_TOKEN) socialPlatforms.push("twitter");
      if (process.env.INSTAGRAM_ACCOUNT_ID) socialPlatforms.push("instagram");

      if (socialPlatforms.length > 0 && article.slug) {
        fetch(`${SITE_URL}/api/social`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: article.title,
            slug: article.slug,
            platforms: socialPlatforms,
          }),
        }).catch(() => {});
      }
    }
  }

  return NextResponse.json({
    message: `Published ${publishedCount} article(s)`,
    published: publishedCount,
    errors: errors.length > 0 ? errors : undefined,
  });
}
