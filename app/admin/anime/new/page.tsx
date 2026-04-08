"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function NewAnimePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "", slug: "", description: "", coverImage: "",
    bannerImage: "", genres: "", status: "ONGOING",
  });
  const [loading, setLoading] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    let coverUrl = form.coverImage;

    if (coverFile) {
      const fd = new FormData();
      fd.append("file", coverFile);
      fd.append("type", "cover");
      const res = await fetch("/api/admin/upload-image", { method: "POST", body: fd });
      const data = await res.json();
      coverUrl = data.url;
    }

    const res = await fetch("/api/admin/anime", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        coverImage: coverUrl,
        genres: form.genres.split(",").map((g) => g.trim()).filter(Boolean),
      }),
    });

    if (res.ok) router.push("/admin");
    else { alert("Hata oluştu"); setLoading(false); }
  }

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      <div className="pt-28 pb-20 px-4 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8 text-purple-300">Yeni Anime Ekle</h1>

        <form onSubmit={handleSubmit} className="bg-[#1a1a2e] border border-purple-900/30 rounded-2xl p-8 space-y-4">
          {[
            { label: "Başlık", key: "title", placeholder: "Anime adı" },
            { label: "Slug", key: "slug", placeholder: "anime-adi (URL için)" },
            { label: "Kapak Resmi URL", key: "coverImage", placeholder: "https://..." },
            { label: "Banner Resmi URL", key: "bannerImage", placeholder: "https://... (opsiyonel)" },
            { label: "Türler", key: "genres", placeholder: "Aksiyon, Macera, Fantezi" },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-sm text-gray-400 mb-1">{field.label}</label>
              <input
                type="text"
                value={(form as any)[field.key]}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                placeholder={field.placeholder}
                className="w-full bg-[#0a0a0f] border border-purple-900/40 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          ))}

          <div>
            <label className="block text-sm text-gray-400 mb-1">Açıklama</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="w-full bg-[#0a0a0f] border border-purple-900/40 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Durum</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full bg-[#0a0a0f] border border-purple-900/40 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
            >
              <option value="ONGOING">Devam Ediyor</option>
              <option value="COMPLETED">Tamamlandı</option>
              <option value="UPCOMING">Yakında</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => router.back()} className="flex-1 border border-gray-700 py-3 rounded-xl text-gray-400 hover:text-white transition-colors">
              İptal
            </button>
            <button type="submit" disabled={loading} className="flex-1 bg-purple-600 hover:bg-purple-500 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50">
              {loading ? "Ekleniyor..." : "Anime Ekle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
