"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

interface Avatar {
  id: string;
  name: string;
  url: string;
}

export default function AvatarsPage() {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [form, setForm] = useState({ name: "", url: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/avatars").then(r => r.json()).then(setAvatars);
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/admin/avatars", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const a = await res.json();
      setAvatars([a, ...avatars]);
      setForm({ name: "", url: "" });
    }
    setLoading(false);
  }

  async function remove(id: string) {
    await fetch("/api/admin/avatars", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setAvatars(avatars.filter(a => a.id !== id));
  }

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      <div className="pt-28 pb-20 px-4 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin" className="text-purple-400 hover:text-purple-300">← Admin</Link>
          <h1 className="text-2xl font-bold text-purple-300">Hareketli Profil Yönetimi</h1>
        </div>

        {/* Add form */}
        <div className="bg-[#1a1a2e] border border-purple-900/30 rounded-2xl p-6 mb-8">
          <h2 className="font-bold text-white mb-4">Yeni Hareketli Profil Ekle</h2>
          <form onSubmit={add} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">İsim</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="örn: Luffy Koşuyor"
                className="w-full bg-[#0a0a0f] border border-purple-900/40 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">GIF / WebP URL</label>
              <input
                type="url"
                value={form.url}
                onChange={e => setForm({ ...form, url: e.target.value })}
                placeholder="https://... (.gif veya .webp)"
                className="w-full bg-[#0a0a0f] border border-purple-900/40 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                required
              />
            </div>
            {form.url && (
              <div className="flex items-center gap-3">
                <img src={form.url} alt="önizleme" className="w-16 h-16 rounded-xl object-cover border border-purple-700/40" />
                <span className="text-sm text-gray-400">Önizleme</span>
              </div>
            )}
            <button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-500 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50">
              {loading ? "Ekleniyor..." : "Ekle"}
            </button>
          </form>
        </div>

        {/* Avatar list */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {avatars.map(a => (
            <div key={a.id} className="bg-[#1a1a2e] border border-purple-900/30 rounded-2xl p-4 text-center">
              <img src={a.url} alt={a.name} className="w-20 h-20 rounded-xl object-cover mx-auto mb-3 border border-purple-700/30" />
              <p className="text-sm text-white font-medium mb-3 truncate">{a.name}</p>
              <button onClick={() => remove(a.id)} className="text-xs text-red-400 hover:text-red-300 transition-colors">Sil</button>
            </div>
          ))}
          {avatars.length === 0 && (
            <div className="col-span-4 text-center py-10 text-gray-500">Henüz hareketli profil eklenmemiş</div>
          )}
        </div>
      </div>
    </div>
  );
}
