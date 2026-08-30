"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewsletterPage() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setResult(null);

    if (!confirm("Send this newsletter to all active subscribers?")) {
      setSending(false);
      return;
    }

    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, content }),
    });

    const data = await res.json();

    if (!res.ok) {
      setResult({ success: false, message: data.error || "Failed to send" });
      setSending(false);
      return;
    }

    setResult({ success: true, message: data.message });
    setSending(false);
  }

  return (
    <div className="admin-content">
      <h1>Send Newsletter</h1>

      <form onSubmit={handleSubmit} className="article-form">
        {result && (
          <div className={result.success ? "auth-success" : "auth-error"}>
            {result.message}
          </div>
        )}

        <div className="field">
          <label htmlFor="subject">Subject</label>
          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Newsletter subject"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="content">Content (HTML allowed)</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your newsletter content here. HTML tags are supported for formatting."
            rows={14}
            required
            style={{ fontFamily: "monospace", fontSize: 13 }}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={sending}>
            {sending ? "Sending..." : "Send Newsletter"}
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
