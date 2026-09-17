"use client";

import { useState, useEffect } from "react";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { motion } from "framer-motion";
import {
    X,
    Check,
    Award,
    Search,
    Users,
    CheckCircle2
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp, getDocs, query, where, writeBatch, doc } from "firebase/firestore";
import { nanoid } from "nanoid";
import { useDialog } from "@/context/DialogContext";
import GoogleBadge from "../GoogleBadge";

interface Participant {
    id: string;
    name: string;
    email: string;
    userId: string;
    registeredAt: any;
    department?: string;
    college?: string;
}

interface CertificateTemplate {
    id: string;
    name: string;
    backgroundUrl: string;
    elements: any[];
}

interface IssueCertificateModalProps {
    template: CertificateTemplate;
    participants: Participant[];
    eventId: string;
    eventTitle: string;
    onClose: () => void;
}

export default function IssueCertificateModal({
    template,
    participants,
    eventId,
    eventTitle,
    onClose
}: IssueCertificateModalProps) {
    const dialog = useDialog();
    useBodyScrollLock();
    const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(new Set());
    const [search, setSearch] = useState("");
    const [issuing, setIssuing] = useState(false);
    const [issuedCount, setIssuedCount] = useState(0);
    const [alreadyIssued, setAlreadyIssued] = useState<Set<string>>(new Set());

    useEffect(() => {
        const checkIssued = async () => {
            try {
                const q = query(
                    collection(db, "events", eventId, "issuedCertificates"),
                    where("templateId", "==", template.id)
                );
                const snap = await getDocs(q);
                const issued = new Set(snap.docs.map((d) => d.data().recipientEmail?.toLowerCase()));
                setAlreadyIssued(issued);
            } catch (error) {
                console.error("Error checking issued certificates:", error);
            }
        };
        checkIssued();
    }, [template.id, eventId]);

    const filteredParticipants = participants.filter(
        (p) =>
            p.name?.toLowerCase().includes(search.toLowerCase()) ||
            p.email?.toLowerCase().includes(search.toLowerCase())
    );

    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedParticipants);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedParticipants(newSet);
    };

    const selectAll = () => {
        const eligible = filteredParticipants.filter(
            (p) => !alreadyIssued.has(p.email?.toLowerCase())
        );
        setSelectedParticipants(new Set(eligible.map((p) => p.id)));
    };

    const deselectAll = () => {
        setSelectedParticipants(new Set());
    };

    const handleIssue = async () => {
        if (selectedParticipants.size === 0) return;

        const confirmed = await dialog.confirm(
            `You are about to issue certificates to ${selectedParticipants.size} participants. Continue?`,
            "Issue Certificates"
        );
        if (!confirmed) return;

        setIssuing(true);
        try {
            const batch = writeBatch(db);
            const today = new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric"
            });

            const toIssue = participants.filter((p) => selectedParticipants.has(p.id));

            for (const p of toIssue) {
                const certId = `GDG-${nanoid(8).toUpperCase()}`;
                const certDocRef = doc(collection(db, "events", eventId, "issuedCertificates"));

                batch.set(certDocRef, {
                    certificateId: certId,
                    recipientName: p.name,
                    recipientEmail: p.email,
                    userId: p.userId || "manual",
                    eventId,
                    eventTitle,
                    templateId: template.id,
                    templateName: template.name,
                    backgroundUrl: template.backgroundUrl,
                    issueDate: today,
                    issuedAt: Timestamp.now(),
                    revoked: false
                });
            }

            await batch.commit();
            await dialog.alert(`Successfully issued ${toIssue.length} certificates!`, "Certificates Issued");
            onClose();
        } catch (error) {
            console.error("Error issuing certificates:", error);
            dialog.alert("Failed to issue certificates. Please try again.", "Error");
        } finally {
            setIssuing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-2xl bg-[#18191b] border border-white/10 rounded-3xl shadow-2xl p-6 overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="flex items-start justify-between pb-4 border-b border-white/10">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Award className="w-5 h-5 text-[#4285F4]" />
                            <h3 className="text-lg font-bold text-white tracking-tight">Issue Event Certificates</h3>
                        </div>
                        <p className="text-xs text-zinc-400">
                            Template: <span className="text-white font-medium">{template.name}</span> &bull; Event: <span className="text-white font-medium">{eventTitle}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/5 transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="py-4 space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search attendees by name or email..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-zinc-900 border border-zinc-750 text-white text-xs focus:outline-none focus:border-[#4285F4] transition"
                        />
                    </div>

                    <div className="flex items-center justify-between text-xs text-zinc-400">
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={selectAll}
                                className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-medium transition"
                            >
                                Select Eligible
                            </button>
                            <button
                                type="button"
                                onClick={deselectAll}
                                className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-medium transition"
                            >
                                Clear Selection
                            </button>
                        </div>
                        <span className="font-mono text-[11px]">
                            {selectedParticipants.size} Selected
                        </span>
                    </div>
                </div>

                {/* Participants Scroll List */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[250px]">
                    {filteredParticipants.length === 0 ? (
                        <div className="text-center py-12 text-zinc-500 text-xs">
                            No attendees matching your query.
                        </div>
                    ) : (
                        filteredParticipants.map((p) => {
                            const isIssued = alreadyIssued.has(p.email?.toLowerCase());
                            const isSelected = selectedParticipants.has(p.id);

                            return (
                                <div
                                    key={p.id}
                                    onClick={() => !isIssued && toggleSelection(p.id)}
                                    className={`p-3.5 rounded-2xl border transition flex items-center justify-between ${
                                        isIssued
                                            ? "bg-zinc-900/40 border-white/5 opacity-50 cursor-not-allowed"
                                            : isSelected
                                            ? "bg-[#4285F4]/10 border-[#4285F4]/40 cursor-pointer shadow-sm"
                                            : "bg-zinc-900/80 border-white/10 hover:border-zinc-700 cursor-pointer"
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${
                                                isSelected
                                                    ? "bg-[#4285F4] border-[#4285F4] text-white"
                                                    : "border-zinc-700 bg-zinc-800"
                                            }`}
                                        >
                                            {isSelected && <Check className="w-3.5 h-3.5" />}
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-white">{p.name}</p>
                                            <p className="text-[11px] text-zinc-400 font-mono">{p.email}</p>
                                        </div>
                                    </div>

                                    <div>
                                        {isIssued ? (
                                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                                                Already Issued
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-mono text-zinc-500">
                                                Eligible
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer Buttons */}
                <div className="pt-4 mt-2 border-t border-white/10 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={issuing}
                        className="px-5 py-2.5 rounded-full border border-zinc-700 text-zinc-300 font-medium text-xs hover:bg-white/5 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleIssue}
                        disabled={issuing || selectedParticipants.size === 0}
                        className="px-6 py-2.5 rounded-full bg-[#4285F4] hover:bg-[#3367D6] disabled:opacity-50 text-white font-semibold text-xs transition active:scale-95 shadow-md flex items-center gap-2"
                    >
                        {issuing ? (
                            "Issuing..."
                        ) : (
                            <>
                                <Award className="w-4 h-4" />
                                <span>Issue to {selectedParticipants.size} Recipients</span>
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
