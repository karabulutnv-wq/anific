"use client";
import { useEffect, useRef, useState, useCallback } from "react";

// Vertex shader - basit quad
const VERT_SHADER = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;
  void main() {
    gl_Position = vec4(a_position, 0, 1);
    v_texCoord = a_texCoord;
  }
`;

// Fragment shader - upscale efektleri
const FRAG_NORMAL = `
  precision mediump float;
  uniform sampler2D u_texture;
  varying vec2 v_texCoord;
  void main() {
    gl_FragColor = texture2D(u_texture, v_texCoord);
  }
`;

const FRAG_2K = `
  precision mediump float;
  uniform sampler2D u_texture;
  uniform vec2 u_resolution;
  varying vec2 v_texCoord;
  void main() {
    vec2 texel = 1.0 / u_resolution;
    vec4 color = texture2D(u_texture, v_texCoord);
    // Renk canlılığı
    vec3 gray = vec3(dot(color.rgb, vec3(0.299, 0.587, 0.114)));
    color.rgb = mix(gray, color.rgb, 1.35);
    // Kontrast
    color.rgb = (color.rgb - 0.5) * 1.12 + 0.5;
    // Parlaklık
    color.rgb *= 1.05;
    gl_FragColor = clamp(color, 0.0, 1.0);
  }
`;

const FRAG_4K = `
  precision mediump float;
  uniform sampler2D u_texture;
  uniform vec2 u_resolution;
  varying vec2 v_texCoord;

  vec4 sharpen(sampler2D tex, vec2 uv, vec2 res) {
    vec2 step = 1.0 / res;
    vec4 center = texture2D(tex, uv);
    vec4 top    = texture2D(tex, uv + vec2(0.0, step.y));
    vec4 bottom = texture2D(tex, uv - vec2(0.0, step.y));
    vec4 left   = texture2D(tex, uv - vec2(step.x, 0.0));
    vec4 right  = texture2D(tex, uv + vec2(step.x, 0.0));
    // Unsharp mask
    vec4 blur = (top + bottom + left + right) * 0.25;
    return center + (center - blur) * 1.8;
  }

  void main() {
    vec4 color = sharpen(u_texture, v_texCoord, u_resolution);
    // Güçlü renk canlılığı
    vec3 gray = vec3(dot(color.rgb, vec3(0.299, 0.587, 0.114)));
    color.rgb = mix(gray, color.rgb, 1.6);
    // Kontrast
    color.rgb = (color.rgb - 0.5) * 1.18 + 0.5;
    // Parlaklık
    color.rgb *= 1.08;
    // Hafif renk tonu
    color.r *= 1.02;
    color.b *= 0.98;
    gl_FragColor = clamp(color, 0.0, 1.0);
  }
`;

function createShader(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  return shader;
}

function createProgram(gl: WebGLRenderingContext, vert: string, frag: string) {
  const prog = gl.createProgram()!;
  gl.attachShader(prog, createShader(gl, gl.VERTEX_SHADER, vert));
  gl.attachShader(prog, createShader(gl, gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(prog);
  return prog;
}

function getVideoInfo(input: string): { type: "iframe" | "direct"; src: string } {
  if (input.includes("<iframe")) {
    const m = input.match(/src=["']([^"']+)["']/);
    if (m) return { type: "iframe", src: m[1] };
  }
  const drive = input.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (drive) return { type: "iframe", src: `https://drive.google.com/file/d/${drive[1]}/preview` };
  const sibnet = input.match(/sibnet\.ru\/video(\d+)/);
  if (sibnet) return { type: "iframe", src: `https://video.sibnet.ru/shell.php?videoid=${sibnet[1]}` };
  if (input.includes("sibnet.ru/shell.php")) return { type: "iframe", src: input };
  const dm = input.match(/dailymotion\.com\/video\/([a-zA-Z0-9]+)/);
  if (dm) return { type: "iframe", src: `https://www.dailymotion.com/embed/video/${dm[1]}?autoplay=0` };
  if (input.includes("dailymotion.com/embed") || input.includes("geo.dailymotion.com")) return { type: "iframe", src: input };
  return { type: "direct", src: input };
}

function IframePlayer({ src }: { src: string }) {
  return (
    <div style={{ width: "100%", aspectRatio: "16/9", background: "#000", position: "relative" }}>
      <iframe src={src} style={{ width: "100%", height: "100%", border: "none", position: "absolute", inset: 0 }}
        allowFullScreen allow="autoplay; fullscreen" />
    </div>
  );
}

type Quality = "1080p" | "2K" | "4K";

function WebGLPlayer({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programsRef = useRef<Record<Quality, WebGLProgram | null>>({ "1080p": null, "2K": null, "4K": null });
  const textureRef = useRef<WebGLTexture | null>(null);
  const rafRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const [quality, setQuality] = useState<Quality>("1080p");
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [showQuality, setShowQuality] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const controlsTimer = useRef<ReturnType<typeof setTimeout>>();
  const qualityRef = useRef<Quality>("1080p");

  useEffect(() => { qualityRef.current = quality; }, [quality]);

  // WebGL init
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false });
    if (!gl) return;
    glRef.current = gl;

    programsRef.current["1080p"] = createProgram(gl, VERT_SHADER, FRAG_NORMAL);
    programsRef.current["2K"] = createProgram(gl, VERT_SHADER, FRAG_2K);
    programsRef.current["4K"] = createProgram(gl, VERT_SHADER, FRAG_4K);

    const positions = new Float32Array([-1,-1, 1,-1, -1,1, 1,1]);
    const texCoords = new Float32Array([0,1, 1,1, 0,0, 1,0]);

    const posBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const texBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texBuf);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    textureRef.current = texture;

    // Store buffers
    (gl as any)._posBuf = posBuf;
    (gl as any)._texBuf = texBuf;
  }, []);

  // Render loop
  const render = useCallback(() => {
    const gl = glRef.current;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!gl || !video || !canvas || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(render);
      return;
    }

    const prog = programsRef.current[qualityRef.current];
    if (!prog) { rafRef.current = requestAnimationFrame(render); return; }

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.useProgram(prog);

    // Texture güncelle
    gl.bindTexture(gl.TEXTURE_2D, textureRef.current);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);

    // Attributes
    const posLoc = gl.getAttribLocation(prog, "a_position");
    gl.bindBuffer(gl.ARRAY_BUFFER, (gl as any)._posBuf);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const texLoc = gl.getAttribLocation(prog, "a_texCoord");
    gl.bindBuffer(gl.ARRAY_BUFFER, (gl as any)._texBuf);
    gl.enableVertexAttribArray(texLoc);
    gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 0, 0);

    // Uniforms
    const resLoc = gl.getUniformLocation(prog, "u_resolution");
    if (resLoc) gl.uniform2f(resLoc, canvas.width, canvas.height);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    rafRef.current = requestAnimationFrame(render);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [render]);

  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
    resetControls();
  }

  function resetControls() {
    setShowControls(true);
    clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => setShowControls(false), 3000);
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = (parseFloat(e.target.value) / 100) * v.duration;
  }

  function toggleFullscreen() {
    const c = containerRef.current;
    if (!c) return;
    if (!document.fullscreenElement) { c.requestFullscreen(); setIsFullscreen(true); }
    else { document.exitFullscreen(); setIsFullscreen(false); }
  }

  function fmt(s: number) {
    if (!s || isNaN(s)) return "0:00";
    return `${Math.floor(s/60)}:${Math.floor(s%60).toString().padStart(2,"0")}`;
  }

  const qualityLabels: Record<Quality, string> = {
    "1080p": "1080p",
    "2K": "2K ✨",
    "4K": "4K 🔥",
  };

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%", aspectRatio: "16/9", background: "#000", cursor: "none" }}
      onMouseMove={resetControls} onMouseLeave={() => setShowControls(false)}>

      {/* Hidden video */}
      <video ref={videoRef} src={src} style={{ display: "none" }}
        onTimeUpdate={() => { const v = videoRef.current; if (v) { setProgress((v.currentTime/v.duration)*100); setDuration(v.duration); }}}
        onLoadedData={() => setLoading(false)}
        onWaiting={() => setLoading(true)}
        onPlaying={() => setLoading(false)}
        onEnded={() => setPlaying(false)}
        crossOrigin="anonymous"
      />

      {/* WebGL canvas */}
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block", cursor: "pointer" }} onClick={togglePlay} />

      {/* Loading */}
      {loading && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <div style={{ width: 44, height: 44, border: "3px solid rgba(124,58,237,0.3)", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        </div>
      )}

      {/* Play button */}
      {!playing && !loading && (
        <button onClick={togglePlay} style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(124,58,237,0.85)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>▶</div>
        </button>
      )}

      {/* Quality badge */}
      {quality !== "1080p" && (
        <div style={{ position: "absolute", top: 12, right: 12, background: quality === "4K" ? "rgba(124,58,237,0.9)" : "rgba(59,130,246,0.9)", borderRadius: 8, padding: "3px 10px", fontSize: 12, fontWeight: 700, color: "white", pointerEvents: "none" }}>
          {quality === "4K" ? "✦ 4K ULTRA" : "✦ 2K"}
        </div>
      )}

      {/* Controls */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.85))", padding: "32px 16px 12px", transition: "opacity 0.3s", opacity: showControls || !playing ? 1 : 0 }}>
        {/* Progress */}
        <input type="range" min="0" max="100" value={progress} onChange={handleSeek}
          style={{ width: "100%", height: 4, marginBottom: 10, accentColor: "#7c3aed", cursor: "pointer" }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={togglePlay} style={{ background: "none", border: "none", color: "white", cursor: "pointer", fontSize: 18, padding: 0 }}>
              {playing ? "⏸" : "▶"}
            </button>
            <input type="range" min="0" max="1" step="0.05" value={volume}
              onChange={e => { setVolume(parseFloat(e.target.value)); if (videoRef.current) videoRef.current.volume = parseFloat(e.target.value); }}
              style={{ width: 70, accentColor: "#7c3aed", cursor: "pointer" }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontVariantNumeric: "tabular-nums" }}>
              {fmt((progress/100)*duration)} / {fmt(duration)}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Quality selector */}
            <div style={{ position: "relative" }}>
              <button onClick={() => setShowQuality(!showQuality)}
                style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, padding: "4px 10px", color: "white", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                ⚙ {quality}
              </button>
              {showQuality && (
                <div style={{ position: "absolute", bottom: "100%", right: 0, marginBottom: 8, background: "rgba(12,12,20,0.98)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, overflow: "hidden", minWidth: 120 }}>
                  <div style={{ padding: "8px 12px", fontSize: 11, color: "rgba(255,255,255,0.4)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>Kalite</div>
                  {(["1080p", "2K", "4K"] as Quality[]).map(q => (
                    <button key={q} onClick={() => { setQuality(q); setShowQuality(false); }}
                      style={{ width: "100%", padding: "10px 14px", background: quality === q ? "rgba(124,58,237,0.2)" : "none", border: "none", color: quality === q ? "#a855f7" : "rgba(255,255,255,0.7)", cursor: "pointer", textAlign: "left", fontSize: 13, fontWeight: quality === q ? 700 : 400 }}>
                      {qualityLabels[q]}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={toggleFullscreen} style={{ background: "none", border: "none", color: "white", cursor: "pointer", fontSize: 16 }}>
              {isFullscreen ? "⊡" : "⛶"}
            </button>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function VideoPlayer({ url }: { url: string }) {
  const { type, src } = getVideoInfo(url);
  if (type === "iframe") return <IframePlayer src={src} />;
  return <WebGLPlayer src={src} />;
}
