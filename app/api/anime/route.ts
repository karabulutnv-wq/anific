import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const animes = await prisma.anime.findMany({
    include: { _count: { select: { episodes: true } } },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(animes);
}
