import Link from "next/link";
import { getCategories, getPostsWithImages } from "@/lib/wp";
import ArticleCard from "@/components/ArticleCard";
import CategorySection from "@/components/CategorySection";

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
    return "";
  }
}

export default async function Home() {
  const categories = await getCategories();
  const bySlug: Record<string, (typeof categories)[number]> = {};
  categories.forEach((c) => (bySlug[c.slug] = c));

  // Show every category that actually has articles (skip empty / uncategorized).
  const homeCats = categories.filter(
    (c) => c.slug !== "uncategorized" && c.count > 0
  );

  const [latest, hot, trending, featured, latestList, ...sectionPosts] =
    await Promise.all([
      getPostsWithImages({ perPage: 5 }),
      getPostsWithImages({ perPage: 8 }),
      getPostsWithImages({ category: bySlug["trending-news"]?.id, perPage: 4 }),
      getPostsWithImages({ category: bySlug["featured"]?.id, perPage: 4 }),
      getPostsWithImages({ perPage: 8 }),
      ...homeCats.map((c) =>
        getPostsWithImages({ category: c.id, perPage: 3 })
      ),
    ]);

  const hero = latest[0];
  const leadList = latest.slice(1, 5);

  const catNameOf = (p: (typeof latest)[number]): string => {
    const id = p.categories?.[0];
    return (id && bySlugById(id)) || "";
  };
  const bySlugById = (id: number): string => {
    const c = categories.find((x) => x.id === id);
    return c?.name ?? "";
  };

  return (
    <div className="container">
      {/* Featured lead */}
      {hero && (
        <div className="lead-grid">
          <Link href={`/post/${hero.slug}`} className="lead">
            {hero.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={hero.image} alt={hero.imageAlt || ""} />
            )}
            <div className="lead-inner">
              <span className="cat">Featured</span>
              <h2>{hero.title.rendered}</h2>
              <p>{stripHtml(hero.excerpt.rendered).slice(0, 180)}</p>
            </div>
          </Link>

          <div className="lead-list">
            {leadList.map((p) => (
              <Link key={p.id} href={`/post/${p.slug}`} className="lead-item">
                <div className="thumb">
                  {p.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image} alt={p.imageAlt || ""} loading="lazy" />
                  )}
                </div>
                <div>
                  <span className="cat">{catNameOf(p)}</span>
                  <h4>{p.title.rendered}</h4>
                  <span className="meta">{formatDate(p.date)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="layout">
        <div>
          {homeCats.map((cat, i) => {
            const posts = sectionPosts[i] ?? [];
            if (!posts.length) return null;
            return (
              <CategorySection key={cat.id} category={cat} posts={posts} />
            );
          })}
        </div>

        <aside className="sidebar">
          <div className="panel">
            <h3>What&apos;s Hot</h3>
            <ul className="hot-list">
              {hot.map((p) => (
                <li key={p.id}>
                  <div className="t">
                    {p.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image} alt={p.imageAlt || ""} loading="lazy" />
                    )}
                  </div>
                  <Link href={`/post/${p.slug}`}>{p.title.rendered}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="panel">
            <h3>Trending News</h3>
            <div className="grid cols-2">
              {trending.map((p) => (
                <ArticleCard key={p.id} post={p} />
              ))}
            </div>
          </div>

          <div className="panel">
            <h3>Featured</h3>
            <ul className="hot-list">
              {featured.map((p) => (
                <li key={p.id}>
                  <div className="t">
                    {p.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image} alt={p.imageAlt || ""} loading="lazy" />
                    )}
                  </div>
                  <Link href={`/post/${p.slug}`}>{p.title.rendered}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="panel">
            <h3>Latest News</h3>
            <ul className="link-list">
              {latestList.map((p) => (
                <li key={p.id}>
                  <Link href={`/post/${p.slug}`}>{p.title.rendered}</Link>
                  <span className="meta">{formatDate(p.date)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="panel">
            <h3>Browse Topics</h3>
            <div className="tag-cloud">
              {categories
                .filter((c) => c.slug !== "uncategorized")
                .map((c) => (
                  <Link key={c.id} className="tag" href={`/category/${c.slug}`}>
                    {c.name}
                  </Link>
                ))}
            </div>
          </div>

          <div className="panel profile">
            <h3>About the Founder</h3>
            <div className="profile-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="profile-photo"
                src="/images/founder_portrait.jpg"
                alt="Abiodun Oladimeji Lasile"
              />
              <h4>Abiodun Oladimeji Lasile</h4>
              <span className="role">
                Founder/Coordinator, The SixthSense Initiative
              </span>
              <p className="bio">
                Kingmaker and Founder/Coordinator of The SixthSense Initiative
                and Sixth Sense Series Publications. Advocate against Lassa
                Fever and champion of children&apos;s reading culture.
              </p>
              <div className="pc-actions">
                <a className="call" href="tel:+2348037171759">
                  Call
                </a>
                <a className="wa" href="https://wa.me/2348027191291">
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <section className="newsletter">
        <h2>Subscribe to Updates</h2>
        <p>
          Get the latest creative news from Orunto Owu Abeokuta — tradition,
          culture, and the Yoruba world.
        </p>
        <form>
          <input type="email" placeholder="Enter your email" aria-label="Email" />
          <button type="button">Subscribe</button>
        </form>
      </section>
    </div>
  );
}
