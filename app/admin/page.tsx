import { createClient } from "@/lib/supabase";

export default async function AdminDashboard() {
  const supabase = createClient();

  // Fetch stats
  const [
    { count: articleCount },
    { count: subscriberCount },
    { count: categoryCount },
    { count: commentCount },
    { data: viewsData },
  ] = await Promise.all([
    supabase.from("articles").select("*", { count: "exact", head: true }),
    supabase.from("subscribers").select("*", { count: "exact", head: true }).eq("active", true),
    supabase.from("categories").select("*", { count: "exact", head: true }),
    supabase.from("comments").select("*", { count: "exact", head: true }),
    supabase.from("articles").select("view_count"),
  ]);
  const totalViews = (viewsData || []).reduce((s: number, r: any) => s + (r.view_count || 0), 0);

  // Recent articles
  const { data: recentArticles } = await supabase
    .from("articles")
    .select("id, title, status, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="admin-content">
      <h1>Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-number">{articleCount ?? 0}</span>
          <span className="stat-label">Articles</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{totalViews}</span>
          <span className="stat-label">Total Reads</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{subscriberCount ?? 0}</span>
          <span className="stat-label">Subscribers</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{categoryCount ?? 0}</span>
          <span className="stat-label">Categories</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{commentCount ?? 0}</span>
          <span className="stat-label">Comments</span>
        </div>
      </div>

      <div className="recent-section">
        <h2>Recent Articles</h2>
        {recentArticles && recentArticles.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentArticles.map((article) => (
                <tr key={article.id}>
                  <td>{article.title}</td>
                  <td>
                    <span className={`badge badge-${article.status}`}>
                      {article.status}
                    </span>
                  </td>
                  <td>
                    {new Date(article.created_at).toLocaleDateString("en-GB")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="empty-state">
            No articles yet.{" "}
            <a href="/admin/articles/new">Create your first article</a>.
          </p>
        )}
      </div>
    </div>
  );
}
