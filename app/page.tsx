import Link from "next/link";
import Navbar from "@/components/Navbar";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const animes = await prisma.anime.findMany({
    take: 12,
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { episodes: true } }, ratings: { select: { score: true } } },
  }).catch(() => []);

  return (
    <div style={{ minHeight: "100vh", background: "#08080f", color: "#f0f0ff" }}>
      <Navbar />

      {/* Hero */}
      <section style={{ position: "relative", paddingTop: 160, paddingBottom: 120, textAlign: "center", overflow: "hidden" }}>
        {/* Ambient glow */}
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 800, height: 500, background: "radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 100, left: "20%", width: 300, height: 300, background: "radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 80, right: "15%", width: 250, height: 250, background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 700, margin: "0 auto", padding: "0 24px" }}>
          {/* Badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)", borderRadius: 100, padding: "6px 16px", marginBottom: 32, fontSize: 13, color: "#c084fc" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#a855f7", display: "inline-block" }} />
            Türkiye'nin anime platformu
          </div>

          {/* Logo büyük */}
          <div style={{ marginBottom: 24 }}>
            <img src="/logo.svg" alt="ANIFIC" style={{ height: 56, margin: "0 auto" }} />
          </div>

          <p style={{ fontSize: 20, color: "rgba(255,255,255,0.5)", marginBottom: 8, fontWeight: 400, lineHeight: 1.6 }}>
            Binlerce anime, tek platformda.
          </p>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.25)", marginBottom: 48 }}>
            Reklamsız, kesintisiz, arkadaşlarınla birlikte izle.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" style={{
              display: "inline-block", padding: "14px 32px", borderRadius: 14,
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              color: "white", fontWeight: 700, fontSize: 15, textDecoration: "none",
              boxShadow: "0 0 40px rgba(124,58,237,0.3)",
              transition: "all 0.2s",
            }}>
              Ücretsiz Başla
            </Link>
            <Link href="/anime" style={{
              display: "inline-block", padding: "14px 32px", borderRadius: 14,
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.7)", fontWeight: 600, fontSize: 15, textDecoration: "none",
            }}>
              Animeleri Keşfet
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: "0 24px 80px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[
            { num: `${animes.length}+`, label: "Anime" },
            { num: "4K", label: "Kalite" },
            { num: "∞", label: "İzleme" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center", padding: "28px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20 }}>
              <div style={{ fontSize: 36, fontWeight: 900, background: "linear-gradient(135deg, #c084fc, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{s.num}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Son eklenenler */}
      {animes.length > 0 && (
        <section style={{ padding: "0 24px 80px", maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "white", margin: 0 }}>Son Eklenenler</h2>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>En yeni bölümler seni bekliyor</p>
            </div>
            <Link href="/anime" style={{ fontSize: 13, color: "#a855f7", textDecoration: "none", fontWeight: 600 }}>Tümünü gör →</Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 16 }}>
            {animes.map(anime => {
              const avg = anime.ratings.length > 0 ? (anime.ratings.reduce((a, b) => a + b.score, 0) / anime.ratings.length).toFixed(1) : null;
              return (
                <Link key={anime.id} href={`/anime/${anime.slug}`} style={{ textDecoration: "none", display: "block" }}>
                  <div style={{ position: "relative", aspectRatio: "3/4", borderRadius: 16, overflow: "hidden", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", transition: "transform 0.2s, box-shadow 0.2s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-6px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 20px 40px rgba(124,58,237,0.2)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}>
                    {anime.coverImage && <img src={anime.coverImage} alt={anime.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                    {avg && <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", borderRadius: 8, padding: "3px 8px", fontSize: 11, fontWeight: 700, color: "#fbbf24" }}>⭐ {avg}</div>}
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)", opacity: 0, transition: "opacity 0.2s" }}
                      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.opacity = "1"}
                      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.opacity = "0"} />
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.8)", marginTop: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{anime.title}</p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{anime._count.episodes} bölüm</p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Features */}
      <section style={{ padding: "0 24px 80px", maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "white", marginBottom: 8, textAlign: "center" }}>Neden ANIFIC?</h2>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", textAlign: "center", marginBottom: 40 }}>Anime izlemenin en iyi yolu</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
          {[
            { icon: "🎬", title: "4K Kalite", desc: "Ultra HD görüntü, canlı renkler" },
            { icon: "👥", title: "Birlikte İzle", desc: "Arkadaşlarınla senkronize izle" },
            { icon: "💬", title: "Topluluk", desc: "Yorum yap, puan ver, tartış" },
            { icon: "🎭", title: "Özel Profiller", desc: "Hareketli avatarlar, kişisel liste" },
          ].map(f => (
            <div key={f.title} style={{ padding: "24px 20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, transition: "border-color 0.2s" }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(124,58,237,0.3)"}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.06)"}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "white", marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "0 24px 100px", maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
        <div style={{ padding: "48px 32px", background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.15)", borderRadius: 28 }}>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: "white", marginBottom: 12 }}>Hemen başla</h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 28 }}>Ücretsiz kayıt ol, binlerce anime izle</p>
          <Link href="/register" style={{ display: "inline-block", padding: "14px 36px", borderRadius: 14, background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "white", fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
            Kayıt Ol
          </Link>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "24px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 12, flexWrap: "wrap" }}>
          <Link href="/privacy" style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>Gizlilik Politikası</Link>
          <Link href="/requests" style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>Anime İste</Link>
          <Link href="/pricing" style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>Üyelik</Link>
        </div>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.15)" }}>© 2024 ANIFIC. Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
}
