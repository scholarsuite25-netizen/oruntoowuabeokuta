"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Page {
  id: string;
  title: string;
  slug: string;
  status: string;
  author_id: string;
  profiles?: { full_name: string };
  created_at: string;
  updated_at: string;
}

export default function PagesListPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchPages();
  }, [statusFilter]);

  async function fetchPages() {
    const params = new URLSearchParams({ limit: "100" });
    if (statusFilter) params.set("status", statusFilter);
    if (search) params.set("search", search);

    const res = await fetch(`/api/pages?${params.toString()}`);
    const data = await res.json();
    setPages(data.pages || []);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this page?")) return;
    await fetch(`/api/pages/${id}`, { method: "DELETE" });
    fetchPages();
  }

  if (loading) return <div className="admin-content">Loading...</div>;

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h1>Pages</h1>
        <Link href="/admin/pages/new" className="btn-primary">
          Add New
        </Link>
      </div>

      <div className="admin-filters">
        <input
          type="text"
          placeholder="Search pages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchPages()}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {pages.length > 0 ? (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page.id}>
                <td>
                  <strong>{page.title}</strong>
                  <div className="meta">/{page.slug}</div>
                </td>
                <td>{page.profiles?.full_name || "-"}</td>
                <td>
                  <span className={`badge badge-${page.status}`}>
                    {page.status}
                  </span>
                </td>
                <td>{new Date(page.created_at).toLocaleDateString()}</td>
                <td>
                  <div className="action-links">
                    <Link
                      href={`/admin/pages/${page.id}/edit`}
                      className="link-btn"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(page.id)}
                      className="link-btn link-btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="empty-state">
          No pages yet.{" "}
          <Link href="/admin/pages/new">Create your first page</Link>.
        </div>
      )}
    </div>
  );
}
