import Link from "next/link";
import { getPostsWithImages } from "@/lib/wp";
import ArticleCard from "@/components/ArticleCard";

export const metadata = { title: "Search | Orunto Owu Abeokuta" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = (searchParams.q ?? "").trim();
  let posts: Awaited<ReturnType<typeof getPostsWithImages>> = [];
  if (q) {
    posts = await getPostsWithImages({ search: q, perPage: 24 });
  }

  return (
    <div className="container">
      <div style={{ margin: "26px auto" }}>
        <h1 style={{ textTransform: "uppercase", letterSpacing: ".5px" }}>
          Search
        </h1>
        <form className="searchbar" action="/search" method="get">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search articles, people, culture..."
            aria-label="Search"
          />
          <button type="submit">Search</button>
        </form>
      </div>

      {q && (
        <p style={{ color: "var(--muted)" }}>
          {posts.length} result{posts.length === 1 ? "" : "s"} for “{q}”
        </p>
      )}

      {q && posts.length > 0 ? (
        <div className="grid cols-4" style={{ marginBottom: 40 }}>
          {posts.map((p) => (
            <ArticleCard key={p.id} post={p} />
          ))}
        </div>
      ) : (
        q && (
          <p style={{ marginBottom: 40 }}>
            No results found. Try another keyword.
          </p>
        )
      )}

      {!q && (
        <p style={{ color: "var(--muted)", marginBottom: 40 }}>
          Enter a keyword above to search across all articles and categories.
        </p>
      )}
    </div>
  );
}
