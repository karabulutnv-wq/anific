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
    <div className="min-h-screen" style={{ background: "#070710" }}>
      <Navbar />

      {/* Hero */}
      <section className="relative pt-40 pb-32 px-4 overflow-hidden text-center">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #7c3aed, transparent)", filter: "blur(60px)" }} />
          <div className="absolute top-40 right-1/4 w-80 h-80 rounded-full opacity-8" style={{ background: "radial-gradient(circle, #6d28d9, transparent)", filter: "blur(60px)" }} />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full text-sm font-medium text-purple-300 border border-purple-500/20" style={{ background: "rgba(124,58,237,0.1)" }}>
            ✨ 4K Kalitede Anime Deneyimi
          </div>

          <h1 className="text-8xl font-black mb-6 leading-none" style={{
            background: "linear-gradient(135deg, #c084fc, #a855f7, #7c3aed)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            ANIFIC
          </h1>

          <p className="text-xl text-gray-400 mb-3 max-w-2xl mx-auto">
            Binlerce anime, reklamsız izleme, arkadaşlarınla birlikte izle
          </p>
          <p className="text-gray-600 mb-12">Ücretsiz kayıt ol, hemen izlemeye başla</p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/register"
              className="px-8 py-3.5 rounded-2xl font-semibold text-white transition-all hover:scale-105 hover:shadow-2xl"
              style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)", boxShadow: "0 0 30px rgba(124,58,237,0.3)" }}>
              Hemen Başla
            </Link>
            <Link href="/anime"
              className="px-8 py-3.5 rounded-2xl font-semibold text-gray-300 border border-white/10 hover:border-purple-500/40 hover:text-white transition-all"
              style={{ background: "rgba(255,255,255,0.04)" }}>
              Animeleri Keşfet →
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: "🎬", title: "4K Kalite", desc: "Ultra HD görüntü, canlı renkler, akıcı izleme" },
            { icon: "👥", title: "Arkadaşlarla İzle", desc: "Senkronize izleme, anlık chat, birlikte eğlen" },
            { icon: "🎭", title: "Hareketli Profiller", desc: "Kişiselleştir, öne çık, tarzını göster" },
            { icon: "⚡", title: "Hızlı & Akıcı", desc: "Anında yükleme, kesintisiz streaming" },
            { icon: "🔍", title: "Akıllı Arama", desc: "Türe göre filtrele, istediğini hemen bul" },
            { icon: "💬", title: "Topluluk", desc: "Yorum yap, puan ver, anime iste" },
          ].map((f) => (
            <div key={f.title}
              className="rounded-2xl p-6 border transition-all hover:-translate-y-1 hover:shadow-2xl"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-bold mb-2 text-white">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Latest Anime */}
      {animes.length > 0 && (
        <section className="py-20 px-4 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-black text-white">Son Eklenenler</h2>
            <Link href="/anime" className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors">
              Tümünü Gör →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {animes.map((anime) => {
              const avg = anime.ratings.length > 0
                ? (anime.ratings.reduce((a, b) => a + b.score, 0) / anime.ratings.length).toFixed(1)
                : null;
              return (
                <Link key={anime.id} href={`/anime/${anime.slug}`}
                  className="group transition-all hover:-translate-y-2 hover:shadow-2xl">
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden relative"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    {anime.coverImage ? (
                      <img src={anime.coverImage} alt={anime.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl text-purple-800">🎌</div>
                    )}
                    {avg && (
                      <div className="absolute top-2 right-2 text-yellow-400 text-xs font-bold px-2 py-1 rounded-lg" style={{ background: "rgba(0,0,0,0.8)" }}>
                        ⭐ {avg}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-gray-300 truncate group-hover:text-white transition-colors">{anime.title}</p>
                  <p className="text-xs text-gray-600">{anime._count.episodes} Bölüm</p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-24 px-4 text-center">
        <div className="max-w-2xl mx-auto rounded-3xl p-12 border"
          style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" }}>
          <h2 className="text-3xl font-black text-white mb-4">Anime Dünyasına Katıl</h2>
          <p className="text-gray-400 mb-8">Ücretsiz kayıt ol, binlerce anime izle</p>
          <Link href="/register"
            className="inline-block px-8 py-3.5 rounded-2xl font-semibold text-white transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}>
            Hemen Başla
          </Link>
        </div>
      </section>

      <footer className="py-8 text-center text-gray-700 text-sm border-t border-white/5">
        <p>© 2024 ANIFIC. Tüm hakları saklıdır.</p>
        <div className="flex justify-center gap-6 mt-3">
          <Link href="/privacy" className="hover:text-gray-500 transition-colors">Gizlilik Politikası</Link>
          <Link href="/pricing" className="hover:text-gray-500 transition-colors">Üyelik</Link>
          <Link href="/requests" className="hover:text-gray-500 transition-colors">Anime İste</Link>
        </div>
      </footer>
    </div>
  );
}
