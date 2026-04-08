"use client";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { PLANS, PlanKey } from "@/lib/subscription";
import Navbar from "@/components/Navbar";
import { Suspense } from "react";

const SHOPIER_LINKS: Record<PlanKey, string> = {
  MONTHLY: "https://www.shopier.com/LyncGames/45942522",
  THREE_MONTHS: "https://www.shopier.com/LyncGames/45942838",
  SIX_MONTHS: "https://www.shopier.com/LyncGames/45942971",
  YEARLY: "https://www.shopier.com/LyncGames/45943020",
  LIFETIME: "https://www.shopier.com/LyncGames/45943056",
};

const PLAN_KEYS = Object.keys(PLANS) as PlanKey[];

const badges: Record<PlanKey, string> = {
  MONTHLY: "",
  THREE_MONTHS: "İndirimli",
  SIX_MONTHS: "Popüler",
  YEARLY: "En İyi Değer",
  LIFETIME: "Sonsuz",
};

function PricingContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useSearchParams();
  const status = params.get("status");

  function handleBuy(plan: PlanKey) {
    if (!session) {
      router.push("/login?redirect=/pricing");
      return;
    }
    window.location.href = SHOPIER_LINKS[plan];
  }

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      <div className="pt-28 pb-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black mb-3 text-purple-300">Üyelik Planları</h1>
          <p className="text-gray-400">Sana uygun planı seç, anime dünyasına dal</p>
        </div>

        {status === "success" && (
          <div className="mb-8 bg-green-900/30 border border-green-500/30 text-green-400 px-6 py-4 rounded-xl text-center">
            Üyeliğin başarıyla aktifleştirildi! 🎉
          </div>
        )}
        {status === "failed" && (
          <div className="mb-8 bg-red-900/30 border border-red-500/30 text-red-400 px-6 py-4 rounded-xl text-center">
            Ödeme başarısız oldu. Tekrar dene.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {PLAN_KEYS.map((key) => {
            const plan = PLANS[key];
            const isLifetime = key === "LIFETIME";
            return (
              <div
                key={key}
                className={`relative rounded-2xl p-6 border transition-all card-hover ${
                  isLifetime
                    ? "bg-gradient-to-b from-purple-900/40 to-violet-900/20 border-purple-500/50 glow"
                    : "bg-[#1a1a2e] border-purple-900/30"
                }`}
              >
                {badges[key] && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    {badges[key]}
                  </span>
                )}

                <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                <div className="text-3xl font-black text-purple-400 mb-4">
                  ₺{plan.price}
                  {plan.duration && <span className="text-sm text-gray-500 font-normal"> / {plan.duration} gün</span>}
                </div>

                <ul className="space-y-2 mb-6 text-sm">
                  <li className="flex items-center gap-2 text-gray-300">
                    <span className="text-purple-400">✓</span>
                    {plan.quality.join(", ")} kalite
                  </li>
                  <li className="flex items-center gap-2 text-gray-300">
                    <span className="text-purple-400">✓</span>
                    {plan.maxProfiles} profil
                  </li>
                  {plan.animatedProfile && (
                    <li className="flex items-center gap-2 text-purple-300 font-medium">
                      <span>✨</span> Hareketli profil
                    </li>
                  )}
                  {plan.earlyAccess && (
                    <li className="flex items-center gap-2 text-purple-300">
                      <span>⚡</span> Erken erişim
                    </li>
                  )}
                  {plan.badge && (
                    <li className="flex items-center gap-2 text-yellow-400">
                      <span>🏆</span> Özel rozet
                    </li>
                  )}
                </ul>

                <button
                  onClick={() => handleBuy(key)}
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${
                    isLifetime
                      ? "bg-purple-600 hover:bg-purple-500 glow"
                      : "bg-purple-900/50 hover:bg-purple-700/50 border border-purple-700/50"
                  }`}
                >
                  Satın Al
                </button>
              </div>
            );
          })}
        </div>

        <p className="text-center text-gray-600 text-sm mt-8">
          Ödeme Shopier güvencesiyle gerçekleştirilir. Satın aldıktan sonra üyeliğin otomatik aktifleşir.
        </p>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense>
      <PricingContent />
    </Suspense>
  );
}
