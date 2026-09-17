"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { 
  Trophy, 
  Flame, 
  Search, 
  ChevronDown, 
  Sparkles, 
  Award, 
  Zap, 
  LayoutGrid, 
  ListFilter, 
  X, 
  CheckCircle2, 
  Share2,
  TrendingUp,
  Sliders,
  ExternalLink
} from "lucide-react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import CreativeProfileAvatar from "@/components/ui/CreativeProfileAvatar";
import { 
  YellowHexagon, 
  BlueWavyRosette, 
  OrangeClover, 
  DaisyStarburst, 
  LimeClover 
} from "@/components/shapes/GoogleLabsShapes";

export interface LeaderboardEntry {
  id: string;
  rank?: number;
  name: string;
  department: string;
  year?: string;
  avatar?: string;
  points: number;
  challengesSolved: number;
  category: "AI & ML" | "Cloud" | "Mobile & Web" | "Open Source";
  season: string;
  badges: string[];
  streakDays?: number;
  bio?: string;
}

const DEFAULT_LEADERBOARD_DATA: LeaderboardEntry[] = [];

const SEASONS = ["Season 2026", "Autumn 2025", "Spring 2025", "All Time"];
const CATEGORIES = ["All Tracks", "AI & ML", "Cloud", "Mobile & Web", "Open Source"];

// Fire celebratory Google-colored confetti
const launchConfetti = (originX = 0.5, originY = 0.5) => {
  try {
    confetti({
      particleCount: 65,
      spread: 70,
      origin: { x: originX, y: originY },
      colors: ["#4285F4", "#EA4335", "#FBBC04", "#34A853", "#ff705d", "#8ed462", "#2ba0ff"],
      disableForReducedMotion: true,
    });
  } catch {
    // Fallback if canvas is unavailable
  }
};

export default function LeaderboardTable() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [selectedSeason, setSelectedSeason] = useState("Season 2026");
  const [selectedCategory, setSelectedCategory] = useState("All Tracks");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"points" | "solved" | "streak">("points");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  
  // Interactive State: Competitor Modal & Cheers
  const [selectedCompetitor, setSelectedCompetitor] = useState<LeaderboardEntry | null>(null);
  const [cheers, setCheers] = useState<Record<string, number>>({
    "lead-1": 48,
    "lead-2": 39,
    "lead-3": 31,
    "lead-4": 25,
    "lead-5": 19,
    "lead-6": 16,
    "lead-7": 14,
    "lead-8": 11,
  });
  const [floatingCheer, setFloatingCheer] = useState<string | null>(null);

  // Interactive Simulator State
  const [simCodelabs, setSimCodelabs] = useState(6);
  const [simHackathons, setSimHackathons] = useState(2);
  const [simStudyJams, setSimStudyJams] = useState(3);
  const [simStreak, setSimStreak] = useState(7);
  const [showSimulator, setShowSimulator] = useState(false);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const q = query(collection(db, "leaderboard"), orderBy("points", "desc"), limit(50));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const fetched: LeaderboardEntry[] = snapshot.docs.map((d, index) => {
            const data = d.data();
            return {
              id: d.id,
              rank: index + 1,
              name: data.name || "GDG Hacker",
              department: data.department || "AJCE Student",
              year: data.year || "",
              avatar: data.avatar || data.photoURL || null,
              points: Number(data.points) || 0,
              challengesSolved: Number(data.challengesSolved) || 0,
              category: data.category || "AI & ML",
              season: data.season || "Season 2026",
              badges: Array.isArray(data.badges) ? data.badges : [],
              streakDays: Number(data.streakDays) || 1,
              bio: data.bio || undefined,
            };
          });
          setEntries(fetched);
        }
      } catch (err) {
        // Retain DEFAULT_LEADERBOARD_DATA on offline/placeholder mode
      }
    };

    fetchLeaderboard();
  }, []);

  const handleCheer = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      launchConfetti(x, y);
    } else {
      launchConfetti();
    }

    setCheers((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));

    setFloatingCheer(id);
    setTimeout(() => {
      setFloatingCheer(null);
    }, 900);
  };

  // Filter and Sort Entries
  const filteredEntries = entries
    .filter((item) => {
      const matchesSeason = selectedSeason === "All Time" || item.season === selectedSeason;
      const matchesCategory = selectedCategory === "All Tracks" || item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.badges.some((b) => b.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSeason && matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "points") return b.points - a.points;
      if (sortBy === "solved") return b.challengesSolved - a.challengesSolved;
      if (sortBy === "streak") return (b.streakDays || 0) - (a.streakDays || 0);
      return 0;
    });

  const topThree = filteredEntries.slice(0, 3);

  // Dynamic Simulator Calculation
  const simulatedXP = simCodelabs * 50 + simHackathons * 250 + simStudyJams * 120 + simStreak * 15;
  const simulatedRank =
    simulatedXP >= 2800
      ? "Rank #1 Contender 🥇"
      : simulatedXP >= 2200
      ? "Top 3 Podium Contender 🥈"
      : simulatedXP >= 1500
      ? "Top 10 Chapter Finisher 🏆"
      : "Active Rising Innovator 🚀";

  return (
    <div className="space-y-12 select-none">
      
      {/* 1. TOP PODIUM SHOWCASE (3D-Style Layered Pedestals with Cheering & Confetti) */}
      {topThree.length > 0 && (
        <div className="relative">
          {/* Header Title with Organic Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#ffffff] border border-[#d5d5d4] flex items-center justify-center">
                <Trophy className="w-4 h-4 text-[#ffd600]" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-semibold tracking-[-0.03em] text-[#2c2e2a]">
                  Podium of Champions
                </h3>
                <p className="text-xs text-[#80827f]">
                  Sprint leaders eligible for exclusive Google Swag Kits and verified credentials
                </p>
              </div>
            </div>

            {/* Quick Celebrate All Button */}
            <button
              onClick={() => {
                launchConfetti(0.5, 0.35);
              }}
              className="self-start sm:self-auto group inline-flex items-center gap-2 px-4 py-2 rounded-[50px] bg-[#ffffff] hover:bg-[#f5f1e4] border border-[#d5d5d4] text-xs font-medium text-[#2c2e2a] transition active:scale-95 shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#ffd600]" />
              <span>Shower Confetti</span>
              <span className="w-2 h-2 rounded-full bg-[#8ed462] action-dot-expand" />
            </button>
          </div>

          {/* Stepped Pedestals (Order: 2nd on Left, 1st in Center elevated, 3rd on Right) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            
            {/* 2nd Place: Silver / Coral Pop */}
            {topThree[1] && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                whileHover={{ y: -6 }}
                onClick={() => setSelectedCompetitor(topThree[1])}
                className="group relative bg-[#ffffff] border border-[#d5d5d4] hover:border-[#ff705d] rounded-[36px] p-6 sm:p-7 flex flex-col items-center text-center cursor-pointer transition-all duration-300 shadow-xs"
              >
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 rounded-[50px] bg-[#f5f1e4] border border-[#d5d5d4] text-[11px] font-mono font-bold text-[#ff705d]">
                    #2 SILVER
                  </span>
                </div>

                <div className="relative mt-3 mb-4 group-hover:scale-105 transition">
                  <CreativeProfileAvatar
                    src={topThree[1].avatar}
                    name={topThree[1].name}
                    seed={topThree[1].id || topThree[1].name}
                    size="custom"
                    className="w-18 h-18 sm:w-20 sm:h-20 border-2 border-[#ff705d] shadow-xs"
                  />
                  <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#ffffff] border border-[#d5d5d4] text-xs flex items-center justify-center shadow-xs">
                    🥈
                  </span>
                </div>

                <h4 className="text-lg font-bold text-[#2c2e2a] group-hover:text-[#ff705d] transition">
                  {topThree[1].name}
                </h4>
                <p className="text-xs text-[#80827f] mt-0.5">{topThree[1].department}</p>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[50px] bg-[#f5f1e4] text-[11px] font-medium text-[#2c2e2a] mt-3">
                  <Flame className="w-3 h-3 text-[#ff705d]" />
                  <span>{topThree[1].streakDays} Day Streak</span>
                </div>

                {/* Stat Badges */}
                <div className="grid grid-cols-2 gap-3 w-full mt-6 pt-5 border-t border-[#f5f1e4]">
                  <div className="p-2.5 rounded-2xl bg-[#f5f1e4]/70">
                    <span className="text-[10px] font-mono uppercase text-[#80827f] block">Points</span>
                    <span className="text-lg font-extrabold text-[#2c2e2a]">
                      {topThree[1].points.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-[#f5f1e4]/70">
                    <span className="text-[10px] font-mono uppercase text-[#80827f] block">Solved</span>
                    <span className="text-lg font-extrabold text-[#2c2e2a]">
                      {topThree[1].challengesSolved}
                    </span>
                  </div>
                </div>

                {/* Cheer High-Five Button */}
                <button
                  type="button"
                  onClick={(e) => handleCheer(topThree[1].id, e)}
                  className="mt-5 w-full py-2.5 px-4 rounded-[50px] bg-[#f5f1e4] hover:bg-[#ff705d] text-[#2c2e2a] hover:text-white border border-[#d5d5d4] hover:border-transparent text-xs font-semibold flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer relative"
                >
                  <span>👏 Cheer ({cheers[topThree[1].id] || 0})</span>
                  {floatingCheer === topThree[1].id && (
                    <span className="absolute -top-7 text-xs font-bold text-[#ff705d] animate-bounce">
                      +1 Cheer! 🎉
                    </span>
                  )}
                </button>
              </motion.div>
            )}

            {/* 1st Place: Gold / Sunshine Pop (Elevated Center Card) */}
            {topThree[0] && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                whileHover={{ y: -8 }}
                onClick={() => setSelectedCompetitor(topThree[0])}
                className="group relative bg-[#ffffff] border-2 border-[#ffd600] rounded-[42px] p-7 sm:p-9 flex flex-col items-center text-center cursor-pointer transition-all duration-300 md:-translate-y-4 shadow-sm z-10"
              >
                {/* Crown Pill */}
                <div className="px-4 py-1.5 rounded-[50px] bg-[#ffd600] text-[#2c2e2a] flex items-center gap-1.5 font-bold text-xs mb-3 shadow-xs">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Season Champion 🥇</span>
                </div>

                <div className="relative mb-4 group-hover:scale-105 transition">
                  <CreativeProfileAvatar
                    src={topThree[0].avatar}
                    name={topThree[0].name}
                    seed={topThree[0].id || topThree[0].name}
                    size="custom"
                    className="w-22 h-22 sm:w-26 sm:h-26 border-4 border-[#ffd600] shadow-md"
                  />
                  <span className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#ffffff] border border-[#d5d5d4] text-sm flex items-center justify-center shadow-xs">
                    👑
                  </span>
                </div>

                <h4 className="text-xl sm:text-2xl font-black text-[#2c2e2a] tracking-tight">
                  {topThree[0].name}
                </h4>
                <p className="text-xs text-[#80827f] mt-1">{topThree[0].department}</p>

                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-[50px] bg-[#ffd600]/20 border border-[#ffd600]/40 text-xs font-bold text-[#2c2e2a] mt-3">
                  <Flame className="w-3.5 h-3.5 text-[#ff705d] fill-[#ff705d]" />
                  <span>{topThree[0].streakDays} Day Streak! 🔥</span>
                </div>

                {/* Primary Stats */}
                <div className="grid grid-cols-2 gap-3.5 w-full mt-6 pt-5 border-t border-[#f5f1e4]">
                  <div className="p-3 rounded-2xl bg-[#f5f1e4]">
                    <span className="text-[10px] font-mono uppercase text-[#80827f] block font-semibold">Total XP</span>
                    <span className="text-2xl font-black text-[#2c2e2a]">
                      {topThree[0].points.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#f5f1e4]">
                    <span className="text-[10px] font-mono uppercase text-[#80827f] block font-semibold">Sprints Solved</span>
                    <span className="text-2xl font-black text-[#2c2e2a]">
                      {topThree[0].challengesSolved}
                    </span>
                  </div>
                </div>

                {/* Cheer High-Five Button */}
                <button
                  type="button"
                  onClick={(e) => handleCheer(topThree[0].id, e)}
                  className="mt-6 w-full py-3 px-5 rounded-[50px] bg-[#2c2e2a] hover:bg-[#1a1b18] text-white text-xs font-bold flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer relative shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#ffd600]" />
                  <span>Send Champion High-Five ({cheers[topThree[0].id] || 0})</span>
                  {floatingCheer === topThree[0].id && (
                    <span className="absolute -top-8 text-xs font-bold text-[#ffd600] animate-bounce">
                      +1 Champion High-Five! 🚀
                    </span>
                  )}
                </button>
              </motion.div>
            )}

            {/* 3rd Place: Bronze / Sky Pop */}
            {topThree[2] && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ y: -6 }}
                onClick={() => setSelectedCompetitor(topThree[2])}
                className="group relative bg-[#ffffff] border border-[#d5d5d4] hover:border-[#2ba0ff] rounded-[36px] p-6 sm:p-7 flex flex-col items-center text-center cursor-pointer transition-all duration-300 shadow-xs"
              >
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 rounded-[50px] bg-[#f5f1e4] border border-[#d5d5d4] text-[11px] font-mono font-bold text-[#2ba0ff]">
                    #3 BRONZE
                  </span>
                </div>

                <div className="relative mt-3 mb-4 group-hover:scale-105 transition">
                  <CreativeProfileAvatar
                    src={topThree[2].avatar}
                    name={topThree[2].name}
                    seed={topThree[2].id || topThree[2].name}
                    size="custom"
                    className="w-18 h-18 sm:w-20 sm:h-20 border-2 border-[#2ba0ff] shadow-xs"
                  />
                  <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#ffffff] border border-[#d5d5d4] text-xs flex items-center justify-center shadow-xs">
                    🥉
                  </span>
                </div>

                <h4 className="text-lg font-bold text-[#2c2e2a] group-hover:text-[#2ba0ff] transition">
                  {topThree[2].name}
                </h4>
                <p className="text-xs text-[#80827f] mt-0.5">{topThree[2].department}</p>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[50px] bg-[#f5f1e4] text-[11px] font-medium text-[#2c2e2a] mt-3">
                  <Flame className="w-3 h-3 text-[#2ba0ff]" />
                  <span>{topThree[2].streakDays} Day Streak</span>
                </div>

                {/* Stat Badges */}
                <div className="grid grid-cols-2 gap-3 w-full mt-6 pt-5 border-t border-[#f5f1e4]">
                  <div className="p-2.5 rounded-2xl bg-[#f5f1e4]/70">
                    <span className="text-[10px] font-mono uppercase text-[#80827f] block">Points</span>
                    <span className="text-lg font-extrabold text-[#2c2e2a]">
                      {topThree[2].points.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-[#f5f1e4]/70">
                    <span className="text-[10px] font-mono uppercase text-[#80827f] block">Solved</span>
                    <span className="text-lg font-extrabold text-[#2c2e2a]">
                      {topThree[2].challengesSolved}
                    </span>
                  </div>
                </div>

                {/* Cheer High-Five Button */}
                <button
                  type="button"
                  onClick={(e) => handleCheer(topThree[2].id, e)}
                  className="mt-5 w-full py-2.5 px-4 rounded-[50px] bg-[#f5f1e4] hover:bg-[#2ba0ff] text-[#2c2e2a] hover:text-white border border-[#d5d5d4] hover:border-transparent text-xs font-semibold flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer relative"
                >
                  <span>👏 Cheer ({cheers[topThree[2].id] || 0})</span>
                  {floatingCheer === topThree[2].id && (
                    <span className="absolute -top-7 text-xs font-bold text-[#2ba0ff] animate-bounce">
                      +1 Cheer! ⚡
                    </span>
                  )}
                </button>
              </motion.div>
            )}

          </div>
        </div>
      )}

      {/* 2. CONTROLS BAR: Category Pills, Season Dropdown, Search, Sort & View Modes */}
      <div className="bg-[#ffffff] border border-[#d5d5d4] p-5 sm:p-6 rounded-[36px] space-y-4 shadow-xs">

        {/* Row 1: Filter pills + right-side controls (selects & view toggle) */}
        <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
          
          {/* Track Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`inline-flex items-center h-8 px-3.5 rounded-[50px] text-xs font-medium transition cursor-pointer whitespace-nowrap flex-shrink-0 ${
                  selectedCategory === cat
                    ? "bg-[#2c2e2a] text-white shadow-xs"
                    : "bg-[#f5f1e4] text-[#2c2e2a] hover:bg-[#eae5d7]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Right controls: Season, Sort, View toggle — all h-8 */}
          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
            
            {/* Season Selector */}
            <div className="relative inline-flex items-center">
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
                className="appearance-none inline-flex items-center h-8 bg-[#f5f1e4] border border-[#d5d5d4] text-[#2c2e2a] text-xs font-semibold pl-3.5 pr-8 rounded-[50px] focus:outline-none focus:border-[#2c2e2a] cursor-pointer leading-none"
              >
                {SEASONS.map((s) => (
                  <option key={s} value={s} className="bg-white text-[#2c2e2a]">{s}</option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-[#80827f] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Sort Selector */}
            <div className="relative inline-flex items-center">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "points" | "solved" | "streak")}
                className="appearance-none inline-flex items-center h-8 bg-[#f5f1e4] border border-[#d5d5d4] text-[#2c2e2a] text-xs font-semibold pl-3.5 pr-8 rounded-[50px] focus:outline-none focus:border-[#2c2e2a] cursor-pointer leading-none"
              >
                <option value="points">Sort: XP</option>
                <option value="solved">Sort: Solved</option>
                <option value="streak">Sort: Streak</option>
              </select>
              <ChevronDown className="w-3 h-3 text-[#80827f] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* View Mode Toggle */}
            <div className="inline-flex items-center h-8 bg-[#f5f1e4] px-0.5 rounded-[50px] border border-[#d5d5d4] gap-0.5">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`h-7 w-7 inline-flex items-center justify-center rounded-full transition cursor-pointer ${
                  viewMode === "table" ? "bg-[#ffffff] text-[#2c2e2a] shadow-xs" : "text-[#80827f] hover:text-[#2c2e2a]"
                }`}
                title="Table View"
              >
                <ListFilter className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={`h-7 w-7 inline-flex items-center justify-center rounded-full transition cursor-pointer ${
                  viewMode === "cards" ? "bg-[#ffffff] text-[#2c2e2a] shadow-xs" : "text-[#80827f] hover:text-[#2c2e2a]"
                }`}
                title="Bento Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>

        {/* Row 2: Search Input — icon always vertically centred */}
        <div className="relative flex items-center w-full">
          <Search className="w-4 h-4 text-[#80827f] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
          <input
            type="text"
            placeholder="Search by student name, department, or badge (e.g. Gemini, CSE, Flutter)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full h-10 bg-[#f5f1e4] border border-[#d5d5d4] hover:border-[#2c2e2a]/40 text-[#2c2e2a] text-xs pl-10 ${searchQuery ? "pr-9" : "pr-4"} rounded-[50px] focus:outline-none focus:border-[#2c2e2a] transition placeholder-[#80827f] shadow-xs`}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#d5d5d4] hover:bg-[#80827f] text-white flex items-center justify-center text-xs transition cursor-pointer"
              title="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* 3. LEADERBOARD DISPLAY: TABLE VIEW OR BENTO CARDS VIEW */}
      {viewMode === "table" ? (
        /* TABLE VIEW */
        <div className="bg-[#ffffff] border border-[#d5d5d4] rounded-[36px] overflow-hidden shadow-xs">
          <div className="p-6 border-b border-[#f5f1e4] flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#2c2e2a] tracking-tight">
                All Chapter Standings
              </h3>
              <p className="text-xs text-[#80827f] mt-0.5">
                Showing {filteredEntries.length} student competitors in {selectedSeason} • Click any row for profile details
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex px-3 py-1 rounded-[50px] bg-[#f5f1e4] border border-[#d5d5d4] text-[11px] font-medium text-[#2c2e2a] items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#8ed462] animate-pulse" />
                Live Firestore Active
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#f5f1e4] bg-[#f5f1e4]/50 text-[11px] font-mono uppercase text-[#80827f] tracking-wider">
                  <th className="py-4 px-6">Rank</th>
                  <th className="py-4 px-6">Competitor</th>
                  <th className="py-4 px-6">Track</th>
                  <th className="py-4 px-6 text-center">Solved</th>
                  <th className="py-4 px-6">Badges & Accolades</th>
                  <th className="py-4 px-6 text-right">XP Points</th>
                  <th className="py-4 px-6 text-center">Cheer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f1e4] text-xs">
                {filteredEntries.map((item, index) => {
                  const rankNum = index + 1;
                  return (
                    <tr
                      key={item.id || index}
                      onClick={() => setSelectedCompetitor(item)}
                      className="hover:bg-[#f5f1e4]/50 transition-colors group cursor-pointer"
                    >
                      {/* Rank */}
                      <td className="py-4 px-6 font-mono font-semibold">
                        <span
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            rankNum === 1
                              ? "bg-[#ffd600] text-[#2c2e2a]"
                              : rankNum === 2
                              ? "bg-[#ff705d] text-white"
                              : rankNum === 3
                              ? "bg-[#2ba0ff] text-white"
                              : "bg-[#f5f1e4] text-[#80827f]"
                          }`}
                        >
                          {rankNum === 1 ? "🥇" : rankNum === 2 ? "🥈" : rankNum === 3 ? "🥉" : rankNum}
                        </span>
                      </td>

                      {/* Competitor Name & Dept */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <CreativeProfileAvatar
                            src={item.avatar}
                            name={item.name}
                            seed={item.id || item.name}
                            size="custom"
                            className="w-9 h-9 border border-[#d5d5d4]"
                          />
                          <div>
                            <div className="font-semibold text-[#2c2e2a] group-hover:text-[#ff705d] transition flex items-center gap-1.5">
                              {item.name}
                              {item.streakDays && item.streakDays >= 5 && (
                                <span className="flex items-center text-[10px] text-[#ff705d] font-mono font-bold bg-[#ff705d]/10 px-2 py-0.5 rounded-full">
                                  <Flame className="w-2.5 h-2.5 fill-[#ff705d] mr-0.5" />
                                  {item.streakDays}d
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-[#80827f] block">
                              {item.department}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Track */}
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 rounded-[50px] text-[11px] font-medium bg-[#f5f1e4] border border-[#d5d5d4] text-[#2c2e2a]">
                          {item.category}
                        </span>
                      </td>

                      {/* Solved */}
                      <td className="py-4 px-6 text-center font-mono font-bold text-[#2c2e2a]">
                        {item.challengesSolved}
                      </td>

                      {/* Badges */}
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1.5 max-w-xs">
                          {item.badges.slice(0, 2).map((badge, bIdx) => (
                            <span
                              key={bIdx}
                              className="px-2.5 py-0.5 rounded-[50px] text-[10px] font-medium bg-[#f5f1e4] border border-[#d5d5d4] text-[#2c2e2a]"
                            >
                              {badge}
                            </span>
                          ))}
                          {item.badges.length > 2 && (
                            <span className="text-[10px] font-medium text-[#80827f] self-center">
                              +{item.badges.length - 2}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Points */}
                      <td className="py-4 px-6 text-right font-mono font-extrabold text-[#2c2e2a] text-sm">
                        {item.points.toLocaleString()}
                      </td>

                      {/* Micro Cheer */}
                      <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => handleCheer(item.id, e)}
                          className="px-3 py-1 rounded-[50px] bg-[#f5f1e4] hover:bg-[#8ed462] hover:text-[#2c2e2a] border border-[#d5d5d4] text-[11px] font-semibold transition active:scale-95 cursor-pointer"
                        >
                          👏 {cheers[item.id] || 0}
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredEntries.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-14 text-center text-[#80827f]">
                      No competitors found matching your search or filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* BENTO CARDS VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEntries.map((item, index) => {
            const rankNum = index + 1;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.25 }}
                onClick={() => setSelectedCompetitor(item)}
                className="bg-[#ffffff] border border-[#d5d5d4] hover:border-[#2c2e2a]/40 rounded-[32px] p-6 flex flex-col justify-between cursor-pointer transition shadow-xs group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        rankNum === 1
                          ? "bg-[#ffd600] text-[#2c2e2a]"
                          : rankNum === 2
                          ? "bg-[#ff705d] text-white"
                          : rankNum === 3
                          ? "bg-[#2ba0ff] text-white"
                          : "bg-[#f5f1e4] text-[#80827f]"
                      }`}
                    >
                      {rankNum === 1 ? "🥇" : rankNum === 2 ? "🥈" : rankNum === 3 ? "🥉" : `#${rankNum}`}
                    </span>
                    <span className="px-3 py-1 rounded-[50px] bg-[#f5f1e4] border border-[#d5d5d4] text-[11px] font-medium text-[#2c2e2a]">
                      {item.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-3.5 mb-4">
                    <CreativeProfileAvatar
                      src={item.avatar}
                      name={item.name}
                      seed={item.id || item.name}
                      size="custom"
                      className="w-12 h-12 border border-[#d5d5d4]"
                    />
                    <div>
                      <h4 className="text-base font-bold text-[#2c2e2a] group-hover:text-[#ff705d] transition">
                        {item.name}
                      </h4>
                      <p className="text-xs text-[#80827f]">{item.department}</p>
                    </div>
                  </div>

                  {/* Badges preview */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {item.badges.slice(0, 3).map((b, bIdx) => (
                      <span
                        key={bIdx}
                        className="px-2.5 py-0.5 rounded-[50px] text-[10px] font-medium bg-[#f5f1e4] text-[#2c2e2a]"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Stats & Cheer */}
                <div className="pt-4 border-t border-[#f5f1e4] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#80827f] block">Points</span>
                    <span className="text-base font-extrabold text-[#2c2e2a]">
                      {item.points.toLocaleString()} pts
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleCheer(item.id, e)}
                    className="px-3.5 py-1.5 rounded-[50px] bg-[#f5f1e4] hover:bg-[#8ed462] hover:text-[#2c2e2a] border border-[#d5d5d4] text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                  >
                    <span>👏</span>
                    <span>{cheers[item.id] || 0}</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* 4. GAMIFIED "HOW TO CLIMB THE RANKS" INTERACTIVE POINTS SIMULATOR */}
      <div className="bg-[#ffffff] border border-[#d5d5d4] rounded-[36px] p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-[50px] bg-[#f5f1e4] text-xs font-medium text-[#2c2e2a]">
              <Sliders className="w-3.5 h-3.5 text-[#2ba0ff]" />
              <span>Interactive Points Simulator</span>
            </div>
            <h3 className="text-2xl font-bold tracking-[-0.03em] text-[#2c2e2a]">
              Climb the Season Leaderboard
            </h3>
            <p className="text-xs text-[#80827f] max-w-xl leading-relaxed">
              Test how completing Codelabs, Hackathons, and Google Cloud Study Jams will elevate your standing.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowSimulator(!showSimulator)}
            className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-[50px] bg-[#f5f1e4] hover:bg-[#2c2e2a] text-[#2c2e2a] hover:text-white border border-[#d5d5d4] text-xs font-semibold transition cursor-pointer self-start sm:self-auto"
          >
            <span>{showSimulator ? "Hide Simulator" : "Try Simulator"}</span>
            <span className="w-2 h-2 rounded-full bg-[#ff705d] action-dot-expand" />
          </button>
        </div>

        {showSimulator && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
            className="space-y-6 pt-4 border-t border-[#f5f1e4]"
          >
            {/* 4 Simulator Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Codelabs */}
              <div className="p-4 rounded-[24px] bg-[#f5f1e4] border border-[#d5d5d4] space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#2c2e2a]">Codelabs Solved</span>
                  <span className="font-mono font-bold text-[#ff705d]">{simCodelabs} (+{simCodelabs * 50} pts)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={simCodelabs}
                  onChange={(e) => setSimCodelabs(Number(e.target.value))}
                  className="w-full accent-[#ff705d] cursor-pointer"
                />
                <span className="text-[10px] text-[#80827f] block">50 XP earned per verified Codelab</span>
              </div>

              {/* Hackathons */}
              <div className="p-4 rounded-[24px] bg-[#f5f1e4] border border-[#d5d5d4] space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#2c2e2a]">Hackathons Joined</span>
                  <span className="font-mono font-bold text-[#2ba0ff]">{simHackathons} (+{simHackathons * 250} pts)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="6"
                  value={simHackathons}
                  onChange={(e) => setSimHackathons(Number(e.target.value))}
                  className="w-full accent-[#2ba0ff] cursor-pointer"
                />
                <span className="text-[10px] text-[#80827f] block">250 XP for each submission</span>
              </div>

              {/* Study Jams */}
              <div className="p-4 rounded-[24px] bg-[#f5f1e4] border border-[#d5d5d4] space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#2c2e2a]">Cloud Study Jams</span>
                  <span className="font-mono font-bold text-[#8ed462]">{simStudyJams} (+{simStudyJams * 120} pts)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={simStudyJams}
                  onChange={(e) => setSimStudyJams(Number(e.target.value))}
                  className="w-full accent-[#8ed462] cursor-pointer"
                />
                <span className="text-[10px] text-[#80827f] block">120 XP per completed lab quest</span>
              </div>

              {/* Streak Days */}
              <div className="p-4 rounded-[24px] bg-[#f5f1e4] border border-[#d5d5d4] space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#2c2e2a]">Daily Streak</span>
                  <span className="font-mono font-bold text-[#ffd600]">{simStreak}d (+{simStreak * 15} pts)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={simStreak}
                  onChange={(e) => setSimStreak(Number(e.target.value))}
                  className="w-full accent-[#ffd600] cursor-pointer"
                />
                <span className="text-[10px] text-[#80827f] block">15 XP per consecutive sprint day</span>
              </div>

            </div>

            {/* Calculated Results Banner */}
            <div className="p-5 rounded-[28px] bg-[#f5f1e4] border border-[#d5d5d4] flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-center md:text-left">
                <div className="w-12 h-12 rounded-2xl bg-[#ffffff] border border-[#d5d5d4] flex items-center justify-center text-2xl">
                  ⚡
                </div>
                <div>
                  <span className="text-[11px] font-mono uppercase text-[#80827f] block">Projected Standing</span>
                  <h4 className="text-xl font-extrabold text-[#2c2e2a]">
                    {simulatedXP.toLocaleString()} XP Points • {simulatedRank}
                  </h4>
                </div>
              </div>

              <a
                href="/programs"
                className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-[50px] bg-[#ff705d] hover:bg-[#ee6350] text-[#ffffff] text-xs font-semibold transition active:scale-95 shadow-xs"
              >
                <span>Join Active Sprint</span>
                <span className="w-2 h-2 rounded-full bg-white action-dot-expand" />
              </a>
            </div>
          </motion.div>
        )}
      </div>

      {/* 5. INTERACTIVE COMPETITOR PROFILE MODAL */}
      <AnimatePresence>
        {selectedCompetitor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2c2e2a]/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={{ duration: 0.25 }}
              className="bg-[#ffffff] border border-[#d5d5d4] rounded-[36px] max-w-lg w-full p-7 sm:p-8 space-y-6 relative shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedCompetitor(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#f5f1e4] hover:bg-[#eae5d7] flex items-center justify-center text-[#2c2e2a] transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Profile Header */}
              <div className="flex items-center gap-4">
                <CreativeProfileAvatar
                  src={selectedCompetitor.avatar}
                  name={selectedCompetitor.name}
                  seed={selectedCompetitor.id || selectedCompetitor.name}
                  size="custom"
                  className="w-16 h-16 border-2 border-[#d5d5d4] shadow-xs"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-[#2c2e2a]">
                      {selectedCompetitor.name}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-[50px] bg-[#f5f1e4] border border-[#d5d5d4] text-[10px] font-mono font-bold text-[#2c2e2a]">
                      {selectedCompetitor.category}
                    </span>
                  </div>
                  <p className="text-xs text-[#80827f] mt-0.5">{selectedCompetitor.department}</p>
                </div>
              </div>

              {/* Bio if available */}
              {selectedCompetitor.bio && (
                <p className="text-xs text-[#80827f] leading-relaxed bg-[#f5f1e4] p-3.5 rounded-2xl border border-[#d5d5d4]">
                  "{selectedCompetitor.bio}"
                </p>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-2xl bg-[#f5f1e4] text-center">
                  <span className="text-[10px] font-mono uppercase text-[#80827f] block">Total XP</span>
                  <span className="text-lg font-black text-[#2c2e2a]">
                    {selectedCompetitor.points.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-[#f5f1e4] text-center">
                  <span className="text-[10px] font-mono uppercase text-[#80827f] block">Solved</span>
                  <span className="text-lg font-black text-[#2c2e2a]">
                    {selectedCompetitor.challengesSolved}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-[#f5f1e4] text-center">
                  <span className="text-[10px] font-mono uppercase text-[#80827f] block">Streak</span>
                  <span className="text-lg font-black text-[#ff705d] flex items-center justify-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-[#ff705d]" />
                    {selectedCompetitor.streakDays}d
                  </span>
                </div>
              </div>

              {/* Badges & Accolades */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#2c2e2a] block">Earned Badges & Accolades</span>
                <div className="flex flex-wrap gap-2">
                  {selectedCompetitor.badges.map((badge, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-[50px] bg-[#f5f1e4] border border-[#d5d5d4] text-xs font-medium text-[#2c2e2a] flex items-center gap-1.5"
                    >
                      <Award className="w-3 h-3 text-[#ffd600]" />
                      <span>{badge}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Cheer Action in Modal */}
              <div className="pt-4 border-t border-[#f5f1e4] flex items-center justify-between">
                <button
                  type="button"
                  onClick={(e) => handleCheer(selectedCompetitor.id, e)}
                  className="group inline-flex items-center gap-2 px-6 py-2.5 rounded-[50px] bg-[#ff705d] hover:bg-[#ee6350] text-white text-xs font-semibold transition active:scale-95 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Send Cheer 👏 ({cheers[selectedCompetitor.id] || 0})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedCompetitor(null)}
                  className="px-4 py-2 rounded-[50px] text-xs font-medium text-[#80827f] hover:text-[#2c2e2a] cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
