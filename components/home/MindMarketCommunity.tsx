"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Trophy, Award, Users, ArrowUpRight, Flame, Sparkles } from "lucide-react";
import GoogleLabsMemberCard from "@/components/cards/GoogleLabsMemberCard";
import { GDG_EXECOM_2026 } from "@/lib/data/TeamData";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Contributor {
  rank: number;
  name: string;
  dept: string;
  points: number;
  badge: string;
  dotColor: string;
  streak?: number;
}

const CURATED_CONTRIBUTORS: Contributor[] = [
  { rank: 1, name: "Rahul S.", dept: "CSE '26", points: 2840, badge: "Cloud Architect", dotColor: "#2563EB", streak: 18 },
  { rank: 2, name: "Ananya P.", dept: "AI & DS '26", points: 2590, badge: "Gemini Hero", dotColor: "#10B981", streak: 14 },
  { rank: 3, name: "Kevin M.", dept: "ECE '25", points: 2310, badge: "Flutter Lead", dotColor: "#F59E0B", streak: 11 },
  { rank: 4, name: "Devika R.", dept: "IT '26", points: 2150, badge: "Open Source Star", dotColor: "#EF4444", streak: 9 },
];

export default function MindMarketCommunity() {
  const [activeTab, setActiveTab] = useState<"xp" | "streaks" | "badges">("xp");
  const [cheers, setCheers] = useState<Record<string, number>>({});
  const [execomMembers, setExecomMembers] = useState<any[]>(GDG_EXECOM_2026.slice(0, 4));
  const [contributors, setContributors] = useState<Contributor[]>(CURATED_CONTRIBUTORS);

  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        // Fetch Execom Team
        const snap = await getDocs(collection(db, "coreProfiles"));
        if (!snap.empty) {
          const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          fetched.sort((a: any, b: any) => {
            const orderA = typeof a.sortOrder === "number" ? a.sortOrder : 9999;
            const orderB = typeof b.sortOrder === "number" ? b.sortOrder : 9999;
            return orderA - orderB;
          });
          if (fetched.length > 0) {
            setExecomMembers(fetched);
          }
        }
      } catch (err) {
        console.warn("Using default Execom team:", err);
      }

      try {
        // Fetch Chapter Leaderboard
        const q = query(collection(db, "leaderboard"), orderBy("points", "desc"), limit(4));
        const leadSnap = await getDocs(q);
        if (!leadSnap.empty) {
          const fetchedLead: Contributor[] = leadSnap.docs.map((d, idx) => {
            const data = d.data();
            return {
              rank: idx + 1,
              name: data.name || "Student Builder",
              dept: data.department || "AJCE '26",
              points: Number(data.points) || 1000,
              badge: Array.isArray(data.badges) && data.badges.length > 0 ? data.badges[0] : "Active Innovator",
              dotColor: idx === 0 ? "#2563EB" : idx === 1 ? "#10B981" : idx === 2 ? "#F59E0B" : "#EF4444",
              streak: Number(data.streakDays) || 7,
            };
          });
          if (fetchedLead.length > 0) {
            setContributors(fetchedLead);
          }
        }
      } catch (err) {
        console.warn("Using curated contributors:", err);
      }
    };

    fetchCommunityData();
  }, []);

  const handleCheer = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      confetti({
        particleCount: 25,
        spread: 50,
        origin: { x, y },
        colors: ["#2563EB", "#EF4444", "#F59E0B", "#10B981"],
        disableForReducedMotion: true,
      });
    } catch {
      // fallback
    }

    setCheers((prev) => ({
      ...prev,
      [name]: (prev[name] || 0) + 1,
    }));
  };

  return (
    <section className="relative w-full bg-transparent py-20 px-4 sm:px-6 select-none">
      <div className="max-w-[1200px] mx-auto space-y-16">
        
        {/* SECTION HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.75, ease: [0.38, 0.005, 0.215, 1.0] }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4"
        >
          <div className="space-y-2">
            <h2 className="text-[42px] sm:text-[60px] md:text-[72px] font-bold tracking-[-0.04em] text-[#0f172a] leading-[1.05]">
              Real Builders. Real Code.
            </h2>
          </div>
          <p className="text-[17px] font-normal text-slate-600 max-w-md leading-relaxed">
            Our campus community ranks among the most active developer chapters in Kerala. Earn badges, build portfolio solutions, and celebrate peer milestones.
          </p>
        </motion.div>

        {/* 2-COLUMN SPLIT: Leaderboard (Left) + Credential & Solution Challenge (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: ARENA LEADERBOARD CARD */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, ease: [0.38, 0.005, 0.215, 1.0] }}
            className="lg:col-span-7 rounded-[40px] bg-white border border-slate-200 p-6 sm:p-8 lg:p-10 flex flex-col justify-between shadow-sm"
          >
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-[26px] sm:text-[34px] font-bold text-[#0f172a] tracking-[-0.03em]">
                    Chapter Leaderboard
                  </h3>
                </div>

                {/* Interactive Highlights Pill Selector */}
                <div className="flex items-center bg-slate-100 p-1 rounded-[50px] border border-slate-200 self-start sm:self-auto overflow-x-auto no-scrollbar shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveTab("xp")}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                      activeTab === "xp" ? "bg-white text-[#0f172a] shadow-xs" : "text-slate-500 hover:text-[#0f172a]"
                    }`}
                  >
                    Top XP ⚡
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("streaks")}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                      activeTab === "streaks" ? "bg-white text-[#0f172a] shadow-xs" : "text-slate-500 hover:text-[#0f172a]"
                    }`}
                  >
                    Streaks 🔥
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("badges")}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                      activeTab === "badges" ? "bg-white text-[#0f172a] shadow-xs" : "text-slate-500 hover:text-[#0f172a]"
                    }`}
                  >
                    Badges 🎖️
                  </button>
                </div>
              </div>

              {/* Contributor List with Interactive Cheer */}
              <div className="space-y-3 pt-2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3"
                  >
                    {contributors.map((c) => (
                      <div
                        key={c.name}
                        className="flex items-center justify-between p-4 rounded-[24px] bg-slate-50/80 hover:bg-slate-100/90 border border-slate-200/60 transition-colors group"
                      >
                        <div className="flex items-center gap-4">
                          <span className="w-8 h-8 rounded-full bg-white text-[#0f172a] font-mono text-xs font-bold flex items-center justify-center border border-slate-200 shadow-2xs">
                            0{c.rank}
                          </span>
                          <div>
                            <h4 className="text-[16px] font-bold text-[#0f172a] group-hover:text-[#2563EB] transition">
                              {c.name}
                            </h4>
                            <span className="text-xs text-slate-500 font-medium">
                              {c.dept} • {activeTab === "streaks" ? `${c.streak} Day Streak 🔥` : c.badge}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-bold text-[#0f172a]">
                            {c.points} pts
                          </span>

                          {/* Interactive High-Five Cheer Button */}
                          <button
                            type="button"
                            onClick={(e) => handleCheer(c.name, e)}
                            className="px-2.5 py-1 rounded-full bg-white hover:bg-[#10B981] hover:text-white border border-slate-200 text-[11px] font-semibold text-[#0f172a] transition active:scale-95 cursor-pointer shadow-xs"
                            title="Cheer this student!"
                          >
                            👏 {cheers[c.name] || 0}
                          </button>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Bottom Card Action */}
            <div className="pt-8 mt-8 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <Link
                href="/leaderboard"
                className="group inline-flex items-center gap-2 px-6 py-2.5 rounded-[50px] bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-[#0f172a] text-[15px] font-bold transition-all duration-300 hover:-translate-y-[1px] active:scale-95 shadow-2xs"
              >
                <span>View Full Standings & Simulator</span>
                <span className="w-2 h-2 rounded-full bg-[#10B981] action-dot-expand" />
              </Link>
              <span className="text-xs font-mono text-slate-400 font-semibold">
                Live Sync via Firestore
              </span>
            </div>
          </motion.div>

          {/* RIGHT: CREDENTIALS & SOLUTION CHALLENGE CARDS */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            
            {/* CARD 1: VERIFIED SKILL BADGES */}
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.38, 0.005, 0.215, 1.0] }}
              className="rounded-[40px] bg-white border border-slate-200 p-6 sm:p-8 flex flex-col justify-between flex-1 shadow-sm"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-[50px] bg-slate-100 text-xs font-semibold text-[#0f172a]">
                    <Award className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Skill Verification</span>
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
                </div>

                <h3 className="text-[24px] sm:text-[28px] font-bold text-[#0f172a] tracking-[-0.03em] leading-snug">
                  Official Google Skill Badges
                </h3>
                <p className="text-[15px] text-slate-600 leading-relaxed font-normal">
                  Earn verifiable, shareable Google Cloud & AI credentials directly credited to your Google Developer Profile.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-[20px] bg-slate-50 border border-slate-200/80">
                    <div className="text-[22px] font-bold text-[#0f172a]">120+</div>
                    <div className="text-xs text-slate-500 font-medium">Cloud Badges Issued</div>
                  </div>
                  <div className="p-3.5 rounded-[20px] bg-slate-50 border border-slate-200/80">
                    <div className="text-[22px] font-bold text-[#0f172a]">98%</div>
                    <div className="text-xs text-slate-500 font-medium">Lab Completion Rate</div>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href="/programs"
                  className="inline-flex items-center gap-2 text-[15px] font-bold text-[#0f172a] pb-0.5 border-b border-slate-300 hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
                >
                  <span>Explore Study Jams</span>
                  <ArrowUpRight className="w-4 h-4 text-slate-400" />
                </Link>
              </div>
            </motion.div>

            {/* CARD 2: GOOGLE SOLUTION CHALLENGE */}
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.38, 0.005, 0.215, 1.0] }}
              className="rounded-[40px] bg-white border border-slate-200 p-6 sm:p-8 flex flex-col justify-between flex-1 shadow-sm"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-[50px] bg-slate-100 text-xs font-semibold text-[#0f172a]">
                    <Users className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Global Competition</span>
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                </div>

                <h3 className="text-[24px] sm:text-[28px] font-bold text-[#0f172a] tracking-[-0.03em] leading-snug">
                  UN Solution Challenge 2026
                </h3>
                <p className="text-[15px] text-slate-600 leading-relaxed font-normal">
                  Join cross-department teams solving one of the 17 UN Sustainable Development Goals using Google Cloud, Flutter, and Vertex AI.
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href="/programs"
                  className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-[50px] bg-[#EF4444] hover:bg-[#DC2626] text-white text-[14px] font-bold transition-all duration-300 hover:-translate-y-[1px] active:scale-95 shadow-md shadow-red-500/20"
                >
                  <span>Submit Your Team</span>
                  <span className="w-2 h-2 rounded-full bg-white action-dot-expand" />
                </Link>
                <span className="text-xs font-mono text-slate-400 font-semibold">
                  Amal Jyothi Chapter
                </span>
              </div>
            </motion.div>

          </div>
        </div>

        {/* 3. EXECOM LEADERSHIP SHOWCASE */}
        <div className="pt-12 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
            <div>
              <h2 className="text-[36px] sm:text-[50px] md:text-[60px] font-bold tracking-[-0.04em] text-[#0f172a] leading-[1.08]">
                Meet the Execom
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-[15px] font-normal text-slate-600 max-w-xs leading-relaxed hidden sm:block">
                The organizers, track leads, and student innovators driving community initiatives.
              </p>
              <Link
                href="/about#execom"
                className="group inline-flex items-center gap-2 px-6 py-2.5 rounded-[50px] bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-[#0f172a] text-[15px] font-bold transition-all duration-300 hover:-translate-y-[1px] active:scale-95 shadow-2xs"
              >
                <span>All {execomMembers.length} Leads</span>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#0f172a] transition-colors" />
              </Link>
            </div>
          </div>

          {/* 4 Featured Google Labs Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {execomMembers.slice(0, 4).map((member, idx) => (
              <GoogleLabsMemberCard
                key={member.username || member.name || idx}
                member={member}
                index={idx}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
