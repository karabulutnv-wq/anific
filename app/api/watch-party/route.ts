import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { episodeId, friendIds } = await req.json();
  const code = generateCode();

  const party = await prisma.watchParty.create({
    data: { hostId: session.user.id, episodeId, code },
    include: { episode: { include: { anime: true } } },
  });

  // Arkadaşlara davet gönder
  for (const friendId of (friendIds || [])) {
    await pusherServer.trigger(`user-${friendId}`, "watch-party-invite", {
      code: party.code,
      hostName: session.user.name,
      animeName: party.episode.anime.title,
      episodeNumber: party.episode.number,
    });
  }

  return NextResponse.json({ code: party.code });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { code, action, currentTime } = await req.json();
  await pusherServer.trigger(`party-${code}`, "sync", {
    action,
    currentTime,
    userId: session.user.id,
  });

  return NextResponse.json({ ok: true });
}
