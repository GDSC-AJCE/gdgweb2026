"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Images } from "lucide-react";

export default function Memories() {
    return (
        <section className="py-24 px-4 sm:px-6 max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                {/* Left Text */}
                <div className="lg:w-1/2 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-gray-400">
                        <Images className="w-3.5 h-3.5 text-[#FBBC04]" />
                        <span>// CULTURE & COMMUNITY</span>
                    </div>

                    <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
                        Moments engineered <br />
                        <span className="bg-gradient-to-r from-[#4285F4] to-[#34A853] bg-clip-text text-transparent">
                            through collaboration.
                        </span>
                    </h2>

                    <p className="text-sm sm:text-base text-gray-400 leading-relaxed max-w-lg">
                        From campus dev fests to weekend hackathons, midnight debugging sprints, and keynotes, every gathering reinforces our bond as builders.
                    </p>

                    <div className="pt-2">
                        <Link
                            href="/gallery"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white text-xs font-semibold tracking-wide transition-all group"
                        >
                            <span>Browse Chapter Gallery</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#4285F4]" />
                        </Link>
                    </div>
                </div>

                {/* Right Visual Deck */}
                <div className="lg:w-1/2 relative h-[380px] w-full flex justify-center items-center">
                    <div className="absolute inset-0 bg-[#4285F4]/10 blur-[100px] rounded-full pointer-events-none" />

                    <motion.div
                        initial={{ rotate: -5, y: 10, opacity: 0 }}
                        whileInView={{ rotate: -5, y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        whileHover={{ scale: 1.05, rotate: 0, zIndex: 20 }}
                        className="absolute left-4 top-8 w-52 sm:w-60 h-72 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#18191b]"
                    >
                        <div className="w-full h-full bg-gradient-to-br from-[#4285F4]/20 via-[#18191b] to-black flex flex-col justify-end p-5">
                            <span className="text-[10px] font-mono text-[#4285F4]">DevFest Keynote</span>
                            <h4 className="text-xs font-bold text-white mt-1">Keynote & AI Demos</h4>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ rotate: 4, y: -10, opacity: 0 }}
                        whileInView={{ rotate: 4, y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        whileHover={{ scale: 1.05, rotate: 0, zIndex: 20 }}
                        className="absolute right-4 bottom-6 w-52 sm:w-60 h-72 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#18191b]"
                    >
                        <div className="w-full h-full bg-gradient-to-br from-[#34A853]/20 via-[#18191b] to-black flex flex-col justify-end p-5">
                            <span className="text-[10px] font-mono text-[#34A853]">Study Jams</span>
                            <h4 className="text-xs font-bold text-white mt-1">Cloud Architecture Labs</h4>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
