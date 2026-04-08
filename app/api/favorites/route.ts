import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json([], { status: 401 });
  const favs = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: { anime: { include: { _count: { select: { episodes: true } } } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(favs.map(f => f.anime));
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const { animeId } = await req.json();
  const existing = await prisma.favorite.findUnique({
    where: { userId_animeId: { userId: session.user.id, animeId } },
  });
  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return NextResponse.json({ favorited: false });
  }
  await prisma.favorite.create({ data: { userId: session.user.id, animeId } });
  return NextResponse.json({ favorited: true });
}
