import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: { status?: string; search?: string };
}) {
  const supabase = createClient();
  const status = searchParams.status || "";
  const search = searchParams.search || "";

  let query = supabase
    .from("articles")
    .select("*, profiles(full_name), categories(name, slug)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (search) {
    query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
  }

  const { data: articles, count } = await query;

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h1>Articles</h1>
        <Link href="/admin/articles/new" className="btn-primary">
          + New Article
        </Link>
      </div>

      <div className="admin-filters">
        <div className="filter-group">
          <a href="/admin/articles" className={!status ? "active" : ""}>
            All
          </a>
          <a
            href="/admin/articles?status=draft"
            className={status === "draft" ? "active" : ""}
          >
            Draft
          </a>
          <a
            href="/admin/articles?status=published"
            className={status === "published" ? "active" : ""}
          >
            Published
          </a>
          <a
            href="/admin/articles?status=archived"
            className={status === "archived" ? "active" : ""}
          >
            Archived
          </a>
        </div>

        <form className="search-form">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search articles..."
          />
          {status && <input type="hidden" name="status" value={status} />}
          <button type="submit">Search</button>
        </form>
      </div>

      <div className="admin-info">
        {count ?? 0} article{(count ?? 0) !== 1 ? "s" : ""}
      </div>

      {articles && articles.length > 0 ? (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Author</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.id}>
                <td>
                  <strong>{article.title}</strong>
                </td>
                <td>{article.categories?.name || "-"}</td>
                <td>{article.profiles?.full_name || "-"}</td>
                <td>
                  <span className={`badge badge-${article.status}`}>
                    {article.status}
                  </span>
                </td>
                <td>
                  {new Date(article.created_at).toLocaleDateString("en-GB")}
                </td>
                <td>
                  <div className="action-links">
                    <Link href={`/admin/articles/${article.id}/edit`}>
                      Edit
                    </Link>
                    <Link href={`/post/${article.slug}`} target="_blank">
                      View
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="empty-state">
          No articles found.{" "}
          <Link href="/admin/articles/new">Create your first article</Link>.
        </div>
      )}
    </div>
  );
}
