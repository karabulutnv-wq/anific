"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

interface Avatar {
  id: string;
  name: string;
  url: string;
  price: number;
  shopierUrl: string | null;
}

export default function AvatarsPage() {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [form, setForm] = useState({ name: "", url: "", price: "", shopierUrl: "" });
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ price: "", shopierUrl: "" });
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
      body: JSON.stringify({ ...form, price: parseFloat(form.price) || 0 }),
    });
    if (res.ok) {
      const a = await res.json();
      setAvatars([a, ...avatars]);
      setForm({ name: "", url: "", price: "", shopierUrl: "" });
    }
    setLoading(false);
  }

  async function update(id: string) {
    const res = await fetch(`/api/admin/avatars/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price: parseFloat(editForm.price) || 0, shopierUrl: editForm.shopierUrl }),
    });
    if (res.ok) {
      setAvatars(avatars.map(a => a.id === id ? { ...a, price: parseFloat(editForm.price) || 0, shopierUrl: editForm.shopierUrl } : a));
      setEditId(null);
    }
  }

  async function remove(id: string) {
    await fetch("/api/admin/avatars", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setAvatars(avatars.filter(a => a.id !== id));
  }

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10, padding: "10px 14px", color: "white", fontSize: 14, outline: "none", width: "100%",
  };

  return (
    <div className="min-h-screen" style={{ background: "#070710" }}>
      <Navbar />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "120px 24px 80px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
          <Link href="/admin" style={{ color: "#a855f7", textDecoration: "none", fontSize: 14 }}>← Admin</Link>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "white" }}>Hareketli Profil Yönetimi</h1>
        </div>

        {/* Add form */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: 24, marginBottom: 32 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "white", marginBottom: 16 }}>Yeni Profil Ekle</h2>
          <form onSubmit={add} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 }}>İsim</label>
              <input style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Profil adı" required />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 }}>Fiyat (₺)</label>
              <input style={inputStyle} type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="29.99" />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 }}>GIF / WebP URL</label>
              <input style={inputStyle} value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://..." required />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 }}>Shopier Linki</label>
              <input style={inputStyle} value={form.shopierUrl} onChange={e => setForm({ ...form, shopierUrl: e.target.value })} placeholder="https://www.shopier.com/..." />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <button type="submit" disabled={loading} style={{
                width: "100%", padding: "12px", borderRadius: 12, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14, color: "white",
                background: "linear-gradient(135deg, #7c3aed, #6d28d9)", opacity: loading ? 0.5 : 1,
              }}>
                {loading ? "Ekleniyor..." : "Ekle"}
              </button>
            </div>
          </form>
        </div>

        {/* Avatar list */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
          {avatars.map(a => (
            <div key={a.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: 16, textAlign: "center" }}>
              <img src={a.url} alt={a.name} style={{ width: 80, height: 80, borderRadius: 16, objectFit: "cover", margin: "0 auto 12px" }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: "white", marginBottom: 4 }}>{a.name}</p>
              <p style={{ fontSize: 13, color: "#a855f7", marginBottom: 4 }}>₺{a.price}</p>
              {a.shopierUrl && <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.shopierUrl}</p>}

              {editId === a.id ? (
                <div style={{ textAlign: "left" }}>
                  <input style={{ ...inputStyle, marginBottom: 8 }} type="number" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} placeholder="Fiyat (₺)" />
                  <input style={{ ...inputStyle, marginBottom: 8 }} value={editForm.shopierUrl} onChange={e => setEditForm({ ...editForm, shopierUrl: e.target.value })} placeholder="Shopier linki" />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => update(a.id)} style={{ flex: 1, padding: "8px", borderRadius: 10, border: "none", cursor: "pointer", background: "#7c3aed", color: "white", fontSize: 13, fontWeight: 600 }}>Kaydet</button>
                    <button onClick={() => setEditId(null)} style={{ flex: 1, padding: "8px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", background: "transparent", color: "rgba(255,255,255,0.5)", fontSize: 13 }}>İptal</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                  <button onClick={() => { setEditId(a.id); setEditForm({ price: String(a.price), shopierUrl: a.shopierUrl || "" }); }}
                    style={{ padding: "6px 14px", borderRadius: 10, border: "1px solid rgba(124,58,237,0.4)", cursor: "pointer", background: "rgba(124,58,237,0.1)", color: "#a855f7", fontSize: 12 }}>
                    Düzenle
                  </button>
                  <button onClick={() => remove(a.id)} style={{ padding: "6px 14px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.3)", cursor: "pointer", background: "rgba(239,68,68,0.1)", color: "#f87171", fontSize: 12 }}>
                    Sil
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
