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
    <div className="relative w-screen h-screen flex flex-col lg:flex-row bg-[#0c0c0e] overflow-hidden select-none">
      
      {/* Left Side: Login Section */}
      <div className="relative z-20 w-full lg:w-[45%] xl:w-[40%] h-full flex flex-col items-center justify-center bg-[#0c0c0e] shadow-[20px_0_50px_rgba(0,0,0,0.8)] border-r border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0c0c0e] via-[#121216] to-[#0c0c0e]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay" />
        
        <div className="relative z-10 flex flex-col items-center space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
        
        {/* Header Seal */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#D4A853] to-[#C29641] rounded-full blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
            <img 
              src="/logo1.png" 
              alt="MyNext Seal" 
              className="relative w-20 h-20 rounded-full border border-[#D4A853]/55 object-cover shadow-2xl bg-black"
            />
          </div>
          <div className="text-center flex flex-col items-center">
            <h1 className="text-2xl font-bold tracking-[0.25em] text-white flex items-center justify-center gap-1.5 drop-shadow-md">
              Next <span className="text-[#D4A853]">LaB</span>
            </h1>
            <div className="mt-2 flex flex-col items-center space-y-1">
              <p className="text-[10px] text-[#D4A853] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Portal de Control
              </p>
              <p className="text-[13px] text-neutral-400 font-medium tracking-wide max-w-[320px]">
                Bienvenido al centro neurálgico de operaciones.
              </p>
            </div>
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

      {/* Right Side: Hero Background Image */}
      <div className="hidden lg:block relative flex-1 h-full bg-[#0c0c0e] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-100 transition-transform duration-[20000ms] ease-out hover:scale-105"
          style={{ backgroundImage: "url(/bg/hero-login.jpg)" }}
        />
        {/* Gradients to blend smoothly with the left panel and add a premium dark vignette */}
        <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#0c0c0e] to-transparent opacity-90 w-32 pointer-events-none z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e]/80 via-transparent to-[#0c0c0e]/40 pointer-events-none z-10" />
      </div>

    </div>
  );
}
