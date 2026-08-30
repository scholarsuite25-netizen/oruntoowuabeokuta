"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ArticleEditor from "@/components/admin/ArticleEditor";

export default function NewPagePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      status,
      seo_title: seoTitle || null,
      seo_description: seoDescription || null,
    };

    const res = await fetch("/api/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to create page");
      setLoading(false);
      return;
    }

    router.push("/admin/pages");
    router.refresh();
  }

  return (
    <div className="admin-content">
      <h1>New Page</h1>

      <form onSubmit={handleSubmit} className="article-form">
        {error && <div className="auth-error">{error}</div>}

        <div className="field">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Page title"
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
            placeholder="Brief summary"
            rows={3}
          />
        </div>

        <div className="field">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div className="seo-section">
          <h3>SEO</h3>
          <div className="field">
            <label>SEO Title</label>
            <input
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder="Custom title for search engines"
              maxLength={70}
            />
          </div>
          <div className="field">
            <label>Meta Description</label>
            <textarea
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              placeholder="Description for search engines"
              rows={3}
              maxLength={160}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Saving..." : status === "published" ? "Publish" : "Save Draft"}
          </button>
          <button type="button" className="btn-secondary" onClick={() => router.back()}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
