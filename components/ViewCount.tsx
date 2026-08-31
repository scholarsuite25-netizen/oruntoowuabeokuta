"use client";
import { useEffect, useState } from "react";
export default function ViewCount({ slug }: { slug: string }) {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    fetch(`/api/views?slug=${encodeURIComponent(slug)}`).then(r=>r.json()).then(d=>setCount(d.view_count ?? 0)).catch(()=>{});
  }, [slug]);
  if (count === null) return <span>👁 -- views</span>;
  return <span>👁 {count} {count===1?"view":"views"}</span>;
}
