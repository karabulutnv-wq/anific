"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

interface Profile { id: string; name: string; avatar: string; isAnimated: boolean; }
interface Avatar { id: string; name: string; url: string; price: number; shopierUrl: string | null; }

export default function ProfilesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [ownedAvatars, setOwnedAvatars] = useState<Avatar[]>([]);
  const [shopAvatars, setShopAvatars] = useState<Avatar[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editProfile, setEditProfile] = useState<Profile | null>(null);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") {
      fetch("/api/profiles").then(r => r.json()).then(setProfiles);
      fetch("/api/profiles/avatars").then(r => r.json()).then(data => {
        setOwnedAvatars(data.owned || []);
        setShopAvatars(data.shop || []);
      });
    }
  }, [status]);

  async function createProfile() {
    if (!newName.trim()) return;
    setLoading(true);
    const res = await fetch("/api/profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });
    const data = await res.json();
    if (!res.ok) alert(data.error);
    else { setProfiles([...profiles, data]); setShowCreate(false); setNewName(""); }
    setLoading(false);
  }

  async function updateAvatar(profileId: string, avatarUrl: string) {
    const res = await fetch(`/api/profiles/${profileId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatar: avatarUrl }),
    });
    if (res.ok) {
      setProfiles(profiles.map(p => p.id === profileId ? { ...p, avatar: avatarUrl } : p));
      setEditProfile(null);
    }
  }

  function selectProfile(profileId: string) {
    localStorage.setItem("activeProfile", profileId);
    router.push("/anime");
  }

  const cardStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 20, padding: 24,
  };

  if (status === "loading") return (
    <div style={{ minHeight: "100vh", background: "#070710", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#a855f7" }}>Yükleniyor...</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#070710" }}>
      <Navbar />
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "120px 24px 80px", textAlign: "center" }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: "white", marginBottom: 8 }}>Kim İzliyor?</h1>
        <p style={{ color: "rgba(255,255,255,0.3)", marginBottom: 48 }}>Profilini seç veya düzenle</p>

        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 24, marginBottom: 48 }}>
          {profiles.map(profile => (
            <div key={profile.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <button onClick={() => selectProfile(profile.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                <div style={{ width: 96, height: 96, borderRadius: 20, overflow: "hidden", border: "2px solid rgba(255,255,255,0.1)", transition: "border-color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "#a855f7")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}>
                  <img src={profile.avatar} alt={profile.name} style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={e => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.name}`; }} />
                </div>
              </button>
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>{profile.name}</span>
              <button onClick={() => setEditProfile(profile)} style={{ fontSize: 12, color: "#a855f7", background: "none", border: "none", cursor: "pointer" }}>
                ✏️ Avatarı Değiştir
              </button>
            </div>
          ))}

          {profiles.length < 4 && (
            <button onClick={() => setShowCreate(true)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer" }}>
              <div style={{ width: 96, height: 96, borderRadius: 20, border: "2px dashed rgba(124,58,237,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, color: "rgba(124,58,237,0.6)" }}>+</div>
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.3)" }}>Profil Ekle</span>
            </button>
          )}
        </div>

        {/* Create modal */}
        {showCreate && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}>
            <div style={{ ...cardStyle, width: "100%", maxWidth: 400 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "white", marginBottom: 16 }}>Yeni Profil</h2>
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Profil adı"
                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "12px 16px", color: "white", fontSize: 14, outline: "none", marginBottom: 16 }} />
              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={() => setShowCreate(false)} style={{ flex: 1, padding: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.5)", cursor: "pointer" }}>İptal</button>
                <button onClick={createProfile} disabled={loading} style={{ flex: 1, padding: 12, borderRadius: 12, border: "none", background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "white", fontWeight: 600, cursor: "pointer" }}>
                  {loading ? "..." : "Oluştur"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit avatar modal */}
        {editProfile && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}>
            <div style={{ ...cardStyle, width: "100%", maxWidth: 480, maxHeight: "80vh", overflowY: "auto" }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "white", marginBottom: 4 }}>{editProfile.name} — Avatar Seç</h2>

              {ownedAvatars.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 12 }}>Sahip Olduklarım</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                    {ownedAvatars.map(a => (
                      <button key={a.id} onClick={() => updateAvatar(editProfile.id, a.url)}
                        style={{ borderRadius: 14, overflow: "hidden", border: "2px solid transparent", cursor: "pointer", padding: 0, transition: "border-color 0.2s" }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = "#a855f7")}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = "transparent")}>
                        <img src={a.url} alt={a.name} style={{ width: "100%", aspectRatio: "1", objectFit: "cover", display: "block" }} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {shopAvatars.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 12 }}>Satın Al</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                    {shopAvatars.map(a => (
                      <div key={a.id} style={{ borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)" }}>
                        <img src={a.url} alt={a.name} style={{ width: "100%", aspectRatio: "1", objectFit: "cover", display: "block", opacity: 0.6 }} />
                        <div style={{ padding: "8px 10px" }}>
                          <p style={{ fontSize: 12, color: "white", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</p>
                          <p style={{ fontSize: 13, color: "#a855f7", fontWeight: 700, marginBottom: 6 }}>₺{a.price}</p>
                          {a.shopierUrl ? (
                            <a href={a.shopierUrl} target="_blank" rel="noopener noreferrer"
                              style={{ display: "block", textAlign: "center", padding: "6px", borderRadius: 8, background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "white", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                              Satın Al
                            </a>
                          ) : (
                            <span style={{ display: "block", textAlign: "center", padding: "6px", borderRadius: 8, background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)", fontSize: 12 }}>Yakında</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {ownedAvatars.length === 0 && shopAvatars.length === 0 && (
                <p style={{ color: "rgba(255,255,255,0.3)", textAlign: "center", padding: 24 }}>Henüz avatar eklenmemiş</p>
              )}

              <button onClick={() => setEditProfile(null)} style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.5)", cursor: "pointer", marginTop: 8 }}>
                Kapat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
