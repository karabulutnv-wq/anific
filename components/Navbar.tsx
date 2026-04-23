"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

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
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [results, setResults] = useState<AnimeResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [activeAvatar, setActiveAvatar] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const profileId = localStorage.getItem("activeProfile");
    if (profileId && session?.user) {
      fetch("/api/profiles").then(r => r.json()).then((profiles: { id: string; avatar: string }[]) => {
        const p = profiles.find(p => p.id === profileId);
        if (p?.avatar) setActiveAvatar(p.avatar);
      }).catch(() => {});
    }
  }, [session]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQ.length >= 2) {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQ)}`);
        setResults(await res.json());
        setShowResults(true);
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQ]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowResults(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const navLinks = [
    { href: "/anime", label: "Animeler" },
    { href: "/requests", label: "Anime İste" },
    { href: "/pricing", label: "Üyelik" },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-black/90 backdrop-blur-xl border-b border-white/5 shadow-2xl" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16 gap-4">
        {/* Logo */}
        <Link href="/" className="text-xl font-black tracking-widest glow-text flex-shrink-0">
          ANIFIC
        </Link>

        {/* Search */}
        <div ref={searchRef} className="relative flex-1 max-w-sm hidden md:block">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm">🔍</span>
            <input
              type="text"
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              placeholder="Anime ara..."
              className="w-full bg-white/5 border border-white/8 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:bg-white/8 transition-all"
            />
          </div>
          {showResults && results.length > 0 && (
            <div className="absolute top-full mt-2 w-full glass rounded-xl shadow-2xl overflow-hidden z-50">
              {results.map(a => (
                <Link key={a.id} href={`/anime/${a.slug}`} onClick={() => { setShowResults(false); setSearchQ(""); }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors">
                  {a.coverImage && <img src={a.coverImage} alt={a.title} className="w-8 h-11 object-cover rounded-lg" />}
                  <div>
                    <p className="text-sm font-medium text-white">{a.title}</p>
                    <p className="text-xs text-gray-600">{a._count.episodes} bölüm</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
          {showResults && results.length === 0 && searchQ.length >= 2 && (
            <div className="absolute top-full mt-2 w-full glass rounded-xl px-4 py-3 text-sm text-gray-600 z-50">Sonuç bulunamadı</div>
          )}
        </div>

        {/* Nav links */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${pathname === link.href ? "text-purple-400 bg-purple-500/10" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
              {link.label}
            </Link>
          ))}
          {session?.user && (
            <>
              <Link href="/friends" className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${pathname === "/friends" ? "text-purple-400 bg-purple-500/10" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
                Arkadaşlar
              </Link>
              <Link href="/favorites" className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${pathname === "/favorites" ? "text-purple-400 bg-purple-500/10" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
                Favoriler
              </Link>
            </>
          )}
        </div>

        {/* User */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {session?.user ? (
            <div className="relative">
              <button onClick={() => setOpen(!open)}
                className="flex items-center gap-2 glass hover:bg-white/8 px-3 py-2 rounded-xl transition-all">
                <div className="w-7 h-7 rounded-full overflow-hidden bg-purple-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {activeAvatar ? (
                    <img src={activeAvatar} alt="profil" className="w-full h-full object-cover" />
                  ) : (
                    session.user.name?.[0]?.toUpperCase()
                  )}
                </div>
                <span className="text-sm text-gray-300 hidden md:block max-w-20 truncate">{session.user.name}</span>
                <span className="text-gray-600 text-xs">▾</span>
              </button>
              {open && (
                <div className="absolute right-0 mt-2 w-52 glass rounded-2xl shadow-2xl overflow-hidden z-50 fade-in">
                  <div className="px-4 py-3 border-b border-white/5">
                    <p className="text-sm font-medium text-white truncate">{session.user.name}</p>
                    <p className="text-xs text-gray-600 truncate">{session.user.email}</p>
                  </div>
                  {[
                    { href: "/profiles", label: "Profiller", icon: "👤" },
                    { href: "/favorites", label: "Favorilerim", icon: "❤️" },
                    { href: "/friends", label: "Arkadaşlar", icon: "👥" },
                    { href: "/settings", label: "Ayarlar", icon: "⚙️" },
                  ].map(item => (
                    <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                      <span>{item.icon}</span>{item.label}
                    </Link>
                  ))}
                  {(session.user as any).role === "ADMIN" && (
                    <Link href="/admin" onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-purple-400 hover:bg-purple-500/10 transition-colors">
                      <span>🛡️</span>Admin Panel
                    </Link>
                  )}
                  <div className="border-t border-white/5">
                    <button onClick={() => signOut()}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                      <span>🚪</span>Çıkış Yap
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="text-sm text-gray-400 hover:text-white px-3 py-2 transition-colors">Giriş</Link>
              <Link href="/register" className="btn-primary text-sm py-2 px-4 inline-block">Kayıt Ol</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
