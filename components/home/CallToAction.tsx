"use client";

import { motion } from "framer-motion";
import MagneticButton from "@/components/MagneticButton";
import { ArrowRight, Sparkles } from "lucide-react";

interface CallToActionProps {
    onApply?: () => void;
}

export default function CallToAction({ onApply }: CallToActionProps) {
    return (
        <section className="py-28 px-4 sm:px-6 relative text-center overflow-hidden border-t border-white/[0.08]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#4285F4]/10 rounded-full blur-[140px] pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md">
                    <Sparkles className="w-3.5 h-3.5 text-[#FBBC04]" />
                    <span className="text-xs font-mono text-gray-300">
                        Join the Core Leadership & Organizing Crew
                    </span>
                </div>

                <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold text-white tracking-tight leading-tight">
                    Shape the chapter. <br />
                    <span className="bg-gradient-to-r from-[#4285F4] via-[#EA4335] to-[#FBBC04] bg-clip-text text-transparent">
                        Leave your imprint.
                    </span>
                </h2>

                <p className="text-sm sm:text-base text-gray-400 max-w-xl mx-auto leading-relaxed">
                    Lead tracks, organize hackathons, coordinate speakers, mentor peers, and elevate our developer community to international acclaim.
                </p>

                <div className="pt-4 flex justify-center">
                    <MagneticButton>
                        <button
                            onClick={onApply}
                            className="px-8 py-4 bg-white text-black font-semibold text-sm rounded-full hover:bg-gray-100 transition-all shadow-xl hover:shadow-white/10 flex items-center gap-2 group"
                        >
                            <span>Apply for Execom Leadership</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </MagneticButton>
                </div>
            </div>
        </section>
    );
}
