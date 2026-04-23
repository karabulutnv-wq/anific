import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json([], { status: 401 });

  const friends = await prisma.friendship.findMany({
    where: {
      OR: [
        { senderId: session.user.id, status: "ACCEPTED" },
        { receiverId: session.user.id, status: "ACCEPTED" },
      ],
    },
    include: {
      sender: { select: { id: true, name: true } },
      receiver: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(friends.map(f => ({
    id: f.id,
    friend: f.senderId === session!.user!.id ? f.receiver : f.sender,
  })));
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { username } = await req.json();
  const receiver = await prisma.user.findFirst({
    where: { name: { equals: username, mode: "insensitive" } },
  });

  if (!receiver) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
  if (receiver.id === session.user.id) return NextResponse.json({ error: "Kendinize istek gönderemezsiniz" }, { status: 400 });

  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { senderId: session.user.id, receiverId: receiver.id },
        { senderId: receiver.id, receiverId: session.user.id },
      ],
    },
  });
  if (existing) return NextResponse.json({ error: "Zaten istek gönderilmiş veya arkadaşsınız" }, { status: 400 });

  const friendship = await prisma.friendship.create({
    data: { senderId: session.user.id, receiverId: receiver.id },
    include: { sender: { select: { id: true, name: true } } },
  });

  await pusherServer.trigger(`user-${receiver.id}`, "friend-request", {
    id: friendship.id,
    sender: friendship.sender,
  });

  return NextResponse.json({ success: true });
}
