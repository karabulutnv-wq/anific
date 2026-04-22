import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const requests = await prisma.animeRequest.findMany({
    include: {
      user: { select: { name: true } },
      _count: { select: { votes: true } },
    },
    orderBy: { votes: { _count: "desc" } },
  });
  return NextResponse.json(requests);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });

  const { title } = await req.json();
  if (!title?.trim()) return NextResponse.json({ error: "Anime adı gerekli" }, { status: 400 });

  const existing = await prisma.anime.findFirst({
    where: { title: { contains: title.trim(), mode: "insensitive" } },
  });
  if (existing) return NextResponse.json({ exists: true, slug: existing.slug });

  const existingRequest = await prisma.animeRequest.findFirst({
    where: { title: { contains: title.trim(), mode: "insensitive" } },
    include: { _count: { select: { votes: true } } },
  });
  if (existingRequest) return NextResponse.json({ alreadyRequested: true, request: existingRequest });

  const request = await prisma.animeRequest.create({
    data: { title: title.trim(), userId: session.user.id },
    include: { user: { select: { name: true } }, _count: { select: { votes: true } } },
  });

  return NextResponse.json(request);
}
