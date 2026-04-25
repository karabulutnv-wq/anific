import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json([]);

  const profiles = await prisma.profile.findMany({
    where: { userId: session.user.id },
    select: { id: true },
  });
  const profileIds = profiles.map(p => p.id);

  const history = await prisma.watchHistory.findMany({
    where: { profileId: { in: profileIds } },
    include: {
      episode: {
        include: {
          anime: { select: { id: true, title: true, slug: true, coverImage: true } },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 10,
    distinct: ["episodeId"],
  });

  return NextResponse.json(history);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ ok: false });

  const { episodeId } = await req.json();

  const profile = await prisma.profile.findFirst({
    where: { userId: session.user.id },
  });
  if (!profile) return NextResponse.json({ ok: false });

  await prisma.watchHistory.upsert({
    where: { profileId_episodeId: { profileId: profile.id, episodeId } },
    update: { updatedAt: new Date() },
    create: { profileId: profile.id, episodeId, progress: 0 },
  });

  return NextResponse.json({ ok: true });
}
