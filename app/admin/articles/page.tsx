"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Article {
  id: string;
  title: string;
  slug: string;
  status: string;
  profiles?: { full_name: string };
  categories?: { name: string };
  created_at: string;
  featured_image?: string;
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState("");
  const limit = 20;

  useEffect(() => {
    fetchArticles();
  }, [statusFilter, page]);

  async function fetchArticles() {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (statusFilter) params.set("status", statusFilter);
    if (search) params.set("search", search);

    const res = await fetch(`/api/articles?${params.toString()}`);
    const data = await res.json();
    setArticles(data.articles || []);
    setTotal(data.total || 0);
    setLoading(false);
  }

  async function handleBulkAction() {
    if (!bulkAction || selected.length === 0) return;

    if (!confirm(`${bulkAction} ${selected.length} article(s)?`)) return;

    for (const id of selected) {
      const updates: Record<string, unknown> = {};

      if (bulkAction === "publish") {
        updates.status = "published";
      } else if (bulkAction === "draft") {
        updates.status = "draft";
      } else if (bulkAction === "trash") {
        updates.status = "trash";
      } else if (bulkAction === "delete") {
        await fetch(`/api/articles/${id}`, { method: "DELETE" });
        continue;
      }

      if (Object.keys(updates).length > 0) {
        await fetch(`/api/articles/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
      }
    }

    setSelected([]);
    setBulkAction("");
    fetchArticles();
  }

  function toggleSelect(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  function toggleSelectAll() {
    if (selected.length === articles.length) {
      setSelected([]);
    } else {
      setSelected(articles.map((a) => a.id));
    }
  }

  const totalPages = Math.ceil(total / limit);

  if (loading) return <div className="admin-content">Loading...</div>;

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
          <button className={!statusFilter ? "active" : ""} onClick={() => { setStatusFilter(""); setPage(1); }}>
            All ({total})
          </button>
          <button className={statusFilter === "draft" ? "active" : ""} onClick={() => { setStatusFilter("draft"); setPage(1); }}>
            Draft
          </button>
          <button className={statusFilter === "pending" ? "active" : ""} onClick={() => { setStatusFilter("pending"); setPage(1); }}>
            Pending
          </button>
          <button className={statusFilter === "published" ? "active" : ""} onClick={() => { setStatusFilter("published"); setPage(1); }}>
            Published
          </button>
          <button className={statusFilter === "scheduled" ? "active" : ""} onClick={() => { setStatusFilter("scheduled"); setPage(1); }}>
            Scheduled
          </button>
          <button className={statusFilter === "trash" ? "active" : ""} onClick={() => { setStatusFilter("trash"); setPage(1); }}>
            Trash
          </button>
        </div>

        <div className="search-form">
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchArticles()}
          />
        </div>
      </div>

      {/* Bulk Actions */}
      {selected.length > 0 && (
        <div className="bulk-actions">
          <span>{selected.length} selected</span>
          <select value={bulkAction} onChange={(e) => setBulkAction(e.target.value)}>
            <option value="">Bulk Actions</option>
            <option value="publish">Publish</option>
            <option value="draft">Set to Draft</option>
            <option value="trash">Move to Trash</option>
            <option value="delete">Delete Permanently</option>
          </select>
          <button className="btn-primary btn-sm" onClick={handleBulkAction} disabled={!bulkAction}>
            Apply
          </button>
          <button className="btn-secondary btn-sm" onClick={() => setSelected([])}>
            Clear
          </button>
        </div>
      )}

      {articles.length > 0 ? (
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: 40 }}>
                <input
                  type="checkbox"
                  checked={selected.length === articles.length && articles.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
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
                  <input
                    type="checkbox"
                    checked={selected.includes(article.id)}
                    onChange={() => toggleSelect(article.id)}
                  />
                </td>
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
                <td>{new Date(article.created_at).toLocaleDateString("en-GB")}</td>
                <td>
                  <div className="action-links">
                    <Link href={`/admin/articles/${article.id}/edit`} className="link-btn">
                      Edit
                    </Link>
                    <Link href={`/post/${article.slug}`} target="_blank" className="link-btn">
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn-secondary btn-sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {page} of {totalPages}
          </span>
          <button
            className="btn-secondary btn-sm"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
