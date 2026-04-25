"use client";
import { useEffect, useRef } from "react";

function getVideoSrc(url: string): { type: "iframe" | "direct"; src: string } {
  // Google Drive
  const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch) return { type: "iframe", src: `https://drive.google.com/file/d/${driveMatch[1]}/preview` };

  // Sibnet
  const sibnetMatch = url.match(/sibnet\.ru\/video(\d+)/);
  if (sibnetMatch) return { type: "iframe", src: `https://video.sibnet.ru/shell.php?videoid=${sibnetMatch[1]}` };
  if (url.includes("sibnet.ru/shell.php")) return { type: "iframe", src: url };

  // Dailymotion
  const dmMatch = url.match(/dailymotion\.com\/video\/([a-zA-Z0-9]+)/);
  if (dmMatch) return { type: "iframe", src: `https://www.dailymotion.com/embed/video/${dmMatch[1]}?autoplay=0` };

  return { type: "direct", src: url };
}

function IframePlayer({ src }: { src: string }) {
  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", background: "#000" }}>
      <iframe
        src={src}
        style={{ width: "100%", height: "100%", border: "none" }}
        allowFullScreen
        allow="autoplay"
      />
    </div>
  );
}

function ArtPlayerComponent({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const artRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    import("artplayer").then(({ default: Artplayer }) => {
      if (artRef.current) {
        artRef.current.destroy();
        artRef.current = null;
      }

      artRef.current = new Artplayer({
        container: containerRef.current!,
        url,
        volume: 1,
        autoplay: false,
        pip: true,
        autoSize: true,
        autoMini: true,
        screenshot: false,
        setting: true,
        loop: false,
        flip: true,
        playbackRate: true,
        aspectRatio: true,
        fullscreen: true,
        fullscreenWeb: true,
        subtitleOffset: true,
        miniProgressBar: true,
        mutex: true,
        backdrop: true,
        playsInline: true,
        autoPlayback: true,
        theme: "#7c3aed",
        lang: "tr",
        moreVideoAttr: {
          crossOrigin: "anonymous",
        },
        icons: {
          loading: `<svg viewBox="0 0 1024 1024" style="width:40px;height:40px;fill:#7c3aed;animation:spin 1s linear infinite">
            <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" opacity=".3"/>
            <path d="M512 140c-205.4 0-372 166.6-372 372 0 205.4 166.6 372 372 372V840c-181.1 0-328-146.9-328-328S330.9 184 512 184V140z"/>
          </svg>`,
        },
        customType: {},
        quality: [
          { default: true, html: "1080p", url },
          { html: "2K ✨", url: `artplayer-quality:2k:${url}` },
          { html: "4K 🔥", url: `artplayer-quality:4k:${url}` },
        ],
      });

      // Kalite değişiminde CSS filter uygula
      artRef.current.on("quality", (quality: any) => {
        const video = artRef.current?.video;
        if (!video) return;
        if (quality.html.includes("2K")) {
          video.style.filter = "saturate(1.3) contrast(1.1) brightness(1.05)";
        } else if (quality.html.includes("4K")) {
          video.style.filter = "saturate(1.6) contrast(1.2) brightness(1.08)";
          video.style.imageRendering = "crisp-edges";
        } else {
          video.style.filter = "none";
          video.style.imageRendering = "auto";
        }
        // Gerçek URL'e geri dön
        artRef.current.url = url;
      });
    });

    return () => {
      if (artRef.current) {
        artRef.current.destroy();
        artRef.current = null;
      }
    };
  }, [url]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", aspectRatio: "16/9", background: "#000" }}
    />
  );
}

export default function VideoPlayer({ url }: { url: string }) {
  const { type, src } = getVideoSrc(url);
  if (type === "iframe") return <IframePlayer src={src} />;
  return <ArtPlayerComponent url={src} />;
}
