"use client";

import { useState } from "react";
import { Card, Badge, Button } from "@/components/ui";

interface LeaderboardUser {
  id: string;
  name: string | null;
  displayName: string | null;
  avatar: string | null;
  xp: number;
  level: number;
  currentStreak: number;
}

const RANK_ICONS = ["🥇", "🥈", "🥉"];
const TIER_COLORS = [
  { min: 0, max: 100, name: "Mới Bắt Đầu", color: "from-slate-400 to-slate-600", badge: "⭐" },
  { min: 100, max: 500, name: "Học Viên", color: "from-amber-400 to-amber-600", badge: "🎌" },
  { min: 500, max: 1500, name: "Lữ Hành", color: "from-emerald-400 to-emerald-600", badge: "🗾" },
  { min: 1500, max: 5000, name: "Samurai", color: "from-fuji-400 to-fuji-700", badge: "⚔️" },
  { min: 5000, max: Infinity, name: "Đại Sư", color: "from-sakura-400 to-rose-600", badge: "👑" },
];

function getTier(xp: number) {
  return TIER_COLORS.findLast((t) => xp >= t.min) ?? TIER_COLORS[0];
}

export function LeaderboardClient({
  currentUserId,
  weeklyUsers,
  allTimeUsers,
}: {
  currentUserId: string;
  weeklyUsers: LeaderboardUser[];
  allTimeUsers: LeaderboardUser[];
}) {
  const [tab, setTab] = useState<"WEEKLY" | "ALL_TIME">("WEEKLY");

  const users = tab === "WEEKLY" ? weeklyUsers : allTimeUsers;
  const currentUser = users.find((u) => u.id === currentUserId);
  const currentUserRank = users.findIndex((u) => u.id === currentUserId) + 1;

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-sumi-900 border border-slate-200 dark:border-slate-800 max-w-sm mx-auto">
        <button
          onClick={() => setTab("WEEKLY")}
          className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
            tab === "WEEKLY"
              ? "bg-white dark:bg-sumi-800 text-sakura-600 dark:text-sakura-400 shadow-sm"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          🔥 Tuần Này (Weekly League)
        </button>
        <button
          onClick={() => setTab("ALL_TIME")}
          className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
            tab === "ALL_TIME"
              ? "bg-white dark:bg-sumi-800 text-sakura-600 dark:text-sakura-400 shadow-sm"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          👑 Mọi Lúc (All-Time)
        </button>
      </div>

      {/* Current User Position Banner */}
      {currentUser && (
        <Card className="p-4 bg-gradient-to-r from-sakura-50 via-rose-50 to-amber-50 dark:from-sumi-900 dark:to-sumi-950 border-2 border-sakura-200 dark:border-sakura-900 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getTier(currentUser.xp).color} flex items-center justify-center text-2xl shadow-lg`}>
                {getTier(currentUser.xp).badge}
              </div>
              <div className="absolute -top-1 -right-1 bg-sakura-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                #{currentUserRank}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Vị trí của bạn {tab === "WEEKLY" ? "trong tuần" : "toàn thời gian"}
              </p>
              <p className="font-black text-slate-900 dark:text-white text-base sm:text-lg">
                {currentUser.displayName || currentUser.name || "Bạn"}{" "}
                <span className="text-sakura-600 dark:text-sakura-400">#{currentUserRank}</span>
              </p>
              <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                <span>⚡ {currentUser.xp.toLocaleString()} XP</span>
                <span>🎯 Lv.{currentUser.level}</span>
                <span>🔥 {currentUser.currentStreak} ngày</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Leaderboard Table List */}
      <div className="space-y-2.5">
        {users.map((user, idx) => {
          const rank = idx + 1;
          const isMe = user.id === currentUserId;
          const tier = getTier(user.xp);
          const displayName = user.displayName || user.name || "Học Viên Ẩn Danh";

          return (
            <Card
              key={user.id}
              className={`p-3.5 transition-all ${
                isMe
                  ? "border-sakura-400 dark:border-sakura-800 bg-sakura-50/50 dark:bg-sakura-950/20 shadow-sm"
                  : rank <= 3
                  ? "border-amber-200 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/10"
                  : "border-slate-200 dark:border-slate-800"
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Rank number or medal */}
                <div className="w-8 text-center shrink-0">
                  {rank <= 3 ? (
                    <span className="text-xl">{RANK_ICONS[rank - 1]}</span>
                  ) : (
                    <span className="text-sm font-black text-slate-400">#{rank}</span>
                  )}
                </div>

                {/* Avatar / Badge */}
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center text-lg shadow-sm shrink-0`}
                >
                  {user.avatar || tier.badge}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-black text-sm truncate ${isMe ? "text-sakura-600 dark:text-sakura-400" : "text-slate-900 dark:text-white"}`}>
                      {displayName}
                      {isMe && " (Bạn)"}
                    </span>
                    <Badge variant={rank <= 3 ? "amber" : "slate"} className="text-[10px] shrink-0">
                      {tier.name}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                    <span>🎯 Lv.{user.level}</span>
                    <span>🔥 {user.currentStreak}d</span>
                  </div>
                </div>

                {/* XP earned */}
                <div className="text-right shrink-0">
                  <div className="font-black text-sm text-amber-600 dark:text-amber-400">
                    ⚡ {user.xp.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {tab === "WEEKLY" ? "XP tuần" : "XP"}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}

        {users.length === 0 && (
          <Card className="p-8 text-center border-dashed border-2 border-slate-200 dark:border-slate-800">
            <p className="text-4xl mb-2">🏆</p>
            <p className="font-black text-slate-700 dark:text-slate-200">Chưa có hoạt động trong tuần này!</p>
            <p className="text-xs text-slate-500 mt-1">Hãy hoàn thành một bài học hoặc ôn tập để dẫn đầu bảng xếp hạng！🌸</p>
          </Card>
        )}
      </div>
    </div>
  );
}
