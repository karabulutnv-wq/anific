"use client";
import { useState, useEffect } from "react";

interface Comment {
  id: string;
  text: string;
  createdAt: string;
  user: { name: string };
}

export default function Comments({ episodeId, userId }: { episodeId: string; userId?: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/comments?episodeId=${episodeId}`)
      .then(r => r.json())
      .then(setComments);
  }, [episodeId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ episodeId, text }),
    });
    if (res.ok) {
      const c = await res.json();
      setComments([c, ...comments]);
      setText("");
    }
    setLoading(false);
  }

  async function deleteComment(id: string) {
    await fetch("/api/comments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setComments(comments.filter(c => c.id !== id));
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-bold text-purple-300 mb-4">Yorumlar ({comments.length})</h2>

      {userId ? (
        <form onSubmit={submit} className="mb-6 flex gap-3">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Yorum yaz..."
            className="flex-1 bg-[#1a1a2e] border border-purple-900/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 text-sm"
          />
          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="bg-purple-600 hover:bg-purple-500 px-5 py-3 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
          >
            Gönder
          </button>
        </form>
      ) : (
        <p className="text-gray-500 text-sm mb-6">Yorum yapmak için giriş yapmalısınız.</p>
      )}

      <div className="space-y-3">
        {comments.map(c => (
          <div key={c.id} className="bg-[#1a1a2e] border border-purple-900/20 rounded-xl px-4 py-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-purple-400 text-sm font-medium">{c.user.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-gray-600 text-xs">{new Date(c.createdAt).toLocaleDateString("tr-TR")}</span>
                {userId && (
                  <button onClick={() => deleteComment(c.id)} className="text-gray-600 hover:text-red-400 text-xs transition-colors">Sil</button>
                )}
              </div>
            </div>
            <p className="text-gray-300 text-sm">{c.text}</p>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-gray-600 text-sm text-center py-4">Henüz yorum yok. İlk yorumu sen yap!</p>
        )}
      </div>
    </div>
  );
}
