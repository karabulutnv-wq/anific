import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN")
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

  const { userId, avatarId } = await req.json();

  const existing = await prisma.userAvatar.findUnique({
    where: { userId_avatarId: { userId, avatarId } },
  });
  if (existing) return NextResponse.json({ error: "Kullanıcı zaten bu avatara sahip" }, { status: 400 });

  await prisma.userAvatar.create({ data: { userId, avatarId } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN")
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

  const { userId, avatarId } = await req.json();
  await prisma.userAvatar.deleteMany({ where: { userId, avatarId } });
  return NextResponse.json({ ok: true });
}
