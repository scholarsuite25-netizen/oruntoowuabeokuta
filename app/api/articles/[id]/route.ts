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
    .select("*, profiles(full_name, avatar_url, bio), categories(name, slug), article_tags(tags(id, name, slug))")
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

  if (!profile || !["superadmin", "editor", "author"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Authors can only edit their own articles
  if (profile.role === "author") {
    const { data: existing } = await supabase
      .from("articles")
      .select("author_id")
      .eq("id", params.id)
      .single();

    if (existing && existing.author_id !== user.id) {
      return NextResponse.json({ error: "Forbidden: can only edit your own articles" }, { status: 403 });
    }
  }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (body.title !== undefined) {
    updates.title = body.title;
    updates.slug = body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }
  if (body.content !== undefined) updates.content = body.content;
  if (body.excerpt !== undefined) updates.excerpt = body.excerpt;
  if (body.featured_image !== undefined) updates.featured_image = body.featured_image;
  if (body.featured_image_alt !== undefined) updates.featured_image_alt = body.featured_image_alt;
  if (body.featured_image_caption !== undefined) updates.featured_image_caption = body.featured_image_caption;
  if (body.category_id !== undefined) updates.category_id = body.category_id || null;
  if (body.status !== undefined) updates.status = body.status;
  if (body.scheduled_at !== undefined) updates.scheduled_at = body.scheduled_at;
  if (body.seo_title !== undefined) updates.seo_title = body.seo_title;
  if (body.seo_description !== undefined) updates.seo_description = body.seo_description;
  if (body.seo_keywords !== undefined) updates.seo_keywords = body.seo_keywords;
  if (body.canonical_url !== undefined) updates.canonical_url = body.canonical_url;
  if (body.og_image !== undefined) updates.og_image = body.og_image;
  if (body.og_title !== undefined) updates.og_title = body.og_title;
  if (body.og_description !== undefined) updates.og_description = body.og_description;
  if (body.social_title !== undefined) updates.social_title = body.social_title;
  if (body.social_description !== undefined) updates.social_description = body.social_description;
  if (body.allow_indexing !== undefined) updates.allow_indexing = body.allow_indexing;

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

  // Save revision when content or title changes
  if (body.title !== undefined || body.content !== undefined) {
    await supabase.from("revisions").insert({
      article_id: params.id,
      title: body.title || data?.title,
      content: body.content || data?.content,
      excerpt: body.excerpt || data?.excerpt,
      author_id: user.id,
    });
  }

  // Handle tags
  if (body.tags && Array.isArray(body.tags)) {
    // Delete existing tag relations
    await supabase.from("article_tags").delete().eq("article_id", params.id);
    // Insert new tag relations
    if (body.tags.length > 0) {
      const tagRelations = body.tags.map((tagId: string) => ({
        article_id: params.id,
        tag_id: tagId,
      }));
      await supabase.from("article_tags").insert(tagRelations);
    }
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

  // Delete tag relations first
  await supabase.from("article_tags").delete().eq("article_id", params.id);

  const { error } = await supabase.from("articles").delete().eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
