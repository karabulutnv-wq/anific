import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;
  const { avatar, name } = await req.json();

  const profile = await prisma.profile.findUnique({ where: { id } });
  if (!profile || profile.userId !== session.user.id)
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

  const updated = await prisma.profile.update({
    where: { id },
    data: { ...(avatar && { avatar }), ...(name && { name }) },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id } = await params;
  const profile = await prisma.profile.findUnique({ where: { id } });
  if (!profile || profile.userId !== session.user.id)
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

  await prisma.profile.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
