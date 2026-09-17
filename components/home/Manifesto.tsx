"use client";

import { motion } from "framer-motion";
import { Terminal, Users, Code, Zap } from "lucide-react";

export default function Manifesto() {
    return (
        <section className="py-28 px-4 sm:px-6 max-w-5xl mx-auto relative z-10">
            <div className="text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-gray-400">
                    <span>// OUR CREED</span>
                </div>
                <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-tight">
                    Beyond lectures. <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4285F4] via-[#34A853] to-[#FBBC04]">
                        Driven by production code.
                    </span>
                </h2>
                <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
                    We believe the most durable technical capability is forged when engineers collaborate, make mistakes, prototype boldly, and ship solutions directly to people.
                </p>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-[#18191b] border border-white/[0.08] space-y-3">
                    <div className="w-9 h-9 rounded-lg bg-[#4285F4]/10 border border-[#4285F4]/20 flex items-center justify-center text-[#4285F4]">
                        <Terminal className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-white tracking-tight">Hands-On Labs</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                        Interactive codelabs and live builds over passive theory. You leave every session with working code pushed to your GitHub repository.
                    </p>
                </div>

                <div className="p-6 rounded-2xl bg-[#18191b] border border-white/[0.08] space-y-3">
                    <div className="w-9 h-9 rounded-lg bg-[#34A853]/10 border border-[#34A853]/20 flex items-center justify-center text-[#34A853]">
                        <Users className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-white tracking-tight">Peer-Led Guilds</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                        No hierarchical barriers. Junior developers pair program with experienced leads, fostering authentic mentorship and reciprocal learning.
                    </p>
                </div>

                <div className="p-6 rounded-2xl bg-[#18191b] border border-white/[0.08] space-y-3">
                    <div className="w-9 h-9 rounded-lg bg-[#EA4335]/10 border border-[#EA4335]/20 flex items-center justify-center text-[#EA4335]">
                        <Zap className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-white tracking-tight">Industry Alignment</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                        From Google Cloud certifications to Solution Challenge hackathons, our initiatives match the real standards of modern software engineering.
                    </p>
                </div>
            </div>
        </section>
    );
}
