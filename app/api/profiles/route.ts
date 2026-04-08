import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLANS } from "@/lib/subscription";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const profiles = await prisma.profile.findMany({
    where: { userId: session.user.id },
  });
  return NextResponse.json(profiles);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { name, avatar } = await req.json();

  const sub = await prisma.subscription.findUnique({ where: { userId: session.user.id } });
  const maxProfiles = sub ? PLANS[sub.plan].maxProfiles : 1;

  const count = await prisma.profile.count({ where: { userId: session.user.id } });
  if (count >= maxProfiles)
    return NextResponse.json({ error: `Maksimum ${maxProfiles} profil oluşturabilirsiniz` }, { status: 400 });

  const profile = await prisma.profile.create({
    data: { name, avatar: avatar || "/avatars/default.png", userId: session.user.id },
  });

  return NextResponse.json(profile);
}
