"use client";
import { useEffect, useRef } from "react";

function getVideoInfo(input: string): { type: "iframe" | "direct"; src: string } {
  // Embed kodu (iframe HTML)
  if (input.trim().startsWith("<iframe")) {
    const match = input.match(/src=["']([^"']+)["']/);
    if (match) return { type: "iframe", src: match[1] };
  }

  // Google Drive
  const driveMatch = input.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch) return { type: "iframe", src: `https://drive.google.com/file/d/${driveMatch[1]}/preview` };

  // Sibnet
  const sibnetMatch = input.match(/sibnet\.ru\/video(\d+)/);
  if (sibnetMatch) return { type: "iframe", src: `https://video.sibnet.ru/shell.php?videoid=${sibnetMatch[1]}` };
  if (input.includes("sibnet.ru/shell.php")) return { type: "iframe", src: input };

  // Dailymotion
  const dmMatch = input.match(/dailymotion\.com\/video\/([a-zA-Z0-9]+)/);
  if (dmMatch) return { type: "iframe", src: `https://www.dailymotion.com/embed/video/${dmMatch[1]}?autoplay=0` };
  if (input.includes("dailymotion.com/embed")) return { type: "iframe", src: input };

  // Direkt video dosyası → ArtPlayer
  return { type: "direct", src: input };
}

function IframePlayer({ src }: { src: string }) {
  return (
    <div style={{ width: "100%", aspectRatio: "16/9", background: "#000", position: "relative" }}>
      <iframe
        src={src}
        style={{ width: "100%", height: "100%", border: "none", position: "absolute", inset: 0 }}
        allowFullScreen
        allow="autoplay; fullscreen"
      />
    </div>
  );
}

function ArtPlayerDirect({ src }: { src: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const artRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    import("artplayer").then(({ default: Artplayer }) => {
      if (artRef.current) { artRef.current.destroy(); artRef.current = null; }

      artRef.current = new Artplayer({
        container: containerRef.current!,
        url: src,
        volume: 1,
        pip: true,
        setting: true,
        playbackRate: true,
        aspectRatio: true,
        fullscreen: true,
        fullscreenWeb: true,
        miniProgressBar: true,
        theme: "#7c3aed",
        lang: "zh-cn",
        quality: [
          { default: true, html: "1080p", url: src },
          { html: "2K ✨", url: src },
          { html: "4K 🔥", url: src },
        ],
      });

      artRef.current.on("quality", (quality: any) => {
        const video = artRef.current?.video;
        if (!video) return;
        if (quality.html.includes("2K")) {
          video.style.filter = "saturate(1.3) contrast(1.1) brightness(1.05)";
        } else if (quality.html.includes("4K")) {
          video.style.filter = "saturate(1.6) contrast(1.2) brightness(1.08)";
        } else {
          video.style.filter = "none";
        }
        artRef.current.url = src;
      });
    });

    return () => { if (artRef.current) { artRef.current.destroy(); artRef.current = null; } };
  }, [src]);

  return <div ref={containerRef} style={{ width: "100%", aspectRatio: "16/9", background: "#000" }} />;
}

export default function VideoPlayer({ url }: { url: string }) {
  const { type, src } = getVideoInfo(url);
  if (type === "iframe") return <IframePlayer src={src} />;
  return <ArtPlayerDirect src={src} />;
}
