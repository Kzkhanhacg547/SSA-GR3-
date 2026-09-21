import Link from "next/link";
import { Button, Card, Badge } from "@/components/ui";

export default function Home() {
  return (
    <div className="space-y-16 py-6 sm:py-10 max-w-6xl mx-auto">
      {/* Top Navbar Brand */}
      <header className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-3 font-black text-xl tracking-tight">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sakura-600 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-sakura-500/30">
            <span className="text-lg font-bold font-jp">日</span>
          </div>
          <div className="flex flex-col">
            <span className="leading-tight text-slate-900 dark:text-white font-black flex items-center gap-1.5 text-lg">
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
            <Button variant="sakura" size="sm" className="font-black shadow-md shadow-sakura-500/25">
              Tạo tài khoản 🌸
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sumi-900 via-[#1e1b4b] to-slate-950 p-8 sm:p-14 text-white border border-slate-800 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-sakura-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-48 h-48 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-5">
          <Badge variant="sakura" dot className="bg-sakura-500/20 text-sakura-300 border-sakura-500/30 text-xs font-black uppercase tracking-widest px-3 py-1">
            🇯🇵 KHÁM PHÁ TIẾNG NHẬT THEO CÁCH MỚI
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Học Tiếng Nhật. <br />
            <span className="bg-gradient-to-r from-sakura-400 via-rose-300 to-amber-300 bg-clip-text text-transparent">
              Khám Phá Nhật Bản.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
            Bạn không chỉ đơn thuần học ngoại ngữ. Bạn đang bắt đầu chuyến hành trình Shinkansen xuyên qua Tokyo, Kyoto, Osaka với bảng 50 âm Gojūon, canvas tập viết nét chữ, và các tình huống giao tiếp sinh tồn đời thực.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-3">
            <Link href="/register">
              <Button variant="gold" size="lg" className="text-slate-950 font-black shadow-lg shadow-amber-500/30 hover:scale-[1.02]">
                Bắt đầu hành trình miễn phí 🚀
              </Button>
            </Link>
            <Link href="/app">
              <Button variant="secondary" size="lg" className="bg-white/95 text-slate-900 font-bold hover:bg-white shadow-md">
                Vào Dashboard ứng dụng ⛩️
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-bold text-slate-400">
            <span className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> Bảng 50 âm Gojūon</span>
            <span className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> Canvas luyện viết nét</span>
            <span className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> Ôn tập lặp lại SRS SM-2</span>
            <span className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> Bản đồ Shinkansen</span>
          </div>
        </div>

        {/* Decorative Torii Background Motif */}
        <div className="absolute right-6 bottom-4 text-9xl sm:text-[180px] opacity-10 select-none pointer-events-none font-jp">
          ⛩️
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-sakura-600 dark:text-sakura-400">
            TÍNH NĂNG ĐỘT PHÁ
          </span>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Mọi Công Cụ Bạn Cần Để Làm Chủ Tiếng Nhật
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Từ bảng chữ cái cơ bản đến hội thoại đời thực, Nihon Quest đồng hành cùng bạn trên từng chặng đường.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Card hover className="p-6 space-y-3 border-2 border-slate-200/80 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-sakura-50 dark:bg-sakura-950/60 flex items-center justify-center text-2xl font-jp font-black text-sakura-600">
              あ
            </div>
            <h3 className="font-black text-lg text-slate-900 dark:text-white">
              Bảng 50 Âm & Canvas Viết Chữ
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Sắp xếp khoa học theo 5 nguyên âm a-i-u-e-o. Tích hợp Canvas HTML5 nhận diện nét vẽ giúp bạn rèn chữ viết Hiragana và Katakana chuẩn xác.
            </p>
          </Card>

          <Card hover className="p-6 space-y-3 border-2 border-slate-200/80 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-2xl text-indigo-600">
              🎴
            </div>
            <h3 className="font-black text-lg text-slate-900 dark:text-white">
              Flashcard Ôn Tập Lặp Lại (SRS)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Áp dụng thuật toán Spaced Repetition SM-2 phân bố thời gian ôn tập tối ưu (Again, Hard, Good, Easy), giúp kiến thức khắc sâu vào trí nhớ dài hạn.
            </p>
          </Card>

          <Card hover className="p-6 space-y-3 border-2 border-slate-200/80 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-2xl text-amber-600">
              🗾
            </div>
            <h3 className="font-black text-lg text-slate-900 dark:text-white">
              Japan Journey: Bản Đồ Khám Phá
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Chinh phục các chặng tàu từ Tokyo, Hakone, Kyoto, Osaka đến Hokkaido. Học tập tích lũy XP để mở khóa danh lam thắng cảnh và danh hiệu quý giá.
            </p>
          </Card>

          <Card hover className="p-6 space-y-3 border-2 border-slate-200/80 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-2xl text-rose-600">
              🍜
            </div>
            <h3 className="font-black text-lg text-slate-900 dark:text-white">
              Chế Độ Sinh Tồn Thực Chiến
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Nhập vai giải quyết các tình huống giao tiếp đời thực với người bản xứ: gọi mì Ramen tại quán, hỏi đường tại ga Shinjuku, hay tính tiền tại Konbini.
            </p>
          </Card>

          <Card hover className="p-6 space-y-3 border-2 border-slate-200/80 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-2xl font-jp font-black text-emerald-600">
              漢
            </div>
            <h3 className="font-black text-lg text-slate-900 dark:text-white">
              Kho Từ Vựng & Hán Tự JLPT N5
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Tra cứu đầy đủ âm On, âm Kun, số nét viết, ý nghĩa và ví dụ ngữ cảnh thực tế của hơn 100 chữ Hán và từ vựng cốt lõi.
            </p>
          </Card>

          <Card hover className="p-6 space-y-3 border-2 border-slate-200/80 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/60 flex items-center justify-center text-2xl text-orange-600">
              🔥
            </div>
            <h3 className="font-black text-lg text-slate-900 dark:text-white">
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
        <p>© 2026 Nihon Quest (日本クエスト). Đồng hành học tiếng Nhật & khám phá xứ sở hoa anh đào.</p>
        <div className="flex items-center gap-4 font-bold">
          <Link href="/login" className="hover:text-slate-900 dark:hover:text-white">Đăng nhập</Link>
          <Link href="/register" className="hover:text-slate-900 dark:hover:text-white">Đăng ký</Link>
          <Link href="/app" className="text-sakura-600 dark:text-sakura-400 hover:underline">Vào ứng dụng ➔</Link>
        </div>
      </footer>
    </div>
  );
}
