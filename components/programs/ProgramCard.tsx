"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import CreativeEventPoster from "@/components/programs/CreativeEventPoster";

interface ProgramProps {
    slug: string;
    title: string;
    description: string;
    index: number;
    posterUrl?: string;
    date?: string;
    registrationLastDate?: string;
}

export default function ProgramCard({ title, description, slug, index, posterUrl, date, registrationLastDate }: ProgramProps) {
    const isRegistrationClosed = () => {
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

    const closed = isRegistrationClosed();

    return (
        <Link href={`/programs/${slug}`} className="block h-full group select-none">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="h-full flex flex-col bg-[#ffffff] border border-[#d5d5d4] hover:border-[#2c2e2a]/40 rounded-[32px] overflow-hidden hover:-translate-y-1 transition-all group shadow-xs"
            >
                {/* Creative Poster (Uploaded image or Landing Page Storybook vector illustration) */}
                <CreativeEventPoster
                    posterUrl={posterUrl}
                    title={title}
                    category="Event"
                    isClosed={closed}
                    seed={slug || title}
                    aspectRatio="video"
                />

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                    <div className="space-y-2">
                        <h3 className="font-medium text-xl text-[#2c2e2a] tracking-tight line-clamp-1 group-hover:text-[#ff705d] transition-colors">
                            {title}
                        </h3>

                        {date && (
                            <div className="flex items-center gap-1.5 text-xs text-[#80827f] font-medium">
                                <Calendar className="w-3.5 h-3.5 text-[#ff705d]" />
                                <span>{date}</span>
                            </div>
                        )}

                        <p className="text-xs text-[#80827f] line-clamp-2 leading-relaxed pt-1">
                            {description}
                        </p>
                    </div>

                    <div className="mt-auto pt-6 flex items-center justify-between border-t border-[#f5f1e4]">
                        <span className="text-xs font-medium text-[#2c2e2a]">
                            {closed ? "View Recap" : "Register Now"}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-[#f5f1e4] group-hover:bg-[#2c2e2a] group-hover:text-[#ffffff] text-[#2c2e2a] flex items-center justify-center transition-all">
                            <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}
