import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN")
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const animeId = formData.get("animeId") as string;

  if (!file) return NextResponse.json({ error: "Dosya gerekli" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Klasör oluştur
  const dir = join(process.cwd(), "public", "videos", animeId);
  await mkdir(dir, { recursive: true });

  // Dosya adını temizle
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = join(dir, safeName);

  await writeFile(filePath, buffer);

  const url = `/videos/${animeId}/${safeName}`;
  return NextResponse.json({ url });
}
