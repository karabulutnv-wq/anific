"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

interface Episode { id: string; number: number; title: string; quality: string; videoUrl: string; }
interface Anime { id: string; title: string; slug: string; episodes: Episode[]; }

export default function ManageAnimePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [form, setForm] = useState({ number: "", title: "", quality: "FHD", videoUrl: "" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [tunnelUrl, setTunnelUrl] = useState("");

  useEffect(() => {
    fetch(/api/admin/anime/+""+${id}+""+).then(r => r.json()).then(setAnime);
    const saved = localStorage.getItem("tunnelUrl");
    if (saved) setTunnelUrl(saved);
  }, [id]);

  async function addEpisode(e: React.FormEvent) {
    e.preventDefault();
    if (!anime) return;
    let videoUrl = form.videoUrl.trim();
    if (videoFile) {
      if (!tunnelUrl) { alert("Tunnel URL gir!"); return; }
      setUploading(true); setUploadProgress(0); setStatus("Yukleniyor...");
      const fd = new FormData();
      fd.append("video", videoFile);
      fd.append("tunnel", tunnelUrl);
      videoUrl = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (ev) => { if (ev.lengthComputable) setUploadProgress(Math.round((ev.loaded/ev.total)*100)); };
        xhr.onload = () => { if (xhr.status===200) resolve(JSON.parse(xhr.responseText).url); else reject(new Error("Hata")); };
        xhr.onerror = () => reject(new Error("Baglanti hatasi"));
        xhr.open("POST", tunnelUrl+"/upload");
        xhr.send(fd);
      }).catch(err => { alert(err.message); return ""; });
      setUploading(false);
      if (!videoUrl) return;
    }
    if (!videoUrl) { alert("Video URL veya dosya gerekli"); return; }
    setLoading(true);
    const res = await fetch("/api/admin/episodes/save", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ animeId: id, number: parseInt(form.number), title: form.title, quality: form.quality, videoUrl }),
    });
    if (res.ok) {
      const ep = await res.json();
      setAnime(prev => prev ? { ...prev, episodes: [...prev.episodes, ep].sort((a,b)=>a.number-b.number) } : prev);
      setForm({ number: "", title: "", quality: "FHD", videoUrl: "" });
      setVideoFile(null);
      setStatus("Bolum eklendi!");
      setTimeout(() => setStatus(""), 3000);
    } else alert("Hata");
    setLoading(false);
  }

  async function deleteEpisode(epId: string) {
    if (!confirm("Silmek istediğine emin misin?")) return;
    const res = await fetch(/api/admin/episodes/+""+${epId}+""+, { method: "DELETE" });
    if (res.ok) setAnime(prev => prev ? { ...prev, episodes: prev.episodes.filter(e=>e.id!==epId) } : prev);
  }

  if (!anime) return <div style={{minHeight:"100vh",background:"#070710",display:"flex",alignItems:"center",justifyContent:"center",color:"#a855f7"}}>Yukleniyor...</div>;

  return (
    <div style={{minHeight:"100vh",background:"#070710"}}>
      <Navbar />
      <div style={{maxWidth:800,margin:"0 auto",padding:"100px 16px 80px"}}>
        <button onClick={()=>router.back()} style={{color:"#a855f7",background:"none",border:"none",cursor:"pointer",marginBottom:24,fontSize:14}}>Geri</button>
        <h1 style={{fontSize:24,fontWeight:900,color:"#a855f7",marginBottom:24}}>{anime.title} - Bolum Yonetimi</h1>
        <div style={{background:"rgba(124,58,237,0.08)",border:"1px solid rgba(124,58,237,0.2)",borderRadius:16,padding:16,marginBottom:24}}>
          <p style={{fontSize:13,color:"#a855f7",marginBottom:8,fontWeight:600}}>Video Server URL</p>
          <input type="text" value={tunnelUrl} onChange={e=>{setTunnelUrl(e.target.value);localStorage.setItem("tunnelUrl",e.target.value);}}
            placeholder="https://xxxx.trycloudflare.com"
            style={{width:"100%",background:"rgba(0,0,0,0.3)",border:"1px solid rgba(124,58,237,0.3)",borderRadius:10,padding:"8px 12px",color:"white",fontSize:13,outline:"none"}} />
          <p style={{fontSize:11,color:"rgba(255,255,255,0.3)",marginTop:6}}>cloudflared tunnel --url http://localhost:8080</p>
        </div>
        <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:20,padding:24,marginBottom:24}}>
          <h2 style={{fontSize:18,fontWeight:700,color:"white",marginBottom:20}}>Yeni Bolum Ekle</h2>
          <form onSubmit={addEpisode} style={{display:"flex",flexDirection:"column",gap:16}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <div>
                <label style={{display:"block",fontSize:12,color:"rgba(255,255,255,0.4)",marginBottom:6}}>Bolum No</label>
                <input type="number" value={form.number} onChange={e=>setForm({...form,number:e.target.value})}
                  style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,padding:"10px 14px",color:"white",fontSize:14,outline:"none"}} required />
              </div>
              <div>
                <label style={{display:"block",fontSize:12,color:"rgba(255,255,255,0.4)",marginBottom:6}}>Kalite</label>
                <select value={form.quality} onChange={e=>setForm({...form,quality:e.target.value})}
                  style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,padding:"10px 14px",color:"white",fontSize:14,outline:"none"}}>
                  <option value="SD">SD</option><option value="HD">HD</option><option value="FHD">FHD 1080p</option><option value="UHD">UHD 4K</option>
                </select>
              </div>
            </div>
            <div>
              <label style={{display:"block",fontSize:12,color:"rgba(255,255,255,0.4)",marginBottom:6}}>Bolum Basligi</label>
              <input type="text" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}
                style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,padding:"10px 14px",color:"white",fontSize:14,outline:"none"}} required />
            </div>
            <div style={{background:"rgba(0,0,0,0.2)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:12,padding:16}}>
              <p style={{fontSize:13,color:"rgba(255,255,255,0.4)",marginBottom:12}}>Video Kaynagi</p>
              <div style={{marginBottom:12}}>
                <label style={{display:"block",fontSize:12,color:"rgba(255,255,255,0.3)",marginBottom:6}}>Bilgisayardan Yukle</label>
                <input type="file" accept="video/*" onChange={e=>{setVideoFile(e.target.files?.[0]||null);setForm({...form,videoUrl:""}); }}
                  style={{width:"100%",color:"rgba(255,255,255,0.5)",fontSize:13}} />
                {videoFile && <p style={{fontSize:12,color:"rgba(255,255,255,0.3)",marginTop:4}}>{videoFile.name} - {(videoFile.size/1024/1024).toFixed(1)} MB</p>}
              </div>
              <div style={{textAlign:"center",color:"rgba(255,255,255,0.2)",fontSize:12,marginBottom:12}}>veya</div>
              <div>
                <label style={{display:"block",fontSize:12,color:"rgba(255,255,255,0.3)",marginBottom:6}}>Video URL / Embed Kodu</label>
                <input type="text" value={form.videoUrl} onChange={e=>{setForm({...form,videoUrl:e.target.value});setVideoFile(null);}}
                  placeholder="https://... veya embed kodu"
                  style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,padding:"10px 14px",color:"white",fontSize:13,outline:"none"}} />
              </div>
            </div>
            {uploading && (
              <div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"rgba(255,255,255,0.5)",marginBottom:6}}>
                  <span>{status}</span><span>{uploadProgress}%</span>
                </div>
                <div style={{background:"rgba(255,255,255,0.08)",borderRadius:4,height:6}}>
                  <div style={{background:"#7c3aed",height:"100%",borderRadius:4,width:uploadProgress+"%",transition:"width 0.3s"}} />
                </div>
              </div>
            )}
            {status && !uploading && <p style={{fontSize:13,textAlign:"center",color:"#4ade80"}}>{status}</p>}
            <button type="submit" disabled={loading||uploading}
              style={{background:"linear-gradient(135deg,#7c3aed,#6d28d9)",border:"none",borderRadius:12,padding:14,color:"white",fontSize:15,fontWeight:600,cursor:"pointer",opacity:(loading||uploading)?0.5:1}}>
              {uploading ? "Yukleniyor... "+uploadProgress+"%" : loading ? "Ekleniyor..." : "Bolum Ekle"}
            </button>
          </form>
        </div>
        <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:20,overflow:"hidden"}}>
          <div style={{padding:"16px 20px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
            <h2 style={{fontSize:16,fontWeight:700,color:"white"}}>Mevcut Bolumler ({anime.episodes.length})</h2>
          </div>
          {anime.episodes.length===0 ? <p style={{textAlign:"center",color:"rgba(255,255,255,0.2)",padding:32}}>Henuz bolum yok</p>
          : anime.episodes.map(ep=>(
            <div key={ep.id} style={{padding:"14px 20px",borderBottom:"1px solid rgba(255,255,255,0.04)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <span style={{color:"#a855f7",fontWeight:700,marginRight:10}}>#{ep.number}</span>
                <span style={{color:"white",fontSize:14}}>{ep.title}</span>
                <span style={{color:"rgba(255,255,255,0.2)",fontSize:11,marginLeft:8}}>{ep.quality}</span>
              </div>
              <button onClick={()=>deleteEpisode(ep.id)} style={{color:"#f87171",background:"none",border:"none",cursor:"pointer",fontSize:13}}>Sil</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}