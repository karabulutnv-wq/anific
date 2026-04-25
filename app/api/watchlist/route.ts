import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json([]);
  const list = await prisma.watchList.findMany({
    where: { userId: session.user.id },
    include: { anime: { include: { _count: { select: { episodes: true } } } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const { animeId, status } = await req.json();
  const item = await prisma.watchList.upsert({
    where: { userId_animeId: { userId: session.user.id, animeId } },
    update: { status },
    create: { userId: session.user.id, animeId, status },
  });
  return NextResponse.json(item);
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const { animeId } = await req.json();
  await prisma.watchList.deleteMany({ where: { userId: session.user.id, animeId } });
  return NextResponse.json({ ok: true });
}
