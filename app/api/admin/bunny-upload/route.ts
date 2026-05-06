import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const LIBRARY_ID = process.env.BUNNY_LIBRARY_ID!;
const API_KEY = process.env.BUNNY_STREAM_API_KEY!;
const CDN = process.env.BUNNY_CDN_HOSTNAME!;

export async function POST(req: NextRequest) {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN")
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

  const { title } = await req.json();

  // Bunny'de video oluştur
  const createRes = await fetch(`https://video.bunnycdn.com/library/${LIBRARY_ID}/videos`, {
    method: "POST",
    headers: {
      "AccessKey": API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    return NextResponse.json({ error: err }, { status: 500 });
  }

  const video = await createRes.json();
  const videoId = video.guid;

  // Upload URL ve video bilgilerini döndür
  return NextResponse.json({
    videoId,
    uploadUrl: `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos/${videoId}`,
    hlsUrl: `https://${CDN}/${videoId}/playlist.m3u8`,
    embedUrl: `https://iframe.mediadelivery.net/embed/${LIBRARY_ID}/${videoId}`,
    apiKey: API_KEY,
  });
}
