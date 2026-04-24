import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN")
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

  const { id } = await params;
  const { price, shopierUrl } = await req.json();

  const avatar = await prisma.animatedAvatar.update({
    where: { id },
    data: { price, shopierUrl },
  });

  return NextResponse.json(avatar);
}
