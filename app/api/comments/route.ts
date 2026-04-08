import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const episodeId = req.nextUrl.searchParams.get("episodeId");
  if (!episodeId) return NextResponse.json([]);
  const comments = await prisma.comment.findMany({
    where: { episodeId },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json(comments);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });
  const { episodeId, text } = await req.json();
  if (!text?.trim()) return NextResponse.json({ error: "Yorum boş olamaz" }, { status: 400 });
  const comment = await prisma.comment.create({
    data: { userId: session.user.id, episodeId, text: text.trim() },
    include: { user: { select: { name: true } } },
  });
  return NextResponse.json(comment);
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const { id } = await req.json();
  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  if (comment.userId !== session.user.id && (session.user as any).role !== "ADMIN")
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  await prisma.comment.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
