"use client";
import { useEffect } from "react";

export default function ViewTracker({ slug, articleId }: { slug?: string; articleId?: string }) {
  useEffect(() => {
    const key = `viewed_${slug || articleId}`;
    if (typeof window !== "undefined" && localStorage.getItem(key)) return;
    const viewer_hash = typeof window !== "undefined" ? btoa(navigator.userAgent.slice(0, 32) + (slug || articleId)) : undefined;
    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, article_id: articleId, viewer_hash }),
    }).catch(() => {});
    if (typeof window !== "undefined") localStorage.setItem(key, "1");
  }, [slug, articleId]);
  return null;
}
