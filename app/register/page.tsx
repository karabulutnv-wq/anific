"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setLoading(false); }
    else router.push("/login?registered=true");
  }

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-600/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-violet-500/6 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 fade-in">
        <div className="text-center mb-10">
          <Link href="/" className="text-3xl font-black glow-text inline-block mb-3">ANIFIC</Link>
          <p className="text-gray-500">Yeni hesap oluştur</p>
        </div>

        <div className="glass rounded-3xl p-8">
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: "Ad Soyad", key: "name", type: "text", placeholder: "Ad Soyad" },
              { label: "Email", key: "email", type: "email", placeholder: "ornek@email.com" },
              { label: "Şifre", key: "password", type: "password", placeholder: "En az 8 karakter" },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">{f.label}</label>
                <input type={f.type} value={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  className="input-modern" placeholder={f.placeholder} minLength={f.key === "password" ? 8 : undefined} required />
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2 disabled:opacity-50">
              {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Zaten hesabın var mı?{" "}
            <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">Giriş Yap</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
