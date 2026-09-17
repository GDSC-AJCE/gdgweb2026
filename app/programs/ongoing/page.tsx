"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProgramCard from "@/components/programs/ProgramCard";
import ProgramsNavTabs from "@/components/programs/ProgramsNavTabs";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Radio, Sparkles, Clock, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function OngoingProgramsPage() {
  const [ongoingPrograms, setOngoingPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOngoingEvents = async () => {
      try {
        const q = query(collection(db, "events"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const now = new Date();

        const events = querySnapshot.docs
          .map(doc => {
            const data = doc.data();
            return {
              slug: data.slug || doc.id,
              title: data.title,
              description: data.tagline || data.description?.substring(0, 100) + "...",
              posterUrl: data.posterUrl,
              date: data.date,
              endDate: data.endDate,
              registrationLastDate: data.registrationLastDate,
              isOngoing: data.isOngoing || false,
              status: data.status || "upcoming",
              isHidden: data.isHidden || false
            };
          })
          .filter(event => {
            if (event.isHidden) return false;
            if (event.isOngoing || event.status === "ongoing" || event.status === "live") return true;
            
            // Check if today falls between event start date and end date
            if (event.date) {
              const start = new Date(event.date);
              const end = event.endDate ? new Date(event.endDate) : new Date(start.getTime() + 86400000); // default 24hr
              if (!isNaN(start.getTime()) && now >= start && now <= end) {
                return true;
              }
            }

            // Also include active registration events if deadline is in the future
            if (event.registrationLastDate) {
              const regEnd = new Date(event.registrationLastDate);
              if (!isNaN(regEnd.getTime()) && now <= regEnd) {
                return true;
              }
            }
            return false;
          });

        setOngoingPrograms(events);
      } catch (e) {
        console.error("Failed to fetch ongoing events", e);
      } finally {
        setLoading(false);
      }
    };

    fetchOngoingEvents();
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 pb-32">
      {/* Header */}
      <div className="mb-8 text-center max-w-2xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EA4335]/10 border border-[#EA4335]/30 text-xs font-mono text-[#EA4335]">
          <span className="w-2 h-2 rounded-full bg-[#EA4335] animate-ping" />
          <span>LIVE & ONGOING PROGRAM ENGINE</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#2c2e2a] tracking-tight">
          Ongoing & Live Events
        </h1>
        <p className="text-sm text-[#80827f] leading-relaxed">
          Programs, workshops, and hackathons active right now. Check in, submit project deliverables, and join live session streams.
        </p>
      </div>

      {/* Subnavigation Tabs */}
      <ProgramsNavTabs />

      {loading ? (
        <div className="flex justify-center py-24">
          <LoadingSpinner />
        </div>
      ) : ongoingPrograms.length === 0 ? (
        <div className="text-center py-20 bg-[#ffffff] border border-[#d5d5d4] rounded-3xl p-10 max-w-xl mx-auto space-y-4 shadow-xs">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#EA4335]/10 border border-[#EA4335]/30 flex items-center justify-center text-[#EA4335]">
            <Radio className="w-8 h-8 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-[#2c2e2a]">No Live Session Right Now</h3>
          <p className="text-xs text-[#80827f] leading-relaxed">
            There are no ongoing workshops or hackathons active at this exact moment. Upcoming programs will appear here as soon as their session or live window begins.
          </p>
          <div className="pt-2">
            <Link
              href="/programs"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[50px] bg-[#2c2e2a] text-white hover:bg-[#1a1a1a] font-semibold text-xs transition shadow-xs"
            >
              <span>Explore All Upcoming Programs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-white/[0.08]">
            <span className="text-xs font-mono text-[#34A853] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#34A853] animate-pulse" />
              Showing {ongoingPrograms.length} active initiative{ongoingPrograms.length > 1 ? "s" : ""}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ongoingPrograms.map((program, index) => (
              <div key={program.slug} className="relative group">
                <div className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-full bg-[#EA4335] text-white text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  Live Now
                </div>
                <ProgramCard
                  title={program.title}
                  description={program.description}
                  slug={program.slug}
                  index={index}
                  posterUrl={program.posterUrl}
                  date={program.date}
                  registrationLastDate={program.registrationLastDate}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
