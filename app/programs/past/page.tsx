"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProgramCard from "@/components/programs/ProgramCard";
import ProgramsNavTabs from "@/components/programs/ProgramsNavTabs";
import LoadingSpinner from "@/components/LoadingSpinner";
import { CheckCircle2, Award, History, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function PastProgramsPage() {
  const [pastPrograms, setPastPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPastEvents = async () => {
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
              registrationLastDate: data.registrationLastDate,
              status: data.status || "completed",
              isHidden: data.isHidden || false
            };
          })
          .filter(event => {
            if (event.isHidden) return false;
            if (event.status === "completed" || event.status === "concluded" || event.status === "past") return true;

            // Check if event date has passed
            if (event.date) {
              const eventDate = new Date(event.date);
              if (!isNaN(eventDate.getTime()) && now.getTime() > (eventDate.getTime() + 86400000)) {
                return true;
              }
            }

            // Check if registration deadline has passed and not ongoing
            if (event.registrationLastDate) {
              const regDeadline = new Date(event.registrationLastDate);
              if (!isNaN(regDeadline.getTime()) && now > regDeadline) {
                return true;
              }
            }

            return false;
          });

        setPastPrograms(events);
      } catch (e) {
        console.error("Failed to fetch past events", e);
      } finally {
        setLoading(false);
      }
    };

    fetchPastEvents();
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 pb-32">
      {/* Header */}
      <div className="mb-8 text-center max-w-2xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#34A853]/10 border border-[#34A853]/30 text-xs font-mono text-[#34A853]">
          <History className="w-3.5 h-3.5 text-[#34A853]" />
          <span>CHAPTER ARCHIVES</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#2c2e2a] tracking-tight">
          Conducted Events & Workshops
        </h1>
        <p className="text-sm text-[#80827f] leading-relaxed">
          Explore past sessions, hackathons, and symposiums hosted by GDG AJCE. Access resources, session recordings, and verify attendance credentials.
        </p>
      </div>

      {/* Subnavigation Tabs */}
      <ProgramsNavTabs />

      {/* Certificate Claim Reminder Banner */}
      <div className="mb-10 bg-[#ffffff] border border-[#d5d5d4] rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-[#4285F4]/10 border border-[#4285F4]/30 flex items-center justify-center text-[#4285F4] shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#2c2e2a]">Attended a past GDG AJCE event?</h4>
            <p className="text-xs text-[#80827f]">Your digital completion certificates are ready for verification and download in your student portal.</p>
          </div>
        </div>
        <Link
          href="/profile/certificates"
          className="px-5 py-2.5 rounded-[50px] bg-[#2c2e2a] text-white hover:bg-[#1a1a1a] text-xs font-semibold transition shrink-0 shadow-xs"
        >
          View My Certificates →
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <LoadingSpinner />
        </div>
      ) : pastPrograms.length === 0 ? (
        <div className="text-center py-20 bg-[#ffffff] border border-[#d5d5d4] rounded-3xl p-10 max-w-xl mx-auto space-y-3 shadow-xs">
          <CheckCircle2 className="w-12 h-12 mx-auto text-[#80827f]" />
          <h3 className="text-xl font-bold text-[#2c2e2a]">No Archived Events Found</h3>
          <p className="text-xs text-[#80827f]">All chapter events conducted will be archived here along with resources and certificate verifications.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-[#d5d5d4]">
            <span className="text-xs font-mono text-[#80827f]">
              Showing {pastPrograms.length} concluded event{pastPrograms.length > 1 ? "s" : ""}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastPrograms.map((program, index) => (
              <div key={program.slug} className="relative group opacity-90 hover:opacity-100 transition">
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
