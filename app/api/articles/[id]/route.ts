import { createClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://oruntoowuabeokuta.org.ng";

// GET /api/articles/:id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("articles")
    .select("*, profiles(full_name), categories(name, slug)")
    .eq("id", params.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json({ article: data });
}

// PUT /api/articles/:id
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const body = await request.json();

  const updates: Record<string, unknown> = {
    title: body.title,
    content: body.content,
    excerpt: body.excerpt,
    featured_image: body.featured_image,
    category_id: body.category_id,
    status: body.status,
    updated_at: new Date().toISOString(),
  };

  // Update slug if title changed
  if (body.title) {
    updates.slug = body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  // Set published_at when publishing
  if (body.status === "published") {
    updates.published_at = body.published_at || new Date().toISOString();
  }

  // Handle scheduled publishing
  if (body.status === "scheduled" && body.scheduled_at) {
    updates.published_at = body.scheduled_at;
  }

  const { data, error } = await supabase
    .from("articles")
    .update(updates)
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Auto-post to social media when publishing for the first time
  if (
    body.status === "published" &&
    body.socialAutoPost &&
    data?.slug
  ) {
    const articleUrl = `${SITE_URL}/post/${data.slug}`;
    const text = body.excerpt
      ? `${body.title}\n\n${body.excerpt}\n\nRead more: ${articleUrl}`
      : `${body.title}\n\nRead more: ${articleUrl}`;

    // Fire-and-forget social posts (don't block the response)
    const socialPlatforms: string[] = [];
    if (process.env.FACEBOOK_PAGE_TOKEN) socialPlatforms.push("facebook");
    if (process.env.TWITTER_BEARER_TOKEN) socialPlatforms.push("twitter");
    if (process.env.INSTAGRAM_ACCOUNT_ID) socialPlatforms.push("instagram");

    if (socialPlatforms.length > 0) {
      fetch(`${SITE_URL}/api/social`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: body.title,
          slug: data.slug,
          excerpt: body.excerpt,
          platforms: socialPlatforms,
          image_url: body.featured_image,
        }),
      }).catch(() => {});
    }
  }

  return NextResponse.json({ article: data });
}

// DELETE /api/articles/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();

  const { error } = await supabase.from("articles").delete().eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
