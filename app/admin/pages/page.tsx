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
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const limit = 20;

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  useEffect(() => {
    fetchPages();
  }, [statusFilter, page]);

  async function fetchPages() {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (statusFilter) params.set("status", statusFilter);
    if (search) params.set("search", search);
    const res = await fetch(`/api/pages?${params.toString()}`);
    const data = await res.json();
    setPages(data.pages || []);
    setTotal(data.total || 0);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this page?")) return;
    await fetch(`/api/pages/${id}`, { method: "DELETE" });
    fetchPages();
  }

  const totalPages = Math.ceil(total / limit);

  if (loading) return <div className="admin-content">Loading...</div>;

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h1>Pages</h1>
        <Link href="/admin/pages/new" className="btn-primary">Add New</Link>
      </div>

      <div className="admin-filters">
        <div className="search-form">
          <input type="text" placeholder="Search pages..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && fetchPages()} />
        </div>
        <div className="filter-group">
          <button onClick={() => setStatusFilter("")} className={!statusFilter ? "active" : ""}>All</button>
          <button onClick={() => setStatusFilter("draft")} className={statusFilter === "draft" ? "active" : ""}>Draft</button>
          <button onClick={() => setStatusFilter("published")} className={statusFilter === "published" ? "active" : ""}>Published</button>
          <button onClick={() => setStatusFilter("archived")} className={statusFilter === "archived" ? "active" : ""}>Archived</button>
        </div>
      </div>

      <div className="admin-info">{total} pages</div>

      {pages.length > 0 ? (
        <>
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
              {pages.map((pg) => (
                <tr key={pg.id}>
                  <td>
                    <strong>{pg.title}</strong>
                    <div className="meta">/{pg.slug}</div>
                  </td>
                  <td>{pg.profiles?.full_name || "-"}</td>
                  <td>
                    <span className={`badge badge-${pg.status}`}>{pg.status}</span>
                  </td>
                  <td>{new Date(pg.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="action-links">
                      <Link href={`/admin/pages/${pg.id}/edit`} className="link-btn">Edit</Link>
                      <button onClick={() => handleDelete(pg.id)} className="link-btn link-btn-danger">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="pagination">
              <button className="btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
              <span className="pagination-info">Page {page} of {totalPages}</span>
              <button className="btn-secondary btn-sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          No pages yet. <Link href="/admin/pages/new">Create your first page</Link>.
        </div>
      )}
    </div>
  );
}
