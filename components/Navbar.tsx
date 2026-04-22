"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AnimeResult {
  id: string;
  slug: string;
  title: string;
  coverImage: string;
  _count: { episodes: number };
}

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [results, setResults] = useState<AnimeResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [activeAvatar, setActiveAvatar] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Aktif profil avatarını yükle
    const profileId = localStorage.getItem("activeProfile");
    if (profileId && session?.user) {
      fetch("/api/profiles")
        .then(r => r.json())
        .then((profiles: { id: string; avatar: string }[]) => {
          const p = profiles.find(p => p.id === profileId);
          if (p?.avatar) setActiveAvatar(p.avatar);
        })
        .catch(() => {});
    }
  }, [session]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQ.length >= 2) {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQ)}`);
        const data = await res.json();
        setResults(data);
        setShowResults(true);
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQ]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-purple-900/30">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16 gap-4">
        <Link href="/" className="text-2xl font-black tracking-wider glow-text flex-shrink-0" style={{ color: "#a855f7" }}>
          ANIFIC
        </Link>

        {/* Search */}
        <div ref={searchRef} className="relative flex-1 max-w-md hidden md:block">
          <input
            type="text"
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            placeholder="Anime ara..."
            className="w-full bg-white/5 border border-purple-900/30 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
          {showResults && results.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-[#1a1a2e] border border-purple-900/40 rounded-xl shadow-2xl overflow-hidden z-50">
              {results.map(a => (
                <Link
                  key={a.id}
                  href={`/anime/${a.slug}`}
                  onClick={() => { setShowResults(false); setSearchQ(""); }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-purple-900/20 transition-colors"
                >
                  {a.coverImage && <img src={a.coverImage} alt={a.title} className="w-8 h-11 object-cover rounded" />}
                  <div>
                    <p className="text-sm font-medium text-white">{a.title}</p>
                    <p className="text-xs text-gray-500">{a._count.episodes} bölüm</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
          {showResults && results.length === 0 && searchQ.length >= 2 && (
            <div className="absolute top-full mt-2 w-full bg-[#1a1a2e] border border-purple-900/40 rounded-xl shadow-2xl px-4 py-3 text-sm text-gray-500">
              Sonuç bulunamadı
            </div>
          )}
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm flex-shrink-0">
          <Link href="/anime" className="text-gray-300 hover:text-purple-400 transition-colors">Animeler</Link>
          <Link href="/requests" className="text-gray-300 hover:text-purple-400 transition-colors">Anime İste</Link>
          <Link href="/pricing" className="text-gray-300 hover:text-purple-400 transition-colors">Üyelik</Link>
          {session?.user && (
            <>
              <Link href="/favorites" className="text-gray-300 hover:text-purple-400 transition-colors">Favoriler</Link>
              <Link href="/profiles" className="text-gray-300 hover:text-purple-400 transition-colors">Profiller</Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {session?.user ? (
            <div className="relative">
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 bg-purple-900/40 hover:bg-purple-800/40 px-3 py-2 rounded-lg transition-colors"
              >
                <div className="w-7 h-7 rounded-full overflow-hidden bg-purple-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {activeAvatar ? (
                    <img src={activeAvatar} alt="profil" className="w-full h-full object-cover" />
                  ) : (
                    session.user.name?.[0]?.toUpperCase()
                  )}
                </div>
                <span className="text-sm hidden md:block">{session.user.name}</span>
              </button>
              {open && (
                <div className="absolute right-0 mt-2 w-48 bg-[#1a1a2e] border border-purple-900/50 rounded-xl shadow-xl overflow-hidden z-50">
                  <Link href="/profiles" onClick={() => setOpen(false)} className="block px-4 py-3 text-sm hover:bg-purple-900/30 transition-colors">Profiller</Link>
                  <Link href="/favorites" onClick={() => setOpen(false)} className="block px-4 py-3 text-sm hover:bg-purple-900/30 transition-colors">Favorilerim</Link>
                  <Link href="/settings" onClick={() => setOpen(false)} className="block px-4 py-3 text-sm hover:bg-purple-900/30 transition-colors">Ayarlar</Link>
                  {(session.user as any).role === "ADMIN" && (
                    <Link href="/admin" onClick={() => setOpen(false)} className="block px-4 py-3 text-sm text-purple-400 hover:bg-purple-900/30 transition-colors">Admin Panel</Link>
                  )}
                  <button onClick={() => signOut()} className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-900/20 transition-colors">
                    Çıkış Yap
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="text-sm text-gray-300 hover:text-white transition-colors">Giriş</Link>
              <Link href="/register" className="text-sm bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg transition-colors font-medium">Kayıt Ol</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
