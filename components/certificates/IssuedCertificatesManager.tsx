"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
    collection,
    query,
    getDocs,
    doc,
    deleteDoc,
    orderBy,
    updateDoc
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Search,
    Trash2,
    ExternalLink,
    Copy,
    Check,
    AlertCircle,
    Award
} from "lucide-react";
import Link from "next/link";
import { useDialog } from "@/context/DialogContext";
import GoogleBadge from "../GoogleBadge";

interface IssuedCertificate {
    id: string;
    certificateId: string;
    recipientName: string;
    recipientEmail: string;
    templateName: string;
    issueDate: string;
    issuedAt: any;
    revoked?: boolean;
}

interface IssuedCertificatesManagerProps {
    eventId: string;
    eventTitle: string;
    onClose: () => void;
}

export default function IssuedCertificatesManager({
    eventId,
    eventTitle,
    onClose
}: IssuedCertificatesManagerProps) {
    const dialog = useDialog();
    const [certificates, setCertificates] = useState<IssuedCertificate[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        fetchCertificates();
    }, [eventId]);

    const fetchCertificates = async () => {
        try {
            const q = query(
                collection(db, "events", eventId, "issuedCertificates"),
                orderBy("issuedAt", "desc")
            );
            const snapshot = await getDocs(q);
            const certs = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            })) as IssuedCertificate[];
            setCertificates(certs);
        } catch (error) {
            console.error("Error fetching certificates:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (cert: IssuedCertificate) => {
        const confirmed = await dialog.confirm(
            `Permanently delete certificate for ${cert.recipientName}? This cannot be undone.`,
            "Delete Certificate"
        );
        if (!confirmed) return;

        try {
            await deleteDoc(doc(db, "events", eventId, "issuedCertificates", cert.id));
            setCertificates(certificates.filter(c => c.id !== cert.id));
        } catch (error) {
            console.error("Error deleting certificate:", error);
            dialog.alert("Failed to delete certificate.", "Error");
        }
    };

    const handleCopyVerifyLink = async (certId: string) => {
        const url = `${window.location.origin}/verify/${certId}`;
        await navigator.clipboard.writeText(url);
        setCopiedId(certId);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const filtered = certificates.filter(
        (c) =>
            c.recipientName?.toLowerCase().includes(search.toLowerCase()) ||
            c.recipientEmail?.toLowerCase().includes(search.toLowerCase()) ||
            c.certificateId?.toLowerCase().includes(search.toLowerCase())
    );

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
                className="relative w-full max-w-4xl bg-[#18191b] border border-white/10 rounded-3xl shadow-2xl p-6 flex flex-col max-h-[90vh] overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-start justify-between pb-4 border-b border-white/10">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Award className="w-5 h-5 text-[#34A853]" />
                            <h3 className="text-lg font-bold text-white tracking-tight">Issued Certificates</h3>
                        </div>
                        <p className="text-xs text-zinc-400">
                            Manage and verify credentials issued for <span className="text-white font-medium">{eventTitle}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/5 transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="py-4 flex items-center justify-between gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Filter by recipient name, email or ID..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-zinc-900 border border-zinc-750 text-white text-xs focus:outline-none focus:border-[#34A853] transition"
                        />
                    </div>
                    <span className="text-xs font-mono text-zinc-400 whitespace-nowrap">
                        {filtered.length} Credentials
                    </span>
                </div>

                {/* Table Container */}
                <div className="flex-1 overflow-y-auto min-h-[300px] border border-white/5 rounded-2xl">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-zinc-900/80 sticky top-0 border-b border-white/10 text-zinc-400 font-mono text-[10px] uppercase">
                            <tr>
                                <th className="p-3 pl-4">Certificate ID</th>
                                <th className="p-3">Recipient</th>
                                <th className="p-3">Issue Date</th>
                                <th className="p-3 text-right pr-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-zinc-500">
                                        No certificates found.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((cert) => (
                                    <tr key={cert.id} className="hover:bg-white/[0.02] transition">
                                        <td className="p-3 pl-4 font-mono text-[11px] text-[#4285F4] font-semibold">
                                            {cert.certificateId}
                                        </td>
                                        <td className="p-3">
                                            <p className="font-semibold text-white">{cert.recipientName}</p>
                                            <p className="text-[11px] text-zinc-400 font-mono">{cert.recipientEmail}</p>
                                        </td>
                                        <td className="p-3 text-zinc-400 font-mono text-[11px]">
                                            {cert.issueDate || "N/A"}
                                        </td>
                                        <td className="p-3 text-right pr-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleCopyVerifyLink(cert.certificateId)}
                                                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition"
                                                    title="Copy Public Verification Link"
                                                >
                                                    {copiedId === cert.certificateId ? (
                                                        <Check className="w-3.5 h-3.5 text-[#34A853]" />
                                                    ) : (
                                                        <Copy className="w-3.5 h-3.5" />
                                                    )}
                                                </button>
                                                <Link
                                                    href={`/verify/${cert.certificateId}`}
                                                    target="_blank"
                                                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition"
                                                    title="View Certificate"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(cert)}
                                                    className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                                                    title="Delete Certificate"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="pt-4 mt-2 border-t border-white/10 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition"
                    >
                        Close
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
