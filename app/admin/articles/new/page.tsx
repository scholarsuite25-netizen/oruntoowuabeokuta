"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ArticleEditor from "@/components/admin/ArticleEditor";

interface Category {
  id: number;
  name: string;
}

export default function NewArticlePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [status, setStatus] = useState<"draft" | "published" | "scheduled">("draft");
  const [scheduledAt, setScheduledAt] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!title.trim()) {
      setError("Title is required");
      setLoading(false);
      return;
    }

    const body = {
      title,
      content,
      excerpt,
      category_id: categoryId || null,
      status,
      published_at: status === "scheduled" ? scheduledAt : undefined,
    };

    const res = await fetch("/api/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to create article");
      setLoading(false);
      return;
    }

    router.push("/admin/articles");
    router.refresh();
  }

  return (
    <div className="admin-content">
      <h1>New Article</h1>

      <form onSubmit={handleSubmit} className="article-form">
        {error && <div className="auth-error">{error}</div>}

        <div className="field">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Article title"
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
            placeholder="Brief summary of the article"
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
              onChange={(e) => setStatus(e.target.value as typeof status)}
            >
              <option value="draft">Draft</option>
              <option value="published">Publish Now</option>
              <option value="scheduled">Schedule</option>
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
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading
              ? "Saving..."
              : status === "published"
              ? "Publish"
              : status === "scheduled"
              ? "Schedule"
              : "Save Draft"}
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
