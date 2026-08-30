"use client";

import { useState, useEffect } from "react";

interface Comment {
  id: number;
  content: string;
  status: string;
  created_at: string;
  profiles: { full_name: string } | null;
  articles: { title: string; slug: string } | null;
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [filter]);

  async function fetchComments() {
    setLoading(true);
    const res = await fetch(`/api/comments?status=${filter}`);
    const data = await res.json();
    setComments(data.comments || []);
    setLoading(false);
  }

  async function updateStatus(id: number, status: string) {
    await fetch("/api/comments", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    fetchComments();
  }

  async function deleteComment(id: number) {
    if (!confirm("Delete this comment?")) return;
    await fetch(`/api/comments?id=${id}`, { method: "DELETE" });
    fetchComments();
  }

  return (
    <div className="admin-content">
      <h1>Comments</h1>

      <div className="admin-filters">
        <div className="filter-group">
          <button
            onClick={() => setFilter("pending")}
            className={filter === "pending" ? "active" : ""}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter("approved")}
            className={filter === "approved" ? "active" : ""}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter("rejected")}
            className={filter === "rejected" ? "active" : ""}
          >
            Rejected
          </button>
          <button
            onClick={() => setFilter("all")}
            className={filter === "all" ? "active" : ""}
          >
            All
          </button>
        </div>
      </div>

      {loading ? (
        <div className="admin-info">Loading...</div>
      ) : comments.length > 0 ? (
        <div className="comments-list">
          {comments.map((comment) => (
            <div key={comment.id} className={`comment-card comment-${comment.status}`}>
              <div className="comment-header">
                <div className="comment-meta">
                  <strong>{comment.profiles?.full_name || "Unknown"}</strong>
                  <span className="comment-date">
                    {new Date(comment.created_at).toLocaleString("en-GB")}
                  </span>
                </div>
                <div className="comment-on">
                  on &ldquo;
                  <a href={`/post/${comment.articles?.slug}`} target="_blank">
                    {comment.articles?.title || "Unknown"}
                  </a>
                  &rdquo;
                </div>
              </div>

              <p className="comment-body">{comment.content}</p>

              <div className="comment-actions">
                {comment.status !== "approved" && (
                  <button
                    onClick={() => updateStatus(comment.id, "approved")}
                    className="link-btn link-btn-approve"
                  >
                    Approve
                  </button>
                )}
                {comment.status !== "rejected" && (
                  <button
                    onClick={() => updateStatus(comment.id, "rejected")}
                    className="link-btn"
                  >
                    Reject
                  </button>
                )}
                <button
                  onClick={() => deleteComment(comment.id)}
                  className="link-btn link-btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          No {filter !== "all" ? filter : ""} comments found.
        </div>
      )}
    </div>
  );
}
