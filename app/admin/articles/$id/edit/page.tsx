"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import ArticleEditor from "@/components/admin/ArticleEditor";

interface Category {
  id: number;
  name: string;
}

interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image: string | null;
  category_id: number | null;
  status: string;
  published_at: string | null;
}

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.id;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [status, setStatus] = useState("draft");
  const [scheduledAt, setScheduledAt] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Load article
    fetch(`/api/articles/${articleId}`)
      .then((r) => r.json())
      .then((d) => {
        const a = d.article;
        setTitle(a.title);
        setContent(a.content);
        setExcerpt(a.excerpt || "");
        setCategoryId(a.category_id || "");
        setStatus(a.status);
        if (a.published_at) {
          setScheduledAt(
            new Date(a.published_at).toISOString().slice(0, 16)
          );
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load article");
        setLoading(false);
      });

    // Load categories
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => {});
  }, [articleId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const body = {
      title,
      content,
      excerpt,
      category_id: categoryId || null,
      status,
      published_at: status === "scheduled" ? scheduledAt : undefined,
    };

    const res = await fetch(`/api/articles/${articleId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to save");
      setSaving(false);
      return;
    }

    router.push("/admin/articles");
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Delete this article? This cannot be undone.")) return;

    const res = await fetch(`/api/articles/${articleId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.push("/admin/articles");
      router.refresh();
    } else {
      setError("Failed to delete article");
    }
  }

  if (loading) return <div className="admin-content">Loading...</div>;

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h1>Edit Article</h1>
        <button onClick={handleDelete} className="btn-danger">
          Delete
        </button>
      </div>

      <form onSubmit={handleSubmit} className="article-form">
        {error && <div className="auth-error">{error}</div>}

        <div className="field">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label>Content</label>
          <ArticleEditor content={content} onChange={setContent} />
        </div>

        <div className="field">
          <label htmlFor="excerpt">Excerpt</label>
          <textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
          />
        </div>

        <div className="form-row">
          <div className="field">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) =>
                setCategoryId(
                  e.target.value ? parseInt(e.target.value) : ""
                )
              }
            >
              <option value="">No category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {status === "scheduled" && (
            <div className="field">
              <label htmlFor="scheduledAt">Publish Date</label>
              <input
                id="scheduledAt"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => router.back()}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
