"use client";

import React from "react";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Mail,
    Phone,
    GraduationCap,
    ExternalLink,
    Code,
    Sparkles,
    Calendar,
    Award
} from "lucide-react";
import GoogleBadge from "../GoogleBadge";
import { resolveName } from "@/lib/utils";

interface SocialLink {
    platform: string;
    url: string;
}

interface ExecomApplication {
    id: string;
    name: string;
    email: string;
    phone: string;
    semester: string;
    department: string;
    interests: string[];
    technicalSkills: string;
    creativeSkills: string;
    whyJoin: string;
    socialLinks: SocialLink[];
    status: "pending" | "accepted" | "rejected";
    answers?: Record<string, any>;
    photoURL?: string;
    submittedAt?: any;
    interviewDate?: string;
    interviewTime?: string;
}

interface ExecomDetailsModalProps {
    application: ExecomApplication | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function ExecomDetailsModal({ application, isOpen, onClose }: ExecomDetailsModalProps) {
    useBodyScrollLock(isOpen);
    if (!application) return null;

    const name = resolveName(
        application.name,
        (application as any).displayName,
        (application as any).fullName,
        application.email,
        (application as any).answers?.name || "Applicant"
    );
    const email = application.email || (application as any).userEmail || (application as any).answers?.email || "No email";
    const phone = application.phone || (application as any).phoneNumber || (application as any).answers?.phone || (application as any).answers?.phoneNumber || "N/A";
    const semester = application.semester || (application as any).sem || (application as any).answers?.semester || "N/A";
    const department = application.department || (application as any).dept || (application as any).answers?.department || "N/A";
    const photoURL = application.photoURL || (application as any).avatarUrl || (application as any).image;
    const interests = (Array.isArray(application.interests) && application.interests.length > 0)
        ? application.interests
        : (application.answers?.track ? (Array.isArray(application.answers.track) ? application.answers.track : [application.answers.track]) : (application.answers?.interests ? (Array.isArray(application.answers.interests) ? application.answers.interests : [application.answers.interests]) : []));

    const statusVariant = application.status === "accepted" ? "green" : application.status === "rejected" ? "red" : "yellow";

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 15 }}
                        className="relative w-full max-w-2xl max-h-[90vh] bg-[#18191b] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-xs"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center text-lg font-bold text-white shrink-0">
                                    {photoURL ? (
                                        <img
                                            src={photoURL}
                                            alt={name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.style.display = "none";
                                            }}
                                        />
                                    ) : (
                                        (name.substring(0, 2)).toUpperCase()
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-lg font-bold text-white tracking-tight">{name}</h2>
                                        <GoogleBadge label={application.status || "PENDING"} variant={statusVariant as any} size="sm" />
                                    </div>
                                    <p className="text-xs text-zinc-400 font-mono mt-0.5">
                                        {semester} &bull; {department}
                                    </p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/5">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Contact Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3.5 rounded-2xl bg-zinc-900 border border-white/5 space-y-1">
                                    <span className="text-[10px] font-mono text-zinc-500 uppercase flex items-center gap-1.5">
                                        <Mail className="w-3 h-3 text-[#4285F4]" /> Email Address
                                    </span>
                                    <p className="text-white font-mono font-medium truncate">{email}</p>
                                </div>
                                <div className="p-3.5 rounded-2xl bg-zinc-900 border border-white/5 space-y-1">
                                    <span className="text-[10px] font-mono text-zinc-500 uppercase flex items-center gap-1.5">
                                        <Phone className="w-3 h-3 text-[#34A853]" /> Phone Number
                                    </span>
                                    <p className="text-white font-mono font-medium">{phone}</p>
                                </div>
                            </div>

                            {/* Domains & Tracks */}
                            {interests && interests.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-mono uppercase text-zinc-400 font-semibold tracking-wider">Domains Applied</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {interests.map((t) => (
                                            <span key={t} className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-zinc-200 font-medium capitalize">
                                                {String(t).replace("-", " ")}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Technical Skills */}
                            {application.technicalSkills && (
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-mono uppercase text-zinc-400 font-semibold tracking-wider flex items-center gap-1.5">
                                        <Code className="w-3.5 h-3.5 text-[#4285F4]" /> Technical Competencies
                                    </h4>
                                    <div className="p-4 rounded-2xl bg-zinc-900 border border-white/5 text-zinc-300 leading-relaxed whitespace-pre-wrap">
                                        {application.technicalSkills}
                                    </div>
                                </div>
                            )}

                            {/* Creative Skills */}
                            {application.creativeSkills && (
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-mono uppercase text-zinc-400 font-semibold tracking-wider flex items-center gap-1.5">
                                        <Sparkles className="w-3.5 h-3.5 text-[#FBBC04]" /> Creative & Non-Technical Skills
                                    </h4>
                                    <div className="p-4 rounded-2xl bg-zinc-900 border border-white/5 text-zinc-300 leading-relaxed whitespace-pre-wrap">
                                        {application.creativeSkills}
                                    </div>
                                </div>
                            )}

                            {/* Statement of Purpose */}
                            {(application.whyJoin || (application as any).answers?.whyJoin || (application as any).answers?.motivation) && (
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-mono uppercase text-zinc-400 font-semibold tracking-wider">
                                        Why do you want to join GDG Core?
                                    </h4>
                                    <div className="p-4 rounded-2xl bg-zinc-900 border border-white/5 text-zinc-300 leading-relaxed whitespace-pre-wrap">
                                        {application.whyJoin || (application as any).answers?.whyJoin || (application as any).answers?.motivation}
                                    </div>
                                </div>
                            )}

                            {/* Custom Form Answers */}
                            {application.answers && Object.keys(application.answers).length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-mono uppercase text-zinc-400 font-semibold tracking-wider">
                                        Custom Application Questions & Answers
                                    </h4>
                                    <div className="space-y-2">
                                        {Object.entries(application.answers).map(([key, value]) => (
                                            <div key={key} className="p-3.5 rounded-2xl bg-zinc-900 border border-white/5 space-y-1">
                                                <span className="text-[10px] font-mono text-zinc-400 uppercase font-semibold block">
                                                    {key.replace(/_/g, " ")}
                                                </span>
                                                <div className="text-zinc-200 text-xs leading-relaxed whitespace-pre-wrap">
                                                    {Array.isArray(value) ? value.join(", ") : String(value || "—")}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Social & Portfolio Links */}
                            {application.socialLinks && application.socialLinks.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-mono uppercase text-zinc-400 font-semibold tracking-wider">Portfolios & Profiles</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {application.socialLinks.map((s, idx) => (
                                            <a
                                                key={idx}
                                                href={s.url.startsWith("http") ? s.url : `https://${s.url}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-3 rounded-2xl bg-zinc-900 border border-white/5 hover:border-white/20 transition flex items-center justify-between group"
                                            >
                                                <span className="font-semibold text-zinc-200 capitalize">{s.platform}</span>
                                                <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-white/10 flex justify-end">
                            <button
                                onClick={onClose}
                                className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
