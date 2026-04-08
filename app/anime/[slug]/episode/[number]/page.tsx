import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import VideoPlayer from "@/components/VideoPlayer";
import Navbar from "@/components/Navbar";
import Comments from "@/components/Comments";
import Link from "next/link";

export default async function EpisodePage({
  params,
}: {
  params: Promise<{ slug: string; number: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { slug, number } = await params;
  const anime = await prisma.anime.findUnique({
    where: { slug },
    include: { episodes: { orderBy: { number: "asc" } } },
  });

  if (!anime) notFound();

  const epNumber = parseInt(number);
  const episode = anime.episodes.find((e) => e.number === epNumber);
  if (!episode) notFound();

  const prevEp = anime.episodes.find((e) => e.number === epNumber - 1);
  const nextEp = anime.episodes.find((e) => e.number === epNumber + 1);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />
      <div className="pt-16">
        <div className="w-full bg-black">
          <VideoPlayer url={episode.videoUrl} />
        </div>

        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <Link href={`/anime/${slug}`} className="text-purple-400 hover:text-purple-300 text-sm mb-1 block">
                ← {anime.title}
              </Link>
              <h1 className="text-xl font-bold text-white">
                Bölüm {episode.number}: {episode.title}
              </h1>
              <span className="text-xs text-gray-500 mt-1 block">{episode.quality} kalite</span>
            </div>

            <div className="flex gap-3">
              {prevEp && (
                <Link href={`/anime/${slug}/episode/${prevEp.number}`} className="bg-[#1a1a2e] border border-purple-900/30 hover:border-purple-600/50 px-4 py-2 rounded-lg text-sm transition-all">
                  ← Önceki
                </Link>
              )}
              {nextEp && (
                <Link href={`/anime/${slug}/episode/${nextEp.number}`} className="bg-purple-700 hover:bg-purple-600 px-4 py-2 rounded-lg text-sm transition-all">
                  Sonraki →
                </Link>
              )}
            </div>
          </div>

          {/* Episode list */}
          <div className="mt-8">
            <h2 className="text-lg font-bold text-purple-300 mb-4">Diğer Bölümler</h2>
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2">
              {anime.episodes.map((ep) => (
                <Link key={ep.id} href={`/anime/${slug}/episode/${ep.number}`}
                  className={`text-center py-2 rounded-lg text-sm font-medium transition-all ${
                    ep.number === epNumber ? "bg-purple-600 text-white" : "bg-[#1a1a2e] text-gray-400 hover:bg-purple-900/30 hover:text-white"
                  }`}
                >
                  {ep.number}
                </Link>
              ))}
            </div>
          </div>

          {/* Comments */}
          <Comments episodeId={episode.id} userId={session?.user?.id} />
        </div>
      </div>
    </div>
  );
}
