import Navbar from "@/components/Navbar";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AnimePage({
  searchParams,
}: {
  searchParams: Promise<{ genre?: string }>;
}) {
  const { genre } = await searchParams;

  const animes = await prisma.anime.findMany({
    where: genre ? { genres: { has: genre } } : undefined,
    include: { _count: { select: { episodes: true } }, ratings: { select: { score: true } } },
    orderBy: { updatedAt: "desc" },
  }).catch(() => []);

  const allGenres = await prisma.anime.findMany({ select: { genres: true } })
    .then(a => [...new Set(a.flatMap(x => x.genres))].sort())
    .catch(() => [] as string[]);

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      <div className="pt-28 pb-20 px-4 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-purple-300">
          {genre ? `${genre} Animeleri` : "Tüm Animeler"}
        </h1>

        {/* Genre filter */}
        {allGenres.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <Link href="/anime" className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${!genre ? "bg-purple-600 border-purple-500 text-white" : "border-purple-900/40 text-gray-400 hover:border-purple-500 hover:text-white"}`}>
              Tümü
            </Link>
            {allGenres.map(g => (
              <Link key={g} href={`/anime?genre=${encodeURIComponent(g)}`}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${genre === g ? "bg-purple-600 border-purple-500 text-white" : "border-purple-900/40 text-gray-400 hover:border-purple-500 hover:text-white"}`}>
                {g}
              </Link>
            ))}
          </div>
        )}

        {animes.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <div className="text-6xl mb-4">🎌</div>
            <p>Bu türde anime bulunamadı</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {animes.map((anime) => {
              const avg = anime.ratings.length > 0
                ? (anime.ratings.reduce((a, b) => a + b.score, 0) / anime.ratings.length).toFixed(1)
                : null;
              return (
                <Link key={anime.id} href={`/anime/${anime.slug}`} className="group card-hover">
                  <div className="aspect-[3/4] rounded-xl overflow-hidden bg-[#1a1a2e] border border-purple-900/20 relative">
                    {anime.coverImage ? (
                      <img src={anime.coverImage} alt={anime.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-purple-600 text-4xl">🎌</div>
                    )}
                    {avg && (
                      <div className="absolute top-2 right-2 bg-black/70 text-yellow-400 text-xs font-bold px-1.5 py-0.5 rounded">
                        ⭐ {avg}
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-sm font-medium text-gray-200 truncate">{anime.title}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">{anime._count.episodes} Bölüm</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${anime.status === "ONGOING" ? "bg-green-900/40 text-green-400" : "bg-gray-800 text-gray-400"}`}>
                      {anime.status === "ONGOING" ? "Devam" : "Bitti"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
