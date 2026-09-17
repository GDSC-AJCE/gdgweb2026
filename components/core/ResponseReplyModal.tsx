"use client";

import React, { useState, useEffect, useRef } from "react";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { createAuditLog } from "@/lib/audit";
import {
    XMarkIcon,
    EnvelopeIcon,
    CheckCircleIcon,
    ChevronDownIcon,
    SparklesIcon,
    ShieldCheckIcon,
    PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import MDEditor, { commands } from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { FaUnderline, FaStrikethrough } from "react-icons/fa";

interface ResponseReplyModalProps {
    onClose: () => void;
    response: {
        id: string;
        name: string;
        email: string;
        subject: string;
        message: string;
    };
}

const LS_KEY = "gdg_smtp_meta";

const TEMPLATES = [
    {
        name: "General Follow-up",
        subject: "Re: {{subject}}",
        body: `Hi {{name}},

Thank you for reaching out to **Google Developer Groups (GDG)**. 

Regarding your query about **{{subject}}**:
> {{message}}

[Your reply here...]

Best regards,  
The GDG Team`
    },
    {
        name: "Collaboration Inquiry",
        subject: "Collaboration with Google Developer Groups",
        body: `Hi {{name}},

We received your inquiry regarding collaboration with GDG. We are always eager to partner with tech leaders, universities, and creators.

[Add specific details about the collaboration...]

Looking forward to hearing from you.

Best,  
The GDG Core Team`
    }
];

export default function ResponseReplyModal({ onClose, response }: ResponseReplyModalProps) {
    useBodyScrollLock();

    const [subject, setSubject] = useState(`Re: ${response.subject}`);
    const [markdownBody, setMarkdownBody] = useState(`Hi ${response.name},\n\nThank you for reaching out to Google Developer Groups.\n\nRegarding your message:\n> ${response.message ? response.message.split('\n').join('\n> ') : ""}\n\n`);
    const [previewMode, setPreviewMode] = useState(false);
    const [previewHtml, setPreviewHtml] = useState<string | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);
    const templatesRef = useRef<HTMLDivElement>(null);

    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // SMTP Config
    const [smtpOpen, setSmtpOpen] = useState(false);
    const [smtpConfigured, setSmtpConfigured] = useState(false);
    const [viaEnv, setViaEnv] = useState(false);
    const [smtpHost, setSmtpHost] = useState("");
    const [smtpPort, setSmtpPort] = useState("587");
    const [smtpUser, setSmtpUser] = useState("");
    const [smtpPass, setSmtpPass] = useState("");
    const [smtpFrom, setSmtpFrom] = useState("");
    const [smtpSecure, setSmtpSecure] = useState(false);
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
                setPreviewHtml("<p>Failed to load preview.</p>");
                setPreviewLoading(false);
            });
        }
    }, [previewMode, markdownBody]);

    const handleSaveSmtp = async () => {
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
    };

    const handleSend = async () => {
        if (!smtpConfigured) {
            setError("SMTP not configured.");
            setSmtpOpen(true);
            return;
        }
        setIsSending(true);
        setError(null);
        try {
            const res = await fetch("/api/send-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    recipients: [{ name: response.name, email: response.email }],
                    subject,
                    markdownBody,
                }),
            });
            const data = await res.json();
            if (res.ok && data.sent > 0) {
                setSuccess(true);
                await createAuditLog("FORM_RESPONSE_REPLY", {
                    responseId: response.id,
                    recipient: response.email,
                    subject
                });

                try {
                    await updateDoc(doc(db, "contactFormResponses", response.id), {
                        replied: true,
                        repliedAt: new Date(),
                        isRead: true
                    });
                    
                    await createAuditLog("RESPONSE_AUTO_STATUS_UPDATE", {
                        responseId: response.id,
                        name: response.name,
                        status: "REPLIED"
                    });
                } catch (e) {
                    console.error("Error marking as replied:", e);
                }

                setTimeout(onClose, 2000);
            } else {
                setError(data.error || "Failed to send email.");
            }
        } catch (e: any) {
            setError(e.message || "Network error.");
        } finally {
            setIsSending(false);
        }
    };

    const applyTemplate = (template: typeof TEMPLATES[0]) => {
        let newBody = template.body
            .replace(/\{\{name\}\}/g, response.name)
            .replace(/\{\{subject\}\}/g, response.subject)
            .replace(/\{\{message\}\}/g, response.message);
        setMarkdownBody(newBody);
        setSubject(template.subject.replace(/\{\{subject\}\}/g, response.subject));
        setShowTemplates(false);
    };

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
                            <h2 className="text-base font-bold text-white tracking-tight">Reply to {response.name}</h2>
                            <p className="text-[11px] text-gray-400">{response.email}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar / Original Message */}
                    <div className="w-72 flex-shrink-0 border-r border-white/[0.06] bg-[#18191b] flex flex-col overflow-y-auto hidden md:flex">
                        <div className="p-6 space-y-4">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Original Message</label>
                            <div className="p-4 bg-white/[0.03] border border-white/10 rounded-xl space-y-2">
                                <p className="text-[11px] font-bold text-[#4285F4] uppercase tracking-tight">{response.subject}</p>
                                <p className="text-xs text-gray-300 leading-relaxed italic line-clamp-[15]">"{response.message}"</p>
                            </div>

                            <div className="pt-4 border-t border-white/5">
                                <button
                                    onClick={() => setSmtpOpen(!smtpOpen)}
                                    className="w-full flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-gray-200 transition"
                                >
                                    <span>SMTP Status</span>
                                    <ChevronDownIcon className={`w-3 h-3 transition-transform ${smtpOpen ? "rotate-180" : ""}`} />
                                </button>
                                <AnimatePresence>
                                    {smtpOpen && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="pt-3 space-y-3">
                                            <input disabled={viaEnv} type="text" value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} placeholder="SMTP Host" className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-[11px] text-white focus:border-[#4285F4] outline-none" />
                                            <input disabled={viaEnv} type="text" value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} placeholder="Username" className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-[11px] text-white focus:border-[#4285F4] outline-none" />
                                            <input disabled={viaEnv} type="password" value={smtpPass} onChange={(e) => setSmtpPass(e.target.value)} placeholder="Password" className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-[11px] text-white focus:border-[#4285F4] outline-none" />
                                            {!viaEnv && (
                                                <button onClick={handleSaveSmtp} disabled={savingSmtp} className="w-full py-2 rounded-lg bg-[#4285F4]/10 border border-[#4285F4]/20 text-[10px] font-bold text-[#4285F4] hover:bg-[#4285F4]/20 transition">
                                                    {savingSmtp ? "Saving..." : "Save Config"}
                                                </button>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                {!smtpOpen && (
                                    <div className={`mt-2 flex items-center gap-2 px-3 py-2 rounded-lg ${smtpConfigured ? "bg-[#34A853]/10 border border-[#34A853]/20 text-[#34A853]" : "bg-[#EA4335]/10 border border-[#EA4335]/20 text-[#EA4335]"} text-[10px] font-medium`}>
                                        <ShieldCheckIcon className="w-3.5 h-3.5" />
                                        {smtpConfigured ? "SMTP Ready" : "SMTP Missing"}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Editor */}
                    <div className="flex-1 flex flex-col overflow-y-auto divide-y divide-white/[0.05]">
                        {success ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                                <div className="w-20 h-20 rounded-3xl bg-[#34A853]/10 border border-[#34A853]/30 flex items-center justify-center mb-6">
                                    <CheckCircleIcon className="w-10 h-10 text-[#34A853]" />
                                </div>
                                <h3 className="text-2xl font-bold text-white tracking-tight">Email Sent!</h3>
                                <p className="text-gray-400 mt-2">Your reply has been delivered to {response.name}.</p>
                            </div>
                        ) : (
                            <>
                                <div className="px-6 py-4 space-y-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-1 p-1 bg-white/[0.03] border border-white/[0.08] rounded-xl">
                                            <button onClick={() => setPreviewMode(false)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${!previewMode ? "bg-[#4285F4]/20 text-[#4285F4] border border-[#4285F4]/30" : "text-gray-400 hover:text-gray-200"}`}>Write</button>
                                            <button onClick={() => setPreviewMode(true)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${previewMode ? "bg-[#4285F4]/20 text-[#4285F4] border border-[#4285F4]/30" : "text-gray-400 hover:text-gray-200"}`}>Preview</button>
                                        </div>

                                        <div className="relative" ref={templatesRef}>
                                            <button onClick={() => setShowTemplates(!showTemplates)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-300 hover:text-white border border-white/[0.1] hover:bg-white/[0.05] transition-all">
                                                <SparklesIcon className="w-3.5 h-3.5 text-[#FBBC04]" /> Templates
                                            </button>
                                            <AnimatePresence>
                                                {showTemplates && (
                                                    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} className="absolute top-full mt-2 right-0 bg-[#1e1f20] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-20 min-w-[220px]">
                                                        {TEMPLATES.map((t, i) => (
                                                            <button key={i} onClick={() => applyTemplate(t)} className="w-full text-left px-4 py-2.5 text-xs text-gray-300 hover:bg-[#4285F4]/10 hover:text-[#4285F4] transition">{t.name}</button>
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
                                                    { ...commands.strikethrough, icon: <FaStrikethrough className="w-3.5 h-3.5" /> },
                                                    commands.divider,
                                                    commands.title,
                                                    commands.unorderedListCommand,
                                                    commands.orderedListCommand,
                                                    commands.quote,
                                                    commands.link,
                                                ]}
                                                extraCommands={[]}
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
                                            onClick={handleSend}
                                            disabled={isSending}
                                            className="flex items-center gap-2 px-6 py-2.5 bg-[#4285F4] hover:bg-[#3367D6] text-white rounded-full text-sm font-semibold shadow-md transition-all disabled:opacity-50"
                                        >
                                            <PaperAirplaneIcon className={`w-4 h-4 ${isSending ? 'animate-ping' : ''}`} />
                                            {isSending ? "Sending..." : "Send Reply"}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
