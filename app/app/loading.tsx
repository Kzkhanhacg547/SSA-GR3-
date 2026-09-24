import Image from "next/image";

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
      {/* New Anime/Japanese Gaming Style App Loading Logo */}
      <div className="relative mb-8">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-2 border-sakura-400/50 shadow-2xl shadow-sakura-500/50 relative flex items-center justify-center animate-pulse">
          <Image
            src="/logo.jpg"
            alt="Nihon Quest Loading"
            width={112}
            height={112}
            className="w-full h-full object-cover"
          />
        </div>
        {/* Spinning Japanese Neon Ring Highlights */}
        <div className="absolute -inset-3 rounded-[36px] border-2 border-sakura-400/60 dark:border-sakura-500/60 animate-spin" style={{ animationDuration: "3s" }} />
        <div className="absolute -inset-5 rounded-[44px] border border-amber-400/40 dark:border-amber-500/40 animate-spin" style={{ animationDuration: "6s", animationDirection: "reverse" }} />
      </div>

      {/* Brand Header */}
      <div className="text-center space-y-1 mb-6">
        <h2 className="font-black text-2xl tracking-tight bg-gradient-to-r from-sakura-600 via-rose-600 to-amber-500 bg-clip-text text-transparent">
          Nihon Quest
        </h2>
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
          日本 • Đang tải ứng dụng...
        </p>
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
