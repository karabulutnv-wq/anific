import Link from "next/link";
import Navbar from "@/components/Navbar";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const animes = await prisma.anime.findMany({
    take: 12,
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { episodes: true } } },
  }).catch(() => []);

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-6xl font-black mb-4 glow-text" style={{ color: "#a855f7" }}>ANIFIC</h1>
          <p className="text-xl text-gray-300 mb-2">En iyi anime deneyimi, 4K kalitede</p>
          <p className="text-gray-500 mb-8">Binlerce anime bölümü, reklamsız, kesintisiz izleme</p>
          <div className="flex gap-4 justify-center">
            <Link href="/pricing" className="bg-purple-600 hover:bg-purple-500 px-8 py-3 rounded-xl font-semibold transition-all glow hover:scale-105">
              Üyelik Al
            </Link>
            <Link href="/anime" className="border border-purple-600/50 hover:border-purple-400 px-8 py-3 rounded-xl font-semibold transition-all hover:bg-purple-900/20">
              Animeleri Keşfet
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: "🎬", title: "4K Kalite", desc: "Ultra HD görüntü kalitesiyle canlı renkler ve akıcı izleme deneyimi" },
            { icon: "👥", title: "4 Profil", desc: "Bir hesapla 4 farklı profil oluştur, herkes kendi listesini yönetsin" },
            { icon: "♾️", title: "Sonsuz Üyelik", desc: "Bir kez öde, sonsuza kadar izle. Hareketli profil ve özel rozet dahil" },
          ].map((f) => (
            <div key={f.title} className="bg-[#1a1a2e] border border-purple-900/30 rounded-2xl p-6 card-hover">
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="text-lg font-bold mb-2 text-purple-300">{f.title}</h3>
              <p className="text-gray-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Latest Anime */}
      {animes.length > 0 && (
        <section className="py-16 px-4 max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-purple-300">Son Eklenenler</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {animes.map((anime) => (
              <Link key={anime.id} href={`/anime/${anime.slug}`} className="group card-hover">
                <div className="aspect-[3/4] rounded-xl overflow-hidden bg-[#1a1a2e] border border-purple-900/20">
                  {anime.coverImage ? (
                    <img src={anime.coverImage} alt={anime.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-purple-600 text-4xl">🎌</div>
                  )}
                </div>
                <p className="mt-2 text-sm font-medium text-gray-200 truncate">{anime.title}</p>
                <p className="text-xs text-gray-500">{anime._count.episodes} Bölüm</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <footer className="border-t border-purple-900/20 py-8 text-center text-gray-600 text-sm">
        © 2026 ANIFIC. Tüm hakları saklıdır.
      </footer>
    </div>
  );
}
