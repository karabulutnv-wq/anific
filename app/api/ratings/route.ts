import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const { animeId, score } = await req.json();
  if (score < 1 || score > 10) return NextResponse.json({ error: "Geçersiz puan" }, { status: 400 });
  const rating = await prisma.rating.upsert({
    where: { userId_animeId: { userId: session.user.id, animeId } },
    update: { score },
    create: { userId: session.user.id, animeId, score },
  });
  return NextResponse.json(rating);
}
