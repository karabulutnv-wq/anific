"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

interface Episode {
  id: string;
  number: number;
  title: string;
  quality: string;
  videoUrl: string;
}

interface Anime {
  id: string;
  title: string;
  slug: string;
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
    fetch(`/api/admin/anime/${id}`).then(r => r.json()).then(setAnime);
  }, [id]);

  async function addEpisode(e: React.FormEvent) {
    e.preventDefault();
    if (!anime) return;
    setLoading(true);

    // Video URL: Sibnet/Drive linki veya otomatik local path
    const videoUrl = form.videoUrl.trim() || `/videos/${anime.slug}/${form.number}.mp4`;

    const res = await fetch("/api/admin/episodes/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        animeId: id,
        number: parseInt(form.number),
        title: form.title,
        quality: form.quality,
        videoUrl,
      }),
    });

    if (res.ok) {
      const ep = await res.json();
      setAnime(prev => prev ? { ...prev, episodes: [...prev.episodes, ep].sort((a, b) => a.number - b.number) } : prev);
      setForm({ number: "", title: "", quality: "FHD", videoUrl: "" });
      setStatus(`✅ Bölüm eklendi! Dosyayı şuraya koy: public/videos/${anime.slug}/${form.number}.mp4`);
      setTimeout(() => setStatus(""), 8000);
    } else {
      alert("Hata oluştu");
    }
    setLoading(false);
  }

  async function deleteEpisode(epId: string) {
    if (!confirm("Bu bölümü silmek istediğine emin misin?")) return;
    const res = await fetch(`/api/admin/episodes/${epId}`, { method: "DELETE" });
    if (res.ok) setAnime(prev => prev ? { ...prev, episodes: prev.episodes.filter(e => e.id !== epId) } : prev);
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
        <h1 className="text-2xl font-bold mb-2 text-purple-300">{anime.title} - Bölüm Yönetimi</h1>

        {/* Bilgi kutusu */}
        <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl px-4 py-3 mb-8 text-sm text-blue-300">
          📁 Video dosyalarını şu klasöre koy: <code className="bg-black/30 px-2 py-0.5 rounded">public/videos/{anime.slug}/[bolum-no].mp4</code>
          <br />
          <span className="text-blue-400/70 text-xs">Örnek: public/videos/{anime.slug}/1.mp4, 2.mp4, 3.mp4 ...</span>
        </div>

        <div className="bg-[#1a1a2e] border border-purple-900/30 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-bold mb-4 text-white">Yeni Bölüm Ekle</h2>
          <form onSubmit={addEpisode} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Bölüm No</label>
                <input
                  type="number"
                  value={form.number}
                  onChange={e => setForm({ ...form, number: e.target.value })}
                  className="w-full bg-[#0a0a0f] border border-purple-900/40 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Kalite</label>
                <select
                  value={form.quality}
                  onChange={e => setForm({ ...form, quality: e.target.value })}
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
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="örn: Luffy'nin Kararı"
                className="w-full bg-[#0a0a0f] border border-purple-900/40 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Video URL (Sibnet veya Drive)</label>
              <input
                type="text"
                value={form.videoUrl}
                onChange={e => setForm({ ...form, videoUrl: e.target.value })}
                placeholder="https://video.sibnet.ru/video1234567"
                className="w-full bg-[#0a0a0f] border border-purple-900/40 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                required
              />
              <p className="text-xs text-gray-600 mt-1">Sibnet video sayfası linki veya Google Drive linki</p>
            </div>

            <div className="bg-[#0a0a0f] border border-purple-900/20 rounded-lg px-4 py-3 text-sm text-gray-500">
              Video yolu otomatik: <span className="text-purple-400">/videos/{anime.slug}/{form.number || "?"}.mp4</span>
            </div>

            {status && <p className="text-sm text-center text-green-400 bg-green-900/20 border border-green-700/30 rounded-lg px-4 py-3">{status}</p>}

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
              {anime.episodes.map(ep => (
                <div key={ep.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <span className="text-purple-400 font-bold mr-3">#{ep.number}</span>
                    <span className="text-white">{ep.title}</span>
                    <span className="text-gray-600 text-xs ml-3">{ep.videoUrl}</span>
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
