"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { SparklesIcon, ArrowTopRightOnSquareIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import GoogleLabsMemberCard from "@/components/cards/GoogleLabsMemberCard";
import { GDG_EXECOM_2026, GDG_ALUMNI_2025, GDG_ALUMNI_2024, ExecomMember } from "@/lib/data/TeamData";

export default function AboutPage() {
    const [activeTab, setActiveTab] = useState<string>("2026");
    const [coreMembers, setCoreMembers] = useState<ExecomMember[]>(GDG_EXECOM_2026);

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const snap = await getDocs(collection(db, "coreProfiles"));
                if (!snap.empty) {
                    const fetchedMap = new Map<string, ExecomMember>();
                    snap.docs.forEach(d => {
                        const data = d.data();
                        const socials = (data.socialLinks as Array<{ platform?: string; url?: string }>) || [];
                        const liSocial = socials.find(s => s.platform?.toLowerCase() === "linkedin")?.url;
                        const ghSocial = socials.find(s => s.platform?.toLowerCase() === "github")?.url;

                        const member: ExecomMember = {
                            id: d.id,
                            name: data.name || "GDG Member",
                            role: data.role || "Core Lead",
                            team: data.team || undefined,
                            track: data.track || "Google Technologies",
                            image: data.photoURL || data.avatarUrl || data.image || null,
                            username: data.username || d.id,
                            dept: data.dept || "CSE",
                            year: data.year || "2026",
                            email: data.email || undefined,
                            linkedin: data.linkedin || liSocial || undefined,
                            github: data.github || ghSocial || undefined,
                            sortOrder: typeof data.sortOrder === "number" ? data.sortOrder : undefined,
                        };

                        const key = (member.email || member.username || member.name).toLowerCase().replace(/[^a-z0-9]/g, "");
                        if (fetchedMap.has(key)) {
                            const existing = fetchedMap.get(key)!;
                            fetchedMap.set(key, {
                                ...existing,
                                ...member,
                                id: member.id || existing.id,
                                sortOrder: typeof member.sortOrder === "number" ? member.sortOrder : existing.sortOrder,
                            });
                        } else {
                            fetchedMap.set(key, member);
                        }
                    });

                    // Merge with local team data
                    const merged = Array.from(fetchedMap.values()).map(f => {
                        const local = GDG_EXECOM_2026.find(
                            m => m.name.toLowerCase() === f.name.toLowerCase() || m.username?.toLowerCase() === f.username?.toLowerCase() || (m.email && f.email && m.email.toLowerCase() === f.email.toLowerCase())
                        );
                        return local
                            ? {
                                ...local,
                                ...f,
                                image: f.image || local.image,
                                linkedin: f.linkedin || local.linkedin,
                                github: f.github || local.github,
                                team: f.team || local.team,
                                role: f.role || local.role,
                                track: f.track || local.track,
                                year: f.year || local.year || "2026",
                                sortOrder: typeof f.sortOrder === "number" ? f.sortOrder : local.sortOrder,
                              }
                            : f;
                    });
                    
                    // Ensure all official 2025-26 members are retained
                    const finalTeam = [...merged];
                    GDG_EXECOM_2026.forEach(local => {
                        const localKey = (local.email || local.username || local.name).toLowerCase().replace(/[^a-z0-9]/g, "");
                        if (!fetchedMap.has(localKey)) {
                            finalTeam.push(local);
                        }
                    });
                    
                    // Also include 2025 and 2024 alumni so they can be merged if they exist in firestore
                    GDG_ALUMNI_2025.forEach(local => {
                        if (!finalTeam.some(m => m.name.toLowerCase() === local.name.toLowerCase() || m.username?.toLowerCase() === local.username?.toLowerCase())) {
                            finalTeam.push({...local, year: "2025"});
                        }
                    });
                    
                    GDG_ALUMNI_2024.forEach(local => {
                        if (!finalTeam.some(m => m.name.toLowerCase() === local.name.toLowerCase() || m.username?.toLowerCase() === local.username?.toLowerCase())) {
                            finalTeam.push({...local, year: "2024"});
                        }
                    });

                    const cleanTeam = finalTeam.filter(
                        m => (m.email || "").toLowerCase().trim() !== "dsc@amaljyothi.ac.in"
                    );

                    // Sort by sortOrder
                    cleanTeam.sort((a, b) => {
                        const orderA = typeof a.sortOrder === "number" ? a.sortOrder : 9999;
                        const orderB = typeof b.sortOrder === "number" ? b.sortOrder : 9999;
                        if (orderA !== orderB) return orderA - orderB;
                        return a.name.localeCompare(b.name);
                    });

                    if (cleanTeam.length > 0) {
                        setCoreMembers(cleanTeam);
                    }
                } else {
                    // Fallback to local data
                    const localData = [
                        ...GDG_EXECOM_2026.map(m => ({...m, year: "2026"})),
                        ...GDG_ALUMNI_2025.map(m => ({...m, year: "2025"})),
                        ...GDG_ALUMNI_2024.map(m => ({...m, year: "2024"}))
                    ];
                    setCoreMembers(localData);
                }
            } catch (err) {
                console.error("Failed to fetch team:", err);
            }
        };
        fetchTeam();
    }, []);

    return (
        <main className="min-h-screen text-[#2c2e2a] relative overflow-hidden pb-32 select-none">
            <section className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 pt-12 sm:pt-16">
                {/* Hero Header */}
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-[50px] bg-[#ffffff] border border-[#d5d5d4] text-[13px] font-medium text-[#2c2e2a] shadow-xs">
                        <SparklesIcon className="w-3.5 h-3.5 text-[#ffd600]" />
                        <span>About GDG AJCE</span>
                    </div>
                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-medium text-[#2c2e2a] tracking-[-0.04em] leading-[1.05]">
                        Build solutions using Google technology.
                    </h1>
                    <p className="text-[17px] text-[#80827f] leading-relaxed max-w-2xl mx-auto">
                        Build solutions using Google technology for regional companies and communities while networking and learning with other aspiring developers.
                    </p>
                </div>

                {/* Community Description Banner */}
                <div className="p-8 sm:p-10 rounded-[36px] bg-[#ffffff] border border-[#e5e1d5] shadow-xs mb-16 max-w-4xl mx-auto text-center space-y-4">
                    <span className="text-xs font-mono text-[#2ba0ff] font-bold uppercase tracking-wider">Who We Are</span>
                    <p className="text-base sm:text-lg text-[#2c2e2a] leading-relaxed">
                        We are a collection of tech enthusiasts interested in learning about technology, sharing expertise, and collaborating to create something to enhance the future. We hold talks, workshops, and other events on a variety of tech-related topics to help you learn more about technology. With weekly activities that are filled with knowledge that is typically not taught within the four walls of a classroom, we teach computer enthusiasts the fundamental learning skills they need to succeed.
                    </p>
                    <div className="pt-2 flex flex-wrap justify-center gap-3">
                        <a
                            href="https://gdsc.community.dev/amal-jyothi-college-of-engineering-kanjirappally"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-[50px] bg-[#2c2e2a] text-white text-xs font-semibold hover:bg-[#1a1a1a] transition-all shadow-xs cursor-pointer"
                        >
                            <span>Official Chapter Page</span>
                            <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                        </a>
                        <a
                            href="https://chat.whatsapp.com/I283WPrqz0yGAfmqL1Bb8o"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-[50px] bg-[#ffffff] border border-[#d5d5d4] text-[#2c2e2a] text-xs font-semibold hover:bg-[#f5f1e4] transition-all shadow-xs cursor-pointer"
                        >
                            <span>Join WhatsApp Community</span>
                        </a>
                    </div>
                </div>

                {/* Core Three Pillars from content.md */}
                <div className="mb-24">
                    <div className="text-center mb-10 space-y-2">
                        <h2 className="text-2xl sm:text-3xl font-medium text-[#2c2e2a] tracking-tight">Our Core Pillars</h2>
                        <p className="text-sm text-[#80827f]">How we empower developers on campus at Amal Jyothi</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-7 sm:p-8 rounded-[36px] bg-[#ffffff] border border-[#e5e1d5] shadow-xs space-y-3">
                            <span className="text-xs font-mono text-[#2ba0ff] font-bold">01 // CONNECT</span>
                            <h3 className="text-xl font-medium text-[#2c2e2a] tracking-tight">Meet & Collaborate</h3>
                            <p className="text-sm text-[#80827f] leading-relaxed">
                                Meet pupils at your institution or university who are enthusiastic about developer tools. Everyone is invited, regardless of their academic specialisation.
                            </p>
                        </div>

                        <div className="p-7 sm:p-8 rounded-[36px] bg-[#ffffff] border border-[#e5e1d5] shadow-xs space-y-3">
                            <span className="text-xs font-mono text-[#8ed462] font-bold">02 // LEARN</span>
                            <h3 className="text-xl font-medium text-[#2c2e2a] tracking-tight">Acquire Practical Skills</h3>
                            <p className="text-sm text-[#80827f] leading-relaxed">
                                Through practical seminars, events, lectures, and project-building activities, you can learn about a variety of technical subjects and acquire new skills.
                            </p>
                        </div>

                        <div className="p-7 sm:p-8 rounded-[36px] bg-[#ffffff] border border-[#e5e1d5] shadow-xs space-y-3">
                            <span className="text-xs font-mono text-[#ff705d] font-bold">03 // GROW</span>
                            <h3 className="text-xl font-medium text-[#2c2e2a] tracking-tight">Solve Real Problems</h3>
                            <p className="text-sm text-[#80827f] leading-relaxed">
                                Build excellent solutions to neighbourhood issues using new knowledge. Expand your network and job opportunities. Help others learn as a way to give back to your neighbourhood.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Team Hierarchy & Showcase */}
                <div id="execom" className="mb-24 scroll-mt-24">
                    <div className="text-center mb-12 space-y-3">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-[50px] bg-[#ffffff] border border-[#d5d5d4] text-[13px] font-medium text-[#2c2e2a] shadow-xs">
                            <span className="w-2 h-2 rounded-full bg-[#ff705d]" />
                            <span>Chapter Leadership & Execom</span>
                        </div>
                        <h2 className="text-3xl sm:text-5xl font-medium text-[#2c2e2a] tracking-[-0.035em]">Executive Committee & Leads</h2>
                        <p className="text-sm sm:text-base text-[#80827f] max-w-2xl mx-auto">
                            The passionate student organizers, track architects, and community leads driving our workshops and initiatives.
                        </p>
                        
                        {/* Year Pills */}
                        <div className="flex justify-center gap-2 pt-4 flex-wrap">
                            {Array.from(new Set(["2026", "2025", "2024", ...coreMembers.map(m => m.year || "2026")]))
                                .sort((a, b) => b.localeCompare(a))
                                .map((yearKey) => {
                                    const label =
                                        yearKey === "2026"
                                            ? "Cohort 2025-26"
                                            : yearKey === "2025"
                                            ? "Alumni 2024-25"
                                            : yearKey === "2024"
                                            ? "Alumni 2023-24"
                                            : `Alumni ${parseInt(yearKey) - 1 || yearKey}-${yearKey.slice(-2)}`;
                                    return (
                                        <button
                                            key={yearKey}
                                            onClick={() => setActiveTab(yearKey)}
                                            className={`px-5 py-2 rounded-[50px] text-xs font-medium transition-all cursor-pointer ${
                                                activeTab === yearKey
                                                    ? "bg-[#2c2e2a] text-white shadow-xs"
                                                    : "bg-[#ffffff] text-[#2c2e2a] hover:bg-[#eae5d7] border border-[#d5d5d4]"
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    );
                                })}
                        </div>
                    </div>

                    {/* Team Members Grid */}
                    {coreMembers.filter(m => (m.year || "2026") === activeTab).length === 0 ? (
                        <div className="p-12 rounded-[32px] bg-white border border-[#e5e1d5] text-center space-y-2 max-w-md mx-auto">
                            <p className="text-sm font-semibold text-[#2c2e2a]">No profiles found for this cohort</p>
                            <p className="text-xs text-[#80827f]">Past roster records for this cohort will appear here once uploaded.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {coreMembers.filter(m => (m.year || "2026") === activeTab).map((member, idx) => (
                                <GoogleLabsMemberCard
                                    key={member.id || member.username || idx}
                                    member={member}
                                    index={idx}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Frequently Asked Questions from content.md */}
                <div className="mb-24 max-w-4xl mx-auto">
                    <div className="text-center mb-12 space-y-3">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-[50px] bg-[#ffffff] border border-[#d5d5d4] text-[13px] font-medium text-[#2c2e2a] shadow-xs">
                            <QuestionMarkCircleIcon className="w-3.5 h-3.5 text-[#4285F4]" />
                            <span>Frequently Asked Questions</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-medium text-[#2c2e2a] tracking-tight">Questions you might have and their answers</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="p-6 sm:p-7 rounded-[32px] bg-[#ffffff] border border-[#e5e1d5] shadow-xs space-y-2">
                            <h3 className="text-lg font-medium text-[#2c2e2a]">What is GDSC / GDG on Campus?</h3>
                            <p className="text-sm text-[#80827f] leading-relaxed">
                                Google Developer Student Clubs (now Google Developer Groups on Campus) are university-based community groups for students interested in Google developer technologies. Students from all undergraduate or postgraduate programs with an interest in growing as a developer can join.
                            </p>
                        </div>

                        <div className="p-6 sm:p-7 rounded-[32px] bg-[#ffffff] border border-[#e5e1d5] shadow-xs space-y-2">
                            <h3 className="text-lg font-medium text-[#2c2e2a]">What are the benefits of joining?</h3>
                            <p className="text-sm text-[#80827f] leading-relaxed">
                                <strong>Professional growth:</strong> Access to technical expertise, workshops, and community management training.<br />
                                <strong>Network growth:</strong> Access to a global network of student leaders, professional community organizers, and industry experts.
                            </p>
                        </div>

                        <div className="p-6 sm:p-7 rounded-[32px] bg-[#ffffff] border border-[#e5e1d5] shadow-xs space-y-2">
                            <h3 className="text-lg font-medium text-[#2c2e2a]">Is it only for students in computer science?</h3>
                            <p className="text-sm text-[#80827f] leading-relaxed">
                                No! Students from all programs and departments who are interested in growing as a developer or designer can join GDG.
                            </p>
                        </div>

                        <div className="p-6 sm:p-7 rounded-[32px] bg-[#ffffff] border border-[#e5e1d5] shadow-xs space-y-2">
                            <h3 className="text-lg font-medium text-[#2c2e2a]">How do I join GDG AJCE and is it free?</h3>
                            <p className="text-sm text-[#80827f] leading-relaxed">
                                You can join GDG AJCE by joining our official chapter platform or WhatsApp community, and it is 100% free of cost.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Chapter Information & Contact Box */}
                <div className="p-8 sm:p-10 rounded-[36px] bg-[#ffffff] border border-[#d5d5d4] shadow-xs max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-2 text-center md:text-left">
                        <h3 className="text-xl font-medium text-[#2c2e2a]">Get in touch with the Chapter</h3>
                        <p className="text-sm text-[#80827f]">
                            Amal Jyothi College of Engineering, Kanjirappally, Kerala, India<br />
                            Email: <a href="mailto:dsc@amaljyothi.ac.in" className="text-[#4285F4] hover:underline">dsc@amaljyothi.ac.in</a> · Phone: +91 9778 130 551
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <a
                            href="https://www.instagram.com/gdscajce/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-5 py-2.5 rounded-[50px] bg-[#f5f1e4] hover:bg-[#eae5d7] text-[#2c2e2a] text-xs font-semibold border border-[#d5d5d4] transition shadow-xs cursor-pointer"
                        >
                            Instagram
                        </a>
                        <a
                            href="https://www.linkedin.com/in/gdsc-amal-jyothi-a74979256/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-5 py-2.5 rounded-[50px] bg-[#2c2e2a] hover:bg-[#1a1a1a] text-white text-xs font-semibold transition shadow-xs cursor-pointer"
                        >
                            LinkedIn
                        </a>
                    </div>
                </div>
            </section>
        </main>
    );
}
