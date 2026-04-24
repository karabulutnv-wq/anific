"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

interface Avatar { id: string; name: string; url: string; price: number; }
interface User {
  id: string; name: string; email: string; role: string;
  ownedAvatars: { avatar: Avatar }[];
}

export default function UsersPage() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [giveAvatarId, setGiveAvatarId] = useState("");
  const [msg, setMsg] = useState("");

  async function search(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/admin/users?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    setUsers(data);
    setLoading(false);
  }

  async function selectUser(user: User) {
    setSelectedUser(user);
    setMsg("");
    const res = await fetch("/api/admin/avatars");
    setAvatars(await res.json());
  }

  async function giveAvatar() {
    if (!selectedUser || !giveAvatarId) return;
    const res = await fetch("/api/admin/users/give-avatar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: selectedUser.id, avatarId: giveAvatarId }),
    });
    const data = await res.json();
    if (res.ok) {
      setMsg("✅ Avatar verildi!");
      const avatar = avatars.find(a => a.id === giveAvatarId);
      if (avatar) setSelectedUser({ ...selectedUser, ownedAvatars: [...selectedUser.ownedAvatars, { avatar }] });
    } else {
      setMsg("❌ " + data.error);
    }
    setTimeout(() => setMsg(""), 3000);
  }

  async function removeAvatar(avatarId: string) {
    if (!selectedUser) return;
    await fetch("/api/admin/users/give-avatar", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: selectedUser.id, avatarId }),
    });
    setSelectedUser({ ...selectedUser, ownedAvatars: selectedUser.ownedAvatars.filter(a => a.avatar.id !== avatarId) });
  }

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10, padding: "10px 14px", color: "white", fontSize: 14, outline: "none",
  };

  return (
    <div className="min-h-screen" style={{ background: "#070710" }}>
      <Navbar />
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "120px 24px 80px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
          <Link href="/admin" style={{ color: "#a855f7", textDecoration: "none", fontSize: 14 }}>← Admin</Link>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "white" }}>Kullanıcı Yönetimi</h1>
        </div>

        {/* Search */}
        <form onSubmit={search} style={{ display: "flex", gap: 12, marginBottom: 32 }}>
          <input
            style={{ ...inputStyle, flex: 1 }}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="İsim veya email ile ara..."
          />
          <button type="submit" disabled={loading} style={{
            padding: "10px 24px", borderRadius: 12, border: "none", cursor: "pointer",
            background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "white", fontWeight: 600, fontSize: 14,
          }}>
            {loading ? "Aranıyor..." : "Ara"}
          </button>
        </form>

        <div style={{ display: "grid", gridTemplateColumns: selectedUser ? "1fr 1fr" : "1fr", gap: 24 }}>
          {/* User list */}
          <div>
            {users.length === 0 && query && !loading && (
              <p style={{ color: "rgba(255,255,255,0.3)", textAlign: "center", padding: 32 }}>Kullanıcı bulunamadı</p>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {users.map(user => (
                <button key={user.id} onClick={() => selectUser(user)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", textAlign: "left",
                    background: selectedUser?.id === user.id ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.03)",
                    border: selectedUser?.id === user.id ? "1px solid rgba(124,58,237,0.4)" : "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 14, cursor: "pointer", transition: "all 0.2s",
                  }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, flexShrink: 0 }}>
                    {user.name[0]}
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "white" }}>{user.name}</p>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{user.email}</p>
                  </div>
                  {user.role === "ADMIN" && (
                    <span style={{ marginLeft: "auto", fontSize: 11, color: "#a855f7", background: "rgba(124,58,237,0.15)", padding: "2px 8px", borderRadius: 20 }}>Admin</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* User detail */}
          {selectedUser && (
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "white", marginBottom: 4 }}>{selectedUser.name}</h2>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginBottom: 20 }}>{selectedUser.email}</p>

              {/* Owned avatars */}
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 10 }}>Sahip Olduğu Profiller ({selectedUser.ownedAvatars.length})</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {selectedUser.ownedAvatars.map(({ avatar }) => (
                    <div key={avatar.id} style={{ position: "relative" }}>
                      <img src={avatar.url} alt={avatar.name} style={{ width: 52, height: 52, borderRadius: 12, objectFit: "cover", border: "2px solid rgba(124,58,237,0.4)" }} />
                      <button onClick={() => removeAvatar(avatar.id)}
                        style={{ position: "absolute", top: -6, right: -6, width: 18, height: 18, borderRadius: "50%", background: "#ef4444", border: "none", cursor: "pointer", color: "white", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        ×
                      </button>
                    </div>
                  ))}
                  {selectedUser.ownedAvatars.length === 0 && <p style={{ fontSize: 13, color: "rgba(255,255,255,0.2)" }}>Henüz yok</p>}
                </div>
              </div>

              {/* Give avatar */}
              <div>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 10 }}>Avatar Ver</p>
                <select
                  value={giveAvatarId}
                  onChange={e => setGiveAvatarId(e.target.value)}
                  style={{ ...inputStyle, width: "100%", marginBottom: 10 }}
                >
                  <option value="">Avatar seç...</option>
                  {avatars.filter(a => !selectedUser.ownedAvatars.find(o => o.avatar.id === a.id)).map(a => (
                    <option key={a.id} value={a.id}>{a.name} - ₺{a.price}</option>
                  ))}
                </select>
                <button onClick={giveAvatar} disabled={!giveAvatarId} style={{
                  width: "100%", padding: "10px", borderRadius: 12, border: "none", cursor: "pointer",
                  background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "white", fontWeight: 600, fontSize: 14,
                  opacity: giveAvatarId ? 1 : 0.4,
                }}>
                  Avatar Ver
                </button>
                {msg && <p style={{ fontSize: 13, marginTop: 8, textAlign: "center" }}>{msg}</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
