import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json([]);

  const friendId = req.nextUrl.searchParams.get("friendId");
  if (!friendId) return NextResponse.json([]);

  const messages = await prisma.directMessage.findMany({
    where: {
      OR: [
        { senderId: session.user.id, receiverId: friendId },
        { senderId: friendId, receiverId: session.user.id },
      ],
    },
    include: { sender: { select: { name: true } } },
    orderBy: { createdAt: "asc" },
    take: 100,
  });
  return NextResponse.json(messages);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { receiverId, text } = await req.json();
  if (!text?.trim()) return NextResponse.json({ error: "Mesaj boş olamaz" }, { status: 400 });

  const msg = await prisma.directMessage.create({
    data: { senderId: session.user.id, receiverId, text: text.trim() },
    include: { sender: { select: { name: true } } },
  });

  const channelId = [session.user.id, receiverId].sort().join("-");
  await pusherServer.trigger(`dm-${channelId}`, "new-message", msg);

  return NextResponse.json(msg);
}
