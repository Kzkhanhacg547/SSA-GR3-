import Link from "next/link";
import { Button, Card, Badge } from "@/components/ui";

export default function Home() {
  return (
    <div className="space-y-16 py-6 sm:py-10">
      {/* Top Navbar Brand */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 font-black text-xl tracking-tight">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sakura-600 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-sakura-500/30">
            <span className="text-lg font-bold">日</span>
          </div>
          <div className="flex flex-col">
            <span className="leading-tight text-slate-900 dark:text-white font-black flex items-center gap-1.5">
              Nihon Quest <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sakura-100 dark:bg-sakura-950 text-sakura-600 dark:text-sakura-300">Quest</span>
            </span>
            <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">Learn Japanese · Explore Japan</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="font-bold">
              Đăng nhập
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="sakura" size="sm" className="font-bold">
              Tạo tài khoản 🌸
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sakura-600 via-rose-600 to-sumi-950 p-8 sm:p-14 text-white shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-5">
          <Badge variant="sakura" className="bg-white/20 text-white border-white/30 text-xs font-black uppercase tracking-widest px-3 py-1">
            🇯🇵 KHÁM PHÁ TIẾNG NHẬT THEO CÁCH MỚI
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Học Tiếng Nhật. <br />
            <span className="text-amber-300 underline decoration-sakura-400">Khám Phá Nhật Bản.</span>
          </h1>
          <p className="text-base sm:text-lg text-rose-100 opacity-95 leading-relaxed">
            Bạn không chỉ đơn thuần học ngoại ngữ. Bạn đang bắt đầu chuyến hành trình Shinkansen xuyên qua Tokyo, Kyoto, Osaka với bảng 50 âm Gojūon, canvas tập viết nét chữ, và các tình huống giao tiếp sinh tồn đời thực.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link href="/register">
              <Button variant="gold" size="lg" className="text-sumi-950 font-black shadow-lg shadow-amber-500/30">
                Bắt đầu hành trình miễn phí 🚀
              </Button>
            </Link>
            <Link href="/app">
              <Button variant="secondary" size="lg" className="bg-white/90 text-sumi-950 font-bold hover:bg-white">
                Vào Dashboard ứng dụng ⛩️
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-6 pt-4 text-xs font-bold text-rose-200">
            <span>✓ Chuẩn bảng 50 âm Gojūon</span>
            <span>✓ Canvas vẽ nét chữ</span>
            <span>✓ Spaced Repetition SRS</span>
          </div>
        </div>

        {/* Decorative Torii Background Motif */}
        <div className="absolute right-4 bottom-4 text-9xl sm:text-[180px] opacity-10 select-none pointer-events-none font-jp">
          ⛩️
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-sakura-600 dark:text-sakura-400">
            TÍNH NĂNG ĐỘT PHÁ
          </span>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">
            Mọi Công Cụ Bạn Cần Để Làm Chủ Tiếng Nhật
          </h2>
          <p className="text-sm text-slate-500">
            Từ bảng chữ cái cơ bản đến hội thoại đời thực, Nihon Quest đồng hành cùng bạn trên từng chặng đường.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Card hover className="p-6 space-y-3 border-2 border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-sakura-50 dark:bg-sakura-950/60 flex items-center justify-center text-2xl text-sakura-600">
              あ
            </div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
              Bảng 50 Âm Gojūon & Canvas Viết Chữ
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Sắp xếp khoa học theo 5 nguyên âm a-i-u-e-o. Tích hợp Canvas HTML5 nhận diện nét vẽ giúp bạn rèn chữ viết Hiragana và Katakana chuẩn xác.
            </p>
          </Card>

          <Card hover className="p-6 space-y-3 border-2 border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-fuji-50 dark:bg-indigo-950/60 flex items-center justify-center text-2xl text-fuji-600">
              🎴
            </div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
              Flashcard Ôn Tập Lặp Lại (SRS)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Áp dụng thuật toán Spaced Repetition SM-2 phân bố thời gian ôn tập tối ưu (Again, Hard, Good, Easy), giúp kiến thức khắc sâu vào trí nhớ dài hạn.
            </p>
          </Card>

          <Card hover className="p-6 space-y-3 border-2 border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-2xl text-amber-600">
              🗾
            </div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
              Japan Journey: Bản Đồ Khám Phá
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Chinh phục các chặng tàu từ Tokyo, Hakone, Kyoto, Osaka đến Hokkaido. Học tập tích lũy XP để mở khóa danh lam thắng cảnh và danh hiệu quý giá.
            </p>
          </Card>

          <Card hover className="p-6 space-y-3 border-2 border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-torii-50 dark:bg-red-950/60 flex items-center justify-center text-2xl text-torii-600">
              🍜
            </div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
              Chế Độ Sinh Tồn Thực Chiến
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Nhập vai giải quyết các tình huống giao tiếp đời thực với người bản xứ: gọi mì Ramen tại quán, hỏi đường tại ga Shinjuku, hay tính tiền tại Konbini.
            </p>
          </Card>

          <Card hover className="p-6 space-y-3 border-2 border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-2xl text-emerald-600">
              漢
            </div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
              Kho Từ Vựng & Hán Tự JLPT N5
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Tra cứu đầy đủ âm On, âm Kun, số nét viết, ý nghĩa và ví dụ ngữ cảnh thực tế của hơn 100 chữ Hán và từ vựng cốt lõi.
            </p>
          </Card>

          <Card hover className="p-6 space-y-3 border-2 border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-2xl text-indigo-600">
              🔥
            </div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
              Gamification: Streak & Daily Quests
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Duy trì thói quen học tập hàng ngày với chuỗi ngọn lửa Streak, hệ thống nhiệm vụ hàng ngày và thăng cấp nhân vật qua bảng xếp hạng.
            </p>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 pt-8 pb-4 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>© 2026 Nihon Quest (日本クエスト). Xây dựng theo tiêu chuẩn Master Prompt.</p>
        <div className="flex items-center gap-4">
          <Link href="/login" className="hover:text-slate-900 dark:hover:text-white">Đăng nhập</Link>
          <Link href="/register" className="hover:text-slate-900 dark:hover:text-white">Đăng ký</Link>
          <Link href="/app" className="text-sakura-600 font-bold">Vào ứng dụng ➔</Link>
        </div>
      </footer>
    </div>
  );
}
