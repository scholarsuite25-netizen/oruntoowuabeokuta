import Link from "next/link";
import type { PostWithImage } from "@/lib/types";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
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

export default function ArticleCard({
  post,
  categoryName,
}: {
  post: PostWithImage;
  categoryName?: string;
}) {
  const title = post.title?.rendered ?? "";
  const excerpt = stripHtml(post.excerpt?.rendered).slice(0, 160);
  return (
    <Link href={`/post/${post.slug}`} className="card">
      <div className="thumb">
        {post.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.image} alt={post.imageAlt || title} loading="lazy" />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background:
                "linear-gradient(135deg,var(--red-deep),var(--gold))",
            }}
          />
        )}
      </div>
      <div className="body">
        {categoryName && <span className="cat">{categoryName}</span>}
        <h3>{title}</h3>
        <p className="excerpt">{excerpt}</p>
        <span className="meta">{formatDate(post.date)}</span>
      </div>
    </Link>
  );
}
