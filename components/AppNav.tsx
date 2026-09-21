"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useSoundAndTheme } from "./SoundAndThemeContext";

interface NavItem {
  href: string;
  label: string;
  shortLabel?: string;
  icon: string;
  badge?: string;
  description?: string;
}

// 5 Core Primary Nav Items (Fits smoothly on any desktop width without overflow)
const PRIMARY_NAV: NavItem[] = [
  { href: "/app", label: "Dashboard", shortLabel: "Tổng quan", icon: "⛩️" },
  { href: "/app/practice", label: "Bài Học", shortLabel: "Bài học", icon: "📖" },
  { href: "/app/review", label: "Ôn Tập", shortLabel: "SRS", icon: "🎴" },
  { href: "/app/vocabulary", label: "Từ Vựng", shortLabel: "Vocab", icon: "漢" },
  { href: "/app/grammar", label: "Ngữ Pháp N5", shortLabel: "Ngữ pháp", icon: "文", badge: "N5" },
];

// Explore & Feature Sub-items grouped into "Khám Phá" dropdown
const EXPLORE_NAV: NavItem[] = [
  {
    href: "/app/sensei",
    label: "AI Kaiwa Sensei",
    icon: "🌸",
    badge: "N3 Voice",
    description: "Đàm thoại tiếng Nhật N3 với Aoi Sensei khẩu hình tự nhiên",
  },
  {
    href: "/app/journey",
    label: "Japan Journey",
    icon: "🗾",
    badge: "Văn Hóa",
    description: "Không gian khám phá danh thắng & văn hóa Nhật Bản",
  },
  {
    href: "/app/survival",
    label: "Survival Mode",
    icon: "🍜",
    description: "Thử thách sinh tồn đối kháng từ vựng & ngữ cảnh",
  },
  {
    href: "/app/leaderboard",
    label: "Bảng Xếp Hạng",
    icon: "🏆",
    badge: "Giải Đấu",
    description: "Xếp hạng cao thủ & đối đầu Rival Bots trong tuần",
  },
  {
    href: "/app/learn",
    label: "Kana Lab",
    icon: "あ",
    description: "Bảng chữ cái Hiragana & Katakana kèm phát âm",
  },
];

export function AppNav() {
  const pathname = usePathname();
  const { theme, setTheme, soundEnabled, setSoundEnabled, playClick } = useSoundAndTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [moreOpen, setMobileDrawerOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const toggleTheme = () => {
    playClick();
    if (theme === "dark") setTheme("light");
    else setTheme("dark");
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) setTimeout(() => playClick(), 50);
  };

  // Close dropdown on outside click or escape
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setDropdownOpen(false);
        setMobileDrawerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const isExploreActive = EXPLORE_NAV.some((item) => pathname === item.href || pathname.startsWith(item.href + "/"));
  const activeExploreItem = EXPLORE_NAV.find((item) => pathname === item.href || pathname.startsWith(item.href + "/"));

  return (
    <>
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 mb-6 w-full glass-panel border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-sumi-950/80 backdrop-blur-xl transition-colors shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          {/* Brand Logo */}
          <Link
            href="/app"
            onClick={playClick}
            className="flex items-center gap-2.5 shrink-0 font-black text-lg tracking-tight hover:opacity-90 transition group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sakura-600 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-sakura-500/25 group-hover:scale-105 group-hover:rotate-3 transition-transform">
              <span className="text-lg font-bold font-jp">日</span>
            </div>
            <div className="flex flex-col">
              <span className="leading-tight text-slate-900 dark:text-white font-black text-base tracking-tight">
                Nihon Quest
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold tracking-wider uppercase">
                Japanese Master
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Bar (5 Core Tabs + Smart Explore Dropdown) */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-1 bg-slate-100/90 dark:bg-sumi-900/90 p-1.5 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 shadow-inner"
          >
            {PRIMARY_NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={playClick}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                    active
                      ? "bg-white text-sakura-600 shadow-sm dark:bg-sumi-800 dark:text-sakura-400 font-black shadow-slate-200/50 dark:shadow-none"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60 dark:text-slate-400 dark:hover:text-white dark:hover:bg-sumi-800/50"
                  }`}
                >
                  <span className="text-sm">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-sakura-500 text-white leading-none shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Smart "Khám Phá" Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setDropdownOpen((prev) => !prev);
                  playClick();
                }}
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
                className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isExploreActive || dropdownOpen
                    ? "bg-sakura-50 text-sakura-600 dark:bg-sakura-950/50 dark:text-sakura-400 border border-sakura-200/80 dark:border-sakura-900 font-black"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/60 dark:text-slate-400 dark:hover:text-white dark:hover:bg-sumi-800/50"
                }`}
              >
                <span>{activeExploreItem ? activeExploreItem.icon : "✨"}</span>
                <span>{activeExploreItem ? activeExploreItem.label : "Khám Phá"}</span>
                <span className={`text-[10px] transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}>
                  ▾
                </span>
                {isExploreActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-sakura-500 absolute top-1 right-1" />
                )}
              </button>

              {/* Floating Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-3xl bg-white/95 dark:bg-sumi-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-2 shadow-2xl z-50 animate-in fade-in-50 zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/80 mb-1">
                    Trung Tâm Khám Phá
                  </div>
                  <div className="space-y-1">
                    {EXPLORE_NAV.map((sub) => {
                      const active = pathname === sub.href;
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={() => {
                            setDropdownOpen(false);
                            playClick();
                          }}
                          className={`flex items-start gap-3 p-2.5 rounded-2xl transition ${
                            active
                              ? "bg-sakura-50 text-sakura-700 dark:bg-sakura-950/60 dark:text-sakura-300 font-bold"
                              : "text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-sumi-800"
                          }`}
                        >
                          <span className="text-xl shrink-0 p-1.5 rounded-xl bg-slate-100 dark:bg-sumi-800 shadow-xs">
                            {sub.icon}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold truncate">{sub.label}</span>
                              {sub.badge && (
                                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-sakura-100 text-sakura-700 dark:bg-sakura-900/60 dark:text-sakura-300">
                                  {sub.badge}
                                </span>
                              )}
                            </div>
                            {sub.description && (
                              <p className="text-[11px] text-slate-400 dark:text-slate-400 truncate mt-0.5">
                                {sub.description}
                              </p>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right Utility Actions (Sound, Dark Mode, Profile) */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              aria-label={soundEnabled ? "Mute audio" : "Enable audio"}
              className={`p-2.5 rounded-2xl text-sm transition-all border ${
                soundEnabled
                  ? "bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-300 shadow-sm"
                  : "bg-slate-100 border-slate-200 text-slate-400 dark:bg-sumi-900 dark:border-slate-800 hover:bg-slate-200/70"
              }`}
              title={soundEnabled ? "Âm thanh: Bật" : "Âm thanh: Tắt"}
            >
              {soundEnabled ? "🔔" : "🔕"}
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className="p-2.5 rounded-2xl text-sm border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-sumi-900 dark:text-slate-200 dark:hover:bg-sumi-800 transition shadow-sm"
              title={theme === "dark" ? "Chuyển giao diện Sáng" : "Chuyển giao diện Tối"}
            >
              {theme === "dark" ? "🌙" : "☀️"}
            </button>

            {/* Profile Avatar Link */}
            <Link
              href="/app/profile"
              onClick={playClick}
              className={`flex items-center justify-center w-10 h-10 rounded-2xl border text-sm font-black transition shadow-sm ${
                pathname === "/app/profile"
                  ? "border-sakura-500 bg-sakura-50 text-sakura-600 dark:bg-sakura-950/50 dark:text-sakura-400"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-sumi-900 dark:text-slate-200"
              }`}
              title="Hồ sơ cá nhân & cài đặt"
            >
              👤
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-sumi-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 py-1.5 px-3 flex justify-around items-center shadow-lg">
        {PRIMARY_NAV.slice(0, 4).map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={playClick}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-bold py-1 px-2 rounded-xl transition ${
                active
                  ? "text-sakura-600 dark:text-sakura-400 font-extrabold"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.shortLabel || item.label}</span>
            </Link>
          );
        })}

        {/* Mobile "More" Drawer button */}
        <button
          onClick={() => {
            setMobileDrawerOpen(true);
            playClick();
          }}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold py-1 px-2 rounded-xl transition ${
            isExploreActive || pathname === "/app/grammar"
              ? "text-sakura-600 dark:text-sakura-400 font-extrabold"
              : "text-slate-500 dark:text-slate-400"
          }`}
        >
          <span className="text-base">⋯</span>
          <span>Thêm</span>
        </button>
      </div>

      {/* Mobile "More" Drawer Bottom Sheet */}
      {moreOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setMobileDrawerOpen(false)}
          />
          {/* Drawer Sheet */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-sumi-950 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 p-5 pb-8 animate-in slide-in-from-bottom-6 duration-200 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎌</span>
                <h3 className="font-black text-slate-900 dark:text-white text-base">Tất Cả Tính Năng</h3>
              </div>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-sumi-900 flex items-center justify-center text-slate-500 font-bold"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[PRIMARY_NAV[4], ...EXPLORE_NAV].map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      setMobileDrawerOpen(false);
                      playClick();
                    }}
                    className={`relative flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all ${
                      active
                        ? "border-sakura-400 bg-sakura-50 dark:bg-sakura-950/50 dark:border-sakura-800 shadow-sm"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-sumi-900"
                    }`}
                  >
                    <span className="text-2xl shrink-0">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span
                          className={`text-xs font-black truncate ${
                            active
                              ? "text-sakura-600 dark:text-sakura-400"
                              : "text-slate-800 dark:text-slate-200"
                          }`}
                        >
                          {item.label}
                        </span>
                      </div>
                      {item.badge && (
                        <span className="inline-block text-[8px] font-black px-1.5 py-0.2 rounded-md bg-sakura-500 text-white mt-0.5">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
}
