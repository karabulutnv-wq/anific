import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default async function AdminPage() {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") redirect("/");

  const [animeCount, userCount, subCount] = await Promise.all([
    prisma.anime.count(),
    prisma.user.count(),
    prisma.subscription.count({ where: { isActive: true } }),
  ]);

  const animes = await prisma.anime.findMany({
    include: { _count: { select: { episodes: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      <div className="pt-28 pb-20 px-4 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-purple-300">Admin Panel</h1>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: "Toplam Anime", value: animeCount, icon: "🎌" },
            { label: "Toplam Kullanıcı", value: userCount, icon: "👥" },
            { label: "Aktif Üyelik", value: subCount, icon: "✅" },
          ].map((s) => (
            <div key={s.label} className="bg-[#1a1a2e] border border-purple-900/30 rounded-2xl p-6 text-center">
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-3xl font-black text-purple-400">{s.value}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-4 mb-8">
          <Link href="/admin/anime/new" className="bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-xl font-medium transition-colors">
            + Yeni Anime Ekle
          </Link>
          <Link href="/admin/avatars" className="bg-purple-900/50 hover:bg-purple-800/50 border border-purple-700/50 px-6 py-3 rounded-xl font-medium transition-colors">
            🎭 Hareketli Profiller
          </Link>
        </div>

        {/* Anime list */}
        <div className="bg-[#1a1a2e] border border-purple-900/30 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-purple-900/30">
                <th className="text-left px-6 py-4 text-sm text-gray-400">Anime</th>
                <th className="text-left px-6 py-4 text-sm text-gray-400">Bölüm</th>
                <th className="text-left px-6 py-4 text-sm text-gray-400">Durum</th>
                <th className="text-left px-6 py-4 text-sm text-gray-400">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {animes.map((anime) => (
                <tr key={anime.id} className="border-b border-purple-900/10 hover:bg-purple-900/10 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {anime.coverImage && (
                        <img src={anime.coverImage} alt={anime.title} className="w-10 h-14 object-cover rounded-lg" />
                      )}
                      <span className="font-medium">{anime.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{anime._count.episodes}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${anime.status === "ONGOING" ? "bg-green-900/40 text-green-400" : "bg-gray-800 text-gray-400"}`}>
                      {anime.status === "ONGOING" ? "Devam" : "Tamamlandı"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/admin/anime/${anime.id}`} className="text-purple-400 hover:text-purple-300 text-sm transition-colors">
                      Yönet →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
