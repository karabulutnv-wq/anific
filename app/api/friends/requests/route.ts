import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json([]);

  const requests = await prisma.friendship.findMany({
    where: { receiverId: session.user.id, status: "PENDING" },
    include: { sender: { select: { id: true, name: true } } },
  });
  return NextResponse.json(requests);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { id, action } = await req.json();
  const friendship = await prisma.friendship.update({
    where: { id },
    data: { status: action === "accept" ? "ACCEPTED" : "REJECTED" },
    include: {
      sender: { select: { id: true, name: true } },
      receiver: { select: { id: true, name: true } },
    },
  });

  if (action === "accept") {
    await pusherServer.trigger(`user-${friendship.senderId}`, "friend-accepted", {
      friend: friendship.receiver,
    });
  }

  return NextResponse.json({ success: true });
}
