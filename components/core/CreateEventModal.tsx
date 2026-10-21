"use client";

import React, { useState, useEffect } from "react";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Calendar,
    Tag,
    Users,
    DollarSign,
    FileText,
    Image as ImageIcon,
    Link as LinkIcon,
    Plus,
    Trash2,
    Check,
    Trophy,
    Shield,
    Sparkles,
    Eye,
    EyeOff,
    Clock,
    AlertCircle,
    ChevronDown,
} from "lucide-react";
import { addDoc, collection, Timestamp, doc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createAuditLog } from "@/lib/audit";
import CustomFormBuilder, { FormField, TeamConfig } from "@/components/CustomFormBuilder";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/Badge";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface CreateEventModalProps {
    onClose: () => void;
    onSuccess: () => void;
    userEmail?: string | null;
    initialData?: any;
    isEdit?: boolean;
}

type EventCategory = "hackathon" | "workshop" | "studyjam" | "techtalk" | "competition" | "meetup" | "execom_call" | "other";

const formatToLocalIso = (d: Date): string => {
    const pad = (n: number) => n.toString().padStart(2, "0");
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const formatDateForInput = (val: any): string => {
    if (!val) return "";
    try {
        if (typeof val === "object") {
            if (typeof val.toDate === "function") {
                return formatToLocalIso(val.toDate());
            }
            if (typeof val.seconds === "number") {
                return formatToLocalIso(new Date(val.seconds * 1000));
            }
        }
        if (val instanceof Date) {
            return formatToLocalIso(val);
        }
        if (typeof val === "string") {
            const trimmed = val.trim();
            if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed)) {
                return trimmed;
            }
            const d = new Date(trimmed);
            if (!isNaN(d.getTime())) {
                return formatToLocalIso(d);
            }
        }
    } catch {
        return "";
    }
    return "";
};

export default function CreateEventModal({
    onClose,
    onSuccess,
    userEmail,
    initialData,
    isEdit = false
}: CreateEventModalProps) {
    useBodyScrollLock();
    const [step, setStep] = useState<"details" | "content" | "registration">("details");
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Core Details
    const [title, setTitle] = useState(initialData?.title || "");
    const [slug, setSlug] = useState(initialData?.slug || "");
    const [tagline, setTagline] = useState(initialData?.tagline || "");
    const [category, setCategory] = useState<EventCategory>(initialData?.category || "workshop");
    const [date, setDate] = useState(formatDateForInput(initialData?.date));
    const [regDate, setRegDate] = useState(formatDateForInput(initialData?.registrationLastDate));
    const [location, setLocation] = useState(initialData?.location || "GDG Tech Lab & Online");
    const [posterUrl, setPosterUrl] = useState(initialData?.posterUrl || "");
    const [externalRegistrationUrl, setExternalRegistrationUrl] = useState(initialData?.externalRegistrationUrl || "");
    const [whatsappUrl, setWhatsappUrl] = useState(initialData?.whatsappUrl || initialData?.postRegistrationLink || "");
    const [isHidden, setIsHidden] = useState(Boolean(initialData?.isHidden));

    // Markdown Content
    const [description, setDescription] = useState(initialData?.description || "");
    const [rules, setRules] = useState(initialData?.rules || "");
    const [prizepool, setPrizepool] = useState(initialData?.prizepool || "");
    const [previewDesc, setPreviewDesc] = useState(false);

    // Toggles for extra sections
    const [showRules, setShowRules] = useState(Boolean(initialData?.rules));
    const [showPrizepool, setShowPrizepool] = useState(Boolean(initialData?.prizepool));

    // Registration & Payment Settings
    const [isPaid, setIsPaid] = useState(Boolean(initialData?.isPaid));
    const [paymentAmount, setPaymentAmount] = useState(initialData?.paymentAmount || 0);
    const [upiId, setUpiId] = useState(initialData?.upiId || "gdgcommunity@okaxis");
    const [eventType, setEventType] = useState<"solo" | "team">(initialData?.participationType || "solo");
    const [customFields, setCustomFields] = useState<FormField[]>(initialData?.customFields || []);
    const [teamConfig, setTeamConfig] = useState<TeamConfig>(initialData?.teamConfig || {
        enabled: false,
        minMembers: 2,
        maxMembers: 4,
        memberFields: [
            { id: "member_name", label: "Full Name", type: "text", required: true },
            { id: "member_email", label: "Email Address", type: "email", required: true },
            { id: "member_phone", label: "Phone Number", type: "phone", required: false }
        ]
    });

    // Sync initialData if edit target changes
    useEffect(() => {
        if (isEdit && initialData) {
            setTitle(initialData.title || "");
            setSlug(initialData.slug || "");
            setTagline(initialData.tagline || "");
            setCategory(initialData.category || "workshop");
            setDate(formatDateForInput(initialData.date));
            setRegDate(formatDateForInput(initialData.registrationLastDate));
            setLocation(initialData.location || "GDG Tech Lab & Online");
            setPosterUrl(initialData.posterUrl || "");
            setExternalRegistrationUrl(initialData.externalRegistrationUrl || "");
            setWhatsappUrl(initialData.whatsappUrl || initialData?.postRegistrationLink || "");
            setIsHidden(Boolean(initialData.isHidden));
            setDescription(initialData.description || "");
            setRules(initialData.rules || "");
            setPrizepool(initialData.prizepool || "");
            setShowRules(Boolean(initialData.rules));
            setShowPrizepool(Boolean(initialData.prizepool));
            setIsPaid(Boolean(initialData.isPaid));
            setPaymentAmount(initialData.paymentAmount || 0);
            setUpiId(initialData.upiId || "gdgcommunity@okaxis");
            setEventType(initialData.participationType || "solo");
            setCustomFields(initialData.customFields || []);
            if (initialData.teamConfig) {
                setTeamConfig(initialData.teamConfig);
            }
        }
    }, [isEdit, initialData]);

    const handleAutoSlug = (text: string) => {
        setTitle(text);
        if (!isEdit) {
            setSlug(
                text
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)+/g, "")
            );
        }
    };

    const extractFormattedTime = (dateTimeStr: string): string => {
        if (!dateTimeStr) return "10:00 AM";
        try {
            const d = new Date(dateTimeStr);
            if (isNaN(d.getTime())) return "10:00 AM";
            return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
        } catch {
            return "10:00 AM";
        }
    };

    const cleanFirestoreData = (data: any): any => {
        if (data === null || data === undefined) {
            return null;
        }
        if (Array.isArray(data)) {
            return data.map((item) => cleanFirestoreData(item));
        }
        if (typeof data === "object" && !(data instanceof Date) && !(data instanceof Timestamp)) {
            const cleaned: Record<string, any> = {};
            for (const [key, value] of Object.entries(data)) {
                if (value !== undefined) {
                    cleaned[key] = cleanFirestoreData(value);
                }
            }
            return cleaned;
        }
        return data;
    };

    const validateDetails = (): boolean => {
        if (!title.trim()) {
            setErrorMessage("Please enter an Event Title to continue.");
            return false;
        }
        if (!date) {
            setErrorMessage("Please select the Event Date & Time to continue.");
            return false;
        }
        setErrorMessage(null);
        return true;
    };

    const handleNextStep = () => {
        setErrorMessage(null);
        if (step === "details") {
            if (!validateDetails()) return;
            setStep("content");
        } else if (step === "content") {
            setStep("registration");
        }
    };

    const handleSelectStep = (targetStep: "details" | "content" | "registration") => {
        setErrorMessage(null);
        if (targetStep !== "details" && !validateDetails()) {
            return;
        }
        setStep(targetStep);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);

        if (!validateDetails()) {
            setStep("details");
            return;
        }

        setSubmitting(true);
        try {
            const rawSlug = slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
            const finalSlug = rawSlug || `event-${Date.now().toString(36)}`;
            const eventTime = extractFormattedTime(date);

            const rawEventPayload = {
                title: title.trim(),
                slug: finalSlug,
                tagline: tagline.trim(),
                category,
                date,
                time: eventTime,
                registrationLastDate: regDate || date,
                location: location.trim(),
                posterUrl: posterUrl.trim(),
                externalRegistrationUrl: externalRegistrationUrl.trim(),
                whatsappUrl: whatsappUrl.trim(),
                postRegistrationLink: whatsappUrl.trim(),
                isHidden,
                description: description.trim(),
                rules: showRules ? rules.trim() : "",
                prizepool: showPrizepool ? prizepool.trim() : "",
                isPaid,
                paymentAmount: isPaid ? Number(paymentAmount) : 0,
                upiId: isPaid ? upiId.trim() : "",
                participationType: eventType,
                customFields: customFields || [],
                teamConfig: {
                    ...teamConfig,
                    enabled: eventType === "team"
                },
                updatedAt: Timestamp.now(),
            };

            const eventPayload = cleanFirestoreData(rawEventPayload);
            const targetDocId = initialData?.id || initialData?._id || initialData?.slug;

            if (isEdit && targetDocId) {
                const eventRef = doc(db, "events", targetDocId);
                await setDoc(eventRef, eventPayload, { merge: true });
                await createAuditLog("EVENT_UPDATED", { eventId: targetDocId, title: title.trim() });
            } else {
                const newDocRef = await addDoc(collection(db, "events"), {
                    ...eventPayload,
                    attendees: initialData?.attendees || [],
                    rsvps: initialData?.rsvps || [],
                    createdAt: Timestamp.now(),
                    createdBy: userEmail || "Core Team"
                });
                await createAuditLog("EVENT_CREATED", { eventId: newDocRef.id, title: title.trim() });
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Error saving event:", error);
            setErrorMessage(error?.message || "Failed to save event. Check permissions.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
        if (e.key === "Enter" && (e.target as HTMLElement).tagName === "INPUT") {
            e.preventDefault();
            if (step !== "registration") {
                handleNextStep();
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />

            <motion.div
                data-scroll-allow
                data-lenis-prevent
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.2 }}
                className="relative w-full max-w-4xl max-h-[90vh] bg-white border border-[#d5d5d4] rounded-[36px] shadow-2xl flex flex-col overflow-hidden text-xs"
            >
                {/* Header */}
                <div className="px-6 py-5 border-b border-[#d5d5d4] flex items-center justify-between bg-white shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#2ba0ff]/15 text-[#2ba0ff] flex items-center justify-center shrink-0">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-[#2c2e2a] tracking-tight">
                                {isEdit ? "Edit GDG Event" : "Create GDG Event"}
                            </h3>
                            <p className="text-xs text-[#80827f]">
                                Step {step === "details" ? "1" : step === "content" ? "2" : "3"} of 3: {step === "details" ? "Details & Schedule" : step === "content" ? "Content & Rules" : "Registration & Tickets"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Badge label="EVENT STUDIO" variant="blue" dot={true} />
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-8 h-8 rounded-full hover:bg-[#f5f1e4] flex items-center justify-center text-[#80827f] hover:text-[#2c2e2a] transition cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Step Tabs Bar */}
                <div className="px-6 py-3 border-b border-[#d5d5d4] bg-[#faf8f4] flex items-center gap-2 shrink-0 overflow-x-auto">
                    {[
                        { id: "details", num: "1", label: "Details & Schedule" },
                        { id: "content", num: "2", label: "Description & Rules" },
                        { id: "registration", num: "3", label: "Registration & Tickets" },
                    ].map((tab) => {
                        const isActive = step === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => handleSelectStep(tab.id as any)}
                                className={`flex-1 min-w-[150px] py-2 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2.5 transition-all duration-150 cursor-pointer ${
                                    isActive
                                        ? "bg-white border border-[#d5d5d4] text-[#2c2e2a] shadow-xs"
                                        : "border border-transparent text-[#80827f] hover:text-[#2c2e2a] hover:bg-white/50"
                                }`}
                            >
                                <span className={`w-5 h-5 rounded-md text-[11px] font-mono font-bold flex items-center justify-center transition-colors ${
                                    isActive
                                        ? "bg-[#4285F4] text-white"
                                        : "bg-[#eadecd] text-[#80827f]"
                                }`}>
                                    {tab.num}
                                </span>
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Error Banner */}
                {errorMessage && (
                    <div className="mx-6 mt-4 p-3.5 rounded-xl bg-[#EA4335]/10 border border-[#EA4335]/30 text-[#EA4335] text-xs font-semibold flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{errorMessage}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setErrorMessage(null)}
                            className="p-1 hover:opacity-75 text-sm font-bold ml-2 cursor-pointer"
                        >
                            &times;
                        </button>
                    </div>
                )}

                {/* Form Body */}
                <form
                    onSubmit={handleSubmit}
                    onKeyDown={handleFormKeyDown}
                    data-scroll-allow
                    data-lenis-prevent
                    className="flex-1 overflow-y-auto p-6 space-y-6 bg-white overscroll-contain"
                >
                    {/* STEP 1: DETAILS */}
                    {step === "details" && (
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="event-title" className="text-xs font-semibold text-[#2c2e2a]">
                                    Event Title <span className="text-[#EA4335]">*</span>
                                </Label>
                                <Input
                                    id="event-title"
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => handleAutoSlug(e.target.value)}
                                    placeholder="e.g. Google Cloud & GenAI Hackathon 2026"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="event-slug" className="text-xs font-semibold text-[#2c2e2a]">
                                        URL Slug <span className="text-[#EA4335]">*</span>
                                    </Label>
                                    <Input
                                        id="event-slug"
                                        type="text"
                                        required
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value)}
                                        placeholder="cloud-genai-hackathon"
                                        className="font-mono text-xs"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="event-category" className="text-xs font-semibold text-[#2c2e2a]">
                                        Category
                                    </Label>
                                    <Select value={category} onValueChange={(val) => setCategory(val as any)}>
                                        <SelectTrigger id="event-category" className="w-full">
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="workshop">Workshop</SelectItem>
                                            <SelectItem value="hackathon">Hackathon</SelectItem>
                                            <SelectItem value="studyjam">Study Jam</SelectItem>
                                            <SelectItem value="techtalk">Tech Talk</SelectItem>
                                            <SelectItem value="competition">Competition</SelectItem>
                                            <SelectItem value="meetup">Meetup</SelectItem>
                                            <SelectItem value="execom_call">Execom Call</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="event-tagline" className="text-xs font-semibold text-[#2c2e2a]">
                                    Short Tagline / Catchphrase
                                </Label>
                                <Input
                                    id="event-tagline"
                                    type="text"
                                    value={tagline}
                                    onChange={(e) => setTagline(e.target.value)}
                                    placeholder="Build next-gen multimodal apps using Gemini API and Firebase"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="event-date" className="text-xs font-semibold text-[#2c2e2a]">
                                        Event Date & Time <span className="text-[#EA4335]">*</span>
                                    </Label>
                                    <DateTimePicker
                                        id="event-date"
                                        required
                                        value={date}
                                        onChange={setDate}
                                        placeholder="Pick date & time..."
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="event-reg-date" className="text-xs font-semibold text-[#2c2e2a]">
                                        Registration Deadline
                                    </Label>
                                    <DateTimePicker
                                        id="event-reg-date"
                                        value={regDate}
                                        onChange={setRegDate}
                                        placeholder="Pick deadline..."
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="event-location" className="text-xs font-semibold text-[#2c2e2a]">
                                        Location / Venue
                                    </Label>
                                    <Input
                                        id="event-location"
                                        type="text"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="Auditorium / Lab 3 / Online"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="event-poster" className="text-xs font-semibold text-[#2c2e2a]">
                                        Poster / Banner Image URL
                                    </Label>
                                    <Input
                                        id="event-poster"
                                        type="text"
                                        value={posterUrl}
                                        onChange={(e) => setPosterUrl(e.target.value)}
                                        placeholder="https://.../poster.webp"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="event-whatsapp" className="text-xs font-semibold text-[#2c2e2a]">
                                        WhatsApp Group URL (On Registration)
                                    </Label>
                                    <Input
                                        id="event-whatsapp"
                                        type="text"
                                        value={whatsappUrl}
                                        onChange={(e) => setWhatsappUrl(e.target.value)}
                                        placeholder="https://chat.whatsapp.com/..."
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="event-external-url" className="text-xs font-semibold text-[#2c2e2a]">
                                        External Registration URL (Optional)
                                    </Label>
                                    <Input
                                        id="event-external-url"
                                        type="text"
                                        value={externalRegistrationUrl}
                                        onChange={(e) => setExternalRegistrationUrl(e.target.value)}
                                        placeholder="Leave empty to use built-in GDG registration"
                                    />
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-[#faf8f4] border border-[#d5d5d4] flex items-center justify-between shadow-2xs">
                                <div>
                                    <Label htmlFor="hide-event-switch" className="font-semibold text-xs text-[#2c2e2a] cursor-pointer">
                                        Hide from Public Listing
                                    </Label>
                                    <p className="text-[11px] text-[#80827f] mt-0.5">Keep event hidden in drafts until officially ready to announce.</p>
                                </div>
                                <Switch
                                    id="hide-event-switch"
                                    checked={isHidden}
                                    onCheckedChange={setIsHidden}
                                />
                            </div>
                        </div>
                    )}

                    {/* STEP 2: CONTENT & MARKDOWN */}
                    {step === "content" && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-semibold text-[#2c2e2a]">
                                    Event Description (Markdown)
                                </Label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPreviewDesc(!previewDesc)}
                                    className="gap-1.5"
                                >
                                    {previewDesc ? <FileText className="w-3.5 h-3.5 text-[#4285F4]" /> : <Eye className="w-3.5 h-3.5 text-[#4285F4]" />}
                                    <span>{previewDesc ? "Edit Mode" : "Preview Markdown"}</span>
                                </Button>
                            </div>

                            {previewDesc ? (
                                <div className="p-5 rounded-2xl bg-white border border-[#d5d5d4] min-h-[220px] prose prose-neutral max-w-none text-xs text-[#2c2e2a] leading-relaxed shadow-xs">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {description || "*No description entered.*"}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                <Textarea
                                    rows={8}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Write markdown overview, prerequisites, agenda, speakers..."
                                    className="font-mono text-xs"
                                />
                            )}

                            {/* Extra Sections Toggles */}
                            <div className="space-y-3 pt-2">
                                <div className="p-4 rounded-2xl bg-[#faf8f4] border border-[#d5d5d4] flex flex-wrap items-center justify-between gap-4 shadow-2xs">
                                    <div className="flex items-center gap-3">
                                        <Switch
                                            id="rules-toggle"
                                            checked={showRules}
                                            onCheckedChange={setShowRules}
                                        />
                                        <div>
                                            <Label htmlFor="rules-toggle" className="cursor-pointer font-semibold text-xs text-[#2c2e2a]">
                                                Include Rules & Guidelines
                                            </Label>
                                            <p className="text-[11px] text-[#80827f]">Code of conduct, eligibility and constraints</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Switch
                                            id="prizepool-toggle"
                                            checked={showPrizepool}
                                            onCheckedChange={setShowPrizepool}
                                        />
                                        <div>
                                            <Label htmlFor="prizepool-toggle" className="cursor-pointer font-semibold text-xs text-[#2c2e2a]">
                                                Include Prize Pool Breakdown
                                            </Label>
                                            <p className="text-[11px] text-[#80827f]">Cash prizes, goodies, certificates</p>
                                        </div>
                                    </div>
                                </div>

                                {showRules && (
                                    <div className="p-4 rounded-2xl bg-white border border-[#d5d5d4] space-y-2 shadow-xs">
                                        <Label className="text-[11px] font-mono uppercase text-[#80827f] font-semibold block">Rules & Guidelines (Markdown)</Label>
                                        <Textarea
                                            rows={4}
                                            value={rules}
                                            onChange={(e) => setRules(e.target.value)}
                                            placeholder="Code of conduct, submission deadlines, technical constraints..."
                                            className="font-mono text-xs"
                                        />
                                    </div>
                                )}

                                {showPrizepool && (
                                    <div className="p-4 rounded-2xl bg-white border border-[#d5d5d4] space-y-2 shadow-xs">
                                        <Label className="text-[11px] font-mono uppercase text-[#80827f] font-semibold block">Prize Pool Details (Markdown)</Label>
                                        <Textarea
                                            rows={3}
                                            value={prizepool}
                                            onChange={(e) => setPrizepool(e.target.value)}
                                            placeholder="1st Place: ₹15,000 + Google Swag Pack&#10;2nd Place: ₹10,000..."
                                            className="font-mono text-xs"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* STEP 3: REGISTRATION & PAYMENT */}
                    {step === "registration" && (
                        <div className="space-y-6">
                            {/* Paid Event Toggle */}
                            <div className="p-5 rounded-2xl bg-[#faf8f4] border border-[#d5d5d4] space-y-4 shadow-2xs">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-bold text-[#2c2e2a] text-sm tracking-tight">Ticketing & Fee</h4>
                                        <p className="text-[#80827f] text-xs mt-0.5">Is this a free workshop or a paid ticketed event?</p>
                                    </div>
                                    <Switch
                                        checked={isPaid}
                                        onCheckedChange={setIsPaid}
                                    />
                                </div>

                                {isPaid && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#d5d5d4]">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-[#2c2e2a]">Ticket Fee (INR)</Label>
                                            <Input
                                                type="number"
                                                min={1}
                                                value={paymentAmount}
                                                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                                                className="font-bold"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-[#2c2e2a]">Receiving UPI ID</Label>
                                            <Input
                                                type="text"
                                                value={upiId}
                                                onChange={(e) => setUpiId(e.target.value)}
                                                placeholder="e.g. gdg@okaxis"
                                                className="font-mono text-xs"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Custom Form Builder */}
                            <CustomFormBuilder
                                fields={customFields}
                                onChange={setCustomFields}
                                eventType={eventType}
                                onEventTypeChange={setEventType}
                                teamConfig={teamConfig}
                                onTeamConfigChange={setTeamConfig}
                            />
                        </div>
                    )}

                    {/* Bottom Navigation Toolbar */}
                    <div className="pt-4 border-t border-[#d5d5d4] flex justify-between items-center bg-white shrink-0">
                        <div>
                            {step !== "details" && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setStep(step === "registration" ? "content" : "details")}
                                >
                                    Back
                                </Button>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            {/* In edit mode, allow saving immediately from ANY step */}
                            {isEdit && (
                                <Button
                                    type="submit"
                                    variant="destructive"
                                    disabled={submitting}
                                >
                                    {submitting ? "Saving..." : "Save Changes"}
                                </Button>
                            )}

                            {step !== "registration" ? (
                                <Button
                                    type="button"
                                    variant="default"
                                    onClick={handleNextStep}
                                >
                                    <span>Next Step</span>
                                </Button>
                            ) : !isEdit ? (
                                <Button
                                    type="submit"
                                    variant="google"
                                    disabled={submitting}
                                >
                                    {submitting ? "Publishing..." : "Publish GDG Event"}
                                </Button>
                            ) : null}
                        </div>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

