import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json([]);
  const profiles = await prisma.profile.findMany({ where: { userId: session.user.id }, select: { id: true } });
  const profileIds = profiles.map(p => p.id);
  const history = await prisma.watchHistory.findMany({
    where: { profileId: { in: profileIds } },
    include: { episode: { include: { anime: true } } },
    orderBy: { updatedAt: "desc" },
    take: 20,
  });
  return NextResponse.json(history);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const { episodeId, progress, profileId } = await req.json();
  const history = await prisma.watchHistory.upsert({
    where: { profileId_episodeId: { profileId, episodeId } },
    update: { progress },
    create: { profileId, episodeId, progress },
  });
  return NextResponse.json(history);
}
