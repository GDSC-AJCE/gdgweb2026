"use client";

import React, { useState, useEffect } from "react";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { motion, AnimatePresence } from "framer-motion";
import {
    XMarkIcon, PaperAirplaneIcon, ClockIcon, CheckCircleIcon, ExclamationCircleIcon, EnvelopeIcon,
    ShieldCheckIcon
} from "@heroicons/react/24/outline";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { fmtDate, slotTime } from "@/lib/scheduler-utils";
import { createAuditLog } from "@/lib/audit";
import MDEditor, { commands } from "@uiw/react-md-editor";
import { FaUnderline } from "react-icons/fa";

interface Recipient {
    id: string;
    name: string;
    email: string;
    time: string;
    link: string;
    status: "idle" | "sending" | "sent" | "error";
    error?: string;
}

const DEFAULT_TEMPLATE = {
    subject: "Interview Scheduled: Google Developer Groups Core Team",
    body: `# Hi {{name}}! 👋

We are excited to invite you to an interview for the **Google Developer Groups (GDG) Core Team**.

### Interview Details
- **Date & Time:** {{time}}
- **Meeting Link:** {{link}}

Please ensure you have a quiet environment and a stable internet connection. We are excited to learn more about your experience and how you want to contribute!

Best regards,  
*The GDG Core Team*`
};

export default function ExecomScheduleEmailModal({ onClose, applications }: { onClose: () => void, applications: any[] }) {
    useBodyScrollLock();
    const [loading, setLoading] = useState(true);
    const [recipients, setRecipients] = useState<Recipient[]>([]);
    const [subject, setSubject] = useState(DEFAULT_TEMPLATE.subject);
    const [markdownBody, setMarkdownBody] = useState(DEFAULT_TEMPLATE.body);
    const [progress, setProgress] = useState<{ current: number; total: number; sent: number; failed: number; active: boolean; aborted?: boolean } | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [confirmStep, setConfirmStep] = useState(0);

    useEffect(() => {
        const prepare = async () => {
            try {
                const schedSnap = await getDoc(doc(db, "settings", "execomSchedule"));
                const tempSnap = await getDoc(doc(db, "settings", "execomEmailTemplates"));
                
                if (tempSnap.exists() && tempSnap.data().scheduled) {
                    setSubject(tempSnap.data().scheduled.subject || DEFAULT_TEMPLATE.subject);
                    setMarkdownBody(tempSnap.data().scheduled.body || DEFAULT_TEMPLATE.body);
                }

                if (!schedSnap.exists()) {
                    setRecipients([]);
                    setLoading(false);
                    return;
                }

                const days = schedSnap.data().days || [];
                const list: Recipient[] = [];

                days.forEach((day: any) => {
                    (day.panels || []).forEach((panel: any) => {
                        (panel.slots || []).forEach((slot: any) => {
                            if (slot.appId) {
                                const app = applications.find(a => a.id === slot.appId);
                                if (app) {
                                    list.push({
                                        id: slot.appId,
                                        name: app.name,
                                        email: app.email,
                                        time: `${fmtDate(day.date)} at ${slotTime(panel.startTime, slot.slotIndex, panel.slotMinutes)}`,
                                        link: panel.meetingLink || "Meeting link will be shared shortly.",
                                        status: "idle"
                                    });
                                }
                            }
                        });
                    });
                });

                setRecipients(list);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        prepare();
    }, [applications]);

    const handleSend = async () => {
        setConfirmStep(0);
        setIsSending(true);
        setProgress({ current: 0, total: recipients.length, sent: 0, failed: 0, active: true, aborted: false });

        let consecutiveFailures = 0;
        let sentCount = 0;
        let failedCount = 0;

        for (let i = 0; i < recipients.length; i++) {
            if (consecutiveFailures >= 3) {
                setProgress(prev => prev ? { ...prev, aborted: true, active: false } : null);
                break;
            }

            const r = recipients[i];
            setRecipients(prev => prev.map((rc, idx) => idx === i ? { ...rc, status: "sending" } : rc));
            setProgress(prev => prev ? { ...prev, current: i + 1 } : null);

            const personalizedBody = markdownBody
                .replace(/{{name}}/g, r.name)
                .replace(/{{time}}/g, r.time)
                .replace(/{{link}}/g, r.link);

            try {
                const res = await fetch("/api/send-email", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        recipients: [{ name: r.name, email: r.email }],
                        subject: subject.replace(/{{name}}/g, r.name),
                        markdownBody: personalizedBody
                    })
                });

                if (!res.ok) throw new Error(await res.text());

                setRecipients(prev => prev.map((rc, idx) => idx === i ? { ...rc, status: "sent" } : rc));
                setProgress(prev => prev ? { ...prev, sent: prev.sent + 1 } : null);
                sentCount++;
                consecutiveFailures = 0;
            } catch (err: any) {
                setRecipients(prev => prev.map((rc, idx) => idx === i ? { ...rc, status: "error", error: err.message } : rc));
                setProgress(prev => prev ? { ...prev, failed: prev.failed + 1 } : null);
                failedCount++;
                consecutiveFailures++;
            }

            await new Promise(resolve => setTimeout(resolve, 200));
        }

        setIsSending(false);
        setProgress(prev => prev ? { ...prev, active: false } : null);

        await createAuditLog("EXECOM_SCHEDULE_BLAST", {
            subject,
            totalRecipients: recipients.length,
            sent: sentCount,
            failed: failedCount,
            aborted: consecutiveFailures >= 3
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 24 }}
                className="relative w-full max-w-5xl h-[85vh] bg-[#131314] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                onClick={e => e.stopPropagation()}>
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07] flex-shrink-0 bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#4285F4]/10 border border-[#4285F4]/30 flex items-center justify-center">
                            <PaperAirplaneIcon className="w-5 h-5 text-[#4285F4]" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-white tracking-tight">Send Interview Schedules</h2>
                            <p className="text-[11px] text-gray-400">
                                {recipients.length} personalized invitation{recipients.length !== 1 ? 's' : ''} queued
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar: Recipients */}
                    <div className="w-72 flex-shrink-0 border-r border-white/[0.06] bg-[#18191b] flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-white/[0.05]">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Target Applicants</label>
                            <div className="px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                                <p className="text-[11px] text-gray-300 leading-relaxed line-clamp-2">
                                    {recipients.map(r => r.name).join(", ") || "No interviews booked yet."}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-full gap-2 opacity-60">
                                    <div className="w-6 h-6 border-2 border-[#4285F4] border-t-transparent rounded-full animate-spin" />
                                    <p className="text-[11px] text-gray-400">Loading Schedule...</p>
                                </div>
                            ) : (
                                recipients.map((r, i) => (
                                    <div key={i} className={`p-3 rounded-xl border transition-all ${
                                        r.status === 'sent' ? 'bg-[#34A853]/10 border-[#34A853]/20' : 
                                        r.status === 'error' ? 'bg-[#EA4335]/10 border-[#EA4335]/20' : 
                                        r.status === 'sending' ? 'bg-[#4285F4]/10 border-[#4285F4]/30' :
                                        'bg-white/[0.02] border-white/5'
                                    }`}>
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-xs font-bold text-white truncate">{r.name}</p>
                                            {r.status === 'sent' ? <CheckCircleIcon className="w-3.5 h-3.5 text-[#34A853]" /> : 
                                             r.status === 'error' ? <ExclamationCircleIcon className="w-3.5 h-3.5 text-[#EA4335]" /> :
                                             r.status === 'sending' ? <div className="w-3 h-3 border-2 border-[#4285F4] border-t-transparent rounded-full animate-spin" /> : null}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mb-0.5 truncate">
                                            <EnvelopeIcon className="w-3 h-3 flex-shrink-0" />
                                            <span className="truncate">{r.email}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] text-[#4285F4] font-medium">
                                            <ClockIcon className="w-3 h-3 flex-shrink-0" />
                                            <span className="truncate">{r.time}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Main Area: Editor */}
                    <div className="flex-1 flex flex-col bg-[#131314] relative overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Subject Line</label>
                                <input value={subject} onChange={e => setSubject(e.target.value)}
                                    className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#4285F4] outline-none transition" />
                            </div>

                            <div data-color-mode="dark" className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Message Content (Markdown)</label>
                                <div className="rounded-xl overflow-hidden border border-white/[0.1] bg-[#18191b]">
                                    <MDEditor value={markdownBody} onChange={v => setMarkdownBody(v || "")} height={380} 
                                        visibleDragbar={false}
                                        commands={[
                                            commands.bold, commands.italic,
                                            {
                                                name: 'underline', keyCommand: 'underline', buttonProps: { 'aria-label': 'Underline' },
                                                icon: <FaUnderline className="w-3" />,
                                                execute: (state, api) => { api.replaceSelection(`<u>${state.selectedText}</u>`); },
                                            },
                                            commands.strikethrough, commands.divider,
                                            commands.title, commands.unorderedListCommand, commands.orderedListCommand,
                                            commands.link,
                                        ]}
                                        style={{ backgroundColor: "transparent" }}
                                    />
                                </div>
                                <div className="text-[11px] text-gray-400 mt-2 flex flex-wrap gap-3">
                                    <span>Variables:</span>
                                    <code className="text-[#4285F4] font-mono">{"{{name}}"}</code>
                                    <code className="text-[#4285F4] font-mono">{"{{time}}"}</code>
                                    <code className="text-[#4285F4] font-mono">{"{{link}}"}</code>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-white/[0.06] bg-[#18191b] flex items-center justify-between flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <ShieldCheckIcon className="w-4 h-4 text-[#34A853]" />
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">SMTP Ready</span>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={onClose} className="px-5 py-2 rounded-full text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/5 transition">
                                    Cancel
                                </button>
                                <button onClick={() => setConfirmStep(1)} disabled={isSending || recipients.length === 0}
                                    className="px-6 py-2 rounded-full bg-[#4285F4] hover:bg-[#3367D6] text-white text-xs font-semibold shadow-md transition disabled:opacity-50 flex items-center gap-2">
                                    <PaperAirplaneIcon className="w-3.5 h-3.5" />
                                    Send Schedules
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Confirm Overlay */}
                <AnimatePresence>
                    {confirmStep === 1 && (
                        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-[#1e1f20] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4"
                                onClick={e => e.stopPropagation()}>
                                <h3 className="text-lg font-bold text-white">Confirm Schedule Dispatch</h3>
                                <p className="text-gray-300 text-xs leading-relaxed">
                                    You are about to send personalized interview invites to <strong className="text-[#4285F4]">{recipients.length} applicants</strong>.
                                </p>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button onClick={() => setConfirmStep(0)} className="px-4 py-2 rounded-full text-xs text-gray-400 hover:text-white transition">Cancel</button>
                                    <button onClick={handleSend} className="px-5 py-2 rounded-full bg-[#4285F4] hover:bg-[#3367D6] text-white text-xs font-semibold shadow-md transition">
                                        Confirm & Dispatch
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
