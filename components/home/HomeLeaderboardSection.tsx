"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Trophy, Flame, ArrowRight, Sparkles, Award } from "lucide-react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function HomeLeaderboardSection() {
  const [topThree, setTopThree] = useState<any[]>([]);

  useEffect(() => {
    const fetchTopThree = async () => {
      try {
        const q = query(collection(db, "leaderboard"), orderBy("points", "desc"), limit(3));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const colors = [
            { color: "#FBBC04", bg: "from-[#FBBC04]/20 to-transparent", border: "border-[#FBBC04]/40" },
            { color: "#EA4335", bg: "from-[#EA4335]/20 to-transparent", border: "border-[#EA4335]/40" },
            { color: "#4285F4", bg: "from-[#4285F4]/20 to-transparent", border: "border-[#4285F4]/40" }
          ];
          const fetched = snapshot.docs.map((d, index) => {
            const data = d.data();
            return {
              rank: index + 1,
              name: data.name || "GDG Hacker",
              dept: data.department || "Student",
              points: (Number(data.points) || 0).toLocaleString(),
              badge: data.badges && data.badges.length > 0 ? data.badges[0] : "Rising Star",
              ...(colors[index] || colors[0])
            };
          });
          setTopThree(fetched);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchTopThree();
  }, []);

  return (
    <section className="relative py-24 px-6 sm:px-8 border-t border-[#DEDACB] overflow-hidden bg-[#F3F0E6]">
      {/* Soft GDG Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#4285F4]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FAF8F2] border border-[#DEDACB] text-xs font-medium text-gray-800 shadow-xs">
              <Trophy className="w-3.5 h-3.5 text-[#FBBC04]" />
              <span>MONTHLY & SEASONAL ARENA</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
              Competition Leaderboard
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Every month, students across departments tackle Google developer challenges, Gemini AI sprints, and Cloud Study Jams. Here are our current season pacesetters.
            </p>
          </div>

          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4285F4] hover:bg-[#1A73E8] text-white font-medium text-xs sm:text-sm shadow-sm hover:shadow-md transition-all shrink-0 group"
          >
            <span>View Full Leaderboard</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Live Top 3 Cards (M3 Elevated Cards with #FAF8F2 surface) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topThree.map((leader) => (
            <div
              key={leader.rank}
              className={`relative bg-[#FAF8F2] border border-[#DEDACB] hover:border-[#4285F4]/60 rounded-2xl p-6 overflow-hidden transition-all duration-300 hover:shadow-md shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)] group`}
            >
              <div className={`absolute top-0 left-0 right-0 h-28 bg-gradient-to-b ${leader.bg} pointer-events-none`} />

              <div className="flex items-start justify-between relative z-10 mb-6">
                <span 
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                  style={{
                    backgroundColor: `${leader.color}18`,
                    color: leader.color,
                    border: `1px solid ${leader.color}40`
                  }}
                >
                  Rank #{leader.rank}
                </span>

                <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-[#EAE7DC] border border-[#DEDACB] text-gray-800">
                  {leader.badge}
                </span>
              </div>

              <div className="flex items-center gap-4 relative z-10 mb-6">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl text-white shadow-sm"
                  style={{ backgroundColor: leader.color }}
                >
                  {leader.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-900 group-hover:text-[#1A73E8] transition">
                    {leader.name}
                  </h4>
                  <p className="text-xs text-gray-600">{leader.dept}</p>
                </div>
              </div>

              <div className="relative z-10 pt-4 border-t border-[#DEDACB]/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-600 uppercase tracking-wider block font-medium">Total Season Points</span>
                  <span className="text-xl font-bold text-gray-900">{leader.points}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-600 uppercase tracking-wider block font-medium">Status</span>
                  <span className="text-xs font-semibold text-[#137333] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#34A853]" />
                    Verified
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Competition Banner (M3 Elevated Card) */}
        <div className="mt-8 bg-[#FAF8F2] border border-[#DEDACB] rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#FBBC04]/20 border border-[#FBBC04]/40 flex items-center justify-center text-[#8F6B00] shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Active Monthly Challenge</p>
              <p className="text-xs text-gray-600">Gemini 2.0 Multimodal Hack Sprint & Cloud Study Jam (Sept - Oct 2026)</p>
            </div>
          </div>
          <Link
            href="/programs"
            className="px-4 py-2 rounded-xl bg-[#FAF8F2] hover:bg-[#EAE7DC] border border-[#DEDACB] text-xs font-medium text-gray-800 transition whitespace-nowrap shadow-xs"
          >
            Participate & Earn Points →
          </Link>
        </div>
      </div>
    </section>
  );
}
