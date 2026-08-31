"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface CatStat { id: string; name: string; slug: string; article_count: number; view_count: number; }

export default function StatsBar() {
  const [data, setData] = useState<{ total_articles: number; total_views: number; categories: CatStat[] } | null>(null);
  useEffect(() => { fetch("/api/stats").then(r => r.json()).then(setData).catch(() => {}); }, []);
  if (!data) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", padding: "10px 14px", background: "#fff", border: "1px solid var(--border)", borderRadius: 8, margin: "16px 0", fontSize: 13 }}>
      <span><strong>{data.total_articles}</strong> articles</span>
      <span>·</span>
      <span><strong>{data.total_views}</strong> reads</span>
      <span style={{ marginLeft: 8, color: "var(--muted)" }}>Per category:</span>
      {data.categories.slice(0, 6).map(c => (
        <Link key={c.id} href={`/category/${c.slug}`} style={{ padding: "4px 8px", background: "var(--light)", borderRadius: 999, textDecoration: "none", color: "#333", border: "1px solid var(--border)" }}>
          {c.name} <strong>{c.article_count}</strong> ({c.view_count} reads)
        </Link>
      ))}
      <Link href="/archive" style={{ marginLeft: "auto", color: "var(--red)", fontWeight: 600 }}>View all →</Link>
    </div>
  );
}
