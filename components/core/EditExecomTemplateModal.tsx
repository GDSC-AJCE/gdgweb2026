"use client";

import React, { useState, useEffect } from "react";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { motion } from "framer-motion";
import { X, Check, FileText } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import GoogleBadge from "../GoogleBadge";

const DEFAULT_TEMPLATES: Record<string, { subject: string; body: string }> = {
    accepted: {
        subject: "🎉 Welcome to Google Developer Groups (GDG) Core Team!",
        body: `# Welcome to GDG Core, {{name}}! 🚀\n\nWe are excited to share that your application for the **Google Developer Groups (GDG)** Core Committee has been **accepted**!\n\n## Next Steps:\n1. **Onboarding Meetup**: Watch your inbox for calendar invites.\n2. **Discord / Slack Access**: You'll receive invitations to our internal organizers channel.\n3. **First Sprint**: We are gearing up for upcoming workshops and hackathons!\n\nWelcome to the team!\n\n— *GDG Lead & Core Organizers*`,
    },
    rejected: {
        subject: "Your Google Developer Groups (GDG) Core Application",
        body: `# Hi {{name}},\n\nThank you for applying to join the **GDG Core Committee**. We appreciate the passion and dedication you brought to your application.\n\nWhile we had an overwhelming number of strong candidates and are unable to offer you a core seat in this cohort, we warmly encourage you to continue attending our sessions and contributing as an active community member.\n\nKeep building and stay connected!\n\n— *GDG Core Team*`,
    },
    pending: {
        subject: "GDG Application Status Update",
        body: `# Hi {{name}},\n\nThank you for your patience while we review applications for the **GDG Core Committee**.\n\nOur panel is reviewing candidate profiles and will reach out with interview schedules or updates shortly.\n\nBest,\n*GDG Core Team*`,
    },
    scheduled: {
        subject: "GDG Core Team Interview Invitation",
        body: `# Hi {{name}}! 👋\n\nYour interview for the **GDG Core Committee** has been scheduled.\n\n### Interview Details:\n- **Time**: {{time}}\n- **Meeting Link**: {{link}}\n\nPlease test your audio and video before the call. We look forward to speaking with you!\n\nBest regards,\n*GDG Lead & Core Team*`
    }
};

interface EditExecomTemplateModalProps {
    onClose: () => void;
}

export default function EditExecomTemplateModal({ onClose }: EditExecomTemplateModalProps) {
    useBodyScrollLock();
    const [activeTab, setActiveTab] = useState<"accepted" | "rejected" | "pending" | "scheduled">("accepted");
    const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const docSnap = await getDoc(doc(db, "settings", "execomEmailTemplates"));
                if (docSnap.exists()) {
                    setTemplates({ ...DEFAULT_TEMPLATES, ...docSnap.data() });
                }
            } catch (err) {
                console.error("Error fetching templates:", err);
            }
        };
        fetchTemplates();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await setDoc(doc(db, "settings", "execomEmailTemplates"), templates);
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (err) {
            console.error("Error saving templates:", err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
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
                className="relative w-full max-w-2xl bg-[#18191b] border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-xs"
            >
                {/* Header */}
                <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-[#4285F4]" />
                        <h3 className="text-base font-bold text-white tracking-tight">Email Templates Editor</h3>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/5 text-zinc-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 py-3 border-b border-white/10">
                    {(["accepted", "rejected", "pending", "scheduled"] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-3.5 py-1.5 rounded-full capitalize font-semibold transition ${
                                activeTab === tab
                                    ? "bg-white text-black"
                                    : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Editor Body */}
                <div className="flex-1 overflow-y-auto py-4 space-y-4">
                    <div>
                        <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Subject Line</label>
                        <input
                            type="text"
                            value={templates[activeTab]?.subject || ""}
                            onChange={(e) => setTemplates({
                                ...templates,
                                [activeTab]: { ...templates[activeTab], subject: e.target.value }
                            })}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-medium text-xs focus:outline-none focus:border-[#4285F4]"
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="text-[10px] font-mono uppercase text-zinc-400">Message Body (Markdown)</label>
                            <span className="text-[10px] font-mono text-zinc-500">Supports &#123;&#123;name&#125;&#125;, &#123;&#123;time&#125;&#125;, &#123;&#123;link&#125;&#125;</span>
                        </div>
                        <textarea
                            rows={10}
                            value={templates[activeTab]?.body || ""}
                            onChange={(e) => setTemplates({
                                ...templates,
                                [activeTab]: { ...templates[activeTab], body: e.target.value }
                            })}
                            className="w-full p-4 rounded-2xl bg-zinc-900 border border-zinc-700 text-white font-mono text-xs focus:outline-none focus:border-[#4285F4] resize-none"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                    {saved ? (
                        <span className="text-[#34A853] text-xs font-semibold flex items-center gap-1">
                            <Check className="w-4 h-4" /> Templates Saved
                        </span>
                    ) : <span />}

                    <div className="flex gap-2">
                        <button onClick={onClose} className="px-4 py-2 rounded-full border border-zinc-700 text-zinc-300">
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-6 py-2 rounded-full bg-[#4285F4] hover:bg-[#3367D6] disabled:opacity-50 text-white font-semibold shadow-md flex items-center gap-1.5"
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
