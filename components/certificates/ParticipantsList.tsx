"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { doc, updateDoc, addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
    Users,
    Mail,
    Phone,
    GraduationCap,
    Building2,
    CheckCircle2,
    XCircle,
    Clock,
    Search,
    UserPlus,
    X,
    CreditCard,
    FileText,
    Download,
    ShieldCheck,
    ChevronRight,
    Award
} from "lucide-react";
import * as XLSX from "xlsx";
import { useDialog } from "@/context/DialogContext";
import { FormField } from "@/components/CustomFormBuilder";
import GoogleBadge from "../GoogleBadge";
import CreativeProfileAvatar from "@/components/ui/CreativeProfileAvatar";

interface Participant {
    id: string;
    name: string;
    email: string;
    userId: string;
    registeredAt: any;
    department?: string;
    college?: string;
    graduationYear?: string | number;
    phoneNumber?: string;
    addedManually?: boolean;
    isTeamRegistration?: boolean;
    teamName?: string;
    teamMembers?: any[];
    teamSize?: number;
    paymentStatus?: "pending_verification" | "verified" | "rejected";
    paymentAmount?: number;
    paymentUpiId?: string;
    paymentUtr?: string;
    customFormResponses?: Record<string, any>;
    checkedIn?: boolean;
}

interface ParticipantsListProps {
    participants: Participant[];
    onRefresh: () => void;
    eventId: string;
    isPaidEvent?: boolean;
    customFields?: FormField[];
    isWriter?: boolean;
}

const EMPTY_FORM = {
    name: "",
    email: "",
    phoneNumber: "",
    college: "Amal Jyothi College of Engineering",
    department: "",
    graduationYear: "2026",
};

export default function ParticipantsList({
    participants,
    onRefresh,
    eventId,
    isPaidEvent = false,
    customFields = [],
    isWriter = false,
}: ParticipantsListProps) {
    const dialog = useDialog();
    const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(
        participants.length > 0 ? participants[0].id : null
    );
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "pending_verification" | "verified" | "rejected">("all");
    const [typeFilter, setTypeFilter] = useState<"all" | "team" | "solo">("all");
    const [showAddModal, setShowAddModal] = useState(false);
    const [addForm, setAddForm] = useState({ ...EMPTY_FORM });
    const [addingParticipant, setAddingParticipant] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const filtered = useMemo(() => {
        return participants.filter((p) => {
            const matchesSearch =
                p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.teamName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.paymentUtr?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "verified" && p.paymentStatus === "verified") ||
                (statusFilter === "pending_verification" && p.paymentStatus === "pending_verification") ||
                (statusFilter === "rejected" && p.paymentStatus === "rejected");

            const matchesType =
                typeFilter === "all" ||
                (typeFilter === "team" && p.isTeamRegistration) ||
                (typeFilter === "solo" && !p.isTeamRegistration);

            return matchesSearch && matchesStatus && matchesType;
        });
    }, [participants, searchQuery, statusFilter, typeFilter]);

    const selectedParticipant = participants.find((p) => p.id === selectedParticipantId);

    const handleUpdatePaymentStatus = async (pId: string, status: "verified" | "rejected") => {
        setProcessingId(pId);
        try {
            await updateDoc(doc(db, "events", eventId, "participants", pId), {
                paymentStatus: status,
                verifiedAt: Timestamp.now()
            });
            onRefresh();
        } catch (error) {
            console.error("Error updating status:", error);
            dialog.alert("Failed to update status", "Error");
        } finally {
            setProcessingId(null);
        }
    };

    const handleToggleCheckIn = async (pId: string, current: boolean) => {
        setProcessingId(pId);
        try {
            await updateDoc(doc(db, "events", eventId, "participants", pId), {
                checkedIn: !current,
                checkedInAt: !current ? Timestamp.now() : null
            });
            onRefresh();
        } catch (error) {
            console.error("Error updating check-in:", error);
        } finally {
            setProcessingId(null);
        }
    };

    const handleAddManualParticipant = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!addForm.name.trim() || !addForm.email.trim()) return;

        setAddingParticipant(true);
        try {
            await addDoc(collection(db, "events", eventId, "participants"), {
                name: addForm.name.trim(),
                email: addForm.email.trim().toLowerCase(),
                phoneNumber: addForm.phoneNumber.trim(),
                college: addForm.college.trim(),
                department: addForm.department.trim(),
                graduationYear: addForm.graduationYear.trim(),
                userId: "manual",
                addedManually: true,
                registeredAt: Timestamp.now(),
                paymentStatus: isPaidEvent ? "verified" : "verified",
                checkedIn: false
            });

            setAddForm({ ...EMPTY_FORM });
            setShowAddModal(false);
            onRefresh();
            dialog.alert("Participant successfully added!", "Success");
        } catch (error) {
            console.error("Error adding participant:", error);
            dialog.alert("Failed to add participant", "Error");
        } finally {
            setAddingParticipant(false);
        }
    };

    const handleExportExcel = () => {
        if (participants.length === 0) {
            dialog.alert("No participants to export.", "Info");
            return;
        }

        const dataToExport = participants.map((p, index) => {
            const baseObj: Record<string, any> = {
                "S.No": index + 1,
                "Name": p.name,
                "Email": p.email,
                "Phone": p.phoneNumber || "N/A",
                "College": p.college || "N/A",
                "Department": p.department || "N/A",
                "Grad Year": p.graduationYear || "N/A",
                "Type": p.isTeamRegistration ? "Team" : "Solo",
                "Team Name": p.teamName || "N/A",
                "Checked In": p.checkedIn ? "Yes" : "No",
            };

            if (isPaidEvent) {
                baseObj["Payment Status"] = p.paymentStatus || "unpaid";
                baseObj["Amount Paid"] = p.paymentAmount || 0;
                baseObj["UTR / Txn ID"] = p.paymentUtr || "N/A";
                baseObj["Payer UPI ID"] = p.paymentUpiId || "N/A";
            }

            if (p.customFormResponses) {
                Object.entries(p.customFormResponses).forEach(([k, v]) => {
                    baseObj[`Form: ${k}`] = Array.isArray(v) ? v.join(", ") : String(v || "");
                });
            }

            return baseObj;
        });

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Attendees");
        XLSX.writeFile(wb, `GDG_Event_Attendees_${new Date().toISOString().split("T")[0]}.xlsx`);
    };

    return (
        <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="flex items-center gap-2 flex-1 max-w-md">
                    <div className="relative w-full">
                        <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-zinc-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name, email, UTR..."
                            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-zinc-900 border border-zinc-750 text-white text-xs focus:outline-none focus:border-[#4285F4] transition"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleExportExcel}
                        className="px-3.5 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white transition flex items-center gap-1.5"
                    >
                        <Download className="w-3.5 h-3.5 text-[#34A853]" />
                        Export Excel
                    </button>
                    {isWriter && (
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-4 py-2 rounded-2xl bg-[#4285F4] hover:bg-[#3367D6] text-xs font-semibold text-white transition flex items-center gap-1.5 shadow-md"
                        >
                            <UserPlus className="w-3.5 h-3.5" />
                            Add Walk-in
                        </button>
                    )}
                </div>
            </div>

            {/* Split View: Left List, Right Details */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
                {/* Left: Participant List */}
                <div className="lg:col-span-5 bg-[#18191b] border border-white/10 rounded-3xl p-4 flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                        <span className="text-xs font-mono font-semibold text-zinc-300">
                            {filtered.length} Attendees
                        </span>
                        <div className="flex gap-1">
                            {isPaidEvent && (
                                <select
                                    value={statusFilter}
                                    onChange={(e: any) => setStatusFilter(e.target.value)}
                                    className="bg-zinc-900 border border-zinc-700 rounded-xl px-2 py-1 text-[11px] text-zinc-300 outline-none"
                                >
                                    <option value="all">All Payments</option>
                                    <option value="verified">Verified</option>
                                    <option value="pending_verification">Pending</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[600px]">
                        {filtered.length === 0 ? (
                            <div className="p-8 text-center text-zinc-500 text-xs">
                                No attendees matching your criteria.
                            </div>
                        ) : (
                            filtered.map((p) => {
                                const isSelected = p.id === selectedParticipantId;
                                return (
                                    <div
                                        key={p.id}
                                        onClick={() => setSelectedParticipantId(p.id)}
                                        className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                                            isSelected
                                                ? "bg-[#4285F4]/10 border-[#4285F4]/40 shadow-sm"
                                                : "bg-zinc-900/60 border-white/5 hover:border-white/15"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <CreativeProfileAvatar name={p.name} size="xs" />
                                            <div className="overflow-hidden">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs font-bold text-white truncate">{p.name}</p>
                                                    {p.checkedIn && (
                                                        <span className="w-1.5 h-1.5 rounded-full bg-[#34A853]" title="Checked In" />
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-zinc-400 font-mono truncate">{p.email}</p>
                                                {p.isTeamRegistration && (
                                                    <p className="text-[10px] text-[#4285F4] font-medium mt-0.5">
                                                        Team: {p.teamName} ({p.teamMembers?.length || 1} members)
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                                            {isPaidEvent && (
                                                <span
                                                    className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-semibold uppercase ${
                                                        p.paymentStatus === "verified"
                                                            ? "bg-[#34A853]/15 text-[#34A853] border border-[#34A853]/30"
                                                            : p.paymentStatus === "rejected"
                                                            ? "bg-[#EA4335]/15 text-[#EA4335] border border-[#EA4335]/30"
                                                            : "bg-[#FBBC04]/15 text-[#FBBC04] border border-[#FBBC04]/30"
                                                    }`}
                                                >
                                                    {p.paymentStatus || "pending"}
                                                </span>
                                            )}
                                            <ChevronRight className={`w-4 h-4 transition ${isSelected ? "text-[#4285F4]" : "text-zinc-600"}`} />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Right: Selected Participant Detailed Panel */}
                <div className="lg:col-span-7 bg-[#18191b] border border-white/10 rounded-3xl p-6 flex flex-col overflow-y-auto max-h-[680px]">
                    {selectedParticipant ? (
                        <div className="space-y-6">
                            {/* Profile Header */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-white/10">
                                <div className="flex items-center gap-3.5">
                                    <CreativeProfileAvatar name={selectedParticipant.name} size="lg" />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-xl font-bold text-white tracking-tight">{selectedParticipant.name}</h3>
                                            {selectedParticipant.isTeamRegistration ? (
                                                <GoogleBadge label="TEAM LEAD" variant="blue" size="sm" />
                                            ) : (
                                                <GoogleBadge label="SOLO" variant="neutral" size="sm" />
                                            )}
                                        </div>
                                        <p className="text-xs text-zinc-400 font-mono mt-0.5">{selectedParticipant.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleToggleCheckIn(selectedParticipant.id, Boolean(selectedParticipant.checkedIn))}
                                        disabled={processingId === selectedParticipant.id}
                                        className={`px-4 py-2 rounded-2xl text-xs font-semibold transition flex items-center gap-1.5 ${
                                            selectedParticipant.checkedIn
                                                ? "bg-[#34A853] text-white hover:bg-[#2D9247]"
                                                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                                        }`}
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        {selectedParticipant.checkedIn ? "Checked In" : "Mark Attendance"}
                                    </button>
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                <div className="p-3.5 rounded-2xl bg-zinc-900 border border-white/5 space-y-1">
                                    <span className="text-[10px] font-mono text-zinc-500 uppercase">Phone</span>
                                    <p className="text-xs font-semibold text-zinc-200">{selectedParticipant.phoneNumber || "Not provided"}</p>
                                </div>
                                <div className="p-3.5 rounded-2xl bg-zinc-900 border border-white/5 space-y-1">
                                    <span className="text-[10px] font-mono text-zinc-500 uppercase">College</span>
                                    <p className="text-xs font-semibold text-zinc-200 truncate">{selectedParticipant.college || "N/A"}</p>
                                </div>
                                <div className="p-3.5 rounded-2xl bg-zinc-900 border border-white/5 space-y-1">
                                    <span className="text-[10px] font-mono text-zinc-500 uppercase">Dept & Year</span>
                                    <p className="text-xs font-semibold text-zinc-200">{selectedParticipant.department || "N/A"} ({selectedParticipant.graduationYear || ""})</p>
                                </div>
                            </div>

                            {/* Payment Verification Card */}
                            {isPaidEvent && (
                                <div className="p-5 rounded-2xl bg-zinc-900 border border-white/10 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="w-4 h-4 text-[#4285F4]" />
                                            <h4 className="text-sm font-bold text-white">Payment Verification</h4>
                                        </div>
                                        <span className="text-xs font-mono font-bold text-white">
                                            ₹{selectedParticipant.paymentAmount || 0}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                        <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                                            <span className="text-[10px] font-mono text-zinc-500 uppercase">UTR / Transaction ID</span>
                                            <p className="font-mono text-[#4285F4] font-semibold select-all">
                                                {selectedParticipant.paymentUtr || "No UTR provided"}
                                            </p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                                            <span className="text-[10px] font-mono text-zinc-500 uppercase">Payer UPI ID</span>
                                            <p className="font-mono text-zinc-200 font-medium">
                                                {selectedParticipant.paymentUpiId || "Not provided"}
                                            </p>
                                        </div>
                                    </div>

                                    {isWriter && (
                                        <div className="flex gap-2 pt-2 border-t border-white/5">
                                            <button
                                                onClick={() => handleUpdatePaymentStatus(selectedParticipant.id, "verified")}
                                                disabled={processingId === selectedParticipant.id || selectedParticipant.paymentStatus === "verified"}
                                                className="flex-1 py-2.5 rounded-xl bg-[#34A853] hover:bg-[#2D9247] disabled:opacity-40 text-white font-semibold text-xs transition"
                                            >
                                                Approve Payment
                                            </button>
                                            <button
                                                onClick={() => handleUpdatePaymentStatus(selectedParticipant.id, "rejected")}
                                                disabled={processingId === selectedParticipant.id || selectedParticipant.paymentStatus === "rejected"}
                                                className="flex-1 py-2.5 rounded-xl bg-[#EA4335]/20 hover:bg-[#EA4335]/30 border border-[#EA4335]/30 disabled:opacity-40 text-[#EA4335] font-semibold text-xs transition"
                                            >
                                                Reject Payment
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Team Roster */}
                            {selectedParticipant.isTeamRegistration && selectedParticipant.teamMembers && selectedParticipant.teamMembers.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="text-xs font-mono uppercase text-zinc-400 font-semibold">Team Members ({selectedParticipant.teamMembers.length})</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {selectedParticipant.teamMembers.map((m, idx) => (
                                            <div key={idx} className="p-3.5 rounded-2xl bg-zinc-900 border border-white/5 space-y-1 text-xs">
                                                <p className="font-bold text-white">{m.member_name || m.name || `Member ${idx + 1}`}</p>
                                                <p className="text-[11px] text-zinc-400 font-mono">{m.member_email || m.email || "No email"}</p>
                                                {m.member_phone && <p className="text-[11px] text-zinc-500 font-mono">{m.member_phone}</p>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Custom Form Answers */}
                            {selectedParticipant.customFormResponses && Object.keys(selectedParticipant.customFormResponses).length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="text-xs font-mono uppercase text-zinc-400 font-semibold">Custom Form Responses</h4>
                                    <div className="space-y-2">
                                        {Object.entries(selectedParticipant.customFormResponses).map(([fieldId, ans], idx) => (
                                            <div key={idx} className="p-3.5 rounded-2xl bg-zinc-900 border border-white/5 text-xs space-y-1">
                                                <span className="text-[10px] font-mono text-zinc-500 uppercase">{fieldId}</span>
                                                <p className="text-white font-medium">
                                                    {Array.isArray(ans) ? ans.join(", ") : String(ans)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center flex-1 text-center py-20 text-zinc-500">
                            <Users className="w-10 h-10 mb-2 opacity-40" />
                            <p className="text-xs">Select a participant to review details.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Manual Participant Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAddModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative w-full max-w-md bg-[#18191b] border border-white/10 rounded-3xl p-6 space-y-5 shadow-2xl"
                        >
                            <div className="flex items-center justify-between pb-3 border-b border-white/10">
                                <h3 className="text-base font-bold text-white">Add Walk-in Attendee</h3>
                                <button onClick={() => setShowAddModal(false)} className="p-1 text-zinc-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleAddManualParticipant} className="space-y-3">
                                <div>
                                    <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={addForm.name}
                                        onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                                        className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs"
                                        placeholder="Alex Morgan"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={addForm.email}
                                        onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                                        className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs"
                                        placeholder="alex@gmail.com"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Phone</label>
                                        <input
                                            type="tel"
                                            value={addForm.phoneNumber}
                                            onChange={(e) => setAddForm({ ...addForm, phoneNumber: e.target.value })}
                                            className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs"
                                            placeholder="+91..."
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Grad Year</label>
                                        <input
                                            type="text"
                                            value={addForm.graduationYear}
                                            onChange={(e) => setAddForm({ ...addForm, graduationYear: e.target.value })}
                                            className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Department</label>
                                    <input
                                        type="text"
                                        value={addForm.department}
                                        onChange={(e) => setAddForm({ ...addForm, department: e.target.value })}
                                        className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs"
                                        placeholder="CSE / IT / ECE"
                                    />
                                </div>

                                <div className="pt-3 flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="px-4 py-2 rounded-full border border-zinc-700 text-zinc-300 text-xs"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={addingParticipant}
                                        className="px-5 py-2 rounded-full bg-[#4285F4] hover:bg-[#3367D6] text-white font-semibold text-xs shadow-md"
                                    >
                                        {addingParticipant ? "Saving..." : "Add Participant"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
