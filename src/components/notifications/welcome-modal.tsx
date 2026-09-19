"use client";

/**
 * WelcomeModal — shown after login.
 *
 * Features:
 * 1. Time-based greeting: Buenos días / tardes / noches, señor Musa
 * 2. Absence summary: if > 1h since last visit, shows what happened
 * 3. Auto-dismisses after 5s, or on tap anywhere
 */

import { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sun, Sunset, Moon, Bell, Clock, X } from "lucide-react";

interface AbsenceSummary {
  hoursAway: number;
  newActivity: number;
  message: string;
}

function getGreeting(): { text: string; icon: React.ReactNode; sub: string } {
  // Use Spain timezone (Palma de Mallorca)
  const hour = new Date().toLocaleString("es-ES", {
    timeZone: "Europe/Madrid",
    hour: "numeric",
    hour12: false,
  });
  const h = parseInt(hour);

  if (h >= 6 && h < 14) {
    return {
      text: "Buenos días",
      icon: <Sun className="w-8 h-8 text-amber-400" />,
      sub: "Que tengas un día productivo ✨",
    };
  } else if (h >= 14 && h < 21) {
    return {
      text: "Buenas tardes",
      icon: <Sunset className="w-8 h-8 text-orange-400" />,
      sub: "Todo bajo control en NextOS 💼",
    };
  } else {
    return {
      text: "Buenas noches",
      icon: <Moon className="w-8 h-8 text-indigo-400" />,
      sub: "Revisando el sistema antes de descansar 🌙",
    };
  }
}

function getLastLogin(): Date | null {
  try {
    const stored = localStorage.getItem("nextos_last_login");
    if (!stored) return null;
    return new Date(stored);
  } catch {
    return null;
  }
}

function saveLastLogin() {
  try {
    localStorage.setItem("nextos_last_login", new Date().toISOString());
  } catch {}
}

export function WelcomeModal() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [greeting, setGreeting] = useState<ReturnType<typeof getGreeting> | null>(null);
  const [absence, setAbsence] = useState<AbsenceSummary | null>(null);
  const [progress, setProgress] = useState(100);

  const dismiss = useCallback(() => {
    setVisible(false);
    saveLastLogin();
  }, []);

  useEffect(() => {
    // Only show on the main dashboard
    if (pathname !== "/") return;

    const lastLogin = getLastLogin();
    const now = new Date();
    const g = getGreeting();
    setGreeting(g);

    // Calculate absence
    if (lastLogin) {
      const diffMs = now.getTime() - lastLogin.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      if (diffHours >= 1) {
        // Fetch activity since last login
        fetch(`/api/activity?limit=50`)
          .then((r) => r.json())
          .then((items: any[]) => {
            const recentItems = Array.isArray(items)
              ? items.filter((i) => {
                  const created = new Date(i.created_at);
                  return created > lastLogin;
                })
              : [];

            const days = Math.floor(diffHours / 24);
            const hours = Math.round(diffHours % 24);

            let awayText = "";
            if (days > 0) {
              awayText = days === 1 ? "1 día" : `${days} días`;
              if (hours > 0) awayText += ` y ${hours}h`;
            } else {
              awayText = `${Math.round(diffHours)}h`;
            }

            setAbsence({
              hoursAway: diffHours,
              newActivity: recentItems.length,
              message: `Estuviste ausente ${awayText}. ${
                recentItems.length > 0
                  ? `Se registraron ${recentItems.length} evento${recentItems.length > 1 ? "s" : ""} durante tu ausencia.`
                  : "No hubo actividad mientras estabas fuera."
              }`,
            });
          })
          .catch(() => {});
      }
    }

    // Show modal
    setVisible(true);

    // Progress bar countdown (5s)
    const DURATION = 5000;
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.max(0, 100 - (elapsed / DURATION) * 100);
      setProgress(pct);
      if (pct === 0) {
        clearInterval(interval);
        dismiss();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [pathname, dismiss]);

  if (!visible || !greeting) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 sm:p-0"
      onClick={dismiss}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300" />

      {/* Modal card */}
      <div
        className="relative w-full sm:w-auto sm:min-w-[360px] sm:max-w-md bg-[#13131a]/95 border border-[#D4A853]/30 rounded-2xl sm:rounded-2xl shadow-[0_0_60px_rgba(212,168,83,0.15)] overflow-hidden animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-400"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gold progress bar at top */}
        <div className="h-0.5 bg-[#1a1a24] w-full">
          <div
            className="h-full bg-gradient-to-r from-[#D4A853] to-[#C29641] transition-all duration-50 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-6">
          {/* Header row */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#D4A853]/10 border border-[#D4A853]/20 flex items-center justify-center shrink-0">
                {greeting.icon}
              </div>
              <div>
                <p className="text-xs text-[#D4A853] font-bold uppercase tracking-[0.2em] mb-0.5">
                  NextOS — Portal de Control
                </p>
                <h2 className="text-xl font-bold text-white leading-tight">
                  {greeting.text},{" "}
                  <span className="text-[#D4A853]">señor Musa</span>
                </h2>
                <p className="text-sm text-[#A3A3A3] mt-0.5">{greeting.sub}</p>
              </div>
            </div>
            <button
              onClick={dismiss}
              className="text-[#666] hover:text-white transition-colors p-1 shrink-0 ml-2"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Absence summary */}
          {absence && absence.hoursAway >= 1 && (
            <div className="bg-[#0c0c14] border border-[#333]/60 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-[#A3A3A3] text-xs font-semibold uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-[#D4A853]" />
                Resumen de ausencia
              </div>
              <p className="text-sm text-white/80 leading-relaxed">{absence.message}</p>
              {absence.newActivity > 0 && (
                <a
                  href="/activity"
                  onClick={dismiss}
                  className="inline-flex items-center gap-1.5 text-xs text-[#D4A853] hover:underline font-semibold mt-1"
                >
                  <Bell className="w-3.5 h-3.5" />
                  Ver actividad reciente →
                </a>
              )}
            </div>
          )}

          {/* Dismiss hint */}
          <p className="text-center text-[10px] text-[#555] mt-4">
            Toca para cerrar · Auto cierre en {Math.ceil(progress / 20)}s
          </p>
        </div>
      </div>
    </div>
  );
}
