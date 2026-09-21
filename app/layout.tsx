import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Noto_Sans_JP } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jp = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-jp",
  display: "swap",
  weight: ["400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "Nihon Quest — Learn Japanese. Explore Japan.",
  description: "Real Japanese learning adventure combining gamification, spaced repetition, stroke writing, and cultural exploration.",
  keywords: ["learn japanese", "hiragana", "katakana", "kanji", "jlpt", "spaced repetition", "nihon quest"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${jp.variable}`}>
      <body className="min-h-screen font-sans bg-slate-50 text-slate-900 dark:bg-sumi-950 dark:text-slate-100 selection:bg-sakura-500 selection:text-white pb-20 md:pb-8">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-sakura-600 focus:text-white focus:z-50 rounded-lg">
          Skip to content
        </a>
        <Providers>
          <div className="min-h-screen bg-seigaiha">
            <main id="main" className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-8 sm:py-8">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
