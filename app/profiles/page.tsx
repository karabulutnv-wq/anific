"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

interface Profile {
  id: string;
  name: string;
  avatar: string;
  isAnimated: boolean;
}

interface Avatar {
  id: string;
  name: string;
  url: string;
}

export default function ProfilesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [animatedAvatars, setAnimatedAvatars] = useState<Avatar[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editProfile, setEditProfile] = useState<Profile | null>(null);
  const [newName, setNewName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") {
      fetchProfiles();
      fetch("/api/admin/avatars").then(r => r.json()).then(setAnimatedAvatars);
    }
  }, [status]);

  async function fetchProfiles() {
    const res = await fetch("/api/profiles");
    const data = await res.json();
    setProfiles(data);
  }

  async function createProfile() {
    if (!newName.trim()) return;
    setLoading(true);
    const res = await fetch("/api/profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, avatar: selectedAvatar || undefined }),
    });
    const data = await res.json();
    if (!res.ok) { alert(data.error); }
    else { setProfiles([...profiles, data]); setShowCreate(false); setNewName(""); setSelectedAvatar(""); }
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

  if (status === "loading") return (
    <div className="min-h-screen gradient-bg flex items-center justify-center">
      <div className="text-purple-400 text-xl">Yükleniyor...</div>
    </div>
  );

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      <div className="pt-28 pb-20 px-4 max-w-4xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-2 text-purple-300">Kim İzliyor?</h1>
        <p className="text-gray-500 mb-12">Profilini seç veya düzenle</p>

        <div className="flex flex-wrap justify-center gap-6">
          {profiles.map((profile) => (
            <div key={profile.id} className="flex flex-col items-center gap-2">
              <button
                onClick={() => selectProfile(profile.id)}
                className="group relative"
              >
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-transparent group-hover:border-purple-500 transition-all">
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.name}`;
                    }}
                  />
                </div>
              </button>
              <span className="text-sm text-gray-300">{profile.name}</span>
              <button
                onClick={() => setEditProfile(profile)}
                className="text-xs text-purple-500 hover:text-purple-300 transition-colors"
              >
                ✏️ Avatarı Değiştir
              </button>
            </div>
          ))}

          {profiles.length < 4 && (
            <button onClick={() => setShowCreate(true)} className="flex flex-col items-center gap-3 group">
              <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-purple-700/50 group-hover:border-purple-500 flex items-center justify-center transition-all">
                <span className="text-3xl text-purple-600 group-hover:text-purple-400">+</span>
              </div>
              <span className="text-sm text-gray-500 group-hover:text-gray-300 transition-colors">Profil Ekle</span>
            </button>
          )}
        </div>

        {/* Create modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
            <div className="bg-[#1a1a2e] border border-purple-900/50 rounded-2xl p-8 w-full max-w-md max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4 text-purple-300">Yeni Profil</h2>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Profil adı"
                className="w-full bg-[#0a0a0f] border border-purple-900/40 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 mb-4"
              />

              {animatedAvatars.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-3">Hareketli Profil Seç</p>
                  <div className="grid grid-cols-4 gap-2">
                    {animatedAvatars.map(a => (
                      <button
                        key={a.id}
                        onClick={() => setSelectedAvatar(a.url)}
                        className={`rounded-xl overflow-hidden border-2 transition-all ${selectedAvatar === a.url ? "border-purple-500" : "border-transparent hover:border-purple-700"}`}
                      >
                        <img src={a.url} alt={a.name} className="w-full aspect-square object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => { setShowCreate(false); setSelectedAvatar(""); }} className="flex-1 border border-gray-700 py-2 rounded-lg text-gray-400 hover:text-white transition-colors">
                  İptal
                </button>
                <button onClick={createProfile} disabled={loading} className="flex-1 bg-purple-600 hover:bg-purple-500 py-2 rounded-lg font-medium transition-colors disabled:opacity-50">
                  {loading ? "..." : "Oluştur"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit avatar modal */}
        {editProfile && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
            <div className="bg-[#1a1a2e] border border-purple-900/50 rounded-2xl p-8 w-full max-w-md max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4 text-purple-300">{editProfile.name} - Avatar Seç</h2>

              {animatedAvatars.length > 0 ? (
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {animatedAvatars.map(a => (
                    <button
                      key={a.id}
                      onClick={() => updateAvatar(editProfile.id, a.url)}
                      className="rounded-xl overflow-hidden border-2 border-transparent hover:border-purple-500 transition-all"
                      title={a.name}
                    >
                      <img src={a.url} alt={a.name} className="w-full aspect-square object-cover" />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm mb-6">Henüz hareketli profil eklenmemiş.</p>
              )}

              <button onClick={() => setEditProfile(null)} className="w-full border border-gray-700 py-2 rounded-lg text-gray-400 hover:text-white transition-colors">
                Kapat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
