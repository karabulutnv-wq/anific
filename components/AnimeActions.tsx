"use client";
import { useState } from "react";

export default function AnimeActions({
  animeId,
  initialFavorited,
  initialRating,
  avgRating,
}: {
  animeId: string;
  initialFavorited: boolean;
  initialRating: number | null;
  avgRating: number | null;
}) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);

  async function toggleFavorite() {
    setLoading(true);
    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ animeId }),
    });
    const data = await res.json();
    if (res.ok) setFavorited(data.favorited);
    setLoading(false);
  }

  async function submitRating(score: number) {
    setRating(score);
    await fetch("/api/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ animeId, score }),
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-4 mt-4">
      <button
        onClick={toggleFavorite}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
          favorited
            ? "bg-red-600/30 border border-red-500/50 text-red-400"
            : "bg-[#1a1a2e] border border-purple-900/30 text-gray-400 hover:text-red-400 hover:border-red-500/30"
        }`}
      >
        {favorited ? "❤️ Favorilerde" : "🤍 Favorilere Ekle"}
      </button>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Puan:</span>
        <div className="flex gap-1">
          {[1,2,3,4,5,6,7,8,9,10].map((s) => (
            <button
              key={s}
              onClick={() => submitRating(s)}
              onMouseEnter={() => setHover(s)}
              onMouseLeave={() => setHover(0)}
              className={`w-6 h-6 rounded text-xs font-bold transition-all ${
                s <= (hover || rating || 0)
                  ? "bg-yellow-500 text-black"
                  : "bg-gray-800 text-gray-500 hover:bg-yellow-500/30"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        {avgRating && (
          <span className="text-sm text-yellow-400 ml-1">⭐ {avgRating.toFixed(1)}</span>
        )}
      </div>
    </div>
  );
}
