"use client";

import { motion } from "framer-motion";
import { Cpu, Cloud, Smartphone, Sparkles, ArrowUpRight } from "lucide-react";
import Link from "next/link";

const TRACKS = [
    {
        id: "ai_ml",
        name: "AI & Machine Learning",
        desc: "Gemini API, Vertex AI, TensorFlow, neural architectures, and intelligent autonomous agents.",
        tag: "Gemini / AI",
        color: "#4285F4",
        borderHover: "hover:border-[#4285F4]/40",
        icon: Sparkles,
    },
    {
        id: "cloud",
        name: "Cloud & Distributed Systems",
        desc: "Google Cloud Platform, serverless Cloud Run, container clusters, and scalable architectures.",
        tag: "GCP / DevOps",
        color: "#34A853",
        borderHover: "hover:border-[#34A853]/40",
        icon: Cloud,
    },
    {
        id: "mobile_web",
        name: "Android & Web Platform",
        desc: "Flutter multiplatform, modern Android with Jetpack Compose, Next.js, and Chrome web standards.",
        tag: "Flutter / Android",
        color: "#FBBC04",
        borderHover: "hover:border-[#FBBC04]/40",
        icon: Smartphone,
    },
    {
        id: "open_source",
        name: "Open Source & Ecosystem",
        desc: "Collaborative developer tooling, community libraries, hackathons, and public contributions.",
        tag: "Community / OSS",
        color: "#EA4335",
        borderHover: "hover:border-[#EA4335]/40",
        icon: Cpu,
    },
];

export default function Tracks() {
    return (
        <section className="py-24 px-4 sm:px-6 max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-gray-400 mb-4">
                        <span>// LEARNING PATHS</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
                        Ecosystem Tracks
                    </h2>
                    <p className="text-gray-400 mt-2 max-w-lg text-sm sm:text-base">
                        Engineered to transition students and builders from code consumers to active architects.
                    </p>
                </div>
                <Link
                    href="/programs"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/70 hover:text-white border-b border-white/20 pb-0.5 transition-colors"
                >
                    <span>View all events & workshops</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {TRACKS.map((track, i) => {
                    const Icon = track.icon;
                    return (
                        <motion.div
                            key={track.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className={`p-6 rounded-2xl bg-[#18191b] border border-white/[0.08] ${track.borderHover} transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1`}
                        >
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center border"
                                        style={{
                                            backgroundColor: `${track.color}15`,
                                            borderColor: `${track.color}30`,
                                            color: track.color,
                                        }}
                                    >
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-gray-400">
                                        {track.tag}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-white tracking-tight mb-2 group-hover:text-white transition-colors">
                                    {track.name}
                                </h3>
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    {track.desc}
                                </p>
                            </div>

                            <div className="pt-8 flex items-center gap-2 text-xs font-medium text-gray-500 group-hover:text-gray-300 transition-colors">
                                <span>Learn track</span>
                                <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
}
