import { prisma } from "./prisma";

// Kullanıcının aktif üyeliği var mı kontrol et, süresi dolduysa pasifleştir
export async function checkSubscription(userId: string) {
  const sub = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!sub) return null;

  // Süresi dolmuşsa pasifleştir
  if (sub.endDate && sub.endDate < new Date() && sub.isActive) {
    await prisma.subscription.update({
      where: { userId },
      data: { isActive: false },
    });
    return null;
  }

  if (!sub.isActive) return null;

  return sub;
}
