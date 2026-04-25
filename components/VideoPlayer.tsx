"use client";
import { useEffect, useRef } from "react";

function extractIframeSrc(input: string): string | null {
  if (input.trim().startsWith("<iframe")) {
    const match = input.match(/src=["']([^"']+)["']/);
    return match ? match[1] : null;
  }
  return null;
}

function getVideoInfo(input: string): { type: "artplayer-iframe" | "artplayer-direct"; src: string } {
  // Embed kodu
  const iframeSrc = extractIframeSrc(input);
  if (iframeSrc) return { type: "artplayer-iframe", src: iframeSrc };

  // Google Drive
  const driveMatch = input.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch) return { type: "artplayer-iframe", src: `https://drive.google.com/file/d/${driveMatch[1]}/preview` };

  // Sibnet
  const sibnetMatch = input.match(/sibnet\.ru\/video(\d+)/);
  if (sibnetMatch) return { type: "artplayer-iframe", src: `https://video.sibnet.ru/shell.php?videoid=${sibnetMatch[1]}` };

  // Dailymotion normal link
  const dmMatch = input.match(/dailymotion\.com\/video\/([a-zA-Z0-9]+)/);
  if (dmMatch) return { type: "artplayer-iframe", src: `https://www.dailymotion.com/embed/video/${dmMatch[1]}?autoplay=0` };

  // Zaten embed URL
  if (input.startsWith("http") && !input.endsWith(".mp4") && !input.endsWith(".m3u8")) {
    if (input.includes("embed") || input.includes("shell.php") || input.includes("drive.google")) {
      return { type: "artplayer-iframe", src: input };
    }
  }

  // Direkt video dosyası
  return { type: "artplayer-direct", src: input };
}

export default function VideoPlayer({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const artRef = useRef<any>(null);
  const { type, src } = getVideoInfo(url);

  useEffect(() => {
    if (!containerRef.current) return;

    import("artplayer").then(({ default: Artplayer }) => {
      if (artRef.current) { artRef.current.destroy(); artRef.current = null; }

      if (type === "artplayer-iframe") {
        // ArtPlayer içine iframe göm
        artRef.current = new Artplayer({
          container: containerRef.current!,
          url: src,
          type: "iframe",
          customType: {
            iframe: function (video: HTMLVideoElement, url: string, art: any) {
              // video elementini iframe ile değiştir
              const iframe = document.createElement("iframe");
              iframe.src = url;
              iframe.style.width = "100%";
              iframe.style.height = "100%";
              iframe.style.border = "none";
              iframe.allowFullscreen = true;
              iframe.setAttribute("allow", "autoplay; fullscreen");
              video.parentNode?.replaceChild(iframe, video);
              art.iframe = iframe;
            },
          },
          theme: "#7c3aed",
          fullscreen: true,
          fullscreenWeb: true,
          miniProgressBar: false,
          setting: false,
          controls: [],
        });
      } else {
        // Direkt mp4 - tam ArtPlayer
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
      }
    });

    return () => {
      if (artRef.current) { artRef.current.destroy(); artRef.current = null; }
    };
  }, [url, src, type]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", aspectRatio: "16/9", background: "#000" }}
    />
  );
}
