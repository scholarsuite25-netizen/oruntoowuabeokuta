import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getPostsWithImages } from "@/lib/wp";
import ArticleCard from "@/components/ArticleCard";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { page?: string };
}) {
  const cat = await getCategoryBySlug(params.slug);
  if (!cat) notFound();

  const page = Math.max(1, Number(searchParams?.page ?? "1") || 1);
  const perPage = 12;
  const posts = await getPostsWithImages({
    category: cat.id,
    perPage,
    page,
  });

  return (
    <div className="container">
      <section className="section">
        <div className="section-head">
          <h2>{cat.name}</h2>
          <span className="more">{cat.count} articles</span>
        </div>
        <div className="grid cols-3">
          {posts.map((p) => (
            <ArticleCard key={p.id} post={p} categoryName={cat.name} />
          ))}
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "center",
            margin: "28px 0",
          }}
        >
          {page > 1 && (
            <Link className="btn ghost" href={`/category/${cat.slug}?page=${page - 1}`}>
              ← Previous
            </Link>
          )}
          {posts.length === perPage && (
            <Link className="btn" href={`/category/${cat.slug}?page=${page + 1}`}>
              Next →
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
