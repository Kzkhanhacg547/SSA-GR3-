"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

type Theme = "light" | "dark" | "system";

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  type?: "success" | "error" | "xp" | "achievement" | "info";
  xp?: number;
}

interface SoundAndThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  playCorrect: () => void;
  playIncorrect: () => void;
  playClick: () => void;
  playFanfare: () => void;
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, "id">) => void;
  removeToast: (id: string) => void;
}

const SoundAndThemeContext = createContext<SoundAndThemeContextType | null>(null);

export function SoundAndThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Initialize from localStorage
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem("nq_theme") as Theme | null;
      if (storedTheme && ["light", "dark", "system"].includes(storedTheme)) {
        setThemeState(storedTheme);
      }
      const storedSound = localStorage.getItem("nq_sound");
      if (storedSound !== null) {
        setSoundEnabledState(storedSound === "true");
      }
    } catch {
      // Ignore
    }
  }, []);

  // Sync theme with HTML document class
  useEffect(() => {
    const root = document.documentElement;
    const applyDark = () => {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    };
    const applyLight = () => {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
    };

    if (theme === "dark") {
      applyDark();
    } else if (theme === "light") {
      applyLight();
    } else {
      // System
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      if (media.matches) applyDark();
      else applyLight();

      const listener = (e: MediaQueryListEvent) => {
        if (e.matches) applyDark();
        else applyLight();
      };
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    }
  }, [theme]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    try {
      localStorage.setItem("nq_theme", t);
    } catch {}
  };

  const setSoundEnabled = (s: boolean) => {
    setSoundEnabledState(s);
    try {
      localStorage.setItem("nq_sound", String(s));
    } catch {}
  };

  // Web Audio Synthesizer (Instant, Zero Network Latency, Lightweight)
  const getAudioContext = useCallback(() => {
    if (typeof window === "undefined") return null;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    return new AudioCtx();
  }, []);

  const playCorrect = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      // Japanese Hirajoshi/Pentatonic chime: E5 (659Hz) -> G5 (784Hz) -> B5 (987Hz)
      const notes = [659.25, 783.99, 987.77];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.001, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.2, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.36);
      });
    } catch {}
  }, [soundEnabled, getAudioContext]);

  const playIncorrect = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.25);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.27);
    } catch {}
  }, [soundEnabled, getAudioContext]);

  const playClick = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(520, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch {}
  }, [soundEnabled, getAudioContext]);

  const playFanfare = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const chord = [523.25, 659.25, 783.99, 1046.5]; // C Major
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.001, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.18, now + idx * 0.06 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.85);
      });
    } catch {}
  }, [soundEnabled, getAudioContext]);

  const showToast = useCallback((toast: Omit<ToastItem, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <SoundAndThemeContext.Provider
      value={{
        theme,
        setTheme,
        soundEnabled,
        setSoundEnabled,
        playCorrect,
        playIncorrect,
        playClick,
        playFanfare,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </SoundAndThemeContext.Provider>
  );
}

export function useSoundAndTheme() {
  const ctx = useContext(SoundAndThemeContext);
  if (!ctx) throw new Error("useSoundAndTheme must be used within SoundAndThemeProvider");
  return ctx;
}

function ToastContainer({ toasts, removeToast }: { toasts: ToastItem[]; removeToast: (id: string) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-2 pointer-events-none sm:bottom-6 sm:right-6 max-w-sm w-full">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-md transition-all transform translate-y-0 animate-in fade-in slide-in-from-bottom-3 ${
            t.type === "xp"
              ? "bg-amber-500/95 text-white border-amber-400 shadow-glow-gold"
              : t.type === "achievement"
              ? "bg-fuji-600/95 text-white border-fuji-400 shadow-lg"
              : t.type === "error"
              ? "bg-red-600/95 text-white border-red-400"
              : "bg-sumi-900/95 text-white border-slate-700 dark:bg-white/95 dark:text-sumi-950 dark:border-slate-200"
          }`}
        >
          <div className="text-xl">
            {t.type === "xp" ? "✨" : t.type === "achievement" ? "🏆" : t.type === "error" ? "⚠️" : "🌸"}
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-sm tracking-wide">{t.title}</h4>
            {t.description && <p className="text-xs opacity-90 mt-0.5">{t.description}</p>}
          </div>
          <button
            onClick={() => removeToast(t.id)}
            className="text-xs opacity-70 hover:opacity-100 p-1"
            aria-label="Close notification"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
