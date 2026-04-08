import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const avatars = await prisma.animatedAvatar.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(avatars);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN")
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

  const { name, url } = await req.json();
  if (!name || !url) return NextResponse.json({ error: "İsim ve URL gerekli" }, { status: 400 });

  const avatar = await prisma.animatedAvatar.create({ data: { name, url } });
  return NextResponse.json(avatar);
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN")
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

  const { id } = await req.json();
  await prisma.animatedAvatar.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
