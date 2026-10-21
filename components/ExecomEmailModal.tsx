"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Mail,
    CheckCircle2,
    XCircle,
    Clock,
    Users,
    Eye,
    PenLine,
    Send,
    ChevronDown,
    Sparkles,
    ShieldCheck,
    Lock,
    Key,
    ExternalLink,
    AlertCircle,
    Check,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import MDEditor, { commands } from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { createAuditLog } from "@/lib/audit";
import { FaUnderline, FaStrikethrough } from "react-icons/fa";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";

interface Recipient { 
    name: string; 
    email: string; 
    status: string; 
}

interface ExecomEmailModalProps {
    onClose: () => void;
    applications: any[];
    singleRecipient?: { name: string; email: string; status: string } | null;
}

type FilterType = "all" | "pending" | "accepted" | "rejected";

const FILTER_OPTIONS: { key: FilterType; label: string; icon: React.ElementType; color: string }[] = [
    { key: "all", label: "All Candidates", icon: Users, color: "text-[#4285F4] bg-[#4285F4]/10 border-[#4285F4]/30" },
    { key: "accepted", label: "Accepted", icon: CheckCircle2, color: "text-[#34A853] bg-[#34A853]/10 border-[#34A853]/30" },
    { key: "pending", label: "Under Review", icon: Clock, color: "text-[#FBBC04] bg-[#FBBC04]/10 border-[#FBBC04]/30" },
    { key: "rejected", label: "Rejected", icon: XCircle, color: "text-[#EA4335] bg-[#EA4335]/10 border-[#EA4335]/30" },
];

const DEFAULT_TEMPLATES: Record<string, { subject: string; body: string }> = {
    accepted: {
        subject: "🎉 Welcome to the GDG AJCE Executive Committee!",
        body: `# Congratulations, {{name}}! 🎉

We are thrilled to welcome you to the **Google Developer Groups (GDG) AJCE Executive Committee**!

## Next Steps

1. **Orientation Meeting** – We will share details about our onboarding session shortly.
2. **Community Workspace** – You will be invited to our core management channels and drive.
3. **Initiatives & Projects** – Prepare to organize flagship developer events, workshops, and study jams!

We were truly impressed by your passion, technical foundation, and drive to foster student innovation.

Welcome aboard! Let's build and inspire together. 🚀

— *The GDG AJCE Executive Committee*`,
    },
    rejected: {
        subject: "Update on your GDG AJCE Execom Application",
        body: `# Hi {{name}},

Thank you for applying for the **Google Developer Groups (GDG) Executive Committee**. We truly appreciate your enthusiasm and the effort invested in your application.

After thoughtful review of all applications, we are unable to offer you a core team role for this tenure. We received a tremendous number of outstanding candidates and seats are limited.

## Keep Exploring & Building

- **Join our community sessions** – Attend GDG hackathons, speaker events, and study jams.
- **Contribute & Lead** – We regularly appoint student sub-leads and project champions for major initiatives.
- **Future Drives** – We open opportunities periodically and encourage you to apply again!

Thank you for being an active part of our tech community.

— *The GDG AJCE Team*`,
    },
    pending: {
        subject: "Your GDG Application – Status Update",
        body: `# Hi {{name}},

Thank you for your interest in joining the **GDG AJCE Executive Committee**. We are currently reviewing your application and profile details.

Our team will finalize evaluations shortly and communicate the next steps.

Thank you for your patience!

— *The GDG AJCE Team*`,
    },
};

export default function ExecomEmailModal({ onClose, applications, singleRecipient }: ExecomEmailModalProps) {
    const isSingleMode = Boolean(singleRecipient);

    const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
    const [filter, setFilter] = useState<FilterType>("accepted");
    const [subject, setSubject] = useState(DEFAULT_TEMPLATES.accepted.subject);
    const [markdownBody, setMarkdownBody] = useState(DEFAULT_TEMPLATES.accepted.body);
    const [previewMode, setPreviewMode] = useState(false);
    const [previewHtml, setPreviewHtml] = useState<string | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);
    const templatesRef = useRef<HTMLDivElement>(null);

    // Resend configuration state
    const [emailSetupOpen, setEmailSetupOpen] = useState(false);
    const [resendConfigured, setResendConfigured] = useState(false);
    const [resendApiKey, setResendApiKey] = useState("");
    const [resendFrom, setResendFrom] = useState("GDG AJCE <onboarding@resend.dev>");
    const [viaEnv, setViaEnv] = useState(false);
    const [savingResend, setSavingResend] = useState(false);
    const [configSaveSuccess, setConfigSaveSuccess] = useState(false);

    // Progress
    const [progress, setProgress] = useState<{
        active: boolean;
        total: number;
        current: number;
        sent: number;
        failed: number;
        consecutiveFailures: number;
        failedRecipients: { email: string; reason: string }[];
        aborted: boolean;
    } | null>(null);

    const [error, setError] = useState<string | null>(null);
    const [confirmStep, setConfirmStep] = useState<0 | 1>(0);

    // Load initial Resend configuration
    useEffect(() => {
        fetch("/api/smtp-config")
            .then((r) => r.json())
            .then((d) => {
                setResendConfigured(Boolean(d.configured));
                setViaEnv(Boolean(d.viaEnv));
                if (d.from) setResendFrom(d.from);
                if (d.apiKeyMasked) setResendApiKey(d.apiKeyMasked);
            })
            .catch(() => {});

        const fetchTemplates = async () => {
            try {
                const docRef = doc(db, "settings", "execomEmailTemplates");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data() as Record<string, { subject: string; body: string }>;
                    const merged = { ...DEFAULT_TEMPLATES, ...data };
                    setTemplates(merged);
                    if (merged[filter]) {
                        setSubject(merged[filter].subject);
                        setMarkdownBody(merged[filter].body);
                    }
                }
            } catch (err) {
                console.warn("Could not load stored templates, using defaults:", err);
            }
        };
        fetchTemplates();
    }, []);

    // Outside click for template menu
    useEffect(() => {
        const h = (e: MouseEvent) => {
            if (templatesRef.current && !templatesRef.current.contains(e.target as Node)) {
                setShowTemplates(false);
            }
        };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    // Load live email preview via emailmd API
    useEffect(() => {
        if (previewMode) {
            setPreviewLoading(true);
            fetch("/api/preview-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ markdownBody }),
            })
                .then((res) => res.text())
                .then((html) => {
                    setPreviewHtml(html);
                    setPreviewLoading(false);
                })
                .catch(() => {
                    setPreviewHtml("<p style='color:#EA4335;padding:20px;font-family:sans-serif;'>Failed to load preview.</p>");
                    setPreviewLoading(false);
                });
        }
    }, [previewMode, markdownBody]);

    const recipients: Recipient[] = isSingleMode
        ? [singleRecipient!]
        : applications
              .filter((a) => filter === "all" || (a.status || "pending") === filter)
              .map((a) => ({ name: a.name || "Candidate", email: a.email, status: a.status || "pending" }));

    const handleFilterChange = (f: FilterType) => {
        setFilter(f);
        if (!isSingleMode && templates[f]) {
            setSubject(templates[f].subject);
            setMarkdownBody(templates[f].body);
        }
    };

    const handleSaveResend = useCallback(async () => {
        if (!resendApiKey.trim()) return;
        setSavingResend(true);
        setError(null);
        try {
            const res = await fetch("/api/smtp-config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    apiKey: resendApiKey.trim(),
                    from: resendFrom.trim(),
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setResendConfigured(true);
                setConfigSaveSuccess(true);
                setTimeout(() => setConfigSaveSuccess(false), 3000);
            } else {
                setError(data.error || "Failed to save Resend settings.");
            }
        } catch (e: any) {
            setError(e.message || "Failed to connect to server.");
        } finally {
            setSavingResend(false);
        }
    }, [resendApiKey, resendFrom]);

    const handleSendInit = () => {
        if (!subject.trim()) {
            setError("Subject line cannot be blank.");
            return;
        }
        if (!markdownBody.trim()) {
            setError("Email content cannot be blank.");
            return;
        }
        if (recipients.length === 0) {
            setError("No candidates matched your selection.");
            return;
        }
        setError(null);
        setConfirmStep(1);
    };

    const executeSend = useCallback(async () => {
        setConfirmStep(0);
        setError(null);

        setProgress({
            active: true,
            total: recipients.length,
            current: 0,
            sent: 0,
            failed: 0,
            consecutiveFailures: 0,
            failedRecipients: [],
            aborted: false,
        });

        let sentCount = 0;
        let failedCount = 0;
        let consecutiveFailures = 0;
        const failedRecipients: { email: string; reason: string }[] = [];

        for (let i = 0; i < recipients.length; i++) {
            const recipient = recipients[i];

            if (consecutiveFailures >= 3) {
                setProgress((prev) => (prev ? { ...prev, aborted: true, active: false } : null));
                setError("Dispatch paused automatically after 3 consecutive errors. Check your Resend API Key or domain.");
                break;
            }

            setProgress((prev) => (prev ? { ...prev, current: i + 1 } : null));

            try {
                const res = await fetch("/api/send-email", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        recipients: [recipient],
                        subject,
                        markdownBody,
                    }),
                });
                const data = await res.json();

                if (!res.ok || (data.failed && data.failed > 0)) {
                    failedCount++;
                    consecutiveFailures++;
                    const reason = data.failedRecipients?.[0]?.reason || data.error || "Delivery failed";
                    failedRecipients.push({ email: recipient.email, reason });
                } else {
                    sentCount++;
                    consecutiveFailures = 0;
                }
            } catch (e: any) {
                failedCount++;
                consecutiveFailures++;
                failedRecipients.push({ email: recipient.email, reason: e.message || "Network error" });
            }

            setProgress((prev) =>
                prev
                    ? {
                          ...prev,
                          sent: sentCount,
                          failed: failedCount,
                          consecutiveFailures,
                          failedRecipients: [...failedRecipients],
                      }
                    : null
            );

            // Resend rate limit safety cushion
            await new Promise((r) => setTimeout(r, 120));
        }

        setProgress((prev) => (prev ? { ...prev, active: false } : null));

        try {
            await createAuditLog("EXECOM_EMAIL_DISPATCH", {
                subject,
                totalRecipients: recipients.length,
                sent: sentCount,
                failed: failedCount,
                failures: failedRecipients,
                aborted: consecutiveFailures >= 3,
                provider: "resend",
            });
        } catch {}
    }, [recipients, subject, markdownBody]);

    return (
        <div 
            className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6"
            data-scroll-allow="true"
            data-lenis-prevent="true"
        >
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[#2c2e2a]/60 backdrop-blur-sm"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 16 }}
                className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-white border border-[#d5d5d4] rounded-3xl shadow-2xl overflow-hidden overscroll-contain"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#d5d5d4] bg-[#f5f1e4]/40 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#4285F4]/10 border border-[#4285F4]/30 flex items-center justify-center text-[#4285F4]">
                            <Mail className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-bold text-[#2c2e2a]">
                                    {isSingleMode ? `Email ${singleRecipient!.name}` : "Execom Email Dispatch"}
                                </h2>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#4285F4]/10 text-[#4285F4] text-[10px] font-bold">
                                    Resend + emailmd
                                </span>
                            </div>
                            <p className="text-xs text-[#80827f]">
                                {isSingleMode
                                    ? singleRecipient!.email
                                    : `${recipients.length} candidate${recipients.length !== 1 ? "s" : ""} selected for broadcast`}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full text-[#80827f] hover:text-[#2c2e2a] hover:bg-black/5 transition cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                    {/* Left Sidebar: Filters & Resend Configuration */}
                    {!isSingleMode && (
                        <div className="w-full md:w-72 flex-shrink-0 border-b md:border-b-0 md:border-r border-[#d5d5d4] bg-[#f5f1e4]/30 flex flex-col overflow-y-auto">
                            {/* Candidate Audience Selector */}
                            <div className="p-5 space-y-3 border-b border-[#d5d5d4]">
                                <Label className="text-[11px] font-mono uppercase text-[#80827f] font-bold block">
                                    Target Candidates
                                </Label>
                                <div className="flex flex-col gap-1.5">
                                    {FILTER_OPTIONS.map((opt) => {
                                        const count =
                                            opt.key === "all"
                                                ? applications.length
                                                : applications.filter((a) => (a.status || "pending") === opt.key).length;
                                        const Icon = opt.icon;
                                        const isActive = filter === opt.key;
                                        return (
                                            <button
                                                key={opt.key}
                                                type="button"
                                                onClick={() => handleFilterChange(opt.key)}
                                                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                                                    isActive
                                                        ? `${opt.color} shadow-xs font-bold`
                                                        : "border-[#d5d5d4] bg-white text-[#80827f] hover:text-[#2c2e2a] hover:border-[#a0a29f]"
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Icon className="w-4 h-4" />
                                                    <span>{opt.label}</span>
                                                </div>
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                                                        isActive ? "bg-white/80" : "bg-[#f5f1e4]"
                                                    }`}
                                                >
                                                    {count}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Resend Engine Setup Box */}
                            <div className="p-5 space-y-3">
                                <button
                                    type="button"
                                    onClick={() => setEmailSetupOpen(!emailSetupOpen)}
                                    className="w-full flex items-center justify-between text-[11px] font-mono uppercase font-bold text-[#80827f] hover:text-[#2c2e2a] transition cursor-pointer"
                                >
                                    <span className="flex items-center gap-1.5">
                                        <Key className="w-3.5 h-3.5 text-[#4285F4]" />
                                        <span>Resend Setup</span>
                                    </span>
                                    <ChevronDown
                                        className={`w-3.5 h-3.5 transition-transform ${
                                            emailSetupOpen ? "rotate-180" : ""
                                        }`}
                                    />
                                </button>

                                <AnimatePresence>
                                    {emailSetupOpen ? (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="space-y-3 pt-1 overflow-hidden"
                                        >
                                            <div className="space-y-1">
                                                <Label className="text-[10px] font-semibold text-[#2c2e2a]">
                                                    Resend API Key
                                                </Label>
                                                <Input
                                                    type="password"
                                                    value={resendApiKey}
                                                    onChange={(e) => setResendApiKey(e.target.value)}
                                                    placeholder="re_xxxxxxxxxxxx"
                                                    disabled={viaEnv}
                                                    className="h-8 text-xs bg-white"
                                                />
                                                <p className="text-[10px] text-[#80827f]">
                                                    Get key from{" "}
                                                    <a
                                                        href="https://resend.com/api-keys"
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-[#4285F4] underline inline-flex items-center gap-0.5"
                                                    >
                                                        resend.com <ExternalLink className="w-2.5 h-2.5" />
                                                    </a>
                                                </p>
                                            </div>

                                            <div className="space-y-1">
                                                <Label className="text-[10px] font-semibold text-[#2c2e2a]">
                                                    Sender (From)
                                                </Label>
                                                <Input
                                                    type="text"
                                                    value={resendFrom}
                                                    onChange={(e) => setResendFrom(e.target.value)}
                                                    placeholder="GDG AJCE <onboarding@resend.dev>"
                                                    disabled={viaEnv}
                                                    className="h-8 text-xs bg-white"
                                                />
                                            </div>

                                            {!viaEnv && (
                                                <button
                                                    type="button"
                                                    onClick={handleSaveResend}
                                                    disabled={savingResend || !resendApiKey.trim()}
                                                    className="w-full py-2 rounded-xl bg-[#2c2e2a] hover:bg-[#1a1a1a] text-white text-xs font-semibold transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                                                >
                                                    {savingResend ? (
                                                        "Saving..."
                                                    ) : configSaveSuccess ? (
                                                        <>
                                                            <Check className="w-3.5 h-3.5 text-[#34A853]" />
                                                            <span>Saved!</span>
                                                        </>
                                                    ) : (
                                                        "Save Resend Config"
                                                    )}
                                                </button>
                                            )}
                                        </motion.div>
                                    ) : (
                                        <div
                                            className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer ${
                                                resendConfigured
                                                    ? "bg-[#34A853]/10 border-[#34A853]/30 text-[#34A853]"
                                                    : "bg-[#EA4335]/10 border-[#EA4335]/30 text-[#EA4335]"
                                            }`}
                                            onClick={() => setEmailSetupOpen(true)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <ShieldCheck className="w-4 h-4" />
                                                <span className="font-semibold text-[11px]">
                                                    {resendConfigured
                                                        ? viaEnv
                                                            ? "Resend (via .env)"
                                                            : "Resend Ready"
                                                        : "Configure Resend"}
                                                </span>
                                            </div>
                                            <span className="text-[10px] underline">Edit</span>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}

                    {/* Right / Main Editor Pane */}
                    <div 
                        className="flex-1 flex flex-col overflow-y-auto overscroll-contain p-6 space-y-4"
                        data-scroll-allow="true"
                    >
                        {/* Progress Panel */}
                        <AnimatePresence>
                            {progress && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="bg-[#f5f1e4] border border-[#d5d5d4] rounded-2xl p-4 space-y-3"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            {progress.active ? (
                                                <div className="w-8 h-8 rounded-full bg-[#4285F4]/20 text-[#4285F4] flex items-center justify-center animate-pulse">
                                                    <Send className="w-4 h-4" />
                                                </div>
                                            ) : progress.sent === progress.total ? (
                                                <div className="w-8 h-8 rounded-full bg-[#34A853]/20 text-[#34A853] flex items-center justify-center">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </div>
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-[#FBBC04]/20 text-[#b08000] flex items-center justify-center">
                                                    <Clock className="w-4 h-4" />
                                                </div>
                                            )}
                                            <div>
                                                <h4 className="text-xs font-bold text-[#2c2e2a]">
                                                    {progress.active
                                                        ? `Sending (${progress.current}/${progress.total})...`
                                                        : progress.aborted
                                                        ? "Dispatch Halted"
                                                        : "Broadcast Completed"}
                                                </h4>
                                                <p className="text-[11px] text-[#80827f]">
                                                    {progress.active
                                                        ? `Delivering to ${recipients[progress.current - 1]?.email}`
                                                        : `Delivered ${progress.sent} of ${progress.total} emails via Resend`}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-base font-bold font-mono text-[#2c2e2a]">
                                            {Math.round((progress.current / progress.total) * 100)}%
                                        </span>
                                    </div>

                                    <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-[#d5d5d4]">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-[#4285F4] to-[#34A853]"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(progress.current / progress.total) * 100}%` }}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Top Bar: Write vs Preview + Templates */}
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center p-1 rounded-xl bg-[#f5f1e4] border border-[#d5d5d4]">
                                <button
                                    type="button"
                                    onClick={() => setPreviewMode(false)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                        !previewMode
                                            ? "bg-white text-[#2c2e2a] shadow-xs"
                                            : "text-[#80827f] hover:text-[#2c2e2a]"
                                    }`}
                                >
                                    <PenLine className="w-3.5 h-3.5" />
                                    <span>Write Markdown</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPreviewMode(true)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                        previewMode
                                            ? "bg-white text-[#2c2e2a] shadow-xs"
                                            : "text-[#80827f] hover:text-[#2c2e2a]"
                                    }`}
                                >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>Live emailmd Preview</span>
                                </button>
                            </div>

                            <div className="relative" ref={templatesRef}>
                                <button
                                    type="button"
                                    onClick={() => setShowTemplates(!showTemplates)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-[#d5d5d4] text-[#2c2e2a] hover:border-[#a0a29f] transition cursor-pointer"
                                >
                                    <Sparkles className="w-3.5 h-3.5 text-[#FBBC04]" />
                                    <span>Templates</span>
                                    <ChevronDown className="w-3 h-3 text-[#80827f]" />
                                </button>

                                <AnimatePresence>
                                    {showTemplates && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 4 }}
                                            className="absolute top-full mt-1.5 right-0 bg-white border border-[#d5d5d4] rounded-2xl shadow-xl overflow-hidden z-30 min-w-[210px] p-1 space-y-0.5"
                                        >
                                            {(["accepted", "pending", "rejected"] as const).map((key) => (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    onClick={() => {
                                                        setSubject(templates[key].subject);
                                                        setMarkdownBody(templates[key].body);
                                                        setShowTemplates(false);
                                                    }}
                                                    className="w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold text-[#2c2e2a] hover:bg-[#f5f1e4] transition capitalize cursor-pointer flex items-center justify-between"
                                                >
                                                    <span>{key} Template</span>
                                                    <span className="text-[10px] text-[#80827f]">Load</span>
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Subject */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-[#2c2e2a]">Subject Line</Label>
                            <Input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Email subject..."
                                className="h-10 text-xs font-medium"
                            />
                        </div>

                        {/* Editor / Preview with emailmd */}
                        <div className="flex-1 min-h-[360px]">
                            {!previewMode ? (
                                <div data-color-mode="light" className="rounded-xl overflow-hidden border border-[#d5d5d4]">
                                    <MDEditor
                                        value={markdownBody}
                                        onChange={(val) => setMarkdownBody(val || "")}
                                        preview="edit"
                                        height={360}
                                        visibleDragbar={false}
                                        commands={[
                                            commands.bold,
                                            commands.italic,
                                            {
                                                name: "underline",
                                                keyCommand: "underline",
                                                buttonProps: { "aria-label": "Underline" },
                                                icon: <FaUnderline className="w-3" />,
                                                execute: (state, api) => {
                                                    api.replaceSelection(`<u>${state.selectedText}</u>`);
                                                },
                                            },
                                            commands.strikethrough,
                                            commands.divider,
                                            commands.title,
                                            commands.unorderedListCommand,
                                            commands.orderedListCommand,
                                            commands.quote,
                                            commands.link,
                                        ]}
                                    />
                                </div>
                            ) : (
                                <div className="bg-[#f8f9fa] rounded-2xl overflow-y-auto max-h-[380px] border border-[#d5d5d4] p-6 shadow-inner">
                                    {previewLoading ? (
                                        <div className="text-xs text-[#80827f] text-center py-20">
                                            Generating emailmd preview...
                                        </div>
                                    ) : (
                                        <div
                                            className="emailmd-preview-container"
                                            dangerouslySetInnerHTML={{ __html: previewHtml || "" }}
                                        />
                                    )}
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-[#EA4335]/10 border border-[#EA4335]/30 rounded-xl text-xs text-[#EA4335]">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Footer Send Trigger */}
                        <div className="flex items-center justify-between pt-4 border-t border-[#d5d5d4]">
                            <div className="text-[11px] text-[#80827f]">
                                Available tokens: <code className="bg-[#f5f1e4] px-1.5 py-0.5 rounded text-[#2c2e2a]">{"{{name}}"}</code>
                            </div>
                            <button
                                type="button"
                                onClick={handleSendInit}
                                disabled={progress?.active}
                                className="px-6 py-2.5 rounded-full bg-[#2c2e2a] hover:bg-[#1a1a1a] text-white text-xs font-semibold shadow-md transition disabled:opacity-50 cursor-pointer flex items-center gap-2"
                            >
                                <Send className="w-3.5 h-3.5" />
                                <span>{isSingleMode ? "Send Email" : `Send to ${recipients.length} Candidates`}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Confirm Dialog Modal */}
                <AnimatePresence>
                    {confirmStep === 1 && (
                        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white border border-[#d5d5d4] rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-4"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="w-12 h-12 rounded-2xl bg-[#4285F4]/10 border border-[#4285F4]/20 flex items-center justify-center text-[#4285F4] mx-auto">
                                    <Send className="w-6 h-6" />
                                </div>
                                <div className="text-center space-y-1">
                                    <h3 className="text-lg font-bold text-[#2c2e2a]">Confirm Email Broadcast</h3>
                                    <p className="text-xs text-[#80827f]">
                                        You are dispatching via <strong>Resend</strong> to:
                                    </p>
                                </div>
                                <div className="p-3 bg-[#f5f1e4] rounded-2xl text-center font-mono text-xs text-[#2c2e2a]">
                                    {recipients.length} candidate{recipients.length !== 1 ? "s" : ""} ({filter})
                                </div>
                                <div className="flex items-center justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setConfirmStep(0)}
                                        className="px-5 py-2.5 rounded-full text-xs font-semibold text-[#80827f] hover:text-[#2c2e2a] transition cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={executeSend}
                                        className="px-6 py-2.5 rounded-full bg-[#4285F4] hover:bg-[#3367D6] text-white text-xs font-semibold shadow-md transition cursor-pointer"
                                    >
                                        Dispatch Now
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
