import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN")
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

  const q = req.nextUrl.searchParams.get("q") || "";

  const users = await prisma.user.findMany({
    where: q ? {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ],
    } : undefined,
    select: {
      id: true, name: true, email: true, role: true,
      ownedAvatars: { include: { avatar: true } },
    },
    take: 20,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}
