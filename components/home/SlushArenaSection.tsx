"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Trophy, Sparkles, QrCode } from "lucide-react";
import Sticker from "@/components/ui/Sticker";

export default function SlushArenaSection() {
  const topThree = [
    {
      rank: 1,
      name: "Naveen Thomas",
      dept: "CSE • 3rd Year",
      points: "2,840 PTS",
      badge: "Gemini Master 🥇",
      color: "bg-[#ffd731]", // Sunburst
    },
    {
      rank: 2,
      name: "Riya Elizabeth",
      dept: "IT • 4th Year",
      points: "2,610 PTS",
      badge: "Cloud Architect 🥈",
      color: "bg-[#ffffff]", // Paper White
    },
    {
      rank: 3,
      name: "Alen Joy",
      dept: "AI & DS • 2nd Year",
      points: "2,380 PTS",
      badge: "TensorFlow Ace 🥉",
      color: "bg-[#e9ccff]", // Lavender
    },
  ];

  return (
    <section className="relative w-full bg-[#cccccc] py-24 px-4 sm:px-8 overflow-hidden select-none border-b border-[#000000]">
      <div className="max-w-[1440px] mx-auto space-y-12">
        
        {/* SECTION HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sticker type="coin" label="MONTHLY ARENA" rotation={-3} size="sm" />
              <span className="text-xs font-bold uppercase tracking-[0.032em] text-[#000000]">// LIVE RANKINGS</span>
            </div>
            <h2 className="font-display text-[64px] sm:text-[100px] md:text-[130px] text-[#000000] uppercase leading-[0.78] m-0">
              ARENA STANDINGS
            </h2>
          </div>

          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-[40px] bg-[#000000] text-[#ffffff] hover:bg-black/85 font-bold uppercase tracking-[0.032em] text-xs border border-[#000000] transition self-start md:self-end"
          >
            <span>Full Standings</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
          </Link>
        </div>

        {/* CONTENT ROW: Top 3 Cards + QR Download Card */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* TOP 3 PODIUM CARDS (3 Columns) */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            {topThree.map((leader) => (
              <div
                key={leader.rank}
                className={`rounded-[30px] border border-[#000000] ${leader.color} p-6 sm:p-7 flex flex-col justify-between hover:-translate-y-1 transition-transform`}
              >
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-[#000000]">
                    <span className="px-3 py-1 rounded-[1600px] border border-[#000000] bg-[#000000] text-[#ffffff] text-xs font-bold font-mono">
                      RANK #{leader.rank}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wide">
                      {leader.badge}
                    </span>
                  </div>

                  <div className="pt-6">
                    <div className="w-14 h-14 rounded-[1600px] border border-[#000000] bg-[#000000] text-[#ffffff] font-display text-2xl flex items-center justify-center mb-4">
                      {leader.name.charAt(0)}
                    </div>
                    <h3 className="font-display text-3xl text-[#000000] uppercase leading-[0.85]">
                      {leader.name}
                    </h3>
                    <p className="text-xs font-bold text-gray-800 uppercase tracking-wide mt-1">
                      {leader.dept}
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-[#000000] flex items-center justify-between">
                  <span className="font-display text-2xl text-[#000000] leading-none">
                    {leader.points}
                  </span>
                  <span className="px-2.5 py-1 rounded-[1600px] border border-[#000000] bg-[#55db9c] text-xs font-bold uppercase">
                    Verified
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* QR DOWNLOAD CARD (Slush Specific Component: 20px radius, #5c4ade background, white QR panel, black hairline border) */}
          <div className="rounded-[20px] border border-[#000000] bg-[#5c4ade] p-5 flex flex-col justify-between text-[#ffffff]">
            <div>
              {/* White QR Code Panel with black hairline border */}
              <div className="w-full aspect-square bg-[#ffffff] rounded-[16px] border border-[#000000] flex flex-col items-center justify-center p-4 text-[#000000]">
                <QrCode className="w-28 h-28 stroke-[1.5]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.032em] mt-2 font-mono">
                  SCAN TO JOIN
                </span>
              </div>

              {/* Label Panel (#5c4ade with white text) */}
              <div className="pt-4 text-center">
                <p className="font-display text-2xl tracking-tight uppercase leading-[0.85]">
                  DOWNLOAD PASS
                </p>
                <p className="text-xs font-medium text-white/90 mt-1">
                  Access chapter events, attendance tickets, and earn verified credentials.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-white/30">
              <Link
                href="/programs"
                className="w-full py-2.5 rounded-[1600px] bg-[#ffffff] text-[#000000] font-bold uppercase tracking-[0.032em] text-xs border border-[#000000] flex items-center justify-center gap-2 hover:bg-[#e9e9e9] transition"
              >
                <span>Join Chapter</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
              </Link>
            </div>
          </div>

        </div>

        {/* ACTIVE SPRINT ANNOUNCEMENT STRIP (Outlined #ffffff card on concrete gray) */}
        <div className="rounded-[24px] border border-[#000000] bg-[#ffffff] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[1600px] border border-[#000000] bg-[#ffd731] flex items-center justify-center text-[#000000]">
              <Sparkles className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.032em] text-[#000000]">Active Monthly Hack Jam</p>
              <p className="text-sm font-medium text-[#000000]">Gemini 2.0 Multimodal Hack Sprint & Cloud Study Jam (Sept – Oct 2026)</p>
            </div>
          </div>
          <Link
            href="/programs"
            className="px-6 py-2.5 rounded-[1600px] bg-[#000000] text-[#ffffff] text-xs font-bold uppercase tracking-[0.032em] border border-[#000000] hover:bg-black/85 transition whitespace-nowrap"
          >
            Participate & Earn Points →
          </Link>
        </div>

      </div>
    </section>
  );
}
