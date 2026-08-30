"use client";

import { useState } from "react";
import Link from "next/link";

export default function UnsubscribePage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    const res = await fetch("/api/subscribers", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
      setStatus("error");
      setMessage(data.error || "Something went wrong");
      return;
    }

    setStatus("success");
    setMessage("You have been unsubscribed. We're sorry to see you go.");
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Orunto Owu Abeokuta</h1>
          <p>Unsubscribe from newsletter</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {status === "success" ? (
            <div className="auth-success">{message}</div>
          ) : (
            <>
              {status === "error" && (
                <div className="auth-error">{message}</div>
              )}
              <p style={{ fontSize: 14, color: "#666", marginBottom: 16 }}>
                Enter your email to unsubscribe from our newsletter.
              </p>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                />
              </div>
              <button
                type="submit"
                className="btn-primary"
                disabled={status === "loading"}
              >
                {status === "loading" ? "Processing..." : "Unsubscribe"}
              </button>
            </>
          )}
        </form>

        <div className="auth-footer">
          <Link href="/" className="back-link">
            Back to site
          </Link>
        </div>
      </div>
    </div>
  );
}
