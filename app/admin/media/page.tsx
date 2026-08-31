"use client";

import { useState, useEffect, useRef } from "react";

interface MediaItem {
  id: number;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const limit = 24;

  useEffect(() => {
    fetchMedia();
  }, [page]);

  async function fetchMedia() {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    const res = await fetch(`/api/media?${params.toString()}`);
    const data = await res.json();
    setMedia(data.media || []);
    setTotal(data.total || 0);
    setLoading(false);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    await fetch("/api/media", { method: "POST", body: formData });
    setUploading(false);
    fetchMedia();
    if (fileRef.current) fileRef.current.value = "";
  }

  function copyUrl(url: string, id: number) {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const totalPages = Math.ceil(total / limit);

  if (loading) return <div className="admin-content">Loading...</div>;

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h1>Media Library</h1>
        <div>
          <input ref={fileRef} type="file" accept="image/*,video/*,application/pdf" onChange={handleUpload} style={{ display: "none" }} />
          <button onClick={() => fileRef.current?.click()} className="btn-primary" disabled={uploading}>
            {uploading ? "Uploading..." : "+ Upload File"}
          </button>
        </div>
      </div>

      <div className="admin-info">{total} files</div>

      {media.length > 0 ? (
        <>
          <div className="media-grid">
            {media.map((item) => (
              <div key={item.id} className="media-card">
                <div className="media-preview">
                  {item.file_type.startsWith("image/") ? (
                    <img src={item.file_url} alt={item.file_name} />
                  ) : item.file_type.startsWith("video/") ? (
                    <div className="media-icon">Video</div>
                  ) : (
                    <div className="media-icon">PDF</div>
                  )}
                </div>
                <div className="media-info">
                  <p className="media-name" title={item.file_name}>{item.file_name}</p>
                  <p className="media-meta">
                    {formatSize(item.file_size)} &middot; {new Date(item.created_at).toLocaleDateString("en-GB")}
                  </p>
                  <button onClick={() => copyUrl(item.file_url, item.id)} className="link-btn">
                    {copiedId === item.id ? "Copied!" : "Copy URL"}
                  </button>
                </div>
              </div>
            ))}
          </div>
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
          No media uploaded yet. Click Upload to get started.
        </div>
      )}
    </div>
  );
}
