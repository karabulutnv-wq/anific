import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { PLANS } from "@/lib/subscription";

export default async function SettingsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session!.user!.id },
    include: { subscription: true },
  });

  const sub = user?.subscription;
  const plan = sub ? PLANS[sub.plan] : null;

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      <div className="pt-28 pb-20 px-4 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8 text-purple-300">Hesap Ayarları</h1>

        <div className="space-y-4">
          {/* User info */}
          <div className="bg-[#1a1a2e] border border-purple-900/30 rounded-2xl p-6">
            <h2 className="font-bold text-white mb-4">Hesap Bilgileri</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Ad</span>
                <span className="text-white">{user?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Email</span>
                <span className="text-white">{user?.email}</span>
              </div>
            </div>
          </div>

          {/* Subscription */}
          <div className="bg-[#1a1a2e] border border-purple-900/30 rounded-2xl p-6">
            <h2 className="font-bold text-white mb-4">Üyelik Durumu</h2>
            {sub && plan ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Plan</span>
                  <span className="text-purple-400 font-bold">{plan.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Durum</span>
                  <span className={sub.isActive ? "text-green-400" : "text-red-400"}>
                    {sub.isActive ? "Aktif" : "Pasif"}
                  </span>
                </div>
                {sub.endDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Bitiş Tarihi</span>
                    <span className="text-white">{new Date(sub.endDate).toLocaleDateString("tr-TR")}</span>
                  </div>
                )}
                {!sub.endDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Süre</span>
                    <span className="text-purple-400">♾️ Sonsuz</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Kalite</span>
                  <span className="text-white">{plan.quality.join(", ")}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-4">Aktif üyeliğin yok</p>
                <Link href="/pricing" className="bg-purple-600 hover:bg-purple-500 px-6 py-2 rounded-lg text-sm font-medium transition-colors">
                  Üyelik Al
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
