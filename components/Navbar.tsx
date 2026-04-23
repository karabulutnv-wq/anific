"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";

interface AnimeResult {
  id: string; slug: string; title: string; coverImage: string;
  _count: { episodes: number };
}

export default function Navbar() {
  const { data: session } = useSession();
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
      } else { setResults([]); setShowResults(false); }
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

  const navBg = scrolled
    ? "rgba(7,7,16,0.95)"
    : "transparent";

  const linkStyle = (href: string) => ({
    padding: "6px 12px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: 500,
    color: pathname === href ? "#a855f7" : "rgba(255,255,255,0.5)",
    background: pathname === href ? "rgba(124,58,237,0.12)" : "transparent",
    transition: "all 0.2s",
    textDecoration: "none",
  } as React.CSSProperties);

  return (
    <nav style={{
      position: "fixed", top: 0, width: "100%", zIndex: 50,
      background: navBg,
      backdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "none",
      transition: "all 0.3s",
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", height: 64, gap: 16 }}>
        {/* Logo */}
        <Link href="/" style={{
          fontSize: 20, fontWeight: 900, letterSpacing: "0.15em", flexShrink: 0, textDecoration: "none",
          background: "linear-gradient(135deg, #c084fc, #7c3aed)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        }}>
          ANIFIC
        </Link>

        {/* Search */}
        <div ref={searchRef} style={{ position: "relative", flex: 1, maxWidth: 360, display: "none" }} className="md:block">
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>🔍</span>
            <input
              type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)}
              placeholder="Anime ara..."
              style={{
                width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12, paddingLeft: 36, paddingRight: 16, paddingTop: 8, paddingBottom: 8,
                fontSize: 14, color: "white", outline: "none",
              }}
            />
          </div>
          {showResults && results.length > 0 && (
            <div style={{
              position: "absolute", top: "100%", marginTop: 8, width: "100%",
              background: "rgba(15,15,25,0.98)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16, overflow: "hidden", zIndex: 50, backdropFilter: "blur(20px)",
            }}>
              {results.map(a => (
                <Link key={a.id} href={`/anime/${a.slug}`} onClick={() => { setShowResults(false); setSearchQ(""); }}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", textDecoration: "none", transition: "background 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  {a.coverImage && <img src={a.coverImage} alt={a.title} style={{ width: 32, height: 44, objectFit: "cover", borderRadius: 8 }} />}
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: "white" }}>{a.title}</p>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{a._count.episodes} bölüm</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }} className="hidden lg:flex">
          {[
            { href: "/anime", label: "Animeler" },
            { href: "/requests", label: "Anime İste" },
            { href: "/pricing", label: "Üyelik" },
            ...(session?.user ? [
              { href: "/friends", label: "Arkadaşlar" },
              { href: "/favorites", label: "Favoriler" },
            ] : []),
          ].map(link => (
            <Link key={link.href} href={link.href} style={linkStyle(link.href)}>{link.label}</Link>
          ))}
        </div>

        {/* User */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, marginLeft: "auto" }}>
          {session?.user ? (
            <div style={{ position: "relative" }}>
              <button onClick={() => setOpen(!open)} style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12, padding: "6px 12px", cursor: "pointer", transition: "all 0.2s",
              }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", overflow: "hidden", background: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                  {activeAvatar ? <img src={activeAvatar} alt="profil" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : session.user.name?.[0]?.toUpperCase()}
                </div>
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} className="hidden md:block">
                  {session.user.name}
                </span>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>▾</span>
              </button>

              {open && (
                <div style={{
                  position: "absolute", right: 0, marginTop: 8, width: 220,
                  background: "rgba(12,12,20,0.98)", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 20, overflow: "hidden", zIndex: 50, backdropFilter: "blur(20px)",
                }}>
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{session.user.name}</p>
                  </div>
                  {[
                    { href: "/profiles", label: "Profiller", icon: "👤" },
                    { href: "/favorites", label: "Favorilerim", icon: "❤️" },
                    { href: "/friends", label: "Arkadaşlar", icon: "👥" },
                    { href: "/settings", label: "Ayarlar", icon: "⚙️" },
                  ].map(item => (
                    <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", fontSize: 14, color: "rgba(255,255,255,0.5)", textDecoration: "none", transition: "all 0.2s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "white"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}>
                      <span>{item.icon}</span>{item.label}
                    </Link>
                  ))}
                  {(session.user as any).role === "ADMIN" && (
                    <Link href="/admin" onClick={() => setOpen(false)}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", fontSize: 14, color: "#a855f7", textDecoration: "none" }}>
                      <span>🛡️</span>Admin Panel
                    </Link>
                  )}
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <button onClick={() => signOut()} style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 16px",
                      fontSize: 14, color: "#f87171", background: "none", border: "none", cursor: "pointer", textAlign: "left",
                    }}>
                      <span>🚪</span>Çıkış Yap
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Link href="/login" style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", textDecoration: "none", padding: "6px 12px" }}>Giriş</Link>
              <Link href="/register" style={{
                fontSize: 14, fontWeight: 600, color: "white", textDecoration: "none",
                padding: "8px 18px", borderRadius: 12,
                background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              }}>Kayıt Ol</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
