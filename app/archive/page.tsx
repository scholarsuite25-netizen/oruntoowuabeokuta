import Link from "next/link";
import {
  getPostsWithImages,
  getCategories,
  rewriteContentImages,
} from "@/lib/wp";

function stripHtml(html?: string): string {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, "").trim();
}
function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}
function getMonthYear(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export const revalidate = 3600;

export const metadata = {
  title: "Archive – Orinto Owu Abeokuta",
  description: "Browse all articles on Orinto Owu Abeokuta.",
};

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: { month?: string; cat?: string; page?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const perPage = 20;
  const category = searchParams.cat ? Number(searchParams.cat) : undefined;

  const [allPosts, categories] = await Promise.all([
    getPostsWithImages({ perPage: 500 }),
    getCategories(),
  ]);

  let filtered = allPosts;
  if (category) {
    filtered = filtered.filter((p) => p.categories?.includes(category));
  }

  // Group by month
  const monthGroups = new Map<string, typeof allPosts>();
  filtered.forEach((p) => {
    const month = getMonthYear(p.date);
    if (month) {
      if (!monthGroups.has(month)) monthGroups.set(month, []);
      monthGroups.get(month)!.push(p);
    }
  });

  const months = Array.from(monthGroups.entries()).sort((a, b) =>
    b[0].localeCompare(a[0])
  );

  // Pagination
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="container">
      <div className="page-header">
        <h1>Archive</h1>
        <p className="page-sub">
          Browse all {filtered.length} articles
          {category &&
            ` in ${categories.find((c) => c.id === category)?.name || ""}`}
        </p>
      </div>

      {/* Category Filter */}
      <div className="archive-filters">
        <Link
          href="/archive"
          className={`archive-filter ${!category ? "active" : ""}`}
        >
          All
        </Link>
        {categories.slice(0, 15).map((cat) => (
          <Link
            key={cat.id}
            href={`/archive?cat=${cat.id}`}
            className={`archive-filter ${category === cat.id ? "active" : ""}`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Month Groups */}
      <div className="archive-grid">
        {months.map(([month, posts]) => (
          <div key={month} className="archive-month">
            <h2 className="archive-month-title">
              {month}{" "}
              <span className="archive-month-count">
                ({posts.length} articles)
              </span>
            </h2>
            <div className="archive-month-posts">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/post/${post.slug}`}
                  className="archive-post"
                >
                  {post.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.image}
                      alt={post.imageAlt || ""}
                      className="archive-post-img"
                      loading="lazy"
                    />
                  )}
                  <div className="archive-post-content">
                    <h3>{post.title.rendered}</h3>
                    <p>{stripHtml(post.excerpt.rendered).slice(0, 120)}</p>
                    <span className="archive-post-date">
                      {formatDate(post.date)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          {page > 1 && (
            <Link
              href={`/archive?page=${page - 1}${category ? `&cat=${category}` : ""}`}
              className="pagination-link"
            >
              ← Previous
            </Link>
          )}
          <span className="pagination-info">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/archive?page=${page + 1}${category ? `&cat=${category}` : ""}`}
              className="pagination-link"
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
