"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import GoogleBadge from "@/components/GoogleBadge";
import MagneticButton from "@/components/MagneticButton";
import { ArrowRight, Sparkles, Terminal, Cpu, Globe, Rocket } from "lucide-react";

interface HomeHeroProps {
    onJoin?: () => void;
}

export default function HomeHero({ onJoin }: HomeHeroProps) {
    return (
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 sm:px-6 py-24 overflow-hidden">
            {/* Top Google Labs Pill */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-8"
            >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md hover:border-white/20 transition-all cursor-pointer">
                    <span className="flex h-2 w-2 rounded-full bg-[#4285F4] animate-pulse" />
                    <span className="text-xs font-mono font-medium text-gray-300 tracking-wide">
                        GDG // Experiment, Build, and Connect
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#34A853]/10 text-[#34A853] border border-[#34A853]/20">
                        Active Chapter
                    </span>
                </div>
            </motion.div>

            {/* Main Headline */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="max-w-4xl mx-auto space-y-6"
            >
                <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight text-white leading-[1.05]">
                    Where developers{" "}
                    <span className="inline-block relative">
                        <span className="bg-gradient-to-r from-[#4285F4] via-[#EA4335] to-[#FBBC04] bg-clip-text text-transparent">
                            create
                        </span>
                    </span>{" "}
                    the future.
                </h1>

                <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto font-normal leading-relaxed">
                    A global network of technologists, builders, and designers exploring AI, Cloud, Android, and Web with Google technologies.
                </p>
            </motion.div>

            {/* CTAs */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.25 }}
                className="mt-10 flex flex-wrap items-center justify-center gap-4"
            >
                <MagneticButton>
                    <button
                        onClick={onJoin}
                        className="px-8 py-3.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-gray-100 transition-all shadow-lg hover:shadow-white/10 flex items-center gap-2 group"
                    >
                        <span>Apply for Execom</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                </MagneticButton>

                <Link
                    href="/programs"
                    className="px-8 py-3.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10 hover:border-white/20 font-semibold text-sm transition-all"
                >
                    Explore Events
                </Link>
            </motion.div>

            {/* Quick Metrics Bar */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-10 border-t border-white/[0.08] pt-10 max-w-3xl w-full"
            >
                {[
                    { label: "Community Builders", val: "1,500+" },
                    { label: "Hands-on Workshops", val: "40+" },
                    { label: "Tech Tracks", val: "4 Core" },
                    { label: "Verified Credentials", val: "100%" },
                ].map((stat, i) => (
                    <div key={i} className="text-center">
                        <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-mono">{stat.val}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">{stat.label}</div>
                    </div>
                ))}
            </motion.div>
        </section>
    );
}
