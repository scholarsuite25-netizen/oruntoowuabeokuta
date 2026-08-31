import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getPostBySlug,
  attachImages,
  getCategories,
  getPostsWithImages,
  rewriteContentImages,
} from "@/lib/wp";
import { calculateReadingTime } from "@/lib/reading-time";
import ArticleCard from "@/components/ArticleCard";
import CommentsSection from "@/components/CommentsSection";
import ShareButtons from "@/components/ShareButtons";
import ViewTracker from "@/components/ViewTracker";
import ViewCount from "@/components/ViewCount";
import AudioReader from "@/components/AudioReader";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://oruntoowuabeokuta.org.ng";

function stripSrcset(html: string): string {
  return html.replace(/\ssrcset="[^"]*"/g, "");
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function stripHtml(html?: string): string {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, "").trim();
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) return { title: "Article Not Found" };

  const [withImg] = await Promise.all([attachImages([post]).then((r) => r[0])]);

  const title = post.title.rendered;
  const description = stripHtml(post.excerpt.rendered).slice(0, 160);
  const url = `${SITE_URL}/post/${post.slug}`;
  const image = withImg.image ? `${SITE_URL}${withImg.image}` : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "Orunto Owu Abeokuta",
      images: image ? [{ url: image, width: 1200, height: 630 }] : [],
      locale: "en_US",
      type: "article",
      publishedTime: post.date,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();

  const [withImg, categories] = await Promise.all([
    attachImages([post]).then((r) => r[0]),
    getCategories(),
  ]);
  const catMap: Record<number, string> = {};
  categories.forEach((c) => (catMap[c.id] = c.name));
  const catNames = post.categories.map((id) => catMap[id]).filter(Boolean);

  const related = post.categories[0]
    ? await getPostsWithImages({ category: post.categories[0], perPage: 4 })
    : [];
  const relatedFiltered = related
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);

  const contentHtml = stripSrcset(rewriteContentImages(post.content.rendered));
  const readTime = calculateReadingTime(post.content.rendered);

  // Check if first image in content matches the featured image
  const firstImgMatch = contentHtml.match(/<img\s[^>]*src="([^"]*)"[^>]*\/?>/i);
  const hasFeaturedInContent = firstImgMatch && withImg.image &&
    firstImgMatch[1].includes(withImg.image.split("/").pop() || "");

  const url = `${SITE_URL}/post/${post.slug}`;
  const image = withImg.image ? `${SITE_URL}${withImg.image}` : undefined;

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title.rendered,
    description: stripHtml(post.excerpt.rendered).slice(0, 300),
    image: image ? [image] : undefined,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Organization",
      name: "Orunto Owu Abeokuta",
    },
    publisher: {
      "@type": "Organization",
      name: "Orunto Owu Abeokuta",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ViewTracker slug={post.slug} articleId={String(post.id)} />
      <div className="container">
        <article className="article">
          <span className="cat">{catNames.join(" · ")}</span>
          <h1>{post.title.rendered}</h1>
          <div className="meta">
            {formatDate(post.date)} &middot; {readTime} min read &middot; <ViewCount slug={post.slug} />
          </div>
          <AudioReader text={stripHtml(post.content.rendered)} title={post.title.rendered} />
          {withImg.image && !hasFeaturedInContent && (
            <div className="article-featured">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={withImg.image}
                alt={withImg.imageAlt || post.title.rendered}
              />
            </div>
          )}
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
          <ShareButtons title={post.title.rendered} slug={post.slug} />
        </article>

        <CommentsSection articleId={post.id} />

        {relatedFiltered.length > 0 && (
          <section className="section">
            <div className="section-head">
              <h2>Related</h2>
            </div>
            <div className="grid cols-3">
              {relatedFiltered.map((p) => (
                <ArticleCard key={p.id} post={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
