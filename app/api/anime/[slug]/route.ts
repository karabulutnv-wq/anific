import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const anime = await prisma.anime.findUnique({
    where: { slug },
    include: { episodes: { orderBy: { number: "asc" } } },
  });
  if (!anime) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  return NextResponse.json(anime);
}
