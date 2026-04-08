import Navbar from "@/components/Navbar";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import AnimeActions from "@/components/AnimeActions";

export default async function AnimeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const anime = await prisma.anime.findUnique({
    where: { slug },
    include: {
      episodes: { orderBy: { number: "asc" } },
      ratings: { select: { score: true } },
    },
  });

  if (!anime) notFound();

  const session = await auth();
  const isLoggedIn = !!session;

  let isFavorited = false;
  let userRating = null;

  if (session?.user?.id) {
    const fav = await prisma.favorite.findUnique({
      where: { userId_animeId: { userId: session.user.id, animeId: anime.id } },
    }).catch(() => null);
    isFavorited = !!fav;

    const rating = await prisma.rating.findUnique({
      where: { userId_animeId: { userId: session.user.id, animeId: anime.id } },
    }).catch(() => null);
    userRating = rating?.score ?? null;
  }

  const avgRating = anime.ratings.length > 0
    ? anime.ratings.reduce((a, b) => a + b.score, 0) / anime.ratings.length
    : null;

  // Similar animes by genre
  const similar = await prisma.anime.findMany({
    where: {
      slug: { not: slug },
      genres: { hasSome: anime.genres },
    },
    take: 6,
    include: { _count: { select: { episodes: true } } },
  });

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />

      <div className="relative h-72 md:h-96 overflow-hidden">
        {anime.bannerImage ? (
          <img src={anime.bannerImage} alt={anime.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-purple-900/30 to-transparent" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-32 relative z-10 pb-20">
        <div className="flex gap-6 flex-col md:flex-row">
          <div className="w-40 md:w-52 flex-shrink-0">
            <div className="aspect-[3/4] rounded-xl overflow-hidden border-2 border-purple-700/50 shadow-2xl">
              {anime.coverImage ? (
                <img src={anime.coverImage} alt={anime.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#1a1a2e] flex items-center justify-center text-5xl">🎌</div>
              )}
            </div>
          </div>

          <div className="flex-1 pt-4 md:pt-16">
            <h1 className="text-3xl font-black text-white mb-2">{anime.title}</h1>
            <div className="flex flex-wrap gap-2 mb-3">
              {anime.genres.map((g) => (
                <Link key={g} href={`/anime?genre=${encodeURIComponent(g)}`} className="text-xs bg-purple-900/40 border border-purple-700/30 text-purple-300 px-3 py-1 rounded-full hover:bg-purple-800/40 transition-colors">{g}</Link>
              ))}
              <span className={`text-xs px-3 py-1 rounded-full ${anime.status === "ONGOING" ? "bg-green-900/40 text-green-400" : "bg-gray-800 text-gray-400"}`}>
                {anime.status === "ONGOING" ? "Devam Ediyor" : anime.status === "COMPLETED" ? "Tamamlandı" : "Yakında"}
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-2">{anime.description}</p>

            {isLoggedIn && (
              <AnimeActions
                animeId={anime.id}
                initialFavorited={isFavorited}
                initialRating={userRating}
                avgRating={avgRating}
              />
            )}
          </div>
        </div>

        {/* Episodes */}
        <div className="mt-10">
          <h2 className="text-xl font-bold text-purple-300 mb-4">Bölümler ({anime.episodes.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {anime.episodes.map((ep) => (
              isLoggedIn ? (
                <Link key={ep.id} href={`/anime/${slug}/episode/${ep.number}`}
                  className="flex items-center gap-4 bg-[#1a1a2e] border border-purple-900/20 hover:border-purple-600/50 rounded-xl p-4 transition-all card-hover">
                  <div className="w-12 h-12 rounded-lg bg-purple-900/40 flex items-center justify-center text-purple-400 font-bold flex-shrink-0">{ep.number}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{ep.title}</p>
                    <p className="text-xs text-gray-500">{ep.quality} kalite</p>
                  </div>
                  <span className="text-purple-500 text-lg">▶</span>
                </Link>
              ) : (
                <Link key={ep.id} href="/login"
                  className="flex items-center gap-4 bg-[#1a1a2e] border border-purple-900/20 hover:border-purple-600/50 rounded-xl p-4 transition-all card-hover opacity-70">
                  <div className="w-12 h-12 rounded-lg bg-purple-900/40 flex items-center justify-center text-purple-400 font-bold flex-shrink-0">{ep.number}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{ep.title}</p>
                    <p className="text-xs text-gray-500">{ep.quality} kalite</p>
                  </div>
                  <span className="text-gray-600 text-lg">🔒</span>
                </Link>
              )
            ))}
          </div>
        </div>

        {/* Similar */}
        {similar.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-purple-300 mb-4">Benzer Animeler</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {similar.map(a => (
                <Link key={a.id} href={`/anime/${a.slug}`} className="group card-hover">
                  <div className="aspect-[3/4] rounded-xl overflow-hidden bg-[#1a1a2e] border border-purple-900/20">
                    {a.coverImage ? (
                      <img src={a.coverImage} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">🎌</div>
                    )}
                  </div>
                  <p className="mt-1 text-xs font-medium text-gray-300 truncate">{a.title}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
