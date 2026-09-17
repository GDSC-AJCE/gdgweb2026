"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, query, where, collection, getDocs, limit } from "firebase/firestore";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
    FaGithub, FaLinkedin, FaInstagram, FaTwitter, FaBehance, 
    FaDribbble, FaGlobe, FaYoutube 
} from "react-icons/fa";
import { 
    ArrowLeft as ArrowLeftIcon, 
    Globe as GlobeAltIcon, 
    Sparkles as SparklesIcon, 
    User as UserCircleIcon 
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CreativeProfileAvatar from "@/components/ui/CreativeProfileAvatar";

import { 
    SiReact, SiNextdotjs, SiTailwindcss, SiTypescript, SiJavascript, 
    SiPython, SiNodedotjs, SiFirebase, SiPostgresql, SiFigma, 
    SiDocker, SiPrisma, SiRust, SiGo, SiCplusplus, SiC,
    SiGraphql, SiMongodb, SiGooglecloud, SiFlutter, SiAndroid
} from "react-icons/si";
import LoadingSpinner from "@/components/LoadingSpinner";

const SOCIAL_ICONS: Record<string, { icon: React.ElementType; label: string }> = {
    github: { icon: FaGithub, label: "GitHub" },
    linkedin: { icon: FaLinkedin, label: "LinkedIn" },
    instagram: { icon: FaInstagram, label: "Instagram" },
    twitter: { icon: FaTwitter, label: "Twitter" },
    behance: { icon: FaBehance, label: "Behance" },
    dribbble: { icon: FaDribbble, label: "Dribbble" },
    youtube: { icon: FaYoutube, label: "YouTube" },
};

const TECH_ICONS: Record<string, React.ElementType> = {
    react: SiReact,
    nextjs: SiNextdotjs,
    next: SiNextdotjs,
    tailwind: SiTailwindcss,
    tailwindcss: SiTailwindcss,
    typescript: SiTypescript,
    js: SiJavascript,
    javascript: SiJavascript,
    python: SiPython,
    node: SiNodedotjs,
    nodejs: SiNodedotjs,
    firebase: SiFirebase,
    postgres: SiPostgresql,
    postgresql: SiPostgresql,
    figma: SiFigma,
    docker: SiDocker,
    prisma: SiPrisma,
    rust: SiRust,
    go: SiGo,
    golang: SiGo,
    cpp: SiCplusplus,
    "c++": SiCplusplus,
    c: SiC,
    graphql: SiGraphql,
    mongodb: SiMongodb,
    gcp: SiGooglecloud,
    googlecloud: SiGooglecloud,
    flutter: SiFlutter,
    android: SiAndroid,
};

export default function TeamMemberClient({ username }: { username: string }) {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (!username) return;
        const fetchProfile = async () => {
            try {
                const q = query(
                    collection(db, "coreProfiles"), 
                    where("username", "==", username.toLowerCase().trim()),
                    limit(1)
                );
                const querySnap = await getDocs(q);
                
                if (!querySnap.empty) {
                    setProfile(querySnap.docs[0].data());
                } else {
                    const directDocRef = doc(db, "coreProfiles", username);
                    const directDocSnap = await getDoc(directDocRef);
                    if (directDocSnap.exists()) {
                        setProfile(directDocSnap.data());
                    }
                }
            } catch (e) {
                console.error("Error fetching profile:", e);
            }
            setLoading(false);
        };
        fetchProfile();
    }, [username]);

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    if (loading) {
        return <LoadingSpinner text="Retrieving organizer credentials..." />;
    }

    if (!profile) {
        return (
            <main className="min-h-screen text-[#2c2e2a] flex items-center justify-center p-6 relative">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-[#ffffff] border border-[#d5d5d4] flex items-center justify-center shadow-xs">
                        <UserCircleIcon className="w-10 h-10 text-[#80827f]" />
                    </div>
                    <h1 className="text-4xl font-bold mb-3 tracking-tight text-[#2c2e2a]">Organizer Not Found</h1>
                    <p className="text-[#80827f] mb-8 text-sm">
                        No Google Developer Groups organizer registered under <span className="text-[#4285F4] font-mono">@{username}</span>
                    </p>
                    <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-[50px] bg-[#2c2e2a] text-white font-semibold text-xs hover:bg-[#1a1a1a] transition shadow-xs">
                        <ArrowLeftIcon className="w-4 h-4" /> Back to Home
                    </Link>
                </motion.div>
            </main>
        );
    }

    const { 
        displayName, bio, avatarUrl, bannerUrl, motto,
        socialLinks = [], customLinks = [], batchYears = [], 
        cardBgColor, cardFgColor, skills, nowSection, bgPattern,
        featuredProjects = [], widgets = []
    } = profile;

    const uname = profile.username || username;
    const bgColor = cardBgColor || "#4285F4";

    const allSocials = [
        ...socialLinks.filter((l: any) => l.platform && l.url).map((l: any) => ({
            icon: SOCIAL_ICONS[l.platform]?.icon || FaGlobe,
            label: SOCIAL_ICONS[l.platform]?.label || l.platform,
            url: l.url,
        })),
        ...customLinks.filter((l: any) => l.url?.trim() && l.label?.trim()).map((l: any) => ({
            icon: FaGlobe, label: l.label, url: l.url,
        })),
    ];

    return (
        <main className="min-h-screen text-[#2c2e2a] flex items-start justify-center p-3 pt-28 sm:p-6 sm:pt-32 lg:p-10 lg:pt-36 relative overflow-hidden pb-32">
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 w-full max-w-6xl rounded-3xl overflow-hidden border border-[#d5d5d4] bg-[#ffffff] shadow-xs group/card"
                onMouseMove={handleMouseMove}
            >
                {/* Dynamic radial glow on cursor */}
                <div 
                    className="absolute inset-0 z-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 pointer-events-none"
                    style={{ background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, ${bgColor}15, transparent 50%)` }}
                />

                {/* Banner Section */}
                <div className="relative w-full h-48 sm:h-64 lg:h-72 overflow-hidden z-[2]">
                    {bannerUrl ? (
                        <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-[#BAE6FD] via-[#D6C7FF] to-[#FED7AA] relative overflow-hidden flex items-center justify-center">
                            {/* Storybook Google Labs shapes in banner */}
                            <div className="absolute inset-0 opacity-40 mix-blend-multiply flex items-center justify-around pointer-events-none">
                                <div className="w-32 h-32 rounded-full bg-[#8ED462] -translate-y-6 blur-xs" />
                                <div className="w-40 h-40 rounded-[40px] bg-[#FBBC04] translate-y-8 blur-xs" />
                                <div className="w-36 h-36 rounded-full bg-[#FF705D] -translate-y-4 blur-xs" />
                                <div className="w-48 h-48 rounded-[50px] bg-[#4285F4] translate-y-12 blur-xs" />
                            </div>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#ffffff] via-transparent to-black/10" />
                </div>

                <div className="relative z-10 flex flex-col p-6 sm:p-10 lg:p-12 mt-[-4rem] sm:mt-[-5rem]">
                    {/* Top Identity bar */}
                    <div className="flex flex-col sm:flex-row items-end sm:items-start justify-between gap-6 mb-12">
                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-6 w-full">
                            <motion.div
                                className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl overflow-hidden border-4 shadow-md shrink-0 z-20 relative bg-[#f5f1e4]"
                                style={{ borderColor: bgColor }}
                            >
                                <CreativeProfileAvatar
                                    src={avatarUrl}
                                    name={displayName}
                                    size="custom"
                                    showBorder={false}
                                    className="w-full h-full rounded-2xl"
                                />
                            </motion.div>

                            <div className="flex flex-col gap-2 text-right sm:text-left flex-1 min-w-0">
                                <div className="flex items-center justify-end sm:justify-start gap-3 flex-wrap">
                                    <h1 className="font-extrabold tracking-tight text-3xl sm:text-4xl lg:text-5xl truncate text-[#2c2e2a]">
                                        {displayName}
                                    </h1>
                                    {batchYears.length > 0 && (
                                        <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest bg-[#f5f1e4] text-[#2c2e2a] border border-[#d5d5d4]">
                                            Batch {batchYears[0]}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center justify-end sm:justify-start gap-3 text-[#80827f]">
                                    <span className="font-mono text-sm tracking-wide text-[#4285F4] font-semibold">@{uname}</span>
                                    <span className="w-1 h-1 rounded-full bg-[#d5d5d4]" />
                                    <span className="text-xs uppercase font-mono tracking-widest text-[#80827f]">GDG Organizer & Core</span>
                                </div>
                                {motto && (
                                    <p className="mt-1 text-sm italic text-[#80827f]">
                                        "{motto}"
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="flex items-center gap-2.5 flex-wrap">
                            {allSocials.map((social, i) => {
                                const Icon = social.icon;
                                return (
                                    <a 
                                        key={i} 
                                        href={social.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="w-10 h-10 rounded-2xl flex items-center justify-center border border-[#d5d5d4] bg-[#f5f1e4] hover:bg-[#e0dbce] text-[#2c2e2a] transition-all hover:scale-105 shadow-2xs"
                                        title={social.label}
                                    >
                                        <Icon className="w-4 h-4" />
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    {/* Bio & Information Grid */}
                    <div className="flex flex-col lg:flex-row gap-12">
                        <div className="flex-1 space-y-10">
                            <div className="space-y-4">
                                <span className="text-[11px] uppercase tracking-[0.2em] font-mono text-[#80827f] font-bold">Biography</span>
                                <div className="prose max-w-none text-[#2c2e2a] text-sm leading-relaxed">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{bio || "This organizer has not written a public bio yet."}</ReactMarkdown>
                                </div>
                            </div>

                            {nowSection && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <SparklesIcon className="w-4 h-4 text-[#FBBC04]" />
                                        <span className="text-[11px] uppercase tracking-[0.2em] font-mono text-[#80827f] font-bold">Current Focus & Projects</span>
                                    </div>
                                    <div className="p-6 rounded-3xl bg-[#f5f1e4] border border-[#d5d5d4] text-[#2c2e2a] text-sm leading-relaxed">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{nowSection}</ReactMarkdown>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column: Widgets & Skills */}
                        <div className="w-full lg:w-[380px] shrink-0 space-y-8">
                            {skills && (
                                <div className="space-y-4">
                                    <span className="text-[11px] uppercase tracking-[0.2em] font-mono text-[#80827f] font-bold">Expertise & Technologies</span>
                                    <div className="flex flex-wrap gap-2.5 p-5 rounded-3xl bg-[#f5f1e4] border border-[#d5d5d4]">
                                        {skills.split(',').map((s: any) => s.trim()).filter(Boolean).map((s: string, idx: number) => {
                                            const normalized = s.toLowerCase().replace(/[^a-z0-9]/g, '');
                                            const Icon = TECH_ICONS[normalized] || TECH_ICONS[s.toLowerCase()];
                                            return (
                                                <div 
                                                    key={idx} 
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ffffff] border border-[#d5d5d4] text-xs font-mono text-[#2c2e2a] shadow-2xs"
                                                >
                                                    {Icon && <Icon className="w-3.5 h-3.5 text-[#4285F4]" />}
                                                    <span>{s}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Widgets */}
                            {widgets.map((widget: any, i: number) => (
                                <div key={i} className="space-y-4">
                                    {widget.type === 'quote' && widget.data?.text && (
                                        <div className="p-6 rounded-3xl bg-[#f5f1e4] border border-[#d5d5d4] relative overflow-hidden">
                                            <p className="text-sm font-medium italic text-[#2c2e2a] mb-3">"{widget.data.text}"</p>
                                            {widget.data.author && (
                                                <p className="text-[11px] font-mono text-[#80827f] uppercase tracking-widest text-right">— {widget.data.author}</p>
                                            )}
                                        </div>
                                    )}

                                    {widget.type === 'spotify' && widget.data?.url && (
                                        <div className="p-4 rounded-3xl bg-[#f5f1e4] border border-[#d5d5d4]">
                                            <span className="text-[10px] font-mono uppercase tracking-widest text-[#80827f] block mb-2">Playlist / Theme</span>
                                            <iframe 
                                                style={{ borderRadius: "16px" }} 
                                                src={`https://open.spotify.com/embed/${widget.data.url.split('.com/')[1]?.split('?')[0]}?utm_source=generator&theme=0`} 
                                                width="100%" 
                                                height="152" 
                                                frameBorder="0" 
                                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Featured Projects */}
                    {featuredProjects.length > 0 && (
                        <div className="mt-16 pt-12 border-t border-[#d5d5d4] space-y-6">
                            <div className="flex items-center gap-2">
                                <GlobeAltIcon className="w-4 h-4 text-[#34A853]" />
                                <span className="text-[11px] uppercase tracking-[0.2em] font-mono text-[#80827f] font-bold">Featured Projects & Open Source</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {featuredProjects.map((proj: any, i: number) => (
                                    <a 
                                        key={i} 
                                        href={proj.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="group p-5 rounded-3xl bg-[#f5f1e4] border border-[#d5d5d4] hover:border-[#4285F4] transition-all hover:scale-[1.01]"
                                    >
                                        {proj.imageUrl && (
                                            <div className="w-full aspect-video rounded-2xl overflow-hidden bg-[#e0dbce] mb-4 border border-[#d5d5d4]">
                                                <img src={proj.imageUrl} alt={proj.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            </div>
                                        )}
                                        <h3 className="font-bold text-[#2c2e2a] text-base mb-1 group-hover:text-[#4285F4] transition-colors">{proj.title}</h3>
                                        <p className="text-xs text-[#80827f] line-clamp-2">{proj.description}</p>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between mt-16 pt-6 border-t border-[#d5d5d4]">
                        <Link href="/" className="inline-flex items-center gap-2 text-xs font-mono text-[#80827f] hover:text-[#2c2e2a] transition">
                            <ArrowLeftIcon className="w-3.5 h-3.5" /> Back to GDG Community
                        </Link>
                    </div>
                </div>
            </motion.div>
        </main>
    );
}
