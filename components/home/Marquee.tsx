"use client";

import { motion } from "framer-motion";

export default function Marquee() {
    const items = [
        "BUILD WITH AI",
        "CLOUD RUN",
        "FLUTTER & DART",
        "GEMINI API",
        "KUBERNETES",
        "ANDROID JETPACK",
        "FIREBASE",
        "TENSORFLOW",
        "OPEN INNOVATION",
        "GOOGLE DEVELOPER GROUPS",
    ];

    return (
        <section className="py-6 border-y border-white/[0.08] bg-[#18191b]/40 backdrop-blur-sm overflow-hidden select-none">
            <div className="flex animate-marquee">
                <div className="flex items-center gap-10 whitespace-nowrap pr-10">
                    {items.concat(items).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-10">
                            <span className="text-xs sm:text-sm font-mono font-bold tracking-widest text-gray-400 hover:text-white transition-colors">
                                {item}
                            </span>
                            <span className="h-1.5 w-1.5 rounded-full bg-[#4285F4]/60" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
