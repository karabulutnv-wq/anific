import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const animes = await prisma.anime.findMany({
    include: { _count: { select: { episodes: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(animes);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN")
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

  const { title, slug, description, coverImage, bannerImage, genres, status } = await req.json();

  const anime = await prisma.anime.create({
    data: { title, slug, description, coverImage, bannerImage, genres, status },
  });

  return NextResponse.json(anime);
}
