"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProgramCard from "@/components/programs/ProgramCard";
import ProgramsNavTabs from "@/components/programs/ProgramsNavTabs";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Calendar, Sparkles } from "lucide-react";

export default function ProgramsClient() {
  const [allPrograms, setAllPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const q = query(collection(db, "events"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
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
              isHidden: data.isHidden || false
            };
          })
          .filter(event => !event.isHidden);
        setAllPrograms(events);
      } catch (e) {
        console.error("Failed to fetch events", e);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const isRegistrationClosed = (registrationLastDate?: string, date?: string) => {
    const now = new Date();
    if (registrationLastDate) {
        const deadline = new Date(registrationLastDate);
        if (!isNaN(deadline.getTime()) && now > deadline) {
            return true;
        }
    }
    if (date) {
        const eventDate = new Date(date);
        if (!isNaN(eventDate.getTime()) && now.getTime() > (eventDate.getTime() + 86400000)) {
            return true;
        }
    }
    return false;
  };

  const activePrograms = allPrograms.filter(p => !isRegistrationClosed(p.registrationLastDate, p.date));
  const closedPrograms = allPrograms.filter(p => isRegistrationClosed(p.registrationLastDate, p.date));
  const hasBoth = activePrograms.length > 0 && closedPrograms.length > 0;

  return (
    <section className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 pb-32 select-none">
      {/* Header */}
      <div className="mb-10 text-center max-w-2xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-[50px] bg-[#ffffff] border border-[#d5d5d4] text-[13px] font-medium text-[#2c2e2a] shadow-xs">
          <Calendar className="w-3.5 h-3.5 text-[#ff705d]" />
          <span>Chapter Initiatives</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-medium text-[#2c2e2a] tracking-[-0.04em] leading-[1.05]">
          Events & Programs
        </h1>
        <p className="text-[16px] text-[#80827f] leading-relaxed">
          From hands-on codelabs to multi-day hackathons and technical symposiums. Register, collaborate, and earn verified credentials.
        </p>
      </div>

      {/* Subnavigation Tabs */}
      <ProgramsNavTabs />

      {loading ? (
        <div className="flex justify-center py-24">
          <LoadingSpinner />
        </div>
      ) : allPrograms.length === 0 ? (
        <div className="text-center py-20 bg-[#ffffff] border border-[#d5d5d4] rounded-[36px] p-12 max-w-xl mx-auto shadow-xs">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#f5f1e4] border border-[#d5d5d4] flex items-center justify-center text-[#ff705d]">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-medium text-[#2c2e2a] mb-2">No Scheduled Events</h3>
          <p className="text-sm text-[#80827f]">We are curating upcoming workshops. Check back soon or apply to become an organizer!</p>
        </div>
      ) : hasBoth ? (
        <div className="space-y-16">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8ed462] animate-pulse" />
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#2c2e2a]">Active Registrations</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activePrograms.map((program, index) => (
                <ProgramCard
                  key={program.slug}
                  title={program.title}
                  description={program.description}
                  slug={program.slug}
                  index={index}
                  posterUrl={program.posterUrl}
                  date={program.date}
                  registrationLastDate={program.registrationLastDate}
                />
              ))}
            </div>
          </div>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#d5d5d4]"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#f5f1e4] px-4 py-1.5 rounded-[50px] border border-[#d5d5d4] text-xs font-medium text-[#80827f] shadow-xs">
                Archived & Concluded Events
              </span>
            </div>
          </div>

          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {closedPrograms.map((program, index) => (
                <ProgramCard
                  key={program.slug}
                  title={program.title}
                  description={program.description}
                  slug={program.slug}
                  index={index}
                  posterUrl={program.posterUrl}
                  date={program.date}
                  registrationLastDate={program.registrationLastDate}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allPrograms.map((program, index) => (
            <ProgramCard
              key={program.slug}
              title={program.title}
              description={program.description}
              slug={program.slug}
              index={index}
              posterUrl={program.posterUrl}
              date={program.date}
              registrationLastDate={program.registrationLastDate}
            />
          ))}
        </div>
      )}
    </section>
  );
}
