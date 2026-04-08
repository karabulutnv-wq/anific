import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json([]);
  const animes = await prisma.anime.findMany({
    where: {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { genres: { has: q } },
      ],
    },
    take: 10,
    include: { _count: { select: { episodes: true } } },
  });
  return NextResponse.json(animes);
}
