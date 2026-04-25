"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface HistoryItem {
  id: string;
  episode: {
    id: string;
    number: number;
    title: string;
    anime: { title: string; slug: string; coverImage: string };
  };
}

export default function ContinueWatching() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    fetch("/api/continue-watching").then(r => r.json()).then(data => {
      if (Array.isArray(data)) setHistory(data);
    }).catch(() => {});
  }, []);

  if (history.length === 0) return null;

  return (
    <section style={{ padding: "0 16px 40px", maxWidth: 1280, margin: "0 auto" }}>
      <h2 style={{ fontSize: 24, fontWeight: 900, color: "white", marginBottom: 20 }}>
        Kaldığın Yerden Devam Et
      </h2>
      <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 8 }}>
        {history.map(item => (
          <Link key={item.id} href={`/anime/${item.episode.anime.slug}/episode/${item.episode.number}`}
            style={{ flexShrink: 0, width: 160, textDecoration: "none" }}>
            <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", aspectRatio: "3/4", background: "rgba(255,255,255,0.05)" }}>
              {item.episode.anime.coverImage && (
                <img src={item.episode.anime.coverImage} alt={item.episode.anime.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              )}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)" }} />
              <div style={{ position: "absolute", bottom: 8, left: 8, right: 8 }}>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 2 }}>{item.episode.anime.title}</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: "white" }}>Bölüm {item.episode.number}</p>
              </div>
              <div style={{
                position: "absolute", top: 8, right: 8,
                background: "rgba(124,58,237,0.9)", borderRadius: 6,
                padding: "2px 6px", fontSize: 11, color: "white", fontWeight: 600,
              }}>
                ▶ Devam
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
