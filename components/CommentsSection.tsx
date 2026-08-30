"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Comment {
  id: number;
  content: string;
  created_at: string;
  profiles: { full_name: string } | null;
}

interface Props {
  articleId: number;
}

export default function CommentsSection({ articleId }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    // Check if logged in
    fetch("/api/auth/callback", { method: "GET" }).catch(() => {});
    // We'll detect login state by attempting to load comments
    fetchComments();
  }, [articleId]);

  async function fetchComments() {
    const res = await fetch(`/api/comments?article_id=${articleId}`);
    const data = await res.json();
    setComments(data.comments || []);
    setLoading(false);

    // Detect if logged in by checking if user can see pending
    // (simpler: just check for a session cookie via the page)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!content.trim()) {
      setError("Please enter a comment");
      return;
    }

    setSubmitting(true);

    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ article_id: articleId, content }),
    });

    const data = await res.json();

    if (!res.ok) {
      if (res.status === 401) {
        setError("You must be logged in to comment.");
      } else {
        setError(data.error || "Failed to post comment");
      }
      setSubmitting(false);
      return;
    }

    setContent("");
    setSuccess("Comment submitted! It will appear after moderator approval.");
    setSubmitting(false);
    fetchComments();
  }

  return (
    <div className="comments-section">
      <h3 className="comments-title">
        Comments
        {comments.length > 0 && (
          <span className="comments-count">{comments.length}</span>
        )}
      </h3>

      {/* Comment Form */}
      <div className="comment-form-wrapper">
        <p className="comment-note">
          You must be{" "}
          <Link href="/login">logged in</Link> to comment. Comments are
          moderated before appearing publicly.
        </p>

        <form onSubmit={handleSubmit} className="comment-form">
          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts..."
            rows={4}
            required
          />

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Posting..." : "Post Comment"}
          </button>
        </form>
      </div>

      {/* Comments List */}
      <div className="comments-list-public">
        {loading ? (
          <p className="comments-loading">Loading comments...</p>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <div className="comment-item-header">
                <div className="comment-avatar">
                  {(comment.profiles?.full_name || "U").charAt(0).toUpperCase()}
                </div>
                <div>
                  <strong className="comment-author">
                    {comment.profiles?.full_name || "Unknown"}
                  </strong>
                  <time className="comment-time">
                    {new Date(comment.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </time>
                </div>
              </div>
              <p className="comment-text">{comment.content}</p>
            </div>
          ))
        ) : (
          <p className="comments-empty">
            No comments yet. Be the first to share your thoughts!
          </p>
        )}
      </div>
    </div>
  );
}
