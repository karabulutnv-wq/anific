"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

interface AnimeRequest {
  id: string;
  title: string;
  createdAt: string;
  user: { name: string };
  _count: { votes: number };
  voted?: boolean;
}

export default function RequestsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [requests, setRequests] = useState<AnimeRequest[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/requests").then(r => r.json()).then(setRequests);
  }, []);

  async function submitRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!session) { router.push("/login"); return; }
    setLoading(true);
    setMsg("");

    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    });
    const data = await res.json();

    if (data.exists) { router.push(`/anime/${data.slug}`); return; }
    if (data.alreadyRequested) {
      setMsg("Bu anime zaten istenmiş! Oy verebilirsin.");
      setRequests(prev => prev.find(r => r.id === data.request.id) ? prev : [{ ...data.request, voted: false }, ...prev]);
      setNewTitle(""); setShowForm(false); setLoading(false); return;
    }

    setRequests([{ ...data, voted: false }, ...requests]);
    setNewTitle(""); setShowForm(false);
    setMsg("✅ İsteğin eklendi!");
    setTimeout(() => setMsg(""), 3000);
    setLoading(false);
  }

  async function vote(requestId: string) {
    if (!session) { router.push("/login"); return; }
    const res = await fetch("/api/requests/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId }),
    });
    const data = await res.json();
    setRequests(prev => prev.map(r =>
      r.id === requestId ? { ...r, _count: { votes: r._count.votes + (data.voted ? 1 : -1) }, voted: data.voted } : r
    ));
  }

  return (
    <div className="min-h-screen gradient-bg">
      <Navbar />
      <div className="pt-28 pb-20 px-4 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-purple-300">Anime İstekleri</h1>
            <p className="text-gray-500 text-sm mt-1">İstediğin animeyi öner, topluluk oy versin</p>
          </div>
          <button
            onClick={() => session ? setShowForm(!showForm) : router.push("/login")}
            className="bg-purple-600 hover:bg-purple-500 px-5 py-2.5 rounded-xl font-medium transition-colors text-sm"
          >
            + Anime İste
          </button>
        </div>

        {msg && <div className="mb-6 bg-purple-900/30 border border-purple-700/30 text-purple-300 px-4 py-3 rounded-xl text-sm">{msg}</div>}

        {showForm && (
          <form onSubmit={submitRequest} className="bg-[#1a1a2e] border border-purple-900/30 rounded-2xl p-6 mb-8">
            <h2 className="font-bold text-white mb-4">Yeni Anime İste</h2>
            <div className="flex gap-3">
              <input
                type="text"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Anime adı..."
                className="flex-1 bg-[#0a0a0f] border border-purple-900/40 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                required
              />
              <button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50">
                {loading ? "..." : "Gönder"}
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-2">Anime sitede varsa direkt o animeye yönlendirileceksin.</p>
          </form>
        )}

        <div className="space-y-3">
          {requests.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <div className="text-5xl mb-4">🎌</div>
              <p>Henüz istek yok. İlk isteği sen yap!</p>
            </div>
          ) : requests.map((req, i) => (
            <div key={req.id} className="bg-[#1a1a2e] border border-purple-900/20 rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-2xl font-black text-purple-900/60 w-8 text-center">{i + 1}</span>
                <div>
                  <p className="font-semibold text-white">{req.title}</p>
                  <p className="text-xs text-gray-500">İsteyen: {req.user.name} · {new Date(req.createdAt).toLocaleDateString("tr-TR")}</p>
                </div>
              </div>
              <button
                onClick={() => vote(req.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${req.voted ? "bg-purple-600 text-white" : "bg-purple-900/30 text-purple-400 hover:bg-purple-800/40"}`}
              >
                <span>▲</span>
                <span>{req._count.votes}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
