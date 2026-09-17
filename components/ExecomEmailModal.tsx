"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { motion, AnimatePresence } from "framer-motion";
import {
    XMarkIcon,
    EnvelopeIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    UsersIcon,
    EyeIcon,
    PencilSquareIcon,
    PaperAirplaneIcon,
    ChevronDownIcon,
    SparklesIcon,
    ShieldCheckIcon,
    LockClosedIcon,
    ArrowRightCircleIcon,
} from "@heroicons/react/24/outline";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import MDEditor, { commands } from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { createAuditLog } from "@/lib/audit";
import { FaUnderline, FaStrikethrough } from "react-icons/fa";

interface Recipient { name: string; email: string; status: string }

interface ExecomEmailModalProps {
    onClose: () => void;
    applications: any[];
    singleRecipient?: { name: string; email: string; status: string } | null;
}

type FilterType = "all" | "pending" | "accepted" | "rejected";

const LS_KEY = "gdg_smtp_meta";

const FILTER_OPTIONS: { key: FilterType; label: string; icon: React.ElementType; active: string }[] = [
    { key: "all", label: "All", icon: UsersIcon, active: "text-[#4285F4] bg-[#4285F4]/10 border-[#4285F4]/30" },
    { key: "pending", label: "Pending", icon: ClockIcon, active: "text-[#FBBC04] bg-[#FBBC04]/10 border-[#FBBC04]/30" },
    { key: "accepted", label: "Accepted", icon: CheckCircleIcon, active: "text-[#34A853] bg-[#34A853]/10 border-[#34A853]/30" },
    { key: "rejected", label: "Rejected", icon: XCircleIcon, active: "text-[#EA4335] bg-[#EA4335]/10 border-[#EA4335]/30" },
];

const TEMPLATES: Record<string, { subject: string; body: string }> = {
    accepted: {
        subject: "🎉 Welcome to the GDG Core Team!",
        body: `# Congratulations, {{name}}! 🎉

We are thrilled to welcome you to the **Google Developer Groups (GDG) Core Team**!

## Next Steps

1. **Orientation** – We will share details about our onboarding call shortly.
2. **Community & Workspace** – You will be added to our official communication channels.
3. **Initiatives & Projects** – Prepare to collaborate on upcoming community events and workshops!

We were impressed by your passion, expertise, and drive to create an impact in the developer community.

Welcome aboard! Let's build and inspire together. 🚀

— *The GDG Core Team*`,
    },
    rejected: {
        subject: "Your GDG Core Team Application",
        body: `# Hi {{name}},

Thank you for taking the time to apply for the **Google Developer Groups (GDG) Core Team**. We truly appreciate your enthusiasm and the effort invested in your application.

After thoughtful review, we are unable to offer you a core team role for this round. We had a high volume of outstanding applications and limited seats available.

## Keep Exploring & Growing

- **Join our sessions** – Attend GDG hackathons, study jams, and speaker sessions.
- **Contribute open-source** – Keep refining your technical and leadership skills.
- **Next opportunities** – We open opportunities periodically and would love to see you apply again!

Thank you for being part of our vibrant developer community.

— *The GDG Core Team*`,
    },
    pending: {
        subject: "Your GDG Application – Status Update",
        body: `# Hi {{name}},

Thank you for applying to the **Google Developer Groups (GDG) Core Team**. We are currently reviewing your application and profile details.

We will finalize our selections soon and keep you posted on the next stage.

Thank you for your patience and enthusiasm!

— *The GDG Core Team*`,
    },
};

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl text-center">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</p>
            <p className={`text-xl font-bold ${color} mt-0.5`}>{value}</p>
        </div>
    );
}

export default function ExecomEmailModal({ onClose, applications, singleRecipient }: ExecomEmailModalProps) {
    const isSingleMode = !!singleRecipient;
    useBodyScrollLock();

    const [templates, setTemplates] = useState(TEMPLATES);
    const [filter, setFilter] = useState<FilterType>("accepted");
    const [subject, setSubject] = useState(TEMPLATES.accepted.subject);
    const [markdownBody, setMarkdownBody] = useState(TEMPLATES.accepted.body);
    const [previewMode, setPreviewMode] = useState(false);
    const [previewHtml, setPreviewHtml] = useState<string | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);
    const templatesRef = useRef<HTMLDivElement>(null);

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
    const [confirmStep, setConfirmStep] = useState<0 | 1 | 2>(0);

    const [smtpOpen, setSmtpOpen] = useState(false);
    const [smtpConfigured, setSmtpConfigured] = useState(false);
    const [smtpHost, setSmtpHost] = useState("");
    const [smtpPort, setSmtpPort] = useState("587");
    const [smtpUser, setSmtpUser] = useState("");
    const [smtpPass, setSmtpPass] = useState("");
    const [smtpFrom, setSmtpFrom] = useState("");
    const [smtpSecure, setSmtpSecure] = useState(false);
    const [viaEnv, setViaEnv] = useState(false);
    const [savingSmtp, setSavingSmtp] = useState(false);

    useEffect(() => {
        try {
            const meta = localStorage.getItem(LS_KEY);
            if (meta) {
                const m = JSON.parse(meta);
                setSmtpHost(m.host || "");
                setSmtpPort(m.port || "587");
                setSmtpUser(m.user || "");
                setSmtpFrom(m.from || "");
                setSmtpSecure(m.secure || false);
            }
        } catch { /* ignore */ }

        fetch("/api/smtp-config")
            .then((r) => r.json())
            .then((d) => {
                setSmtpConfigured(d.configured);
                setViaEnv(!!d.viaEnv);
                if (d.configured) {
                    setSmtpHost((p) => (d.viaEnv ? d.host : p || d.host || ""));
                    setSmtpPort((p) => (d.viaEnv ? String(d.port) : p || String(d.port || 587)));
                    setSmtpUser((p) => (d.viaEnv ? d.user : p || d.user || ""));
                    setSmtpFrom((p) => (d.viaEnv ? d.from : p || d.from || ""));
                    setSmtpSecure(d.secure || false);
                }
            })
            .catch(() => { /* error */ });

        const fetchTemplates = async () => {
            try {
                const docRef = doc(db, "settings", "execomEmailTemplates");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data() as Record<string, { subject: string; body: string }>;
                    const mergedTemplates = { ...TEMPLATES, ...data };
                    setTemplates(mergedTemplates);
                    if (filter && mergedTemplates[filter]) {
                        setSubject(mergedTemplates[filter].subject);
                        setMarkdownBody(mergedTemplates[filter].body);
                    }
                }
            } catch (error) {
                console.error("Error loading templates:", error);
            }
        };
        fetchTemplates();
    }, []);

    useEffect(() => {
        if (error && (error.toLowerCase().includes("smtp") || error.toLowerCase().includes("configured"))) {
            setSmtpOpen(true);
        }
    }, [error]);

    useEffect(() => {
        const h = (e: MouseEvent) => {
            if (templatesRef.current && !templatesRef.current.contains(e.target as Node)) setShowTemplates(false);
        };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    useEffect(() => {
        if (previewMode) {
            setPreviewLoading(true);
            fetch("/api/preview-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ markdownBody }),
            })
            .then(res => res.text())
            .then(html => {
                setPreviewHtml(html);
                setPreviewLoading(false);
            })
            .catch(() => {
                setPreviewHtml("<p style='color:black;font-family:sans-serif;'>Failed to load preview.</p>");
                setPreviewLoading(false);
            });
        }
    }, [previewMode, markdownBody]);

    const recipients: Recipient[] = isSingleMode
        ? [singleRecipient!]
        : applications
            .filter((a) => filter === "all" || a.status === filter)
            .map((a) => ({ name: a.name || "Applicant", email: a.email, status: a.status || "pending" }));

    const handleFilterChange = (f: FilterType) => {
        setFilter(f);
        if (!isSingleMode && templates[f]) {
            setSubject(templates[f].subject);
            setMarkdownBody(templates[f].body);
        }
    };

    const handleSaveSmtp = useCallback(async () => {
        if (!smtpHost.trim() || !smtpUser.trim() || !smtpPass.trim()) return;
        setSavingSmtp(true);
        try {
            const res = await fetch("/api/smtp-config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    host: smtpHost.trim(),
                    port: Number(smtpPort) || 587,
                    user: smtpUser.trim(),
                    pass: smtpPass.trim(),
                    from: smtpFrom.trim(),
                    secure: smtpSecure,
                }),
            });
            if (res.ok) {
                localStorage.setItem(LS_KEY, JSON.stringify({
                    host: smtpHost.trim(),
                    port: smtpPort,
                    user: smtpUser.trim(),
                    from: smtpFrom.trim(),
                    secure: smtpSecure,
                }));
                setSmtpConfigured(true);
                setSmtpPass("");
                setSmtpOpen(false);
            }
        } finally {
            setSavingSmtp(false);
        }
    }, [smtpHost, smtpPort, smtpUser, smtpPass, smtpFrom, smtpSecure]);

    const handleSendInit = useCallback(() => {
        if (!smtpConfigured) {
            setError("SMTP not configured. Please fill in and save your SMTP settings first.");
            return;
        }
        if (recipients.length === 0) { setError("No recipients match the selected filter."); return; }
        if (!subject.trim()) { setError("Please enter a subject line."); return; }
        if (!markdownBody.trim()) { setError("Please write an email body."); return; }

        setConfirmStep(1);
    }, [smtpConfigured, recipients, subject, markdownBody]);

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
            aborted: false
        });

        const failedRecipients: { email: string; reason: string }[] = [];
        let sentCount = 0;
        let failedCount = 0;
        let consecutiveFailures = 0;

        for (let i = 0; i < recipients.length; i++) {
            const recipient = recipients[i];
            
            if (consecutiveFailures >= 3) {
                setProgress(prev => prev ? { ...prev, aborted: true, active: false } : null);
                break;
            }

            setProgress(prev => prev ? { ...prev, current: i + 1 } : null);

            try {
                const res = await fetch("/api/send-email", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ recipients: [recipient], subject, markdownBody }),
                });
                const data = await res.json();

                if (!res.ok || data.failed > 0) {
                    failedCount++;
                    consecutiveFailures++;
                    const reason = data.failedRecipients?.[0]?.reason || data.error || "Unknown error";
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

            setProgress(prev => prev ? { 
                ...prev, 
                sent: sentCount, 
                failed: failedCount, 
                consecutiveFailures, 
                failedRecipients: [...failedRecipients] 
            } : null);
            
            await new Promise(r => setTimeout(r, 150));
        }

        setProgress(prev => prev ? { ...prev, active: false } : null);

        await createAuditLog("EXECOM_EMAIL_BLAST", {
            subject,
            totalRecipients: recipients.length,
            sentRecipients: sentCount,
            failedRecipients: failedCount,
            failures: failedRecipients,
            aborted: consecutiveFailures >= 3
        });
    }, [recipients, subject, markdownBody]);

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/70 backdrop-blur-md"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 24 }}
                className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#131314] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07] flex-shrink-0 bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#4285F4]/10 border border-[#4285F4]/30 flex items-center justify-center">
                            <EnvelopeIcon className="w-5 h-5 text-[#4285F4]" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-white tracking-tight">
                                {isSingleMode ? `Email ${singleRecipient!.name}` : "Send Bulk Notifications"}
                            </h2>
                            <p className="text-[11px] text-gray-400">
                                {isSingleMode
                                    ? singleRecipient!.email
                                    : `${recipients.length} recipient${recipients.length !== 1 ? "s" : ""} selected`}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar */}
                    {!isSingleMode && (
                        <div className="w-72 flex-shrink-0 border-r border-white/[0.06] bg-[#18191b] flex flex-col overflow-y-auto hidden md:flex">
                            <div className="p-6 space-y-4 border-b border-white/[0.05]">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Recipient Filter</label>
                                <div className="flex flex-col gap-2">
                                    {FILTER_OPTIONS.map((opt) => {
                                        const count = opt.key === "all"
                                            ? applications.length
                                            : applications.filter((a) => a.status === opt.key).length;
                                        const Icon = opt.icon;
                                        const isActive = filter === opt.key;
                                        return (
                                            <button
                                                key={opt.key}
                                                onClick={() => handleFilterChange(opt.key)}
                                                className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${isActive ? opt.active : "border-white/[0.05] text-gray-400 hover:text-gray-200 hover:bg-white/[0.02]"}`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Icon className="w-4 h-4" />
                                                    {opt.label}
                                                </div>
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${isActive ? "bg-white/20" : "bg-white/5"}`}>{count}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* SMTP Config */}
                            <div className="p-6">
                                <button
                                    onClick={() => setSmtpOpen(!smtpOpen)}
                                    className="w-full flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 hover:text-gray-200 transition"
                                >
                                    <span>SMTP Settings</span>
                                    <ChevronDownIcon className={`w-3 h-3 transition-transform ${smtpOpen ? "rotate-180" : ""}`} />
                                </button>
                                
                                <AnimatePresence>
                                    {smtpOpen ? (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-2.5 overflow-hidden">
                                            <input disabled={viaEnv} type="text" value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} placeholder="Host (e.g. smtp.gmail.com)" className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-1.5 text-[11px] text-white focus:border-[#4285F4] outline-none" />
                                            <input disabled={viaEnv} type="email" value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} placeholder="Email / Username" className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-1.5 text-[11px] text-white focus:border-[#4285F4] outline-none" />
                                            <input disabled={viaEnv} type="password" value={smtpPass} onChange={(e) => setSmtpPass(e.target.value)} placeholder="Password" className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-1.5 text-[11px] text-white focus:border-[#4285F4] outline-none" />
                                            {!viaEnv && (
                                                <button onClick={handleSaveSmtp} disabled={savingSmtp} className="w-full py-2 rounded-lg bg-[#4285F4]/10 border border-[#4285F4]/20 text-[10px] font-bold text-[#4285F4] hover:bg-[#4285F4]/20 transition">
                                                    {savingSmtp ? "Saving..." : "Save Settings"}
                                                </button>
                                            )}
                                        </motion.div>
                                    ) : (
                                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${smtpConfigured ? "bg-[#34A853]/10 border border-[#34A853]/20" : "bg-[#EA4335]/10 border border-[#EA4335]/20"}`}>
                                            <ShieldCheckIcon className={`w-3.5 h-3.5 ${smtpConfigured ? "text-[#34A853]" : "text-[#EA4335]"}`} />
                                            <span className={`text-[10px] font-medium ${smtpConfigured ? "text-[#34A853]" : "text-[#EA4335]"}`}>
                                                {smtpConfigured ? "Ready to dispatch" : "SMTP Missing"}
                                            </span>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}

                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col overflow-y-auto divide-y divide-white/[0.05]">
                        {/* Progress Panel */}
                        <AnimatePresence>
                            {progress && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-[#18191b] border-b border-white/[0.06] p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            {progress.active ? (
                                                <div className="w-9 h-9 rounded-xl bg-[#4285F4]/20 flex items-center justify-center animate-pulse">
                                                    <PaperAirplaneIcon className="w-5 h-5 text-[#4285F4]" />
                                                </div>
                                            ) : progress.sent === progress.total ? (
                                                <div className="w-9 h-9 rounded-xl bg-[#34A853]/20 border border-[#34A853]/30 flex items-center justify-center">
                                                    <CheckCircleIcon className="w-5 h-5 text-[#34A853]" />
                                                </div>
                                            ) : (
                                                <div className="w-9 h-9 rounded-xl bg-[#FBBC04]/20 border border-[#FBBC04]/30 flex items-center justify-center">
                                                    <ClockIcon className="w-5 h-5 text-[#FBBC04]" />
                                                </div>
                                            )}
                                            <div>
                                                <h4 className="text-sm font-bold text-white leading-tight">
                                                    {progress.active ? "Dispatch in progress..." : progress.aborted ? "Dispatch Aborted" : "Campaign Complete"}
                                                </h4>
                                                <p className="text-[11px] text-gray-400">
                                                    {progress.active ? `Sending to ${recipients[progress.current - 1]?.email}` : "Summary of email activity"}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-xl font-bold text-white tabular-nums">
                                            {Math.round((progress.current / progress.total) * 100)}%
                                        </span>
                                    </div>

                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-4">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-[#4285F4] to-[#34A853]"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(progress.current / progress.total) * 100}%` }}
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <StatBox label="Total" value={progress.total} color="text-white" />
                                        <StatBox label="Sent" value={progress.sent} color="text-[#34A853]" />
                                        <StatBox label="Failed" value={progress.failed} color="text-[#EA4335]" />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Compose */}
                        <div className="px-6 py-4 space-y-4">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-1 p-1 bg-white/[0.03] border border-white/[0.08] rounded-xl">
                                    <button onClick={() => setPreviewMode(false)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${!previewMode ? "bg-[#4285F4]/20 text-[#4285F4] border border-[#4285F4]/30" : "text-gray-400 hover:text-gray-200"}`}>
                                        <PencilSquareIcon className="w-3.5 h-3.5" /> Write
                                    </button>
                                    <button onClick={() => setPreviewMode(true)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${previewMode ? "bg-[#4285F4]/20 text-[#4285F4] border border-[#4285F4]/30" : "text-gray-400 hover:text-gray-200"}`}>
                                        <EyeIcon className="w-3.5 h-3.5" /> Preview
                                    </button>
                                </div>

                                <div className="relative" ref={templatesRef}>
                                    <button onClick={() => setShowTemplates(!showTemplates)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-300 hover:text-white border border-white/[0.1] hover:bg-white/[0.04] transition-all">
                                        <SparklesIcon className="w-3.5 h-3.5 text-[#FBBC04]" /> Templates
                                    </button>
                                    <AnimatePresence>
                                        {showTemplates && (
                                            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} className="absolute top-full mt-2 right-0 bg-[#1e1f20] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-20 min-w-[200px]">
                                                {(["accepted", "rejected", "pending"] as const).map((key) => (
                                                    <button key={key} onClick={() => { setSubject(templates[key].subject); setMarkdownBody(templates[key].body); setShowTemplates(false); }} className="w-full text-left px-4 py-2.5 text-xs text-gray-300 hover:bg-[#4285F4]/10 hover:text-[#4285F4] transition capitalize">
                                                        {key} Template
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Subject</label>
                                <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#4285F4] transition" />
                            </div>

                            {!previewMode ? (
                                <div data-color-mode="dark">
                                    <MDEditor
                                        value={markdownBody}
                                        onChange={(val) => setMarkdownBody(val || "")}
                                        preview="edit"
                                        height={380}
                                        className="custom-md-editor"
                                        visibleDragbar={false}
                                        commands={[
                                            commands.bold, commands.italic,
                                            { name: 'underline', keyCommand: 'underline', buttonProps: { 'aria-label': 'Underline' }, icon: <FaUnderline className="w-3" />, execute: (state, api) => { api.replaceSelection(`<u>${state.selectedText}</u>`); } },
                                            commands.strikethrough, commands.divider,
                                            commands.title, commands.unorderedListCommand, commands.orderedListCommand,
                                            commands.quote, commands.link,
                                        ]}
                                        style={{ backgroundColor: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px" }}
                                    />
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl overflow-hidden min-h-[380px] border border-white/20 p-8">
                                    {previewLoading ? <div className="text-gray-400 text-center py-20">Rendering...</div> : <div className="prose prose-sm max-w-none text-gray-900" dangerouslySetInnerHTML={{ __html: previewHtml || "" }} />}
                                </div>
                            )}

                            {error && <div className="p-3 bg-[#EA4335]/10 border border-[#EA4335]/20 rounded-lg text-xs text-[#EA4335]">{error}</div>}

                            <div className="pt-4 flex justify-end">
                                <button
                                    onClick={handleSendInit}
                                    disabled={progress?.active}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-[#4285F4] hover:bg-[#3367D6] text-white rounded-full text-sm font-semibold shadow-md transition-all disabled:opacity-50"
                                >
                                    <PaperAirplaneIcon className="w-4 h-4" />
                                    Send Email
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Confirm Dialog */}
                <AnimatePresence>
                    {confirmStep === 1 && (
                        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#1e1f20] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4" onClick={e => e.stopPropagation()}>
                                <h3 className="text-lg font-bold text-white">Confirm Email Broadcast</h3>
                                <p className="text-sm text-gray-300">
                                    You are about to dispatch an email to <strong className="text-[#4285F4]">{recipients.length} recipients</strong> with subject:
                                </p>
                                <div className="p-3 bg-white/[0.03] border border-white/10 rounded-xl text-xs text-gray-200 italic font-mono truncate">
                                    {subject}
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button onClick={() => setConfirmStep(0)} className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white transition">Cancel</button>
                                    <button onClick={executeSend} className="px-5 py-2 rounded-full bg-[#4285F4] hover:bg-[#3367D6] text-white text-xs font-semibold shadow-md transition">Confirm & Blast</button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
