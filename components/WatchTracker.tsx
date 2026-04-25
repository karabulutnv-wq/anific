"use client";
import { useEffect } from "react";

export default function WatchTracker({ episodeId }: { episodeId: string }) {
  useEffect(() => {
    // Sayfaya girince izlendi olarak kaydet
    fetch("/api/continue-watching", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ episodeId }),
    }).catch(() => {});
  }, [episodeId]);

  return null;
}
