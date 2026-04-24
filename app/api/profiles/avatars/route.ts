import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ owned: [], shop: [] });

  const [owned, all] = await Promise.all([
    prisma.userAvatar.findMany({
      where: { userId: session.user.id },
      include: { avatar: true },
    }),
    prisma.animatedAvatar.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const ownedIds = new Set(owned.map(o => o.avatarId));
  return NextResponse.json({
    owned: owned.map(o => o.avatar),
    shop: all.filter(a => !ownedIds.has(a.id)),
  });
}
