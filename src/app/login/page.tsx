"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Mail, Lock, ShieldCheck } from "lucide-react";

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
    <div className="w-full max-w-md bg-[#1A1A1A]/85 border border-[#333]/80 p-8 rounded-2xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] space-y-6 glass hover-glow transition-all duration-500">
      {/* Brand Header & Logos */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative group">
          <div className="absolute -inset-1.5 bg-gradient-to-r from-[#D4A853] to-[#C29641] rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
          <img 
            src="/logo2.jpg" 
            alt="MyNext Seal" 
            className="relative w-20 h-20 rounded-full border border-[#D4A853]/60 object-cover shadow-xl bg-[#111]"
          />
        </div>
        
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold tracking-widest text-white flex items-center gap-2 justify-center">
            <img 
              src="/logo1.png" 
              alt="MyNext Brand Icon" 
              className="w-5.5 h-5.5 object-contain rounded"
            />
            MY<span className="text-[#D4A853]">NEXT</span>
          </h1>
          <p className="text-[#A3A3A3] text-[10px] uppercase tracking-widest font-semibold flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D4A853]" /> NextOS Portal de Acceso
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm text-center animate-in shake duration-300">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] text-[#A3A3A3] font-bold uppercase tracking-wider pl-1">Gmail / Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3] pointer-events-none" />
            <Input
              type="email"
              placeholder="admin@mynext.dev"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 bg-[#111]/60 border-[#333] hover:border-[#444] text-white focus:border-[#D4A853] transition-all duration-300 h-11 rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] text-[#A3A3A3] font-bold uppercase tracking-wider pl-1">Contraseña</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3] pointer-events-none" />
            <Input
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 bg-[#111]/60 border-[#333] hover:border-[#444] text-white focus:border-[#D4A853] transition-all duration-300 h-11 rounded-xl"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#D4A853] hover:bg-[#c39742] active:scale-[0.99] text-black font-bold h-11 rounded-xl shadow-lg shadow-[#D4A853]/10 hover:shadow-[#D4A853]/20 transition-all duration-300 mt-2 flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Iniciar Sesión"}
        </Button>
      </form>

      <div className="text-center pt-2">
        <p className="text-[10px] text-[#555] tracking-wide uppercase">Acceso restringido para personal autorizado.</p>
      </div>
    </div>
  );
}
