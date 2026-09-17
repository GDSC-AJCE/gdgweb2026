"use client";

import { use, useEffect, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { doc, getDoc, collection, addDoc, query, where, getDocs, Timestamp, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from "framer-motion";
import {
    CalendarIcon,
    ClockIcon,
    ArrowLeftIcon,
    CheckCircleIcon,
    XMarkIcon,
    ShareIcon,
    MapPinIcon,
    UserGroupIcon,
    DocumentTextIcon,
    SparklesIcon,
    PhoneIcon,
    UserIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import LoadingSpinner, { useFullPageLoader } from "@/components/LoadingSpinner";
import { useDialog } from "@/context/DialogContext";
import { MemberFieldsForm, CustomFieldsForm } from "@/components/CustomFormRenderer";
import DualUPIPayment from "@/components/DualUPIPayment";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";
import CreativeEventPoster from "@/components/programs/CreativeEventPoster";

export default function ProgramDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const router = useRouter();
    const { user, userData, googleSignIn } = useAuth();
    const dialog = useDialog();

    const [data, setData] = useState<any>(null);
    const [eventId, setEventId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("about");

    // Registration wizard
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [showRegisterConfirm, setShowRegisterConfirm] = useState(false);
    const [registering, setRegistering] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    // Form inputs
    const [customFormValues, setCustomFormValues] = useState<Record<string, any>>({});
    const [customFormErrors, setCustomFormErrors] = useState<Record<string, string>>({});
    const [stepError, setStepError] = useState<string | null>(null);

    // Team registration inputs
    const [teamName, setTeamName] = useState("");
    const [teamMembers, setTeamMembers] = useState<any[]>([]);

    // Payment state
    const [paymentUpiId, setPaymentUpiId] = useState("");
    const [paymentUtr, setPaymentUtr] = useState("");

    const isTeamEvent = Boolean(data?.participationType === "team" || data?.teamConfig?.enabled);

    // Dynamic steps builder
    const steps: string[] = [];
    if (isTeamEvent) {
        steps.push("team_name");
        steps.push("team_members");
    }
    if (data?.customFields && data.customFields.length > 0) {
        steps.push("custom_form");
    }
    if (data?.isPaid && data?.paymentAmount > 0) {
        steps.push("payment");
    } else {
        steps.push("review");
    }

    const currentStepId = steps[currentStepIndex] || "review";
    const isLastStep = currentStepIndex === steps.length - 1;

    const isRegistrationClosed = (): boolean => {
        if (!data?.isEvent) return false;
        const now = new Date();
        if (data.regDate) {
            const regDeadline = new Date(data.regDate);
            if (!isNaN(regDeadline.getTime()) && now > regDeadline) return true;
        }
        if (data.date) {
            const eventDate = new Date(data.date);
            if (!isNaN(eventDate.getTime()) && now > eventDate) return true;
        }
        return false;
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                const eventsRef = collection(db, "events");
                const q = query(eventsRef, where("slug", "==", slug));
                const querySnap = await getDocs(q);

                if (!querySnap.empty) {
                    const docSnap = querySnap.docs[0];
                    const ed = docSnap.data();
                    setEventId(docSnap.id);
                    setData({
                        category: ed.category,
                        title: ed.title,
                        tagline: ed.tagline,
                        content: ed.description,
                        date: ed.date,
                        regDate: ed.registrationLastDate,
                        posterUrl: ed.posterUrl,
                        location: ed.location || "Google Meet / Hybrid",
                        isEvent: true,
                        type: "Technical Session",
                        isPaid: ed.isPaid || false,
                        paymentAmount: ed.paymentAmount || 0,
                        upiId: ed.upiId || "",
                        paymentNote: ed.paymentNote || "",
                        rules: ed.rules,
                        prizepool: ed.prizepool,
                        sponsors: ed.sponsors,
                        collaborators: ed.collaborators,
                        featureFlags: ed.featureFlags,
                        customFields: ed.customFields || [],
                        participationType: ed.participationType || "solo",
                        teamConfig: ed.teamConfig || null,
                        postRegistrationLink: ed.postRegistrationLink || "",
                        postRegistrationMessage: ed.postRegistrationMessage || "",
                        externalRegistrationUrl: ed.externalRegistrationUrl || "",
                        isHidden: ed.isHidden || false,
                        coordinators: ed.coordinators || [],
                        brochureUrl: ed.brochureUrl || ""
                    });
                } else {
                    const docRef = doc(db, "events", slug);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const ed = docSnap.data();
                        setEventId(docSnap.id);
                        setData({
                            category: ed.category,
                            title: ed.title,
                            tagline: ed.tagline,
                            content: ed.description,
                            date: ed.date,
                            regDate: ed.registrationLastDate,
                            posterUrl: ed.posterUrl,
                            location: ed.location || "Google Meet / Hybrid",
                            isEvent: true,
                            type: "Technical Session",
                            isPaid: ed.isPaid || false,
                            paymentAmount: ed.paymentAmount || 0,
                            upiId: ed.upiId || "",
                            paymentNote: ed.paymentNote || "",
                            rules: ed.rules,
                            prizepool: ed.prizepool,
                            sponsors: ed.sponsors,
                            collaborators: ed.collaborators,
                            featureFlags: ed.featureFlags,
                            customFields: ed.customFields || [],
                            participationType: ed.participationType || "solo",
                            teamConfig: ed.teamConfig || null,
                            postRegistrationLink: ed.postRegistrationLink || "",
                            postRegistrationMessage: ed.postRegistrationMessage || "",
                            externalRegistrationUrl: ed.externalRegistrationUrl || "",
                            isHidden: ed.isHidden || false,
                            coordinators: ed.coordinators || [],
                            brochureUrl: ed.brochureUrl || ""
                        });
                    } else {
                        setData(null);
                    }
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [slug]);

    useEffect(() => {
        const checkRegistration = async () => {
            if (!user || !eventId) return;
            try {
                const q = query(
                    collection(db, "events", eventId, "participants"),
                    where("userId", "==", user.uid)
                );
                const snap = await getDocs(q);
                setIsRegistered(!snap.empty);
            } catch (error) {
                console.error("Error checking registration:", error);
            }
        };
        checkRegistration();
    }, [user, eventId]);

    const handleRegister = () => {
        if (!eventId) return;

        if (isRegistrationClosed()) {
            dialog.alert("Registration for this event is closed.", "Notice");
            return;
        }

        if (data?.externalRegistrationUrl) {
            window.open(data.externalRegistrationUrl, "_blank");
            return;
        }

        if (data?.category === "execom_call") {
            router.push("/execom");
            return;
        }

        if (!user) {
            sessionStorage.setItem("registrationReturnUrl", window.location.pathname);
            setShowLoginPrompt(true);
            return;
        }

        if (isRegistered) {
            dialog.alert("You are already registered for this event!", "Notice");
            return;
        }

        setCustomFormValues({});
        setCustomFormErrors({});
        setTeamName("");

        const isTeam = data?.participationType === "team" || data?.teamConfig?.enabled;
        if (isTeam && data?.teamConfig) {
            const minTeammates = Math.max(0, (data.teamConfig.minMembers || 2) - 1);
            setTeamMembers(Array.from({ length: minTeammates }, () => ({})));
        } else {
            setTeamMembers([]);
        }

        setPaymentUpiId("");
        setPaymentUtr("");
        setCurrentStepIndex(0);
        setShowRegisterConfirm(true);
    };

    const handleNextStep = () => {
        setStepError(null);

        if (currentStepId === "team_name") {
            if (!teamName.trim()) {
                setCustomFormErrors({ teamName: "Team Name is required" });
                setStepError("Please provide a name for your team.");
                return;
            }
        } else if (currentStepId === "team_members") {
            const minAllowed = data?.teamConfig?.minMembers || 2;
            if (teamMembers.length + 1 < minAllowed) {
                setStepError(`Minimum ${minAllowed} members required.`);
                return;
            }
        } else if (currentStepId === "custom_form") {
            const errors: Record<string, string> = {};
            (data?.customFields || []).forEach((f: any) => {
                if (f.required && !customFormValues[f.id]) {
                    errors[f.id] = "This question is required";
                }
            });
            if (Object.keys(errors).length > 0) {
                setCustomFormErrors(errors);
                setStepError("Please answer all required questions.");
                return;
            }
        } else if (currentStepId === "payment") {
            if (!paymentUpiId.trim() || !paymentUtr.trim()) {
                setStepError("Please enter your UPI ID and payment reference / UTR number.");
                return;
            }
        }

        if (isLastStep) {
            confirmRegistration();
        } else {
            setCurrentStepIndex(prev => prev + 1);
        }
    };

    const confirmRegistration = async () => {
        if (!eventId || !user) return;
        setRegistering(true);

        try {
            const isTeam = Boolean(data?.participationType === "team" || data?.teamConfig?.enabled);
            const participantData: any = {
                userId: user.uid,
                name: user.displayName || userData?.displayName || "Anonymous",
                email: user.email,
                department: userData?.department || "",
                college: userData?.college || "",
                graduationYear: userData?.graduationYear || "",
                phoneNumber: userData?.phoneNumber || "",
                registeredAt: Timestamp.now(),
                customFormResponses: customFormValues,
                isTeamRegistration: isTeam,
                participationType: isTeam ? "team" : "solo",
                ...(isTeam ? {
                    teamName: teamName.trim(),
                    teamMembers: teamMembers,
                    teamSize: teamMembers.length + 1
                } : {})
            };

            if (data?.isPaid && data?.paymentAmount > 0) {
                participantData.paymentStatus = "pending_verification";
                participantData.paymentAmount = data.paymentAmount;
                participantData.paymentUpiId = paymentUpiId.trim();
                participantData.paymentUtr = paymentUtr.trim();
            }

            await addDoc(collection(db, "events", eventId, "participants"), participantData);
            setShowRegisterConfirm(false);
            setIsRegistered(true);
            setRegistrationSuccess(true);

            confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6 },
                colors: ["#4285F4", "#EA4335", "#FBBC04", "#34A853"]
            });
        } catch (error) {
            console.error("Error registering:", error);
            dialog.alert("Failed to complete registration. Please try again.", "Error");
        } finally {
            setRegistering(false);
        }
    };

    if (loading) return <LoadingSpinner text="Loading event details..." />;
    if (!data) return notFound();

    return (
        <main className="min-h-screen text-[#e3e3e3] relative overflow-hidden pb-32">
            <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-12">
                <Link href="/programs" className="inline-flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-white transition-colors mb-8 group">
                    <ArrowLeftIcon className="w-3.5 h-3.5 transform group-hover:-translate-x-1 transition-transform" />
                    Back to All Events
                </Link>

                <div className="grid lg:grid-cols-[1fr_360px] gap-8 lg:gap-12 items-start">
                    {/* Left Column: Details */}
                    <div className="space-y-8">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="px-3 py-1 rounded-full bg-[#f5f1e4] border border-[#d5d5d4] text-xs font-mono text-[#2ba0ff]">
                                    {data.type}
                                </span>
                                <span className={`px-3 py-1 rounded-full border text-[10px] font-mono font-bold uppercase tracking-wider ${
                                    isRegistered
                                        ? "bg-[#34A853]/10 border-[#34A853]/30 text-[#34A853]"
                                        : isRegistrationClosed()
                                            ? "bg-[#EA4335]/10 border-[#EA4335]/30 text-[#EA4335]"
                                            : "bg-[#2ba0ff]/10 border-[#2ba0ff]/30 text-[#2ba0ff]"
                                }`}>
                                    {isRegistered ? "Registered" : isRegistrationClosed() ? "Closed" : "Open"}
                                </span>
                            </div>

                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#2c2e2a] tracking-tight">
                                {data.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-5 text-xs text-[#80827f] mt-4 font-mono">
                                {data.date && (
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4 text-[#2ba0ff]" />
                                        <span>Date: <span className="text-[#2c2e2a] font-semibold">{data.date}</span></span>
                                    </div>
                                )}
                                {data.regDate && (
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4 text-[#FBBC04]" />
                                        <span>Deadline: <span className="text-[#2c2e2a] font-semibold">{data.regDate}</span></span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex items-center gap-1 p-1 bg-[#ffffff] border border-[#d5d5d4] rounded-[50px] w-fit shadow-xs">
                            <button
                                onClick={() => setActiveTab("about")}
                                className={`px-4 py-1.5 text-xs font-semibold rounded-[50px] transition-all cursor-pointer ${
                                    activeTab === "about"
                                        ? "bg-[#2c2e2a] text-white shadow-xs"
                                        : "text-[#2c2e2a] hover:bg-[#f5f1e4]"
                                }`}
                            >
                                Overview
                            </button>
                            {data.featureFlags?.rules && (
                                <button
                                    onClick={() => setActiveTab("rules")}
                                    className={`px-4 py-1.5 text-xs font-semibold rounded-[50px] transition-all cursor-pointer ${
                                        activeTab === "rules"
                                            ? "bg-[#2c2e2a] text-white shadow-xs"
                                            : "text-[#2c2e2a] hover:bg-[#f5f1e4]"
                                    }`}
                                >
                                    Guidelines
                                </button>
                            )}
                            {data.featureFlags?.prizepool && (
                                <button
                                    onClick={() => setActiveTab("prizepool")}
                                    className={`px-4 py-1.5 text-xs font-semibold rounded-[50px] transition-all cursor-pointer ${
                                        activeTab === "prizepool"
                                            ? "bg-[#2c2e2a] text-white shadow-xs"
                                            : "text-[#2c2e2a] hover:bg-[#f5f1e4]"
                                    }`}
                                >
                                    Prizes
                                </button>
                            )}
                        </div>

                        {/* Tab Content */}
                        <div className="bg-[#ffffff] border border-[#d5d5d4] rounded-3xl p-6 sm:p-8 shadow-xs">
                            {activeTab === "about" && (
                                <div className="space-y-6">
                                    {data.tagline && (
                                        <p className="text-base text-[#2c2e2a] italic border-l-2 border-[#2ba0ff] pl-4 py-1">
                                            "{data.tagline}"
                                        </p>
                                    )}
                                    <div className="prose prose-sm max-w-none text-[#2c2e2a] leading-relaxed">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {data.content}
                                        </ReactMarkdown>
                                    </div>

                                    {data.coordinators && data.coordinators.length > 0 && (
                                        <div className="pt-6 border-t border-[#f5f1e4]">
                                            <h4 className="text-xs font-mono font-bold text-[#80827f] uppercase tracking-wider mb-4">
                                                Event Leads & Coordinators
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {data.coordinators.map((c: any, idx: number) => (
                                                    <div key={idx} className="p-3 rounded-2xl bg-[#f5f1e4] border border-[#d5d5d4] flex items-center justify-between">
                                                        <div>
                                                            <p className="text-xs font-bold text-[#2c2e2a]">{c.name}</p>
                                                            <p className="text-[10px] text-[#80827f]">{c.role || "Lead"}</p>
                                                        </div>
                                                        {c.phone && (
                                                            <a href={`tel:${c.phone}`} className="p-2 rounded-xl bg-[#ffffff] border border-[#d5d5d4] hover:bg-[#e0dbce] text-[#2ba0ff]">
                                                                <PhoneIcon className="w-3.5 h-3.5" />
                                                            </a>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === "rules" && (
                                <div className="prose prose-sm max-w-none text-[#2c2e2a]">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {data.rules || "Guidelines and conduct policy apply to all registered attendees."}
                                    </ReactMarkdown>
                                </div>
                            )}

                            {activeTab === "prizepool" && (
                                <div className="prose prose-sm max-w-none text-[#2c2e2a]">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {data.prizepool || "Certificates of completion and community credits awarded to active participants."}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Sticky Action Card */}
                    <div className="sticky top-28 space-y-4">
                        {/* Creative Poster (Uploaded image or Landing Page Storybook illustration) */}
                        <div className="rounded-3xl overflow-hidden border border-[#d5d5d4] shadow-xs bg-[#ffffff]">
                            <CreativeEventPoster
                                posterUrl={data.posterUrl}
                                title={data.title}
                                category={data.type || "Event"}
                                isClosed={isRegistrationClosed()}
                                seed={slug || data.title}
                                aspectRatio="video"
                                showBadges={false}
                            />
                        </div>

                        <div className="p-6 rounded-3xl bg-[#ffffff] border border-[#d5d5d4] space-y-5 shadow-xs">
                            {/* Action Button */}
                            {isRegistered ? (
                                <div className="space-y-3">
                                    <div className="w-full py-3 bg-[#34A853]/10 border border-[#34A853]/30 text-[#34A853] font-semibold rounded-[50px] text-center flex items-center justify-center gap-2 text-xs tracking-wide">
                                        <CheckCircleIcon className="w-4 h-4" />
                                        YOU ARE REGISTERED
                                    </div>
                                    {data.postRegistrationLink && (
                                        <a
                                            href={data.postRegistrationLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full py-2.5 px-4 bg-[#2c2e2a] hover:bg-[#1a1a1a] text-white font-semibold rounded-[50px] text-center flex items-center justify-center gap-2 text-xs transition-colors shadow-xs"
                                        >
                                            <ShareIcon className="w-3.5 h-3.5" />
                                            {data.postRegistrationMessage || "Join Chapter Discord / Slack"}
                                        </a>
                                    )}
                                </div>
                            ) : isRegistrationClosed() ? (
                                <div className="w-full py-3 bg-[#EA4335]/10 border border-[#EA4335]/30 text-[#EA4335] font-semibold rounded-[50px] text-center text-xs">
                                    REGISTRATION CLOSED
                                </div>
                            ) : (
                                <button
                                    onClick={handleRegister}
                                    disabled={registering}
                                    className="w-full py-3.5 bg-[#2c2e2a] hover:bg-[#1a1a1a] text-white font-semibold text-xs rounded-[50px] transition-all shadow-xs flex items-center justify-center gap-2 group cursor-pointer"
                                >
                                    <span>{data.category === "execom_call" ? "APPLY FOR EXECOM" : "REGISTER FOR EVENT"}</span>
                                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                </button>
                            )}

                            {/* Key Information */}
                            <div className="space-y-3 pt-3 border-t border-[#f5f1e4] text-xs">
                                <div className="flex justify-between items-center">
                                    <span className="text-[#80827f]">Participation</span>
                                    <span className="text-[#2c2e2a] font-medium capitalize">{data.participationType || "Solo"}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[#80827f]">Access Fee</span>
                                    <span className="text-[#2c2e2a] font-bold">
                                        {data.isPaid && data.paymentAmount > 0 ? `₹${data.paymentAmount}` : "Free"}
                                    </span>
                                </div>
                                {data.location && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-[#80827f]">Venue</span>
                                        <span className="text-[#2c2e2a] font-medium truncate max-w-[180px]">{data.location}</span>
                                    </div>
                                )}
                            </div>

                            {data.brochureUrl && (
                                <a
                                    href={data.brochureUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[50px] border border-[#d5d5d4] hover:bg-[#f5f1e4] text-xs font-semibold text-[#2c2e2a] transition-colors"
                                >
                                    <DocumentTextIcon className="w-3.5 h-3.5" />
                                    Download Brochure
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Registration Wizard Dialog */}
            <AnimatePresence>
                {showRegisterConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowRegisterConfirm(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-[#ffffff] border border-[#d5d5d4] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-xs z-10 max-h-[90vh] flex flex-col">
                            {/* Wizard Header */}
                            <div className="flex items-center justify-between pb-4 border-b border-[#d5d5d4]">
                                <div>
                                    <span className="text-[10px] font-mono font-semibold text-[#4285F4] uppercase">Step {currentStepIndex + 1} of {steps.length}</span>
                                    <h3 className="text-base font-bold text-[#2c2e2a] tracking-tight mt-0.5">
                                        {currentStepId === "team_name" && "Team Registration"}
                                        {currentStepId === "team_members" && "Add Teammates"}
                                        {currentStepId === "custom_form" && "Attendee Survey"}
                                        {currentStepId === "payment" && "UPI Registration Fee"}
                                        {currentStepId === "review" && "Confirm Details"}
                                    </h3>
                                </div>
                                <button onClick={() => setShowRegisterConfirm(false)} className="p-1 rounded-lg text-[#80827f] hover:text-[#2c2e2a] cursor-pointer">
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>

                            {stepError && (
                                <div className="mt-4 p-3 rounded-xl bg-[#EA4335]/10 border border-[#EA4335]/20 text-[#EA4335] text-xs">
                                    {stepError}
                                </div>
                            )}

                            {/* Wizard Body */}
                            <div className="flex-1 overflow-y-auto py-6 space-y-4">
                                {currentStepId === "team_name" && (
                                    <div className="space-y-3">
                                        <label className="text-xs font-semibold text-[#2c2e2a]">Team Name *</label>
                                        <input
                                            type="text"
                                            value={teamName}
                                            onChange={e => setTeamName(e.target.value)}
                                            placeholder="e.g. Google Cloud Architects"
                                            className="w-full bg-[#f5f1e4] border border-[#d5d5d4] rounded-xl px-4 py-2.5 text-[#2c2e2a] text-xs outline-none focus:border-[#4285F4] focus:bg-[#ffffff]"
                                        />
                                    </div>
                                )}

                                {currentStepId === "team_members" && (
                                    <div className="space-y-4">
                                        <MemberFieldsForm
                                            member={teamMembers[0] || {}}
                                            index={0}
                                            memberFields={data?.teamConfig?.memberFields || []}
                                            onChange={(fieldId, val) => {
                                                const updated = [...teamMembers];
                                                updated[0] = { ...(updated[0] || {}), [fieldId]: val };
                                                setTeamMembers(updated);
                                            }}
                                            errors={customFormErrors}
                                        />
                                    </div>
                                )}

                                {currentStepId === "custom_form" && (
                                    <CustomFieldsForm
                                        fields={data?.customFields || []}
                                        values={customFormValues}
                                        onChange={setCustomFormValues}
                                        errors={customFormErrors}
                                    />
                                )}

                                {currentStepId === "payment" && (
                                    <div className="space-y-4">
                                        <DualUPIPayment amount={data?.paymentAmount || 0} payeeName={data?.title || "GDG Event"} />
                                        <div className="space-y-3 pt-3">
                                            <div>
                                                <label className="text-xs text-[#2c2e2a] font-medium block mb-1">Your UPI ID *</label>
                                                <input
                                                    type="text"
                                                    value={paymentUpiId}
                                                    onChange={e => setPaymentUpiId(e.target.value)}
                                                    placeholder="user@upi"
                                                    className="w-full bg-[#f5f1e4] border border-[#d5d5d4] rounded-xl px-3 py-2 text-xs text-[#2c2e2a] font-mono outline-none focus:border-[#4285F4] focus:bg-[#ffffff]"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-[#2c2e2a] font-medium block mb-1">12-Digit UTR / Transaction ID *</label>
                                                <input
                                                    type="text"
                                                    value={paymentUtr}
                                                    onChange={e => setPaymentUtr(e.target.value)}
                                                    placeholder="12 digit UTR from payment app"
                                                    className="w-full bg-[#f5f1e4] border border-[#d5d5d4] rounded-xl px-3 py-2 text-xs text-[#2c2e2a] font-mono outline-none focus:border-[#4285F4] focus:bg-[#ffffff]"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {currentStepId === "review" && (
                                    <div className="p-4 rounded-2xl bg-[#f5f1e4] border border-[#d5d5d4] space-y-2 text-xs">
                                        <p className="text-[#80827f]">Review your registration details for <strong className="text-[#2c2e2a]">{data?.title}</strong>.</p>
                                        <p className="text-[#80827f]">Ticket Type: <span className="text-[#34A853] font-semibold">{data?.isPaid ? `Paid (₹${data.paymentAmount})` : "Complimentary Access"}</span></p>
                                    </div>
                                )}
                            </div>

                            {/* Wizard Footer */}
                            <div className="flex items-center justify-between pt-4 border-t border-[#d5d5d4]">
                                {currentStepIndex > 0 ? (
                                    <button onClick={() => setCurrentStepIndex(prev => prev - 1)} className="px-4 py-2 text-xs text-[#80827f] hover:text-[#2c2e2a] cursor-pointer transition">
                                        Back
                                    </button>
                                ) : <div />}
                                <button
                                    onClick={handleNextStep}
                                    disabled={registering}
                                    className="px-6 py-2.5 rounded-[50px] bg-[#2c2e2a] hover:bg-[#1a1a1a] text-white text-xs font-semibold shadow-xs cursor-pointer transition disabled:opacity-50"
                                >
                                    {registering ? "Registering..." : isLastStep ? "Complete Registration" : "Next"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Login Prompt Dialog */}
            <AnimatePresence>
                {showLoginPrompt && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLoginPrompt(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-[#ffffff] border border-[#d5d5d4] rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-xs">
                            <h3 className="text-lg font-bold text-[#2c2e2a]">Sign In Required</h3>
                            <p className="text-xs text-[#80827f]">Sign in with your Google Account to secure your registration.</p>
                            <button
                                onClick={async () => {
                                    await googleSignIn();
                                    setShowLoginPrompt(false);
                                }}
                                className="w-full py-2.5 bg-[#2c2e2a] hover:bg-[#1a1a1a] text-white font-semibold text-xs rounded-[50px] cursor-pointer shadow-xs transition"
                            >
                                Sign in with Google
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </main>
    );
}
