"use client";

import { useState, useEffect } from "react";

interface Tag {
  id: string;
  name: string;
  slug: string;
  description: string;
  created_at: string;
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const limit = 20;

  useEffect(() => {
    fetchTags();
  }, [page]);

  async function fetchTags() {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set("search", search);
    const res = await fetch(`/api/tags?${params.toString()}`);
    const data = await res.json();
    setTags(data.tags || []);
    setTotal(data.total || 0);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    if (editingId) {
      await fetch(`/api/tags/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
    } else {
      await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
    }
    setName("");
    setDescription("");
    setEditingId(null);
    setSaving(false);
    fetchTags();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this tag?")) return;
    await fetch(`/api/tags/${id}`, { method: "DELETE" });
    fetchTags();
  }

  function handleEdit(tag: Tag) {
    setEditingId(tag.id);
    setName(tag.name);
    setDescription(tag.description || "");
  }

  const totalPages = Math.ceil(total / limit);

  if (loading) return <div className="admin-content">Loading...</div>;

  return (
    <div className="admin-content">
      <h1>Tags</h1>

      <form onSubmit={handleSubmit} className="inline-form">
        <div className="form-row">
          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tag name" required />
          </div>
          <div className="field">
            <label htmlFor="desc">Description</label>
            <input id="desc" type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
          </div>
          <div className="field field-btn">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update" : "Add"}
            </button>
            {editingId && (
              <button type="button" className="btn-secondary" onClick={() => { setEditingId(null); setName(""); setDescription(""); }}>Cancel</button>
            )}
          </div>
        </div>
      </form>

      <div className="admin-filters">
        <div className="search-form">
          <input type="text" placeholder="Search tags..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && fetchTags()} />
        </div>
        <span className="admin-info">{total} tags</span>
      </div>

      {tags.length > 0 ? (
        <>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tags.map((tag) => (
                <tr key={tag.id}>
                  <td><strong>{tag.name}</strong></td>
                  <td>{tag.slug}</td>
                  <td>{tag.description || "-"}</td>
                  <td>
                    <div className="action-links">
                      <button onClick={() => handleEdit(tag)} className="link-btn">Edit</button>
                      <button onClick={() => handleDelete(tag.id)} className="link-btn link-btn-danger">Delete</button>
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
        <div className="empty-state">No tags yet. Add one above.</div>
      )}
    </div>
  );
}
