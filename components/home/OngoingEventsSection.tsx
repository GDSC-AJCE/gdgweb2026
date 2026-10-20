"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight, Mail, Check } from "lucide-react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import CreativeEventPoster from "@/components/programs/CreativeEventPoster";

// =============================================================================
// STORYBOOK ILLUSTRATIONS & CHARACTERS (Directly modeled from reference mockup)
// =============================================================================

// 1. Periwinkle Canvas with Hanging Orange Star Character (Bars / Gymnastics)
function OrangeStarGymnastArt() {
  return (
    <div className="w-full h-full bg-[#C5D2FF] relative flex items-center justify-center overflow-hidden select-none">
      <svg viewBox="0 0 240 180" className="w-[85%] h-[85%] max-w-[260px] drop-shadow-xs" fill="none">
        {/* Gymnastic Bar Frame (Clean Dark Outline) */}
        <line x1="30" y1="45" x2="210" y2="45" stroke="#2c2e2a" strokeWidth="4" strokeLinecap="round" />
        <line x1="45" y1="45" x2="45" y2="175" stroke="#2c2e2a" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="195" y1="45" x2="195" y2="175" stroke="#2c2e2a" strokeWidth="3.5" strokeLinecap="round" />
        {/* Base feet */}
        <line x1="30" y1="175" x2="60" y2="175" stroke="#2c2e2a" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="180" y1="175" x2="210" y2="175" stroke="#2c2e2a" strokeWidth="3.5" strokeLinecap="round" />

        {/* Playful Orange 10-Point Starburst Character */}
        <g transform="translate(120, 95)">
          {/* Hands gripping the bar */}
          <ellipse cx="-42" cy="-48" rx="7" ry="6" fill="#FF8343" />
          <ellipse cx="42" cy="-48" rx="7" ry="6" fill="#FF8343" />
          {/* Main Star Body */}
          <path
            d="M 0 -42
               L 13 -22
               L 36 -32
               L 35 -8
               L 52 8
               L 32 23
               L 38 46
               L 15 37
               L 0 54
               L -15 37
               L -38 46
               L -32 23
               L -52 8
               L -35 -8
               L -36 -32
               L -13 -22 Z"
            fill="#FF8343"
          />
          {/* Cute Face (Closed Smiling Eyes + Smile) */}
          <path d="M -16 -4 Q -11 -9 -6 -4" stroke="#2c2e2a" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M 6 -4 Q 11 -9 16 -4" stroke="#2c2e2a" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M -8 10 Q 0 16 8 10" stroke="#2c2e2a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* Rosy Cheeks */}
          <circle cx="-19" cy="4" r="3.5" fill="#FF5722" opacity="0.4" />
          <circle cx="19" cy="4" r="3.5" fill="#FF5722" opacity="0.4" />
        </g>
      </svg>
    </div>
  );
}

// 2. Sunshine Yellow Canvas with Coral Blossom Hand Balancing Tech Sphere (Volleyball)
function CoralHandVolleyballArt() {
  return (
    <div className="w-full h-full bg-[#FDF085] relative flex items-center justify-center overflow-hidden select-none">
      <svg viewBox="0 0 240 180" className="w-[85%] h-[85%] max-w-[260px] drop-shadow-xs" fill="none">
        {/* Playful Pink/Coral Multi-Lobe Hand / Fan Creature */}
        <g transform="translate(120, 135)">
          {/* Left finger 1 */}
          <path d="M -75 -12 C -85 -30 -60 -45 -48 -26 L -20 5 Z" fill="#F472B6" />
          {/* Left finger 2 */}
          <path d="M -50 -36 C -60 -65 -30 -75 -18 -48 L 0 5 Z" fill="#F472B6" />
          {/* Center finger */}
          <path d="M -14 -60 C -14 -90 14 -90 14 -60 L 0 10 Z" fill="#F472B6" />
          {/* Right finger 2 */}
          <path d="M 18 -48 C 30 -75 60 -65 50 -36 L 0 5 Z" fill="#F472B6" />
          {/* Right finger 1 */}
          <path d="M 48 -26 C 60 -45 85 -30 75 -12 L 20 5 Z" fill="#F472B6" />

          {/* Rounded base body */}
          <rect x="-65" y="-12" width="130" height="24" rx="12" fill="#F472B6" />

          {/* Cute Face on Hand Body */}
          <path d="M -14 -8 Q -9 -13 -4 -8" stroke="#2c2e2a" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M 4 -8 Q 9 -13 14 -8" stroke="#2c2e2a" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M -6 4 Q 0 9 6 4" stroke="#2c2e2a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </g>

        {/* Floating Volleyball / Google Sphere on Top */}
        <g transform="translate(142, 44)">
          <circle cx="0" cy="0" r="19" fill="#FFFBEB" stroke="#2c2e2a" strokeWidth="2.5" />
          {/* Volleyball Ribs / Seams */}
          <path d="M -13 -13 Q 0 0 -13 13" stroke="#2c2e2a" strokeWidth="2" fill="none" />
          <path d="M 13 -13 Q 0 0 13 13" stroke="#2c2e2a" strokeWidth="2" fill="none" />
          <path d="M -19 0 L 19 0" stroke="#2c2e2a" strokeWidth="2" />
        </g>

        {/* Small Companion Blossom Ball */}
        <circle cx="160" cy="46" r="6" fill="#F472B6" />
        <circle cx="125" cy="48" r="5" fill="#F472B6" />
      </svg>
    </div>
  );
}

// 3. Purple / Lavender Canvas with Tech Racquet & Sparkling Orb
function LavenderRacquetArt() {
  return (
    <div className="w-full h-full bg-[#D6C7FF] relative flex items-center justify-center overflow-hidden select-none">
      <svg viewBox="0 0 240 180" className="w-[85%] h-[85%] max-w-[260px] drop-shadow-xs" fill="none">
        {/* Soft Background Dome Shape */}
        <path d="M 145 175 L 215 175 C 215 95 145 95 145 175 Z" fill="#C4B5FD" opacity="0.6" />

        {/* Small floating sparkles */}
        <circle cx="50" cy="45" r="4" fill="#FFFFFF" opacity="0.9" />
        <circle cx="205" cy="115" r="3" fill="#FFFFFF" opacity="0.8" />

        {/* Cute Mascot Character with Racquet */}
        <g transform="translate(85, 80)">
          {/* Racquet Handle (behind or emerging naturally from arm) */}
          <line x1="28" y1="36" x2="48" y2="10" stroke="#2c2e2a" strokeWidth="4" strokeLinecap="round" />

          {/* Racquet Head */}
          <g transform="translate(56, -4)">
            <ellipse cx="0" cy="0" rx="22" ry="26" fill="#FFFBEB" stroke="#2c2e2a" strokeWidth="3" />
            <line x1="0" y1="-26" x2="0" y2="26" stroke="#2c2e2a" strokeWidth="1.5" strokeDasharray="3,3" />
            <line x1="-22" y1="0" x2="22" y2="0" stroke="#2c2e2a" strokeWidth="1.5" strokeDasharray="3,3" />
          </g>

          {/* Oval Mascot Body */}
          <ellipse cx="0" cy="30" rx="34" ry="40" fill="#8B5CF6" stroke="#2c2e2a" strokeWidth="2.5" />

          {/* Cute Eyes & Smile */}
          <circle cx="-11" cy="22" r="3.5" fill="#2c2e2a" />
          <circle cx="11" cy="22" r="3.5" fill="#2c2e2a" />
          <path d="M -5 34 Q 0 39 5 34" stroke="#2c2e2a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* Rosy Cheeks */}
          <circle cx="-18" cy="28" r="3" fill="#A78BFA" opacity="0.5" />
          <circle cx="18" cy="28" r="3" fill="#A78BFA" opacity="0.5" />

          {/* Mascot Hand holding the handle */}
          <circle cx="28" cy="36" r="6" fill="#8B5CF6" stroke="#2c2e2a" strokeWidth="2" />
        </g>

        {/* Floating Glowing Code Ball (Google Brackets) */}
        <g transform="translate(162, 54)">
          <circle cx="0" cy="0" r="14" fill="#FFFFFF" stroke="#2c2e2a" strokeWidth="2" />
          <path d="M -5 -4 L -9 0 L -5 4" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 5 -4 L 9 0 L 5 4" stroke="#34A853" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {/* Sparkle dot above ball */}
          <circle cx="12" cy="-12" r="2.5" fill="#FFFFFF" />
        </g>
      </svg>
    </div>
  );
}

// 4. Mint Green Canvas with Coding Clover Bot
function MintCloverBotArt() {
  return (
    <div className="w-full h-full bg-[#D2F4B8] relative flex items-center justify-center overflow-hidden select-none">
      <svg viewBox="0 0 240 180" className="w-[85%] h-[85%] max-w-[260px] drop-shadow-xs" fill="none">
        {/* Soft Organic Clover Shape */}
        <g transform="translate(120, 90)">
          <circle cx="-24" cy="-15" r="22" fill="#8ED462" />
          <circle cx="24" cy="-15" r="22" fill="#8ED462" />
          <circle cx="0" cy="20" r="24" fill="#8ED462" />

          {/* Cute Face */}
          <circle cx="-10" cy="-2" r="3" fill="#2c2e2a" />
          <circle cx="10" cy="-2" r="3" fill="#2c2e2a" />
          <path d="M -5 8 Q 0 13 5 8" stroke="#2c2e2a" strokeWidth="2.5" strokeLinecap="round" fill="none" />

          {/* Laptop Base */}
          <rect x="-38" y="32" width="76" height="8" rx="4" fill="#2c2e2a" />
          <rect x="-28" y="10" width="56" height="24" rx="4" fill="#FFFFFF" stroke="#2c2e2a" strokeWidth="2.5" />
          {/* Laptop Screen Code Lines */}
          <line x1="-20" y1="18" x2="-2" y2="18" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" />
          <line x1="-20" y1="24" x2="6" y2="24" stroke="#EA4335" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* Android Antennas */}
        <line x1="105" y1="46" x2="95" y2="30" stroke="#2c2e2a" strokeWidth="3" strokeLinecap="round" />
        <line x1="135" y1="46" x2="145" y2="30" stroke="#2c2e2a" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
}

// Map art components
const ART_COMPONENTS = [
  OrangeStarGymnastArt,
  CoralHandVolleyballArt,
  LavenderRacquetArt,
  MintCloverBotArt,
];

interface OngoingEventItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  tag: string;
  date?: string;
  endDate?: string;
  registrationLastDate?: string;
  isOngoing?: boolean;
  status?: string;
  isHidden?: boolean;
  artIndex: number;
  posterUrl?: string;
}

// =============================================================================
// SHOWCASE / CURATED ONGOING EVENTS (Ensures carousel is never blank)
// =============================================================================
const SHOWCASE_EVENTS: OngoingEventItem[] = [
  {
    id: "solution-challenge-2026",
    slug: "solution-challenge-2026",
    title: "Google Solution Challenge 2026",
    description: "Build an impactful project addressing the UN 17 Sustainable Development Goals using Google Cloud, Vertex AI, and Flutter.",
    tag: "GLOBAL INITIATIVE",
    artIndex: 0,
  },
  {
    id: "build-with-ai-sprint",
    slug: "build-with-ai-sprint",
    title: "Build with AI: Gemini & GenAI Sprint",
    description: "Hands-on build sprint integrating Gemini 1.5 Pro, function calling, and multimodal agents into real apps.",
    tag: "LIVE SPRINT",
    artIndex: 1,
  },
  {
    id: "cloud-study-jam-bootcamp",
    slug: "cloud-study-jam-bootcamp",
    title: "Cloud Study Jam & Kubernetes Bootcamp",
    description: "Earn Google Cloud skill badges, deploy containerized workloads, and master production-grade architecture.",
    tag: "STUDY JAM",
    artIndex: 2,
  },
  {
    id: "android-compose-camp",
    slug: "android-compose-camp",
    title: "Android Compose & Modern Kotlin",
    description: "Master modern declarative Android UI with Jetpack Compose, Kotlin Coroutines, and clean architecture.",
    tag: "WORKSHOP",
    artIndex: 3,
  },
];

export default function OngoingEventsSection() {
  const [events, setEvents] = useState<OngoingEventItem[]>(SHOWCASE_EVENTS);
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch live ongoing events from Firestore
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const q = query(collection(db, "events"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const now = new Date();

        const liveEvents: OngoingEventItem[] = snapshot.docs
          .map((doc, idx) => {
            const data = doc.data();
            return {
              id: doc.id,
              slug: data.slug || doc.id,
              title: data.title,
              description: data.tagline || (data.description ? data.description.substring(0, 95) + "..." : ""),
              tag: data.status === "ongoing" || data.isOngoing ? "LIVE NOW" : "REGISTRATION OPEN",
              date: data.date,
              endDate: data.endDate,
              registrationLastDate: data.registrationLastDate,
              isOngoing: data.isOngoing || false,
              status: data.status || "upcoming",
              isHidden: data.isHidden || false,
              artIndex: idx % ART_COMPONENTS.length,
              posterUrl: data.posterUrl,
            };
          })
          .filter((event) => {
            if (event.isHidden) return false;
            if (event.isOngoing || event.status === "ongoing" || event.status === "live") return true;

            if (event.date) {
              const start = new Date(event.date);
              const end = event.endDate ? new Date(event.endDate) : new Date(start.getTime() + 86400000);
              if (!isNaN(start.getTime()) && now >= start && now <= end) return true;
            }

            if (event.registrationLastDate) {
              const regEnd = new Date(event.registrationLastDate);
              if (!isNaN(regEnd.getTime()) && now <= regEnd) return true;
            }
            return false;
          });

        if (liveEvents.length > 0) {
          setEvents(liveEvents);
        }
      } catch (err) {
        console.warn("Using curated fallback events:", err);
      }
    };

    fetchEvents();
  }, []);

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 360;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setSubscribing(true);
    try {
      await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "homepage_ongoing_events" }),
      });
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 5000);
      setEmail("");
    } catch {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 5000);
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <section className="relative w-full bg-transparent py-14 sm:py-20 px-4 sm:px-6 select-none overflow-hidden">
      <div className="max-w-[1240px] mx-auto">
        {/* TOP / TWO-COLUMN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* ===================== LEFT COLUMN (HEADLINE & SUBSCRIBE) ===================== */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
            <div className="space-y-6">


              {/* 3-Line Inter Display Headline */}
              <h2 className="text-[44px] sm:text-[54px] md:text-[62px] font-bold text-[#0f172a] leading-[1.02] tracking-[-0.04em]">
                Build Bold.<br />
                Code Free.<br />
                Ship Hard.
              </h2>

              {/* Descriptive Paragraph */}
              <p className="text-[15px] sm:text-[16px] font-normal text-slate-600 leading-relaxed max-w-md">
                A community where student developers discover tech through building, sprints, and teamwork. 
                Our clubs help members grow stronger, more confident, and launch real projects in a collaborative environment.
              </p>
            </div>

            {/* Newsletter / Event Alert Input */}
            <div className="pt-2 max-w-md">
              <form onSubmit={handleSubscribe} className="relative">
                <div className="flex items-center bg-white border border-slate-200 hover:border-slate-300 focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#2563EB]/15 rounded-[50px] p-1.5 sm:p-2 shadow-xs transition-all">
                  <div className="pl-3.5 pr-2.5 text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    className="w-full bg-transparent text-[14px] sm:text-[15px] text-[#0f172a] placeholder-slate-400 outline-none font-medium pr-2"
                    required
                  />
                  <button
                    type="submit"
                    disabled={subscribing}
                    className="group shrink-0 inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-[50px] bg-[#0f172a] hover:bg-slate-800 text-white text-[13px] sm:text-[14px] font-medium transition-all duration-300 active:scale-95 shadow-xs cursor-pointer disabled:opacity-60"
                  >
                    <span>
                      {subscribing ? "Subscribing..." : subscribed ? "Subscribed!" : "Subscribe"}
                    </span>
                    {subscribed ? (
                      <Check className="w-3.5 h-3.5 text-[#10B981]" />
                    ) : subscribing ? (
                      <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-[#10B981] transition-all duration-300 group-hover:scale-125" />
                    )}
                  </button>
                </div>
              </form>

              {/* Quick Link to Master Programs directory */}
              <div className="pt-5">
                <Link
                  href="/programs"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0f172a] hover:text-[#2563EB] transition-colors group"
                >
                  <span>Explore all active & ongoing sessions</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* ===================== RIGHT COLUMN (CAROUSEL OF CARDS) ===================== */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            
            {/* Navigational Controls Header */}
            <div className="flex items-center justify-between px-1 pb-1">
              <span className="text-xs font-mono text-slate-500 uppercase tracking-wider font-semibold">
                {events.length} Live Opportunities
              </span>

              {/* Carousel Next / Prev Pill Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleScroll("left")}
                  aria-label="Previous events"
                  className="w-9 h-9 rounded-full bg-white border border-slate-200 hover:border-slate-300 text-[#0f172a] flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-xs cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleScroll("right")}
                  aria-label="Next events"
                  className="w-9 h-9 rounded-full bg-white border border-slate-200 hover:border-slate-300 text-[#0f172a] flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-xs cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Horizontal Scrollable Track */}
            <div
              ref={scrollRef}
              className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 pt-1 no-scrollbar scroll-smooth snap-x snap-mandatory px-1"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {events.map((event, idx) => {
                return (
                  <motion.div
                    key={event.id || idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="snap-start flex-shrink-0 w-[260px] sm:w-[325px] rounded-[32px] bg-white border border-slate-200 p-5 sm:p-6 flex flex-col justify-between shadow-sm hover:border-slate-300 hover:shadow-md transition-all duration-300 group"
                  >
                    <div>
                      {/* Top Row: Pill Chip + Round Arrow Link Button */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-[50px] bg-slate-100 border border-slate-200 text-[11px] font-semibold text-[#0f172a] tracking-tight">
                          {event.tag}
                        </span>

                        <Link
                          href={`/programs/${event.slug}`}
                          aria-label={`View ${event.title}`}
                          className="w-8 h-8 rounded-full border border-slate-200 bg-white text-[#0f172a] group-hover:bg-[#0f172a] group-hover:text-white group-hover:border-[#0f172a] flex items-center justify-center transition-all duration-200"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </Link>
                      </div>

                      {/* Card Title */}
                      <h3 className="text-[22px] sm:text-[24px] font-bold text-[#0f172a] leading-tight tracking-[-0.03em] mt-3.5 mb-2">
                        <Link href={`/programs/${event.slug}`} className="hover:underline">
                          {event.title}
                        </Link>
                      </h3>

                      {/* Card Description */}
                      <p className="text-[13px] text-slate-600 line-clamp-2 leading-relaxed mb-5">
                        {event.description}
                      </p>
                    </div>

                    {/* Bottom Poster / Illustration Block */}
                    <div className="w-full h-[205px] sm:h-[220px] rounded-[24px] overflow-hidden border border-slate-200/80 relative">
                      <CreativeEventPoster
                        posterUrl={event.posterUrl}
                        title={event.title}
                        seed={event.slug || event.title}
                        variant={event.artIndex}
                        showBadges={false}
                        aspectRatio="auto"
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

