export default function AppLoading() {
  const PHRASES = [
    "頑張れ！— Cố lên nào！",
    "一歩一歩。— Từng bước một.",
    "継続は力なり。— Kiên trì là sức mạnh.",
    "夢は逃げない。— Ước mơ không bỏ chạy。",
    "今日も頑張りましょう！— Hôm nay cũng cố gắng nhé！",
  ];

  const phrase = PHRASES[Math.floor(Math.random() * PHRASES.length)];

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-sakura-50/20 to-fuji-50/10 dark:from-slate-950 dark:via-sumi-950 dark:to-slate-950">
      {/* Torii Gate Animation */}
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-sakura-500 via-rose-500 to-amber-500 shadow-2xl shadow-sakura-500/40 flex items-center justify-center animate-pulse">
          <span className="text-3xl font-black text-white">⛩️</span>
        </div>
        {/* Spinning ring */}
        <div className="absolute -inset-2 rounded-[28px] border-2 border-sakura-300/50 dark:border-sakura-800/50 animate-spin" style={{ animationDuration: "3s" }} />
        <div className="absolute -inset-4 rounded-[36px] border border-sakura-200/30 dark:border-sakura-900/30 animate-spin" style={{ animationDuration: "5s", animationDirection: "reverse" }} />
      </div>

      {/* Brand */}
      <div className="text-center space-y-2 mb-6">
        <h2 className="font-black text-xl text-slate-900 dark:text-white">Nihon Quest</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Đang tải...</p>
      </div>

      {/* Japanese phrase */}
      <div className="rounded-2xl border border-sakura-200 dark:border-sakura-900 bg-white/80 dark:bg-sumi-950/80 backdrop-blur px-5 py-3 text-center max-w-xs">
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{phrase}</p>
      </div>

      {/* Loading dots */}
      <div className="flex gap-2 mt-6">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-sakura-400 animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
