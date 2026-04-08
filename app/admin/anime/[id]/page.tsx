"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

interface Episode {
  id: string;
  number: number;
  title: string;
  quality: string;
}

interface Anime {
  id: string;
  title: string;
  episodes: Episode[];
}

export default function ManageAnimePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [form, setForm] = useState({ number: "", title: "", quality: "FHD", videoUrl: "" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch(`/api/admin/anime/${id}`).then((r) => r.json()).then(setAnime);
  }, [id]);

  async function addEpisode(e: React.FormEvent) {
    e.preventDefault();
    if (!form.videoUrl.trim()) { alert("Video URL gerekli"); return; }
    setLoading(true);
    setStatus("");

    const res = await fetch("/api/admin/episodes/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        animeId: id,
        number: parseInt(form.number),
        title: form.title,
        quality: form.quality,
        videoUrl: form.videoUrl,
      }),
    });

    if (res.ok) {
      const ep = await res.json();
      setAnime((prev) => prev ? { ...prev, episodes: [...prev.episodes, ep].sort((a,b) => a.number - b.number) } : prev);
      setForm({ number: "", title: "", quality: "FHD", videoUrl: "" });
      setStatus("✅ Bölüm eklendi!");
      setTimeout(() => setStatus(""), 3000);
    } else {
      const data = await res.json();
      alert("Hata: " + data.error);
    }
    setLoading(false);
  }

  async function deleteEpisode(epId: string) {
    if (!confirm("Bu bölümü silmek istediğine emin misin?")) return;
    const res = await fetch(`/api/admin/episodes/${epId}`, { method: "DELETE" });
    if (res.ok) {
      setAnime((prev) => prev ? { ...prev, episodes: prev.episodes.filter(e => e.id !== epId) } : prev);
    }
  }

  if (!anime) return (
    <div className="min-h-screen gradient-bg flex items-center justify-center">
      <div className="text-purple-400">Yükleniyor...</div>
    </div>
  );

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      <div className="pt-28 pb-20 px-4 max-w-4xl mx-auto">
        <button onClick={() => router.back()} className="text-purple-400 hover:text-purple-300 mb-6 block">← Geri</button>
        <h1 className="text-2xl font-bold mb-8 text-purple-300">{anime.title} - Bölüm Yönetimi</h1>

        <div className="bg-[#1a1a2e] border border-purple-900/30 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-bold mb-4 text-white">Yeni Bölüm Ekle</h2>
          <form onSubmit={addEpisode} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Bölüm No</label>
                <input
                  type="number"
                  value={form.number}
                  onChange={(e) => setForm({ ...form, number: e.target.value })}
                  className="w-full bg-[#0a0a0f] border border-purple-900/40 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Kalite</label>
                <select
                  value={form.quality}
                  onChange={(e) => setForm({ ...form, quality: e.target.value })}
                  className="w-full bg-[#0a0a0f] border border-purple-900/40 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="SD">SD (480p)</option>
                  <option value="HD">HD (720p)</option>
                  <option value="FHD">FHD (1080p)</option>
                  <option value="UHD">UHD (4K)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Bölüm Başlığı</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="örn: Luffy'nin Kararı"
                className="w-full bg-[#0a0a0f] border border-purple-900/40 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Video URL</label>
              <input
                type="url"
                value={form.videoUrl}
                onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                placeholder="https://..."
                className="w-full bg-[#0a0a0f] border border-purple-900/40 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                required
              />
              <p className="text-xs text-gray-600 mt-1">Google Drive, Dropbox, Mega veya direkt video linki</p>
            </div>

            {status && <p className="text-sm text-center py-1">{status}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-500 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? "Ekleniyor..." : "Bölüm Ekle"}
            </button>
          </form>
        </div>

        <div className="bg-[#1a1a2e] border border-purple-900/30 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-purple-900/30">
            <h2 className="font-bold text-white">Mevcut Bölümler ({anime.episodes.length})</h2>
          </div>
          {anime.episodes.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">Henüz bölüm yok</div>
          ) : (
            <div className="divide-y divide-purple-900/10">
              {anime.episodes.map((ep) => (
                <div key={ep.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <span className="text-purple-400 font-bold mr-3">#{ep.number}</span>
                    <span className="text-white">{ep.title}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs bg-purple-900/40 text-purple-300 px-2 py-1 rounded-full">{ep.quality}</span>
                    <button onClick={() => deleteEpisode(ep.id)} className="text-red-500 hover:text-red-400 text-sm transition-colors">Sil</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
