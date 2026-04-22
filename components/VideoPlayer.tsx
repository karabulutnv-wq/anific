"use client";
import { useRef, useState, useEffect, useCallback } from "react";

const QUALITY_FILTERS: Record<string, string> = {
  "1080p": "none",
  "2K": "saturate(1.3) contrast(1.1) brightness(1.05)",
  "4K": "saturate(1.6) contrast(1.2) brightness(1.08)",
};

const QUALITY_STYLES: Record<string, React.CSSProperties> = {
  "1080p": {},
  "2K": {},
  "4K": { imageRendering: "crisp-edges", transform: "scale(1.002)", backfaceVisibility: "hidden" },
};

function getVideoSrc(url: string): { type: "drive" | "sibnet" | "dailymotion" | "direct"; src: string } {
  // Google Drive
  const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch) return { type: "drive", src: `https://drive.google.com/file/d/${driveMatch[1]}/preview` };
  
  // Sibnet
  const sibnetMatch = url.match(/sibnet\.ru\/video(\d+)/);
  if (sibnetMatch) return { type: "sibnet", src: `https://video.sibnet.ru/shell.php?videoid=${sibnetMatch[1]}` };
  if (url.includes("sibnet.ru/shell.php")) return { type: "sibnet", src: url };

  // Dailymotion - https://www.dailymotion.com/video/x9abcde
  const dmMatch = url.match(/dailymotion\.com\/video\/([a-zA-Z0-9]+)/);
  if (dmMatch) return { type: "dailymotion", src: `https://www.dailymotion.com/embed/video/${dmMatch[1]}?autoplay=0&mute=0` };

  return { type: "direct", src: url };
}

function formatTime(s: number) {
  if (!s || isNaN(s)) return "0:00";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

// Icons
const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M8 5v14l11-7z"/>
  </svg>
);
const PauseIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
  </svg>
);
const VolumeIcon = ({ muted, level }: { muted: boolean; level: number }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    {muted || level === 0 ? (
      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
    ) : level < 0.5 ? (
      <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
    ) : (
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
    )}
  </svg>
);
const FullscreenIcon = ({ active }: { active: boolean }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    {active ? (
      <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
    ) : (
      <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
    )}
  </svg>
);
const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
  </svg>
);

function DailymotionPlayer({ src }: { src: string }) {
  return (
    <div className="relative w-full bg-black" style={{ aspectRatio: "16/9" }}>
      <iframe
        src={src}
        className="w-full h-full"
        allowFullScreen
        allow="autoplay"
        style={{ border: "none" }}
      />
    </div>
  );
}

function SibnetPlayer({ src }: { src: string }) {
  return (
    <div className="relative w-full bg-black" style={{ aspectRatio: "16/9" }}>
      <iframe
        src={src}
        className="w-full h-full"
        allowFullScreen
        allow="autoplay"
        style={{ border: "none" }}
      />
    </div>
  );
}

function DrivePlayer({ src, quality, onQualityChange }: { src: string; quality: string; onQualityChange: (q: string) => void }) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="relative w-full bg-black select-none" style={{ aspectRatio: "16/9" }}>
      {/* Watermark */}
      <div className="absolute top-3 left-3 z-20 pointer-events-none flex items-center gap-1">
        <span className="text-white font-black text-sm tracking-widest opacity-70">ANIFIC</span>
        <span className="text-purple-400 text-xs font-bold opacity-70">PLAYER</span>
      </div>

      <div className="w-full h-full" style={{
        filter: QUALITY_FILTERS[quality] !== "none" ? QUALITY_FILTERS[quality] : undefined,
        ...QUALITY_STYLES[quality]
      }}>
        <iframe src={src} className="w-full h-full" allow="autoplay" allowFullScreen style={{ border: "none" }} />
      </div>

      {/* Quality badge */}
      {quality !== "1080p" && (
        <div className={`absolute top-3 right-3 z-20 text-xs font-black px-2 py-1 rounded-lg pointer-events-none ${
          quality === "4K" ? "bg-purple-600/90 text-white" : "bg-blue-600/90 text-white"
        }`}>
          {quality === "4K" ? "✦ 4K ULTRA" : "✦ 2K"}
        </div>
      )}

      {/* Settings button */}
      <div className="absolute bottom-3 right-3 z-20">
        <div className="relative">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-lg transition-colors flex items-center gap-1"
          >
            <SettingsIcon />
            <span className="text-xs">{quality}</span>
          </button>
          {showSettings && (
            <div className="absolute bottom-full right-0 mb-2 bg-[#1a1a2e] border border-purple-900/50 rounded-xl overflow-hidden shadow-2xl">
              <div className="px-3 py-2 text-xs text-gray-500 border-b border-purple-900/30">Kalite</div>
              {["1080p", "2K", "4K"].map(q => (
                <button
                  key={q}
                  onClick={() => { onQualityChange(q); setShowSettings(false); }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between gap-4 ${
                    quality === q ? "text-purple-400 bg-purple-900/20" : "text-gray-300 hover:bg-white/5"
                  }`}
                >
                  <span>{q}</span>
                  {quality === q && <span className="text-purple-400">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DirectPlayer({ url, quality, onQualityChange }: { url: string; quality: string; onQualityChange: (q: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);
  const controlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideControls = useCallback(() => {
    if (playing) setShowControls(false);
  }, [playing]);

  function resetControlsTimer() {
    setShowControls(true);
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(hideControls, 3000);
  }

  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
    resetControlsTimer();
  }

  function handleTimeUpdate() {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setCurrentTime(v.currentTime);
    setProgress((v.currentTime / v.duration) * 100);
    if (v.buffered.length > 0) {
      setBuffered((v.buffered.end(v.buffered.length - 1) / v.duration) * 100);
    }
  }

  function handleProgressClick(e: React.MouseEvent<HTMLDivElement>) {
    const v = videoRef.current;
    const bar = progressRef.current;
    if (!v || !bar) return;
    const rect = bar.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    v.currentTime = pct * v.duration;
  }

  function handleVolume(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setMuted(val === 0);
    if (videoRef.current) { videoRef.current.volume = val; videoRef.current.muted = val === 0; }
  }

  function toggleMute() {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }

  function skip(sec: number) {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + sec));
    resetControlsTimer();
  }

  function toggleFullscreen() {
    const c = containerRef.current;
    if (!c) return;
    if (!document.fullscreenElement) { c.requestFullscreen(); setIsFullscreen(true); }
    else { document.exitFullscreen(); setIsFullscreen(false); }
  }

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.addEventListener("loadedmetadata", () => { setDuration(v.duration); setLoading(false); });
    v.addEventListener("waiting", () => setLoading(true));
    v.addEventListener("playing", () => setLoading(false));
    v.addEventListener("ended", () => setPlaying(false));
    document.addEventListener("fullscreenchange", () => setIsFullscreen(!!document.fullscreenElement));
  }, []);

  const filter = QUALITY_FILTERS[quality];

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black select-none group"
      style={{ aspectRatio: "16/9" }}
      onMouseMove={resetControlsTimer}
      onMouseLeave={() => playing && setShowControls(false)}
      onDoubleClick={toggleFullscreen}
    >
      {/* Video */}
      <div className="w-full h-full" style={{ filter: filter !== "none" ? filter : undefined, ...QUALITY_STYLES[quality] }}>
        <video
          ref={videoRef}
          src={url}
          className="w-full h-full"
          onTimeUpdate={handleTimeUpdate}
          onClick={togglePlay}
        />
      </div>

      {/* Loading spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 border-3 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" style={{ borderWidth: 3 }} />
        </div>
      )}

      {/* Watermark */}
      <div className="absolute top-3 left-3 z-20 pointer-events-none flex items-center gap-1">
        <span className="text-white font-black text-sm tracking-widest opacity-60">ANIFIC</span>
        <span className="text-purple-400 text-xs font-bold opacity-60">PLAYER</span>
      </div>

      {/* Quality badge */}
      {quality !== "1080p" && (
        <div className={`absolute top-3 right-3 z-20 text-xs font-black px-2 py-1 rounded-lg pointer-events-none ${
          quality === "4K" ? "bg-purple-600/90 text-white" : "bg-blue-600/90 text-white"
        }`}>
          {quality === "4K" ? "✦ 4K ULTRA" : "✦ 2K"}
        </div>
      )}

      {/* Center play button */}
      {!playing && !loading && (
        <button onClick={togglePlay} className="absolute inset-0 flex items-center justify-center z-10">
          <div className="w-16 h-16 rounded-full bg-purple-600/80 backdrop-blur-sm flex items-center justify-center hover:bg-purple-500/90 transition-all hover:scale-110 shadow-lg shadow-purple-900/50">
            <PlayIcon />
          </div>
        </button>
      )}

      {/* Controls */}
      <div className={`absolute bottom-0 left-0 right-0 z-20 transition-opacity duration-300 ${showControls || !playing ? "opacity-100" : "opacity-0"}`}>
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

        <div className="relative px-4 pb-3 pt-8">
          {/* Progress bar */}
          <div
            ref={progressRef}
            className="relative h-1 rounded-full cursor-pointer mb-3 group/progress"
            style={{ background: "rgba(255,255,255,0.15)" }}
            onClick={handleProgressClick}
          >
            {/* Buffered */}
            <div className="absolute inset-y-0 left-0 rounded-full bg-white/20" style={{ width: `${buffered}%` }} />
            {/* Progress */}
            <div className="absolute inset-y-0 left-0 rounded-full bg-purple-500" style={{ width: `${progress}%` }} />
            {/* Thumb */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-md opacity-0 group-hover/progress:opacity-100 transition-opacity"
              style={{ left: `calc(${progress}% - 6px)` }}
            />
          </div>

          {/* Buttons row */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Play/Pause */}
              <button onClick={togglePlay} className="text-white hover:text-purple-400 transition-colors">
                {playing ? <PauseIcon /> : <PlayIcon />}
              </button>

              {/* Skip back */}
              <button onClick={() => skip(-10)} className="text-white hover:text-purple-400 transition-colors text-xs font-bold flex items-center gap-0.5">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>
                <span>10</span>
              </button>

              {/* Skip forward */}
              <button onClick={() => skip(10)} className="text-white hover:text-purple-400 transition-colors text-xs font-bold flex items-center gap-0.5">
                <span>10</span>
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"/></svg>
              </button>

              {/* Volume */}
              <div className="flex items-center gap-2 group/vol">
                <button onClick={toggleMute} className="text-white hover:text-purple-400 transition-colors">
                  <VolumeIcon muted={muted} level={volume} />
                </button>
                <input
                  type="range" min="0" max="1" step="0.05" value={muted ? 0 : volume}
                  onChange={handleVolume}
                  className="w-0 group-hover/vol:w-16 transition-all duration-200 accent-purple-500 cursor-pointer h-1"
                />
              </div>

              {/* Time */}
              <span className="text-white text-xs tabular-nums">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Settings / Quality */}
              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="text-white hover:text-purple-400 transition-colors flex items-center gap-1"
                >
                  <SettingsIcon />
                  <span className="text-xs">{quality}</span>
                </button>
                {showSettings && (
                  <div className="absolute bottom-full right-0 mb-2 bg-[#1a1a2e] border border-purple-900/50 rounded-xl overflow-hidden shadow-2xl min-w-[120px]">
                    <div className="px-3 py-2 text-xs text-gray-500 border-b border-purple-900/30">Kalite</div>
                    {["1080p", "2K", "4K"].map(q => (
                      <button
                        key={q}
                        onClick={() => { onQualityChange(q); setShowSettings(false); }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between gap-4 ${
                          quality === q ? "text-purple-400 bg-purple-900/20" : "text-gray-300 hover:bg-white/5"
                        }`}
                      >
                        <span>{q}</span>
                        {quality === q && <span>✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Fullscreen */}
              <button onClick={toggleFullscreen} className="text-white hover:text-purple-400 transition-colors">
                <FullscreenIcon active={isFullscreen} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VideoPlayer({ url }: { url: string }) {
  const [quality, setQuality] = useState("1080p");
  const { type, src } = getVideoSrc(url);

  if (type === "dailymotion") return <DailymotionPlayer src={src} />;
  if (type === "sibnet") return <SibnetPlayer src={src} />;
  if (type === "drive") return <DrivePlayer src={src} quality={quality} onQualityChange={setQuality} />;
  return <DirectPlayer url={src} quality={quality} onQualityChange={setQuality} />;
}
