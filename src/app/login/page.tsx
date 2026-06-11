"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, Info } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Credenciales incorrectas");
      }

      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative w-screen h-screen flex flex-col items-center justify-center bg-[#0c0c0e] overflow-hidden select-none">
      {/* Dynamic Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40 scale-105 filter blur-[2px]"
        style={{ backgroundImage: "url(/bg/header-bg.jpg)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] via-black/85 to-[#0c0c0e]/95" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-15 mix-blend-overlay" />

      {/* Main Container */}
      <div className="relative z-10 flex flex-col items-center space-y-8 animate-in fade-in zoom-in duration-500">
        
        {/* Header Seal */}
        <div className="flex flex-col items-center space-y-3">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#D4A853] to-[#C29641] rounded-full blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
            <img 
              src="/logo1.png" 
              alt="MyNext Seal" 
              className="relative w-16 h-16 rounded-full border border-[#D4A853]/55 object-cover shadow-2xl bg-black"
            />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold tracking-[0.25em] text-white uppercase flex items-center justify-center gap-1.5 drop-shadow-md">
              MY<span className="text-[#D4A853]">NEXT</span> <span className="font-light text-neutral-400">OS</span>
            </h1>
            <p className="text-[9px] text-[#A3A3A3] font-bold uppercase tracking-[0.18em] flex items-center justify-center gap-1 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4A853]" /> Portal de Control
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="w-[320px] p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs text-center animate-in shake duration-300 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
            ⚠️ {error}
          </div>
        )}

        {/* Login form */}
        <div className="login-wrapper">
          <div className="card-switch">
              <div className="flip-card__inner">
                {/* Front Side: Log In */}
                <div className="flip-card__front">
                  <div className="title font-black">Iniciar Sesión</div>
                  <form className="flip-card__form" onSubmit={handleLogin}>
                    <input 
                      className="flip-card__input" 
                      name="email" 
                      placeholder="Correo electrónico" 
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <input 
                      className="flip-card__input" 
                      name="password" 
                      placeholder="Contraseña" 
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button className="flip-card__btn flex items-center justify-center gap-2" disabled={loading}>
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#111]" />
                      ) : (
                        "Entrar"
                      )}
                    </button>
                  </form>
                </div>
              </div>
          </div>
        </div>

      </div>
    </div>
  );
}
