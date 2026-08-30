"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ArticleEditor from "@/components/admin/ArticleEditor";

interface Category {
  id: string;
  name: string;
}

interface Tag {
  id: string;
  name: string;
}

interface MediaItem {
  id: string;
  file_url: string;
  file_name: string;
  alt_text?: string;
}

export default function NewArticlePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [status, setStatus] = useState<"draft" | "pending" | "published" | "scheduled">("draft");
  const [scheduledAt, setScheduledAt] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [featuredImageAlt, setFeaturedImageAlt] = useState("");
  const [featuredImageCaption, setFeaturedImageCaption] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [showSeo, setShowSeo] = useState(false);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/tags").then((r) => r.json()),
    ]).then(([catData, tagData]) => {
      setCategories(catData.categories || []);
      setTags(tagData.tags || []);
    }).catch(() => {});
  }, []);

  async function fetchMedia() {
    const res = await fetch("/api/media?limit=50");
    const data = await res.json();
    setMediaItems(data.media || []);
  }

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
      tags: selectedTags,
      status,
      featured_image: featuredImage || null,
      featured_image_alt: featuredImageAlt || null,
      featured_image_caption: featuredImageCaption || null,
      scheduled_at: status === "scheduled" ? scheduledAt : undefined,
      seo_title: seoTitle || null,
      seo_description: seoDescription || null,
      seo_keywords: seoKeywords || null,
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

  function toggleTag(tagId: string) {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
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

        {/* Featured Image */}
        <div className="field">
          <label>Featured Image</label>
          {featuredImage ? (
            <div className="featured-preview">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={featuredImage} alt={featuredImageAlt} style={{ maxWidth: 300, borderRadius: 8 }} />
              <div style={{ marginTop: 8 }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setFeaturedImage("");
                    setFeaturedImageAlt("");
                    setFeaturedImageCaption("");
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                fetchMedia();
                setShowMediaPicker(true);
              }}
            >
              Choose Featured Image
            </button>
          )}
          {featuredImage && (
            <>
              <div className="field" style={{ marginTop: 8 }}>
                <input
                  type="text"
                  placeholder="Alt text for accessibility"
                  value={featuredImageAlt}
                  onChange={(e) => setFeaturedImageAlt(e.target.value)}
                />
              </div>
              <div className="field">
                <input
                  type="text"
                  placeholder="Caption (optional)"
                  value={featuredImageCaption}
                  onChange={(e) => setFeaturedImageCaption(e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="field">
            <label>Tags</label>
            <div className="tag-selector">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  className={`tag-chip ${selectedTags.includes(tag.id) ? "selected" : ""}`}
                  onClick={() => toggleTag(tag.id)}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="form-row">
          <div className="field">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
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
              <option value="pending">Pending Review</option>
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

        {/* SEO Fields */}
        <div className="field">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setShowSeo(!showSeo)}
          >
            {showSeo ? "Hide SEO" : "SEO Settings"}
          </button>
        </div>

        {showSeo && (
          <div className="seo-section">
            <div className="field">
              <label>SEO Title</label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Custom title for search engines"
                maxLength={70}
              />
              <small>{seoTitle.length}/70 characters</small>
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
              <small>{seoDescription.length}/160 characters</small>
            </div>
            <div className="field">
              <label>Keywords</label>
              <input
                type="text"
                value={seoKeywords}
                onChange={(e) => setSeoKeywords(e.target.value)}
                placeholder="Comma-separated keywords"
              />
            </div>
          </div>
        )}

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

      {/* Media Picker Modal */}
      {showMediaPicker && (
        <div className="modal-overlay" onClick={() => setShowMediaPicker(false)}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <h2>Select Featured Image</h2>
            <div className="media-grid">
              {mediaItems.map((item) => (
                <div
                  key={item.id}
                  className="media-card"
                  onClick={() => {
                    setFeaturedImage(item.file_url);
                    setFeaturedImageAlt(item.alt_text || "");
                    setShowMediaPicker(false);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.file_url} alt={item.alt_text || item.file_name} loading="lazy" />
                  <div className="media-info">
                    <span className="media-name">{item.file_name}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowMediaPicker(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
