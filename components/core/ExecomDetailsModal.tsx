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
    Award,
    CheckCircle,
    XCircle,
    User,
    Check
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
    onAccept?: () => void;
    onReject?: () => void;
}

export default function ExecomDetailsModal({
    application,
    isOpen,
    onClose,
    onAccept,
    onReject,
}: ExecomDetailsModalProps) {
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
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-xs"
                    />

                    <motion.div
                        data-scroll-allow
                        data-lenis-prevent
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 15 }}
                        className="relative w-full max-w-2xl max-h-[90vh] bg-white border border-[#d5d5d4] rounded-[32px] shadow-2xl flex flex-col overflow-hidden text-xs"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-[#f5f1e4] flex items-start justify-between bg-white shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-[#f5f1e4] border border-[#d5d5d4] overflow-hidden flex items-center justify-center text-lg font-bold text-[#2c2e2a] shrink-0 shadow-2xs">
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
                                        <h2 className="text-xl font-bold text-[#2c2e2a] tracking-tight">{name}</h2>
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                                            application.status === "accepted"
                                                ? "bg-[#34A853]/15 text-[#34A853]"
                                                : application.status === "rejected"
                                                ? "bg-[#EA4335]/15 text-[#EA4335]"
                                                : "bg-[#FBBC04]/15 text-[#b08000]"
                                        }`}>
                                            {application.status || "PENDING"}
                                        </span>
                                    </div>
                                    <p className="text-xs text-[#80827f] font-mono mt-1">
                                        {semester} &bull; {department}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-full hover:bg-[#f5f1e4] flex items-center justify-center text-[#80827f] hover:text-[#2c2e2a] transition cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content Body */}
                        <div data-scroll-allow data-lenis-prevent className="flex-1 overflow-y-auto p-6 space-y-6 overscroll-contain">
                            {/* Contact Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="p-3.5 rounded-2xl bg-[#faf9f6] border border-[#d5d5d4] space-y-1">
                                    <span className="text-[10px] font-mono text-[#80827f] uppercase flex items-center gap-1.5 font-bold">
                                        <Mail className="w-3.5 h-3.5 text-[#4285F4]" /> Email Address
                                    </span>
                                    <p className="text-[#2c2e2a] font-mono font-medium truncate text-xs">{email}</p>
                                </div>
                                <div className="p-3.5 rounded-2xl bg-[#faf9f6] border border-[#d5d5d4] space-y-1">
                                    <span className="text-[10px] font-mono text-[#80827f] uppercase flex items-center gap-1.5 font-bold">
                                        <Phone className="w-3.5 h-3.5 text-[#34A853]" /> Phone Number
                                    </span>
                                    <p className="text-[#2c2e2a] font-mono font-medium text-xs">{phone}</p>
                                </div>
                            </div>

                            {/* Domains & Tracks */}
                            {interests && interests.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-mono uppercase text-[#80827f] font-bold tracking-wider">
                                        Domains / Tracks Applied
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {interests.map((t) => (
                                            <span key={t} className="px-3 py-1 rounded-xl bg-[#f5f1e4] border border-[#d5d5d4] text-[#2c2e2a] font-semibold text-xs capitalize">
                                                {String(t).replace("-", " ")}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Motivation / Why Join */}
                            {application.whyJoin && (
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-mono uppercase text-[#80827f] font-bold tracking-wider flex items-center gap-1.5">
                                        <Sparkles className="w-3.5 h-3.5 text-[#FBBC04]" /> Why Join Execom?
                                    </h4>
                                    <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#d5d5d4] text-[#2c2e2a] leading-relaxed whitespace-pre-wrap text-xs">
                                        {application.whyJoin}
                                    </div>
                                </div>
                            )}

                            {/* Technical Skills */}
                            {application.technicalSkills && (
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-mono uppercase text-[#80827f] font-bold tracking-wider flex items-center gap-1.5">
                                        <Code className="w-3.5 h-3.5 text-[#4285F4]" /> Technical Competencies
                                    </h4>
                                    <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#d5d5d4] text-[#2c2e2a] leading-relaxed whitespace-pre-wrap text-xs">
                                        {application.technicalSkills}
                                    </div>
                                </div>
                            )}

                            {/* Creative Skills */}
                            {application.creativeSkills && (
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-mono uppercase text-[#80827f] font-bold tracking-wider flex items-center gap-1.5">
                                        <Award className="w-3.5 h-3.5 text-[#ff705d]" /> Creative & Organizing Background
                                    </h4>
                                    <div className="p-4 rounded-2xl bg-[#faf9f6] border border-[#d5d5d4] text-[#2c2e2a] leading-relaxed whitespace-pre-wrap text-xs">
                                        {application.creativeSkills}
                                    </div>
                                </div>
                            )}

                            {/* Custom Form Answers */}
                            {application.answers && Object.keys(application.answers).length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-mono uppercase text-[#80827f] font-bold tracking-wider">
                                        Custom Application Questions & Answers
                                    </h4>
                                    <div className="space-y-2">
                                        {Object.entries(application.answers).map(([key, value]) => (
                                            <div key={key} className="p-3.5 rounded-2xl bg-[#faf9f6] border border-[#d5d5d4] space-y-1">
                                                <span className="text-[10px] font-mono text-[#80827f] uppercase font-bold block">
                                                    {key.replace(/_/g, " ")}
                                                </span>
                                                <div className="text-[#2c2e2a] text-xs leading-relaxed whitespace-pre-wrap">
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
                                    <h4 className="text-[10px] font-mono uppercase text-[#80827f] font-bold tracking-wider">
                                        Portfolios & Profiles
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {application.socialLinks.map((s, idx) => (
                                            <a
                                                key={idx}
                                                href={s.url.startsWith("http") ? s.url : `https://${s.url}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-3 rounded-2xl bg-[#faf9f6] border border-[#d5d5d4] hover:bg-[#f5f1e4] transition flex items-center justify-between group"
                                            >
                                                <span className="font-semibold text-[#2c2e2a] capitalize text-xs">{s.platform}</span>
                                                <ExternalLink className="w-3.5 h-3.5 text-[#80827f] group-hover:text-[#2c2e2a] transition" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Controls: Reject / Accept / Close */}
                        <div className="p-4 border-t border-[#f5f1e4] flex items-center justify-between bg-white shrink-0">
                            <div className="flex items-center gap-2">
                                {onReject && (
                                    <button
                                        type="button"
                                        onClick={onReject}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#EF4444]/40 hover:bg-[#EF4444]/10 text-[#EF4444] font-semibold text-xs transition cursor-pointer"
                                    >
                                        <XCircle className="w-3.5 h-3.5" />
                                        <span>Reject</span>
                                    </button>
                                )}
                                {onAccept && (
                                    <button
                                        type="button"
                                        onClick={onAccept}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#10B981] hover:bg-[#059669] text-white font-semibold text-xs shadow-sm transition cursor-pointer"
                                    >
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        <span>Accept Candidate</span>
                                    </button>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-[#0f172a] font-semibold text-xs transition cursor-pointer"
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
