import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default async function FavoritesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const favs = await prisma.favorite.findMany({
    where: { userId: session!.user!.id },
    include: { anime: { include: { _count: { select: { episodes: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      <div className="pt-28 pb-20 px-4 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-purple-300">Favorilerim</h1>
        {favs.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🤍</div>
            <p className="text-gray-500 mb-4">Henüz favori anime eklemedin</p>
            <Link href="/anime" className="bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-xl text-sm font-medium transition-colors">
              Animeleri Keşfet
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {favs.map(({ anime }) => (
              <Link key={anime.id} href={`/anime/${anime.slug}`} className="group card-hover">
                <div className="aspect-[3/4] rounded-xl overflow-hidden bg-[#1a1a2e] border border-purple-900/20">
                  {anime.coverImage ? (
                    <img src={anime.coverImage} alt={anime.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">🎌</div>
                  )}
                </div>
                <p className="mt-2 text-sm font-medium text-gray-200 truncate">{anime.title}</p>
                <p className="text-xs text-gray-500">{anime._count.episodes} Bölüm</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
