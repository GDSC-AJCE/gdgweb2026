"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Mail,
    Send,
    ExternalLink,
    Users,
    Sparkles,
    CheckCircle2,
    Clock,
    Search,
    Check,
    X,
    FileText,
    Eye,
    Edit3,
    AlertCircle,
    RotateCw,
    MessageSquare
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useDialog } from "@/context/DialogContext";
import GoogleBadge from "../GoogleBadge";

interface Participant {
    id: string;
    name: string;
    email: string;
    userId: string;
    department?: string;
    college?: string;
    phoneNumber?: string;
    registeredAt?: any;
}

interface EventMailTabProps {
    eventId: string;
    eventTitle: string;
    eventDate?: string;
    participants: Participant[];
    isWriter?: boolean;
}

export default function EventMailTab({
    eventId,
    eventTitle,
    eventDate,
    participants,
    isWriter = true,
}: EventMailTabProps) {
    const router = useRouter();
    const dialog = useDialog();

    // Selection state
    const [selectedIds, setSelectedIds] = useState<Set<string>>(
        new Set(participants.map((p) => p.id))
    );
    const [searchQuery, setSearchQuery] = useState("");

    // Message Editor state
    const [subject, setSubject] = useState(`Important Update regarding ${eventTitle} — GDG on Campus AJCE`);
    const [markdownBody, setMarkdownBody] = useState(
`Hello {{name}},

Thank you for registering for **${eventTitle}** hosted by **Google Developer Groups on Campus, Amal Jyothi College of Engineering**.

### 🗓️ Event Information:
- **Event:** ${eventTitle}
- **Date:** ${eventDate || "Upcoming"}
- **Organized by:** GDG on Campus AJCE

Please ensure you join our community group and stay tuned for hands-on technical sessions and workshop resources.

If you have any questions, feel free to reply to this email.

Best regards,  
**GDG on Campus AJCE Team**  
Amal Jyothi College of Engineering`.trim()
    );

    const [activeSubTab, setActiveSubTab] = useState<"compose" | "preview">("compose");
    const [sending, setSending] = useState(false);
    const [sendProgress, setSendProgress] = useState<{ sent: number; total: number; failed: number } | null>(null);

    // Filter participants
    const filteredParticipants = useMemo(() => {
        return participants.filter(
            (p) =>
                p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.department?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [participants, searchQuery]);

    const toggleSelect = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
    };

    const selectAll = () => {
        setSelectedIds(new Set(filteredParticipants.map((p) => p.id)));
    };

    const deselectAll = () => {
        setSelectedIds(new Set());
    };

    // Open in Mail Studio (Transfers participants via localStorage)
    const handleOpenInMailStudio = () => {
        const selectedRecipients = participants
            .filter((p) => selectedIds.has(p.id))
            .map((p, index) => ({
                id: index + 1,
                name: p.name,
                email: p.email,
                category: p.department || "Attendee",
                team: eventTitle,
                date: eventDate || new Date().toLocaleDateString(),
                time: "10:00 AM",
                time_slot: "10:00 AM",
                status: "Pending" as const,
                isValid: true,
                selected: true
            }));

        try {
            localStorage.setItem("gdg_mail_studio_recipients", JSON.stringify(selectedRecipients));
            localStorage.setItem("gdg_mail_studio_event_title", eventTitle);
        } catch (e) {
            console.error("Storage error:", e);
        }

        router.push(`/admin?tab=mailer&eventId=${eventId}`);
    };

    // Quick Template Switcher
    const applyTemplate = (type: "confirmation" | "reminder" | "certificate" | "custom") => {
        if (type === "confirmation") {
            setSubject(`Registration Confirmed: ${eventTitle} — GDG AJCE`);
            setMarkdownBody(
`Hello {{name}},

Your seat for **${eventTitle}** is officially confirmed! 🚀

We are thrilled to have you join us for an inspiring session exploring modern Google technologies and developer tools.

### 📍 Logistics:
- **Event:** ${eventTitle}
- **Date & Time:** ${eventDate || "To be announced"}
- **Venue:** Amal Jyothi College of Engineering / Google Meet

See you there!

Warmly,  
**Team GDG on Campus AJCE**`.trim()
            );
        } else if (type === "reminder") {
            setSubject(`Reminder: ${eventTitle} is happening soon!`);
            setMarkdownBody(
`Hello {{name}},

This is a friendly reminder that **${eventTitle}** is starting soon!

Please arrive 10 minutes prior to the scheduled time with your laptop and student ID.

Looking forward to an energetic technical session!

Best regards,  
**Team GDG on Campus AJCE**`.trim()
            );
        } else if (type === "certificate") {
            setSubject(`🎓 Your Certificate for ${eventTitle} is Available!`);
            setMarkdownBody(
`Hello {{name}},

Congratulations on completing **${eventTitle}** with Google Developer Groups on Campus AJCE!

Your official, cryptographically verifiable **Certificate of Participation** has been generated and is now accessible in your GDG Credential Wallet:

[**View & Verify Your Certificate**](${typeof window !== 'undefined' ? window.location.origin : ''}/profile/certificates)

You can share your verified credential on LinkedIn and add it to your technical portfolio.

Keep innovating!

Warm regards,  
**Team GDG on Campus AJCE**`.trim()
            );
        }
    };

    // Send Broadcast to Selected Students
    const handleSendBroadcast = async () => {
        const recipientsToSend = participants.filter((p) => selectedIds.has(p.id));
        if (recipientsToSend.length === 0) {
            dialog.alert("Please select at least one recipient.", "No Recipients");
            return;
        }

        const confirmed = await dialog.confirm(
            `You are about to dispatch this email to ${recipientsToSend.length} selected students. Proceed with broadcast?`,
            "Confirm Broadcast"
        );
        if (!confirmed) return;

        setSending(true);
        setSendProgress({ sent: 0, total: recipientsToSend.length, failed: 0 });

        try {
            const res = await fetch("/api/send-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    recipients: recipientsToSend.map((r) => ({ name: r.name, email: r.email })),
                    subject,
                    markdownBody,
                })
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.needsSetup) {
                    dialog.alert(
                        "Resend API Key is not configured in .env. You can click 'Connect to Mail Studio' above to dispatch via Google Apps Script Gateway or Gmail SMTP directly!",
                        "Resend Setup Needed"
                    );
                } else {
                    dialog.alert(`Broadcast failed: ${data.error || "Unknown error"}`, "Error");
                }
                return;
            }

            setSendProgress({ sent: data.sent || recipientsToSend.length, total: recipientsToSend.length, failed: data.failed || 0 });
            dialog.alert(
                `Broadcast complete! Sent: ${data.sent} emails${data.failed ? `, Failed: ${data.failed}` : ""}.`,
                "Broadcast Sent"
            );
        } catch (err: any) {
            console.error("Broadcast error:", err);
            dialog.alert(`Failed to send email broadcast: ${err.message}`, "Broadcast Error");
        } finally {
            setSending(false);
        }
    };

    // First selected recipient for preview
    const previewRecipient = participants.find((p) => selectedIds.has(p.id)) || participants[0] || {
        name: "Alex Morgan",
        email: "alex@amaljyothi.ac.in"
    };

    const renderedPreviewSubject = subject.replace(/\{\{name\}\}/g, previewRecipient.name);
    const renderedPreviewBody = markdownBody
        .replace(/\{\{name\}\}/g, previewRecipient.name)
        .replace(/\{\{email\}\}/g, previewRecipient.email)
        .replace(/\{\{eventTitle\}\}/g, eventTitle)
        .replace(/\{\{date\}\}/g, eventDate || "Scheduled Date");

    return (
        <div className="space-y-8 text-[#2c2e2a]">
            {/* Top Header Card */}
            <div className="bg-[#ffffff] border border-[#d5d5d4] rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#EA4335]/10 border border-[#EA4335]/20 flex items-center justify-center text-[#EA4335] shrink-0">
                        <Mail className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold text-[#2c2e2a] tracking-tight">
                                Attendee Broadcast & Mail Studio
                            </h2>
                            <GoogleBadge label="EMAIL GATEWAY" variant="red" size="sm" />
                        </div>
                        <p className="text-xs text-[#80827f]">
                            Dispatch announcements, schedule updates, and certificate notifications to attendees of {eventTitle}.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    {/* Connect to Mail Studio Button */}
                    <button
                        type="button"
                        onClick={handleOpenInMailStudio}
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#2c2e2a] hover:bg-black text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                        title="Transfers this event's attendees into Mail Studio for advanced Figma layouts and Google Apps Script dispatcher"
                    >
                        <ExternalLink className="w-3.5 h-3.5 text-[#34A853]" />
                        <span>Connect to Mail Studio</span>
                    </button>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left: Recipient Selection (5 cols) */}
                <div className="lg:col-span-5 bg-[#ffffff] border border-[#d5d5d4] rounded-3xl p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-[#4285F4]" />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#2c2e2a]">
                                Target Attendees
                            </h3>
                        </div>
                        <span className="text-xs font-mono font-semibold text-[#4285F4]">
                            {selectedIds.size} / {participants.length} Selected
                        </span>
                    </div>

                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#80827f]" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter attendees by name, email, department..."
                            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#f5f1e4] border border-[#d5d5d4] text-xs text-[#2c2e2a] focus:outline-none focus:border-[#4285F4]"
                        />
                    </div>

                    {/* Quick Selection Buttons */}
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-[#f5f1e4]">
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={selectAll}
                                className="px-2.5 py-1 rounded-full bg-[#f5f1e4] hover:bg-[#eae5d8] border border-[#d5d5d4] text-[11px] font-medium text-[#2c2e2a] transition"
                            >
                                Select All
                            </button>
                            <button
                                type="button"
                                onClick={deselectAll}
                                className="px-2.5 py-1 rounded-full bg-[#f5f1e4] hover:bg-[#eae5d8] border border-[#d5d5d4] text-[11px] font-medium text-[#2c2e2a] transition"
                            >
                                Clear
                            </button>
                        </div>
                        <span className="text-[10px] text-[#80827f] font-mono">
                            Showing {filteredParticipants.length}
                        </span>
                    </div>

                    {/* Recipients Scroll List */}
                    <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                        {filteredParticipants.length === 0 ? (
                            <div className="text-center py-12 text-[#80827f] text-xs">
                                No participants match your search query.
                            </div>
                        ) : (
                            filteredParticipants.map((p) => {
                                const isSelected = selectedIds.has(p.id);
                                return (
                                    <div
                                        key={p.id}
                                        onClick={() => toggleSelect(p.id)}
                                        className={`p-3 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                                            isSelected
                                                ? "bg-[#4285F4]/10 border-[#4285F4]/40"
                                                : "bg-[#f5f1e4]/50 border-[#d5d5d4] hover:bg-[#f5f1e4]"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`w-4 h-4 rounded-md border flex items-center justify-center transition ${
                                                    isSelected
                                                        ? "bg-[#4285F4] border-[#4285F4] text-white"
                                                        : "border-[#d5d5d4] bg-white"
                                                }`}
                                            >
                                                {isSelected && <Check className="w-3 h-3" />}
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-[#2c2e2a] leading-tight">
                                                    {p.name}
                                                </p>
                                                <p className="text-[11px] text-[#80827f] font-mono">
                                                    {p.email}
                                                </p>
                                            </div>
                                        </div>

                                        {p.department && (
                                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-[#d5d5d4] text-[#80827f]">
                                                {p.department}
                                            </span>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Right: Mail Composer & Dispatcher (7 cols) */}
                <div className="lg:col-span-7 bg-[#ffffff] border border-[#d5d5d4] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                    {/* Header with Sub-tabs and Template shortcuts */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#f5f1e4]">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setActiveSubTab("compose")}
                                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition ${
                                    activeSubTab === "compose"
                                        ? "bg-[#2c2e2a] text-white"
                                        : "bg-[#f5f1e4] text-[#80827f] hover:text-[#2c2e2a]"
                                }`}
                            >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Compose</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveSubTab("preview")}
                                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition ${
                                    activeSubTab === "preview"
                                        ? "bg-[#2c2e2a] text-white"
                                        : "bg-[#f5f1e4] text-[#80827f] hover:text-[#2c2e2a]"
                                }`}
                            >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Preview</span>
                            </button>
                        </div>

                        {/* Preset Buttons */}
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-mono uppercase text-[#80827f]">Templates:</span>
                            <button
                                type="button"
                                onClick={() => applyTemplate("confirmation")}
                                className="px-2.5 py-1 rounded-full bg-[#f5f1e4] hover:bg-[#eae5d8] border border-[#d5d5d4] text-[10px] font-medium text-[#2c2e2a]"
                            >
                                Confirmation
                            </button>
                            <button
                                type="button"
                                onClick={() => applyTemplate("reminder")}
                                className="px-2.5 py-1 rounded-full bg-[#f5f1e4] hover:bg-[#eae5d8] border border-[#d5d5d4] text-[10px] font-medium text-[#2c2e2a]"
                            >
                                Reminder
                            </button>
                            <button
                                type="button"
                                onClick={() => applyTemplate("certificate")}
                                className="px-2.5 py-1 rounded-full bg-[#f5f1e4] hover:bg-[#eae5d8] border border-[#d5d5d4] text-[10px] font-medium text-[#4285F4]"
                            >
                                Certificate
                            </button>
                        </div>
                    </div>

                    {activeSubTab === "compose" ? (
                        <div className="space-y-4">
                            {/* Subject Line */}
                            <div>
                                <label className="text-[11px] font-mono uppercase text-[#80827f] block mb-1.5 font-semibold">
                                    Subject Line
                                </label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Enter subject..."
                                    className="w-full px-4 py-2.5 rounded-2xl bg-[#f5f1e4] border border-[#d5d5d4] text-xs font-medium text-[#2c2e2a] focus:outline-none focus:border-[#4285F4]"
                                />
                            </div>

                            {/* Dynamic Variables Pill Bar */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] font-mono text-[#80827f]">Variables:</span>
                                {["{{name}}", "{{email}}", "{{eventTitle}}", "{{date}}"].map((tag) => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => setMarkdownBody((prev) => `${prev} ${tag}`)}
                                        className="px-2 py-0.5 rounded-md bg-[#f5f1e4] border border-[#d5d5d4] font-mono text-[10px] text-[#4285F4] hover:bg-white"
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>

                            {/* Message Body Editor */}
                            <div>
                                <label className="text-[11px] font-mono uppercase text-[#80827f] block mb-1.5 font-semibold">
                                    Message Content (Markdown / HTML)
                                </label>
                                <textarea
                                    value={markdownBody}
                                    onChange={(e) => setMarkdownBody(e.target.value)}
                                    rows={12}
                                    placeholder="Type your broadcast message..."
                                    className="w-full p-4 rounded-2xl bg-[#f5f1e4] border border-[#d5d5d4] text-xs font-mono text-[#2c2e2a] focus:outline-none focus:border-[#4285F4] leading-relaxed resize-y"
                                />
                            </div>
                        </div>
                    ) : (
                        /* Live Personalized Preview */
                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-[#f5f1e4]/70 border border-[#d5d5d4] text-xs">
                                <p className="font-semibold text-[#2c2e2a]">
                                    To: <span className="text-[#4285F4] font-mono">{previewRecipient.email}</span> ({previewRecipient.name})
                                </p>
                                <p className="font-semibold text-[#2c2e2a] mt-1">
                                    Subject: <span className="text-[#2c2e2a] font-normal">{renderedPreviewSubject}</span>
                                </p>
                            </div>

                            <div className="p-6 rounded-2xl bg-white border border-[#d5d5d4] shadow-2xs space-y-3 prose prose-sm max-w-none text-xs text-[#2c2e2a] leading-relaxed whitespace-pre-line font-sans">
                                {renderedPreviewBody}
                            </div>
                        </div>
                    )}

                    {/* Dispatch Footer */}
                    <div className="pt-4 border-t border-[#f5f1e4] flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-xs text-[#80827f]">
                            <Sparkles className="w-4 h-4 text-[#FBBC04]" />
                            <span>
                                Dispatches personalized email with attendee variables.
                            </span>
                        </div>

                        {isWriter && (
                            <button
                                type="button"
                                onClick={handleSendBroadcast}
                                disabled={sending || selectedIds.size === 0}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#EA4335] hover:bg-[#d93025] text-white text-xs font-semibold shadow-xs transition disabled:opacity-50 cursor-pointer"
                            >
                                <Send className="w-3.5 h-3.5" />
                                <span>
                                    {sending
                                        ? "Broadcasting..."
                                        : `Send Broadcast to ${selectedIds.size} Recipients`}
                                </span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
