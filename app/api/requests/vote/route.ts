import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });

  const { requestId } = await req.json();

  const existing = await prisma.animeRequestVote.findUnique({
    where: { requestId_userId: { requestId, userId: session.user.id } },
  });

  if (existing) {
    await prisma.animeRequestVote.delete({ where: { id: existing.id } });
    return NextResponse.json({ voted: false });
  }

  await prisma.animeRequestVote.create({
    data: { requestId, userId: session.user.id },
  });

  return NextResponse.json({ voted: true });
}
