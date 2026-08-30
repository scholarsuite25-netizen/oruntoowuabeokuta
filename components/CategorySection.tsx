import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";
import type { WPCategory, PostWithImage } from "@/lib/types";

export default function CategorySection({
  category,
  posts,
}: {
  category: WPCategory;
  posts: PostWithImage[];
}) {
  if (!posts || posts.length === 0) return null;
  return (
    <section className="section">
      <div className="section-head">
        <h2>{category.name}</h2>
        <Link className="more" href={`/category/${category.slug}`}>
          View all
        </Link>
      </div>
      <div className="grid cols-3">
        {posts.map((p) => (
          <ArticleCard key={p.id} post={p} categoryName={category.name} />
        ))}
      </div>
    </section>
  );
}
