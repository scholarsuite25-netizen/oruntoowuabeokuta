"use client";
import { useState, useEffect, useRef } from "react";

export default function AudioReader({ text, title }: { text: string; title?: string }) {
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [supported, setSupported] = useState(true);
  const [rate, setRate] = useState(1);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && !("speechSynthesis" in window)) setSupported(false);
    return () => { if (typeof window !== "undefined") window.speechSynthesis.cancel(); };
  }, []);

  function stripHtml(html: string) { return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 4000); }
  const clean = stripHtml(text);

  function play() {
    if (!clean) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = "en-NG"; u.rate = rate;
    u.onstart = () => { setSpeaking(true); setPaused(false); };
    u.onend = () => { setSpeaking(false); setPaused(false); };
    u.onerror = () => { setSpeaking(false); setPaused(false); };
    utterRef.current = u;
    window.speechSynthesis.speak(u);
  }
  function pause() { window.speechSynthesis.pause(); setPaused(true); }
  function resume() { window.speechSynthesis.resume(); setPaused(false); }
  function stop() { window.speechSynthesis.cancel(); setSpeaking(false); setPaused(false); }

  if (!supported) return null;
  if (!clean) return null;

  return (
    <div className="audio-reader" aria-label="Audio reader controls" style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", margin: "12px 0", padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 8, background: "#fff" }}>
      <span style={{ fontSize: 13, fontWeight: 600 }}>🔊 Listen:</span>
      {!speaking ? (
        <button onClick={play} className="btn-primary btn-sm" aria-label="Play article audio">▶ Play</button>
      ) : paused ? (
        <>
          <button onClick={resume} className="btn-primary btn-sm">▶ Resume</button>
          <button onClick={stop} className="btn-secondary btn-sm">■ Stop</button>
        </>
      ) : (
        <>
          <button onClick={pause} className="btn-secondary btn-sm">⏸ Pause</button>
          <button onClick={stop} className="btn-secondary btn-sm">■ Stop</button>
        </>
      )}
      <label style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>Speed
        <select value={rate} onChange={e => setRate(parseFloat(e.target.value))} style={{ padding: "4px 6px", borderRadius: 6, border: "1px solid var(--border)" }}>
          <option value="0.8">0.8x</option>
          <option value="1">1x</option>
          <option value="1.2">1.2x</option>
          <option value="1.5">1.5x</option>
        </select>
      </label>
      {title && <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 4 }}>{speaking ? "Reading…" : "Click play to listen"}</span>}
    </div>
  );
}
