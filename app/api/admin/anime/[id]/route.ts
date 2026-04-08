import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN")
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

  const { id } = await params;
  const anime = await prisma.anime.findUnique({
    where: { id },
    include: { episodes: { orderBy: { number: "asc" } } },
  });

  if (!anime) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  return NextResponse.json(anime);
}
