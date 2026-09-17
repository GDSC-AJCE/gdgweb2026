"use client";

import { use, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { createAuditLog } from "@/lib/audit";
import { db } from "@/lib/firebase";
import {
    doc,
    getDoc,
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    updateDoc,
    Timestamp,
    query,
    orderBy,
    where
} from "firebase/firestore";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft as ArrowLeftIcon,
    Users as UsersIcon,
    FileText as DocumentTextIcon,
    Settings as Cog6ToothIcon,
    Image as PhotoIcon,
    Trash2 as TrashIcon,
    Plus as PlusIcon,
    CheckCircle2 as CheckCircleIcon,
    X as XMarkIcon,
    ShieldCheck as ShieldCheckIcon,
    Trophy as TrophyIcon,
    DollarSign as CurrencyDollarIcon,
    Users as UserGroupIcon,
    Tag as TagIcon,
    Link as LinkIcon,
    Sliders as AdjustmentsHorizontalIcon,
    Award as CheckBadgeIcon,
    Calendar as CalendarIcon,
    ClipboardList as ClipboardListIcon,
} from "lucide-react";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useDialog } from "@/context/DialogContext";
import CertificateBuilder from "@/components/certificates/CertificateBuilder";
import CertificateTemplateCard from "@/components/certificates/CertificateTemplateCard";
import ParticipantsList from "@/components/certificates/ParticipantsList";
import IssueCertificateModal from "@/components/certificates/IssueCertificateModal";
import IssuedCertificatesManager from "@/components/certificates/IssuedCertificatesManager";
import CustomFormBuilder, { FormField, TeamConfig } from "@/components/CustomFormBuilder";

import dynamic from 'next/dynamic';
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const MDEditor = dynamic(
    () => import("@uiw/react-md-editor"),
    { ssr: false }
);

type Tab = "settings" | "features" | "form" | "participants" | "certificates";

interface Sponsor {
    name: string;
    logo: string;
    website: string;
}

interface Collaborator {
    name: string;
    role: string;
    avatar: string;
}

interface EventData {
    id: string;
    title: string;
    tagline?: string;
    description?: string;
    date?: string;
    registrationLastDate?: string;
    posterUrl?: string;
    slug?: string;
    location?: string;
    externalRegistrationUrl?: string;
    isPaid?: boolean;
    paymentAmount?: number;
    upiId?: string;
    paymentNote?: string;
    customFields?: FormField[];
    participationType?: "solo" | "team";
    teamConfig?: TeamConfig;
    postRegistrationLink?: string;
    postRegistrationMessage?: string;
    isHidden?: boolean;
    eventDates?: { date: string; time?: string }[];
    coordinators?: { name: string; phone: string; countryCode?: string }[];
    category?: "hackathon" | "workshop" | "ideathon" | "competition" | "seminar" | "meetup" | "other";
    rules?: string;
    prizepool?: string;
    sponsors?: Sponsor[];
    collaborators?: Collaborator[];
    brochureUrl?: string;
    featureFlags?: {
        rules?: boolean;
        prizepool?: boolean;
        sponsors?: boolean;
        collaborators?: boolean;
    };
    assignedCore?: string[];
}

interface CertificateTemplate {
    id: string;
    name: string;
    backgroundUrl: string;
    elements: any[];
    createdAt: any;
}

interface Participant {
    id: string;
    name: string;
    email: string;
    userId: string;
    registeredAt: any;
    department?: string;
    college?: string;
    graduationYear?: string;
    phoneNumber?: string;
    paymentStatus?: "pending_verification" | "verified" | "rejected";
    paymentAmount?: number;
    paymentUpiId?: string;
    paymentUtr?: string;
    customFormResponses?: Record<string, any>;
}

export default function EventDashboardPage({
    params
}: {
    params: Promise<{ eventId: string }>;
}) {
    const { eventId } = use(params);
    const { user, userData } = useAuth();
    const isCoreManageOrAdmin = userData?.role === 'core-manage' || userData?.isAdmin;
    const router = useRouter();
    const dialog = useDialog();

    const [loading, setLoading] = useState(true);
    const [event, setEvent] = useState<EventData | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>("settings");

    const [posterPreview, setPosterPreview] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
    const [showBuilder, setShowBuilder] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<CertificateTemplate | null>(null);

    const [participants, setParticipants] = useState<Participant[]>([]);
    const [issuingTemplate, setIssuingTemplate] = useState<CertificateTemplate | null>(null);
    const [showIssuedManager, setShowIssuedManager] = useState(false);
    const [deletingTemplateId, setDeletingTemplateId] = useState<string | null>(null);

    const [coreUsers, setCoreUsers] = useState<any[]>([]);
    const [savingAssignment, setSavingAssignment] = useState(false);

    const isWriter = isCoreManageOrAdmin ||
        (userData?.role === 'core' && (event?.assignedCore ?? []).includes(user?.uid ?? ''));

    useEffect(() => {
        if (userData && !['core-manage', 'core'].includes(userData.role) && !userData.isAdmin) {
            router.push("/");
        }
    }, [userData, router]);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const eventDoc = await getDoc(doc(db, "events", eventId));
                if (eventDoc.exists()) {
                    setEvent({ id: eventDoc.id, ...eventDoc.data() } as EventData);
                    if (eventDoc.data().posterUrl) {
                        setPosterPreview(eventDoc.data().posterUrl);
                    }
                } else {
                    router.push("/core");
                }
            } catch (error) {
                console.error("Error fetching event:", error);
            } finally {
                setLoading(false);
            }
        };

        if (eventId) fetchEvent();
    }, [eventId, router]);

    const fetchTemplates = async () => {
        try {
            const q = query(
                collection(db, "events", eventId, "certificates"),
                orderBy("createdAt", "desc")
            );
            const snap = await getDocs(q);
            setTemplates(
                snap.docs.map((d) => ({ id: d.id, ...d.data() } as CertificateTemplate))
            );
        } catch (error) {
            console.error("Error fetching templates:", error);
        }
    };

    const fetchParticipants = async () => {
        try {
            const q = query(
                collection(db, "events", eventId, "participants"),
                orderBy("registeredAt", "desc")
            );
            const snap = await getDocs(q);
            setParticipants(
                snap.docs.map((d) => ({ id: d.id, ...d.data() } as Participant))
            );
        } catch (error) {
            console.error("Error fetching participants:", error);
        }
    };

    useEffect(() => {
        if (eventId) {
            fetchTemplates();
            fetchParticipants();
        }
    }, [eventId]);

    useEffect(() => {
        if (!isCoreManageOrAdmin) return;
        const fetchCoreUsers = async () => {
            try {
                const snap = await getDocs(
                    query(collection(db, 'users'), where('role', '==', 'core'))
                );
                setCoreUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            } catch (e) {
                console.error('Error fetching core users:', e);
            }
        };
        fetchCoreUsers();
    }, [isCoreManageOrAdmin]);

    const handleAssignCoreToggle = async (uid: string) => {
        if (!event || !isCoreManageOrAdmin) return;
        setSavingAssignment(true);
        try {
            const current: string[] = event.assignedCore ?? [];
            const updated = current.includes(uid)
                ? current.filter(id => id !== uid)
                : [...current, uid];
            await updateDoc(doc(db, 'events', eventId), { assignedCore: updated });
            setEvent({ ...event, assignedCore: updated });
        } catch (e) {
            console.error('Error updating assignedCore:', e);
            dialog.alert('Failed to update assignment.', 'Error');
        } finally {
            setSavingAssignment(false);
        }
    };

    const sanitizeForFirestore = (obj: any): any => {
        if (obj === undefined) return null;
        if (obj === null || typeof obj !== "object") return obj;
        if (Array.isArray(obj)) return obj.map(sanitizeForFirestore);
        const clean: any = {};
        for (const [key, value] of Object.entries(obj)) {
            if (value !== undefined) {
                clean[key] = sanitizeForFirestore(value);
            }
        }
        return clean;
    };

    const handleSaveSettings = async () => {
        if (!event) return;
        setSaving(true);

        try {
            const rawUpdateData: any = {
                title: event.title || "",
                tagline: event.tagline || "",
                description: event.description || "",
                posterUrl: posterPreview || null,
                date: event.date || "",
                registrationLastDate: event.registrationLastDate || "",
                location: event.location || "",
                slug: event.slug || "",
                externalRegistrationUrl: event.externalRegistrationUrl || "",
                isPaid: event.isPaid || false,
                paymentAmount: event.isPaid ? (event.paymentAmount || 0) : 0,
                upiId: event.isPaid ? (event.upiId || "") : "",
                paymentNote: event.isPaid ? (event.paymentNote || "") : "",
                customFields: (event.customFields || []).map((f) => ({
                    id: f.id,
                    type: f.type,
                    label: f.label || "",
                    required: !!f.required,
                    options: f.options || [],
                    placeholder: f.placeholder || ""
                })),
                participationType: event.participationType || "solo",
                teamConfig: event.teamConfig ? {
                    enabled: event.participationType === "team" || !!event.teamConfig.enabled,
                    minMembers: Number(event.teamConfig.minMembers) || 2,
                    maxMembers: Number(event.teamConfig.maxMembers) || 4,
                    teamNameRequired: event.teamConfig.teamNameRequired !== false,
                    memberFields: (event.teamConfig.memberFields || []).map((m) => ({
                        id: m.id,
                        label: m.label || "",
                        type: m.type || "text",
                        required: !!m.required,
                        placeholder: m.placeholder || "",
                        options: m.options || []
                    }))
                } : null,
                postRegistrationLink: event.postRegistrationLink || "",
                postRegistrationMessage: event.postRegistrationMessage || "",
                category: event.category || "hackathon",
                isHidden: event.isHidden || false,
                eventDates: event.eventDates || [],
                coordinators: event.coordinators || [],
                rules: event.rules || "",
                prizepool: event.prizepool || "",
                sponsors: (event.sponsors || []).map((s) => ({
                    name: s.name || "",
                    logo: s.logo || "",
                    website: s.website || ""
                })),
                collaborators: (event.collaborators || []).map((c) => ({
                    name: c.name || "",
                    role: c.role || "",
                    avatar: c.avatar || ""
                })),
                featureFlags: event.featureFlags || {},
                assignedCore: event.assignedCore ?? []
            };

            const updateData = sanitizeForFirestore(rawUpdateData);
            await updateDoc(doc(db, "events", eventId), updateData);

            await createAuditLog("EVENT_UPDATE", {
                eventId,
                title: event.title,
                date: event.date || "",
                isPaid: event.isPaid || false
            });

            dialog.alert("Settings saved successfully!", "Success");
        } catch (error) {
            console.error("Error saving settings:", error);
            dialog.alert("Failed to save settings. Please try again.", "Error");
        } finally {
            setSaving(false);
        }
    };

    const handleTemplateSave = async (data: any) => {
        try {
            if (editingTemplate) {
                await updateDoc(doc(db, "events", eventId, "certificates", editingTemplate.id), {
                    ...data,
                    updatedAt: Timestamp.now()
                });
            } else {
                await addDoc(collection(db, "events", eventId, "certificates"), {
                    ...data,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now()
                });
            }
            setShowBuilder(false);
            setEditingTemplate(null);
            fetchTemplates();
        } catch (error) {
            console.error("Error saving template:", error);
            dialog.alert("Failed to save template. Please try again.", "Error");
        }
    };

    const handleTemplateDelete = async (templateId: string) => {
        const confirmed = await dialog.confirm("Are you sure you want to delete this template? This will permanently remove all issued certificates associated with it.", "Confirm Deletion");
        if (!confirmed) return;

        setDeletingTemplateId(templateId);

        try {
            const q = query(collection(db, "events", eventId, "issuedCertificates"), where("templateId", "==", templateId));
            const snapshot = await getDocs(q);
            await Promise.all(snapshot.docs.map(doc => deleteDoc(doc.ref)));
            await deleteDoc(doc(db, "events", eventId, "certificates", templateId));
            fetchTemplates();
        } catch (error) {
            console.error("Error deleting template:", error);
            dialog.alert("Failed to delete template.", "Error");
        } finally {
            setDeletingTemplateId(null);
        }
    };

    const tabs = [
        { id: "settings", label: "General", icon: TagIcon },
        { id: "features", label: "Modules", icon: AdjustmentsHorizontalIcon },
        { id: "form", label: "Form & Teams", icon: ClipboardListIcon },
        { id: "participants", label: "Participants", icon: UsersIcon },
        { id: "certificates", label: "Certificates", icon: DocumentTextIcon },
    ];

    if (loading) return <LoadingSpinner text="Opening event operations deck..." />;
    if (!event) return null;

    return (
        <main className="min-h-screen text-[#e3e3e3] relative selection:bg-[#4285F4]/30 pb-32">
            <div className="google-ambient-bg pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-24 relative z-10">
                {/* Breadcrumb Navigation */}
                <div className="mb-8 flex items-center justify-between">
                    <Link
                        href="/core"
                        className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition group"
                    >
                        <ArrowLeftIcon className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                        Back to GDG Deck
                    </Link>

                    <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${event.isHidden ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"}`}>
                            {event.isHidden ? "Private Draft" : "Live Event"}
                        </span>
                    </div>
                </div>

                {/* Event Hero Details */}
                <div className="relative overflow-hidden mb-10 flex flex-col md:flex-row gap-8 items-start md:items-center p-6 sm:p-8 rounded-3xl bg-[#1e1f20]/50 backdrop-blur-md border border-zinc-800">
                    <div className="w-full md:w-44 aspect-[3/4] shrink-0 rounded-2xl overflow-hidden border border-zinc-700 bg-black/40 relative">
                        {posterPreview ? (
                            <img src={posterPreview} className="w-full h-full object-cover" alt="Event Artwork" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                <PhotoIcon className="w-10 h-10" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1">
                        <div className="flex flex-wrap gap-2 mb-3">
                            <span className="px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-[#4285F4] text-[10px] font-mono font-bold uppercase tracking-wider">
                                {event.category || "Workshop"}
                            </span>
                            <span className="px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                                {event.date || "Date Open"}
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-2">
                            {event.title}
                        </h1>
                        <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl">
                            {event.tagline || "Organize attendees, check payment verification, and generate automated certificates."}
                        </p>
                    </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    <div className="p-5 rounded-3xl bg-[#1e1f20]/50 border border-zinc-800 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
                            <UsersIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-white">{participants.length}</p>
                            <span className="text-[10px] font-mono text-zinc-500 uppercase">Attendees</span>
                        </div>
                    </div>
                    <div className="p-5 rounded-3xl bg-[#1e1f20]/50 border border-zinc-800 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
                            <DocumentTextIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-white">{templates.length}</p>
                            <span className="text-[10px] font-mono text-zinc-500 uppercase">Cert Templates</span>
                        </div>
                    </div>
                    <div className="p-5 rounded-3xl bg-[#1e1f20]/50 border border-zinc-800 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                            <CheckCircleIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-white">{event.isPaid ? `₹${event.paymentAmount}` : "Free"}</p>
                            <span className="text-[10px] font-mono text-zinc-500 uppercase">Ticket Fee</span>
                        </div>
                    </div>
                    <div className="p-5 rounded-3xl bg-[#1e1f20]/50 border border-zinc-800 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                            <TrophyIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-white capitalize">{event.participationType || 'Solo'}</p>
                            <span className="text-[10px] font-mono text-zinc-500 uppercase">Participation</span>
                        </div>
                    </div>
                </div>

                {/* Sub-Deck Tabs */}
                <div className="mb-10 flex justify-center">
                    <div className="inline-flex gap-1 p-1 bg-[#18191b] border border-zinc-800 rounded-full shadow-lg overflow-x-auto max-w-full">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as Tab)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-xs tracking-wide transition ${
                                    activeTab === tab.id
                                        ? "bg-[#4285F4] text-white shadow-md shadow-[#4285F4]/20"
                                        : "text-zinc-400 hover:text-white"
                                }`}
                            >
                                <tab.icon className="w-3.5 h-3.5" />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Views */}
                <AnimatePresence mode="wait">
                    {activeTab === "settings" && (
                        <motion.div
                            key="settings"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                        >
                            <div className="lg:col-span-8 space-y-8">
                                <div className="bg-[#1e1f20]/50 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
                                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">Essential Settings</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-[11px] font-mono text-zinc-500 uppercase block mb-2">Event Title</label>
                                            <input
                                                type="text"
                                                value={event.title}
                                                onChange={(e) => setEvent({ ...event, title: e.target.value })}
                                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-[#4285F4] outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-mono text-zinc-500 uppercase block mb-2">Category</label>
                                            <select
                                                value={event.category || "hackathon"}
                                                onChange={(e) => setEvent({ ...event, category: e.target.value as any })}
                                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-[#4285F4] outline-none"
                                            >
                                                <option value="hackathon">Hackathon</option>
                                                <option value="workshop">Workshop</option>
                                                <option value="ideathon">Ideathon</option>
                                                <option value="competition">Competition</option>
                                                <option value="seminar">Seminar</option>
                                                <option value="meetup">Meetup</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[11px] font-mono text-zinc-500 uppercase block mb-2">Tagline</label>
                                        <input
                                            type="text"
                                            value={event.tagline || ""}
                                            onChange={(e) => setEvent({ ...event, tagline: e.target.value })}
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-[#4285F4] outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[11px] font-mono text-zinc-500 uppercase block mb-2">Custom URL Slug</label>
                                        <div className="flex items-center">
                                            <span className="px-4 py-3 bg-zinc-800 border border-zinc-700 border-r-0 rounded-l-xl text-zinc-500 text-xs font-mono">/programs/</span>
                                            <input
                                                type="text"
                                                value={event.slug || ""}
                                                onChange={(e) => setEvent({ ...event, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                                                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-r-xl px-4 py-3 text-sm text-white focus:border-[#4285F4] outline-none font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Rich Markdown Description */}
                                <div className="bg-[#1e1f20]/50 border border-zinc-800 rounded-3xl p-6 sm:p-8" data-color-mode="dark">
                                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 mb-4">Event Description & Agenda (Markdown)</h3>
                                    <MDEditor
                                        value={event.description || ""}
                                        onChange={(val) => setEvent({ ...event, description: val || "" })}
                                        preview="edit"
                                        height={360}
                                    />
                                </div>
                            </div>

                            {/* Sidebar Configuration */}
                            <div className="lg:col-span-4 space-y-8">
                                <div className="bg-[#1e1f20]/50 border border-zinc-800 rounded-3xl p-6 space-y-6">
                                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">Artwork & Visibility</h3>
                                    <div>
                                        <label className="text-[11px] font-mono text-zinc-500 uppercase block mb-2">Poster Image URL</label>
                                        <input
                                            type="url"
                                            value={posterPreview || ""}
                                            onChange={(e) => setPosterPreview(e.target.value)}
                                            placeholder="https://..."
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-300 font-mono focus:border-[#4285F4] outline-none"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-zinc-900/60 rounded-2xl border border-zinc-800">
                                        <div>
                                            <p className="text-xs font-semibold text-white">Publicly Listed</p>
                                            <p className="text-[10px] text-zinc-500">Show on /programs catalog</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setEvent({ ...event, isHidden: !event.isHidden })}
                                            className={`relative w-10 h-5 rounded-full transition ${event.isHidden ? "bg-zinc-700" : "bg-[#34A853]"}`}
                                        >
                                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition ${event.isHidden ? "left-1" : "left-6"}`} />
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-[#1e1f20]/50 border border-zinc-800 rounded-3xl p-6 space-y-4">
                                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">Timeline & Logistics</h3>
                                    <div>
                                        <label className="text-[11px] font-mono text-zinc-500 uppercase block mb-1">Display Date</label>
                                        <input
                                            type="text"
                                            value={event.date || ""}
                                            onChange={(e) => setEvent({ ...event, date: e.target.value })}
                                            placeholder="e.g. Nov 24, 2026"
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#4285F4] outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-mono text-zinc-500 uppercase block mb-1">Registration Last Date</label>
                                        <input
                                            type="date"
                                            value={event.registrationLastDate || ""}
                                            onChange={(e) => setEvent({ ...event, registrationLastDate: e.target.value })}
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#4285F4] outline-none [color-scheme:dark]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-mono text-zinc-500 uppercase block mb-1">Venue / Online Link</label>
                                        <input
                                            type="text"
                                            value={event.location || ""}
                                            onChange={(e) => setEvent({ ...event, location: e.target.value })}
                                            placeholder="Auditorium / Google Meet"
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#4285F4] outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Paid entry configuration */}
                                <div className="bg-[#1e1f20]/50 border border-zinc-800 rounded-3xl p-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">UPI Payment Gate</h3>
                                        <button
                                            type="button"
                                            onClick={() => setEvent({ ...event, isPaid: !event.isPaid })}
                                            className={`relative w-10 h-5 rounded-full transition ${event.isPaid ? "bg-[#4285F4]" : "bg-zinc-700"}`}
                                        >
                                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition ${event.isPaid ? "left-6" : "left-1"}`} />
                                        </button>
                                    </div>

                                    {event.isPaid && (
                                        <div className="space-y-4 pt-2">
                                            <div>
                                                <label className="text-[11px] font-mono text-zinc-500 uppercase block mb-1">Fee (INR)</label>
                                                <input
                                                    type="number"
                                                    value={event.paymentAmount || ""}
                                                    onChange={(e) => setEvent({ ...event, paymentAmount: parseFloat(e.target.value) || 0 })}
                                                    placeholder="299"
                                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:border-[#4285F4] outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[11px] font-mono text-zinc-500 uppercase block mb-1">Primary UPI ID</label>
                                                <input
                                                    type="text"
                                                    value={event.upiId || ""}
                                                    onChange={(e) => setEvent({ ...event, upiId: e.target.value })}
                                                    placeholder="gdg@upi"
                                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:border-[#4285F4] outline-none"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Floating Save Command Bar */}
                            {isWriter && (
                                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-4 bg-[#18191b]/95 backdrop-blur-2xl border border-zinc-800 px-8 py-4 rounded-full shadow-2xl">
                                    <span className="text-[10px] font-mono text-zinc-400 hidden sm:block">Configuration Changes</span>
                                    <button
                                        onClick={handleSaveSettings}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-[#4285F4] hover:bg-[#3367d6] text-white font-semibold text-xs rounded-full transition shadow-lg shadow-[#4285F4]/20 disabled:opacity-50"
                                    >
                                        <CheckBadgeIcon className="w-4 h-4" />
                                        {saving ? "Deploying..." : "Save Event Settings"}
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === "features" && (
                        <motion.div
                            key="features"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="max-w-4xl mx-auto space-y-6"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    { id: 'rules', label: 'Guidelines', icon: ShieldCheckIcon },
                                    { id: 'prizepool', label: 'Prizepool', icon: TrophyIcon },
                                    { id: 'sponsors', label: 'Partnerships', icon: CurrencyDollarIcon },
                                    { id: 'collaborators', label: 'Speakers & Guests', icon: UserGroupIcon },
                                ].map((feature) => {
                                    const isActive = event.featureFlags?.[feature.id as keyof typeof event.featureFlags];
                                    return (
                                        <button
                                            key={feature.id}
                                            onClick={() => setEvent({
                                                ...event,
                                                featureFlags: { ...event.featureFlags, [feature.id]: !isActive }
                                            })}
                                            className={`p-5 rounded-3xl border text-left transition ${
                                                isActive 
                                                    ? 'bg-[#4285F4]/10 border-[#4285F4]/30 text-white' 
                                                    : 'bg-[#1e1f20]/50 border-zinc-800 text-zinc-400 hover:text-white'
                                            }`}
                                        >
                                            <feature.icon className="w-5 h-5 mb-3 text-[#4285F4]" />
                                            <p className="font-bold text-xs uppercase tracking-wider">{feature.label}</p>
                                        </button>
                                    );
                                })}
                            </div>

                            {event.featureFlags?.rules && (
                                <div className="bg-[#1e1f20]/50 border border-zinc-800 rounded-3xl p-6" data-color-mode="dark">
                                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 mb-4">Event Guidelines & Rules</h4>
                                    <MDEditor
                                        value={event.rules || ""}
                                        onChange={(val) => setEvent({ ...event, rules: val || "" })}
                                        preview="edit"
                                        height={260}
                                    />
                                </div>
                            )}

                            {event.featureFlags?.prizepool && (
                                <div className="bg-[#1e1f20]/50 border border-zinc-800 rounded-3xl p-6" data-color-mode="dark">
                                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 mb-4">Prizepool Breakdown</h4>
                                    <MDEditor
                                        value={event.prizepool || ""}
                                        onChange={(val) => setEvent({ ...event, prizepool: val || "" })}
                                        preview="edit"
                                        height={260}
                                    />
                                </div>
                            )}

                            {isWriter && (
                                <div className="flex justify-end pt-4">
                                    <button
                                        onClick={handleSaveSettings}
                                        disabled={saving}
                                        className="px-6 py-2.5 bg-[#4285F4] hover:bg-[#3367d6] text-white font-semibold text-xs rounded-full transition"
                                    >
                                        Save Modules
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === "form" && (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="max-w-4xl mx-auto space-y-6"
                        >
                            <div className="bg-[#1e1f20]/50 border border-zinc-800 rounded-3xl p-6 sm:p-8">
                                <CustomFormBuilder
                                    fields={event.customFields || []}
                                    onChange={(fields) => setEvent({ ...event, customFields: fields })}
                                    eventType={event.participationType || "solo"}
                                    onEventTypeChange={(type) => setEvent({ ...event, participationType: type })}
                                    teamConfig={event.teamConfig}
                                    onTeamConfigChange={(config) => setEvent({ ...event, teamConfig: config })}
                                />
                            </div>

                            {isWriter && (
                                <div className="flex justify-end pt-4">
                                    <button
                                        onClick={handleSaveSettings}
                                        disabled={saving}
                                        className="px-6 py-2.5 bg-[#4285F4] hover:bg-[#3367d6] text-white font-semibold text-xs rounded-full transition"
                                    >
                                        Save Form & Team Setup
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === "participants" && (
                        <motion.div
                            key="participants"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <ParticipantsList
                                participants={participants}
                                onRefresh={fetchParticipants}
                                eventId={eventId}
                                isPaidEvent={event?.isPaid || false}
                                customFields={event?.customFields || []}
                                isWriter={isWriter}
                            />
                        </motion.div>
                    )}

                    {activeTab === "certificates" && (
                        <motion.div
                            key="certificates"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-bold text-white">Credential Templates</h3>
                                    <p className="text-xs text-zinc-400">Design certificates with dynamic QR verification tags.</p>
                                </div>
                                {isWriter && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setEditingTemplate(null);
                                                setShowBuilder(true);
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 bg-[#4285F4] hover:bg-[#3367d6] text-white font-semibold text-xs rounded-full transition"
                                        >
                                            <PlusIcon className="w-3.5 h-3.5" />
                                            Design Template
                                        </button>
                                        <button
                                            onClick={() => setShowIssuedManager(true)}
                                            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs rounded-full transition border border-zinc-700"
                                        >
                                            Issued Credentials
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {templates.map((template) => (
                                    <CertificateTemplateCard
                                        key={template.id}
                                        template={template}
                                        onEdit={() => {
                                            setEditingTemplate(template);
                                            setShowBuilder(true);
                                        }}
                                        onDelete={() => handleTemplateDelete(template.id)}
                                        onIssue={() => setIssuingTemplate(template)}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Builder & Issuance Modals */}
            <AnimatePresence>
                {showBuilder && (
                    <CertificateBuilder
                        onClose={() => {
                            setShowBuilder(false);
                            setEditingTemplate(null);
                        }}
                        onSave={handleTemplateSave}
                        existingTemplate={editingTemplate}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {issuingTemplate && (
                    <IssueCertificateModal
                        template={issuingTemplate}
                        participants={participants}
                        eventId={eventId}
                        eventTitle={event.title}
                        onClose={() => setIssuingTemplate(null)}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showIssuedManager && (
                    <IssuedCertificatesManager
                        eventId={eventId}
                        eventTitle={event.title}
                        onClose={() => setShowIssuedManager(false)}
                    />
                )}
            </AnimatePresence>
        </main>
    );
}
