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
    <div className="min-h-screen bg-primary relative">
      <div className="gradient-bg">
        <Navbar />

        {/* Hero */}
        <section className="relative pt-40 pb-32 px-4 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute top-40 right-1/4 w-80 h-80 bg-violet-500/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <div className="inline-block mb-4 px-4 py-1.5 glass-purple rounded-full text-sm font-medium text-purple-300 fade-in">
              ✨ 4K Kalitede Anime Deneyimi
            </div>
            <h1 className="text-7xl font-black mb-6 glow-text leading-tight" style={{ animationDelay: "0.1s" }}>
              ANIFIC
            </h1>
            <p className="text-xl text-gray-400 mb-3 max-w-2xl mx-auto leading-relaxed">
              Binlerce anime, reklamsız izleme, arkadaşlarınla birlikte izle
            </p>
            <p className="text-gray-600 mb-10">Ücretsiz kayıt ol, hemen izlemeye başla</p>

            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/register" className="btn-primary relative z-10 inline-block">
                Hemen Başla
              </Link>
              <Link href="/anime" className="btn-ghost inline-block">
                Animeleri Keşfet →
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-4 max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: "🎬", title: "4K Kalite", desc: "Ultra HD görüntü, canlı renkler, akıcı izleme" },
              { icon: "👥", title: "Arkadaşlarla İzle", desc: "Senkronize izleme, anlık chat, birlikte eğlen" },
              { icon: "🎭", title: "Hareketli Profiller", desc: "Kişiselleştir, öne çık, tarzını göster" },
              { icon: "⚡", title: "Hızlı & Akıcı", desc: "Anında yükleme, kesintisiz streaming" },
              { icon: "🔍", title: "Akıllı Arama", desc: "Türe göre filtrele, istediğini hemen bul" },
              { icon: "💬", title: "Topluluk", desc: "Yorum yap, puan ver, anime iste" },
            ].map((f, i) => (
              <div key={f.title} className="glass rounded-2xl p-6 card-hover fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-bold mb-2 text-white">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Latest */}
        {animes.length > 0 && (
          <section className="py-20 px-4 max-w-7xl mx-auto relative z-10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black text-white">Son Eklenenler</h2>
              <Link href="/anime" className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors">
                Tümünü Gör →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {animes.map((anime, i) => {
                const avg = anime.ratings.length > 0 ? (anime.ratings.reduce((a, b) => a + b.score, 0) / anime.ratings.length).toFixed(1) : null;
                return (
                  <Link key={anime.id} href={`/anime/${anime.slug}`} className="group card-hover fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                    <div className="aspect-[3/4] rounded-xl overflow-hidden glass relative">
                      {anime.coverImage ? (
                        <img src={anime.coverImage} alt={anime.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-purple-600/40 text-4xl">🎌</div>
                      )}
                      {avg && (
                        <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm text-yellow-400 text-xs font-bold px-2 py-1 rounded-lg">
                          ⭐ {avg}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-gray-200 truncate group-hover:text-white transition-colors">{anime.title}</p>
                    <p className="text-xs text-gray-600">{anime._count.episodes} Bölüm</p>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-24 px-4 text-center relative z-10">
          <div className="max-w-2xl mx-auto glass-purple rounded-3xl p-12">
            <h2 className="text-3xl font-black text-white mb-4">Anime Dünyasına Katıl</h2>
            <p className="text-gray-400 mb-8">Ücretsiz kayıt ol, binlerce anime izle</p>
            <Link href="/register" className="btn-primary inline-block">
              Hemen Başla
            </Link>
          </div>
        </section>

        <footer className="border-t border-white/5 py-8 text-center text-gray-700 text-sm relative z-10">
          © 2024 ANIFIC. Tüm hakları saklıdır.
        </footer>
      </div>
    </div>
  );
}
