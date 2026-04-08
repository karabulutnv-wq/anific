import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN")
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

  const { animeId, number, title, quality, videoUrl, videoPublicId } = await req.json();

  const episode = await prisma.episode.create({
    data: { animeId, number, title, videoUrl, videoPublicId, quality },
  });

  return NextResponse.json(episode);
}
