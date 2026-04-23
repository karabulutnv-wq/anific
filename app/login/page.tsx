"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { ...form, redirect: false });
    if (res?.error) { setError("Email veya şifre hatalı"); setLoading(false); }
    else router.push("/profiles");
  }

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-violet-500/6 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 fade-in">
        <div className="text-center mb-10">
          <Link href="/" className="text-3xl font-black glow-text inline-block mb-3">ANIFIC</Link>
          <p className="text-gray-500">Hesabına giriş yap</p>
        </div>

        <div className="glass rounded-3xl p-8">
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className="input-modern" placeholder="ornek@email.com" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Şifre</label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                className="input-modern" placeholder="••••••••" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2 disabled:opacity-50">
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Hesabın yok mu?{" "}
            <Link href="/register" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">Kayıt Ol</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
