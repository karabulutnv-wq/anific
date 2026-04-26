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
  const [mobileOpen, setMobileOpen] = useState(false);
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
    setMobileOpen(false);
    setOpen(false);
  }, [pathname]);

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

  const navLinks = [
    { href: "/anime", label: "Animeler" },
    { href: "/requests", label: "Anime İste" },
    ...(session?.user ? [
      { href: "/friends", label: "Arkadaşlar" },
      { href: "/favorites", label: "Favoriler" },
    ] : []),
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, width: "100%", zIndex: 50,
        background: scrolled ? "rgba(7,7,16,0.97)" : "rgba(7,7,16,0.8)",
        backdropFilter: "blur(20px)",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "none",
        transition: "all 0.3s",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 16px", display: "flex", alignItems: "center", height: 60, gap: 12 }}>
          
          {/* Logo */}
          <Link href="/" style={{
            fontSize: 18, fontWeight: 900, letterSpacing: "0.15em", flexShrink: 0, textDecoration: "none",
            background: "linear-gradient(135deg, #c084fc, #7c3aed)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            ANIFIC
          </Link>

          {/* Search - desktop */}
          <div ref={searchRef} style={{ position: "relative", flex: 1, maxWidth: 320, display: "none" }} className="md:block">
            <input
              type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)}
              placeholder="🔍 Anime ara..."
              style={{
                width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12, padding: "8px 16px", fontSize: 14, color: "white", outline: "none",
              }}
            />
            {showResults && results.length > 0 && (
              <div style={{
                position: "absolute", top: "100%", marginTop: 8, width: "100%",
                background: "rgba(12,12,20,0.98)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16, overflow: "hidden", zIndex: 50, backdropFilter: "blur(20px)",
              }}>
                {results.map(a => (
                  <Link key={a.id} href={`/anime/${a.slug}`} onClick={() => { setShowResults(false); setSearchQ(""); }}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", textDecoration: "none" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    {a.coverImage && <img src={a.coverImage} alt={a.title} style={{ width: 28, height: 38, objectFit: "cover", borderRadius: 6 }} />}
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 500, color: "white" }}>{a.title}</p>
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{a._count.episodes} bölüm</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Desktop nav links */}
          <div style={{ display: "flex", alignItems: "center", gap: 2, marginLeft: "auto" }} className="hidden lg:flex">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} style={{
                padding: "6px 12px", borderRadius: 10, fontSize: 14, fontWeight: 500, textDecoration: "none",
                color: isActive(link.href) ? "#a855f7" : "rgba(255,255,255,0.5)",
                background: isActive(link.href) ? "rgba(124,58,237,0.12)" : "transparent",
                transition: "all 0.2s",
              }}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* User button - desktop */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }} className="hidden md:flex">
            {session?.user ? (
              <div style={{ position: "relative" }}>
                <button onClick={() => setOpen(!open)} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12, padding: "6px 12px", cursor: "pointer",
                }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", overflow: "hidden", background: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                    {activeAvatar ? <img src={activeAvatar} alt="profil" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : session.user.name?.[0]?.toUpperCase()}
                  </div>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {session.user.name}
                  </span>
                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>▾</span>
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
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", fontSize: 14, color: "rgba(255,255,255,0.5)", textDecoration: "none" }}
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
              <div style={{ display: "flex", gap: 8 }}>
                <Link href="/login" style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", textDecoration: "none", padding: "6px 12px" }}>Giriş</Link>
                <Link href="/register" style={{ fontSize: 14, fontWeight: 600, color: "white", textDecoration: "none", padding: "8px 16px", borderRadius: 12, background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}>Kayıt Ol</Link>
              </div>
            )}
          </div>

          {/* Hamburger - mobile */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden"
            style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", padding: 8, color: "white", fontSize: 22 }}
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div style={{
            background: "rgba(7,7,16,0.98)", backdropFilter: "blur(20px)",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            padding: "16px",
          }}>
            {/* Mobile search */}
            <input
              type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)}
              placeholder="🔍 Anime ara..."
              style={{
                width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12, padding: "10px 16px", fontSize: 14, color: "white", outline: "none", marginBottom: 12,
              }}
            />

            {/* Mobile nav links */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
              {navLinks.map(link => (
                <Link key={link.href} href={link.href} style={{
                  padding: "12px 16px", borderRadius: 12, fontSize: 15, fontWeight: 500, textDecoration: "none",
                  color: isActive(link.href) ? "#a855f7" : "rgba(255,255,255,0.7)",
                  background: isActive(link.href) ? "rgba(124,58,237,0.12)" : "transparent",
                }}>
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Mobile user */}
            {session?.user ? (
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", overflow: "hidden", background: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700 }}>
                    {activeAvatar ? <img src={activeAvatar} alt="profil" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : session.user.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: "white" }}>{session.user.name}</p>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{session.user.email}</p>
                  </div>
                </div>
                {[
                  { href: "/profiles", label: "Profiller", icon: "👤" },
                  { href: "/favorites", label: "Favorilerim", icon: "❤️" },
                  { href: "/friends", label: "Arkadaşlar", icon: "👥" },
                  { href: "/settings", label: "Ayarlar", icon: "⚙️" },
                  ...(((session.user as any).role === "ADMIN") ? [{ href: "/admin", label: "Admin Panel", icon: "🛡️" }] : []),
                ].map(item => (
                  <Link key={item.href} href={item.href}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 8px", fontSize: 15, color: "rgba(255,255,255,0.6)", textDecoration: "none", borderRadius: 10 }}>
                    <span>{item.icon}</span>{item.label}
                  </Link>
                ))}
                <button onClick={() => signOut()} style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 8px",
                  fontSize: 15, color: "#f87171", background: "none", border: "none", cursor: "pointer", textAlign: "left", borderRadius: 10,
                }}>
                  <span>🚪</span>Çıkış Yap
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 8, borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 12 }}>
                <Link href="/login" style={{ flex: 1, textAlign: "center", padding: "12px", borderRadius: 12, fontSize: 15, color: "rgba(255,255,255,0.6)", textDecoration: "none", border: "1px solid rgba(255,255,255,0.1)" }}>Giriş</Link>
                <Link href="/register" style={{ flex: 1, textAlign: "center", padding: "12px", borderRadius: 12, fontSize: 15, fontWeight: 600, color: "white", textDecoration: "none", background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}>Kayıt Ol</Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </>
  );
}
