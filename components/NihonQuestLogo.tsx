"use client";

import Image from "next/image";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function NihonQuestLogo({ size = "md", showText = true }: LogoProps) {
  const iconSizes = {
    sm: "w-8 h-8 sm:w-9 sm:h-9",
    md: "w-9 h-9 sm:w-11 sm:h-11",
    lg: "w-12 h-12 sm:w-14 sm:h-14",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base sm:text-lg",
    lg: "text-xl sm:text-2xl",
  };

  return (
    <div className="flex items-center gap-2.5 shrink-0 group cursor-pointer select-none">
      {/* Anime & Gaming Style Japanese Crest Logo Icon */}
      <div
        className={`relative ${iconSizes[size]} rounded-2xl overflow-hidden bg-gradient-to-br from-sumi-900 via-rose-950 to-sumi-950 border border-sakura-400/40 shadow-lg shadow-sakura-500/20 group-hover:scale-105 group-hover:rotate-2 group-hover:shadow-sakura-500/40 transition-all duration-300 flex items-center justify-center`}
      >
        {/* Sun & Torii Gate Vector Art Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-rose-500/30 via-transparent to-transparent" />
        
        <Image
          src="/logo.jpg"
          alt="Nihon Quest Logo"
          width={48}
          height={48}
          className="w-full h-full object-cover rounded-2xl group-hover:scale-110 transition-transform duration-300"
        />

        {/* Glow Ring Highlight */}
        <div className="absolute inset-0 rounded-2xl border border-sakura-300/30 group-hover:border-sakura-400/70 transition-colors pointer-events-none" />
      </div>

      {/* Modern Japanese Brand Typography */}
      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1">
            <span
              className={`font-black ${textSizes[size]} tracking-tight bg-gradient-to-r from-slate-900 via-rose-700 to-sakura-600 dark:from-white dark:via-sakura-300 dark:to-rose-400 bg-clip-text text-transparent group-hover:from-sakura-600 group-hover:to-amber-500 transition-all`}
            >
              Nihon Quest
            </span>
            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-sakura-500 text-white shadow-xs animate-pulse">
              JP
            </span>
          </div>
          <span className="text-[9px] font-extrabold tracking-widest text-slate-400 dark:text-slate-400 uppercase mt-0.5 flex items-center gap-1">
            <span className="text-sakura-500 font-jp">日本</span> • Học Tiếng Nhật Thông Minh
          </span>
        </div>
      )}
    </div>
  );
}
