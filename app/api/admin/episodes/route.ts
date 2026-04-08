import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadVideo } from "@/lib/cloudinary";

export const maxDuration = 300; // 5 dakika timeout

export async function POST(req: NextRequest) {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN")
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

  try {
    const formData = await req.formData();
    const animeId = formData.get("animeId") as string;
    const number = parseInt(formData.get("number") as string);
    const title = formData.get("title") as string;
    const quality = formData.get("quality") as string;
    const videoFile = formData.get("video") as File;

    if (!videoFile) return NextResponse.json({ error: "Video dosyası gerekli" }, { status: 400 });

    const buffer = Buffer.from(await videoFile.arrayBuffer());
    const { url, publicId } = await uploadVideo(buffer, `anific/episodes/${animeId}`);

    const episode = await prisma.episode.create({
      data: {
        animeId,
        number,
        title,
        videoUrl: url,
        videoPublicId: publicId,
        quality: quality as any,
      },
    });

    return NextResponse.json(episode);
  } catch (err: any) {
    console.error("Episode upload error:", err);
    return NextResponse.json({ error: err.message || "Yükleme başarısız" }, { status: 500 });
  }
}
