"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp, doc, getDoc } from "firebase/firestore";
import { 
    CheckCircle2, 
    XCircle, 
    ArrowRight, 
    Lock, 
    Sparkles, 
    User, 
    Mail, 
    Phone, 
    GraduationCap, 
    Building2, 
    CalendarClock, 
    ChevronDown, 
    AlertCircle 
} from "lucide-react";
import confetti from "canvas-confetti";
import { useAuth } from "@/context/AuthContext";
import CustomFormRenderer from "@/components/CustomFormRenderer";
import LoadingSpinner from "@/components/LoadingSpinner";
import { resolveName, formatNameFromEmail } from "@/lib/utils";
import { GDG_EXECOM_2026 } from "@/lib/data/TeamData";
import CustomImageUploader from "@/components/ui/CustomImageUploader";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";

export default function ExecomPage() {
    const { user, userData, loading: authLoading, googleSignIn } = useAuth();
    
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const [formValues, setFormValues] = useState<Record<string, any>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    const [applicantProfile, setApplicantProfile] = useState({
        name: "",
        email: "",
        phone: "",
        department: "CSE",
        semester: "S4",
        college: "Amal Jyothi College of Engineering",
        photoURL: "",
    });

    useEffect(() => {
        if (user) {
            const knownMember = GDG_EXECOM_2026.find(
                (m) => m.email?.toLowerCase().trim() === user.email?.toLowerCase().trim()
            );

            // Filter out institutional or chapter default names
            const isGeneric = (val?: string | null) =>
                Boolean(
                    val &&
                    (val.toLowerCase().includes("developers group") ||
                     val.toLowerCase().includes("gdsc") ||
                     val.toLowerCase() === "applicant" ||
                     val.toLowerCase() === "member")
                );

            const authName = user.displayName && !isGeneric(user.displayName) ? user.displayName : "";
            const provName = user.providerData?.[0]?.displayName && !isGeneric(user.providerData[0].displayName) ? user.providerData[0].displayName : "";

            const detectedName = resolveName(
                userData?.name && !isGeneric(userData.name) ? userData.name : "",
                userData?.displayName && !isGeneric(userData.displayName) ? userData.displayName : authName || provName,
                userData?.fullName && !isGeneric(userData.fullName) ? userData.fullName : "",
                user.email,
                knownMember?.name || ""
            );

            setApplicantProfile((prev) => ({
                ...prev,
                name: prev.name && !isGeneric(prev.name) ? prev.name : (detectedName !== "Applicant" ? detectedName : ""),
                email: user.email || prev.email,
                phone: prev.phone || userData?.phoneNumber || userData?.phone || "",
                department: prev.department && prev.department !== "CSE" ? prev.department : (userData?.department || userData?.dept || knownMember?.dept || "CSE"),
                semester: prev.semester && prev.semester !== "S4" ? prev.semester : (userData?.semester || userData?.sem || "S4"),
                college: userData?.college || "Amal Jyothi College of Engineering",
                photoURL: prev.photoURL || userData?.photoURL || userData?.avatarUrl || user.photoURL || "",
            }));
        }
    }, [user, userData]);
    
    const [driveSettings, setDriveSettings] = useState<{ isOpen: boolean; title: string; description: string; deadline: string; fields?: any[] } | null>(null);
    const [loadingSettings, setLoadingSettings] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const docRef = doc(db, "settings", "execomRecruitment");
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    setDriveSettings(snap.data() as any);
                } else {
                    setDriveSettings({ isOpen: false, title: "Recruitment Closed", description: "We are not accepting applications at this time.", deadline: "" });
                }
            } catch (err) {
                console.error("Error fetching drive settings:", err);
                setDriveSettings({ isOpen: false, title: "Error", description: "Could not load recruitment details.", deadline: "" });
            } finally {
                setLoadingSettings(false);
            }
        };
        fetchSettings();
    }, []);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!applicantProfile.name.trim()) {
            newErrors.name = "Full name is required.";
        }
        if (!applicantProfile.phone.trim()) {
            newErrors.phone = "Phone number is required.";
        }

        if (driveSettings?.fields) {
            driveSettings.fields.forEach(field => {
                if (field.required) {
                    const val = formValues[field.id];
                    if (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0)) {
                        newErrors[field.id] = `${field.label || "This field"} is required.`;
                    }
                }
            });
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        if (!user) return;
        
        setSubmitting(true);

        try {
            const candidateName = applicantProfile.name.trim();
            const candidatePhone = applicantProfile.phone.trim();
            const candidateEmail = user.email || applicantProfile.email;
            const candidateDept = applicantProfile.department;
            const candidateSem = applicantProfile.semester;
            const candidatePhoto = (applicantProfile.photoURL || "").trim() || user.photoURL || "";

            await addDoc(collection(db, "execomApplications"), {
                userId: user.uid,
                name: candidateName,
                fullName: candidateName,
                displayName: candidateName,
                email: candidateEmail,
                phone: candidatePhone,
                phoneNumber: candidatePhone,
                semester: candidateSem,
                department: candidateDept,
                college: applicantProfile.college,
                photoURL: candidatePhoto,
                
                // Custom answers
                answers: formValues,
                
                status: "pending",
                submittedAt: Timestamp.now(),
            });

            // Also sync profile to users/{uid} so user profile details are remembered (never overwrite super admin)
            const userEmail = (user.email || "").toLowerCase().trim();
            if (userEmail !== "dsc@amaljyothi.ac.in" && userEmail !== "karthiksambhu123@gmail.com") {
                try {
                    const { setDoc: setFirestoreDoc } = await import("firebase/firestore");
                    await setFirestoreDoc(doc(db, "users", user.uid), {
                        name: candidateName,
                        displayName: candidateName,
                        fullName: candidateName,
                        phoneNumber: candidatePhone,
                        department: candidateDept,
                        semester: candidateSem,
                        college: applicantProfile.college,
                        photoURL: candidatePhoto,
                    }, { merge: true });
                } catch (syncErr) {
                    console.warn("Could not sync user profile:", syncErr);
                }
            }

            setSubmitted(true);
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ["#4285F4", "#EA4335", "#FBBC04", "#34A853"]
            });
        } catch (err) {
            console.error("Error saving Execom application:", err);
            setErrors({ submit: "Failed to submit application. Please try again." });
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingSettings || authLoading) {
        return (
            <main className="min-h-screen py-16 px-4 flex items-center justify-center bg-[#f8fafc]">
                <LoadingSpinner text="Loading Application..." size="lg" variant="cluster" />
            </main>
        );
    }

    if (!driveSettings?.isOpen) {
        return (
            <main className="min-h-screen py-16 px-4 sm:px-6 relative z-10 flex flex-col items-center justify-center bg-[#f8fafc]">
                <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-sm">
                    <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-500">
                        <XCircle className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-[#0f172a] tracking-tight">{driveSettings?.title || "Recruitment Closed"}</h2>
                    <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
                        {driveSettings?.description || "We are not currently accepting applications for the core team."}
                    </p>
                    <button
                        onClick={() => window.location.href = "/"}
                        className="px-8 py-3 bg-[#0f172a] hover:bg-black text-white text-xs font-semibold rounded-full transition shadow-xs cursor-pointer"
                    >
                        Return to Homepage
                    </button>
                </div>
            </main>
        );
    }

    if (!user) {
        return (
            <main className="min-h-screen bg-[#f8fafc] flex items-center justify-center select-none p-4">
                <div className="p-8 sm:p-10 rounded-[32px] bg-white border border-slate-200 shadow-xl text-center space-y-6 max-w-md w-full">
                    <div className="w-16 h-16 rounded-2xl bg-[#2563EB]/10 border border-[#2563EB]/20 flex items-center justify-center mx-auto text-[#2563EB]">
                        <Lock className="w-7 h-7" />
                    </div>

                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2563EB]/10 text-[#2563EB] text-xs font-bold">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Execom Recruitment</span>
                        </div>
                        <h2 className="text-2xl font-bold text-[#0f172a] tracking-tight">
                            Sign In to Apply
                        </h2>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Sign in with your Google account to submit your application for the GDG AJCE Executive Committee.
                        </p>
                    </div>

                    <button
                        onClick={googleSignIn}
                        className="w-full inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-[#0f172a] hover:bg-black text-white text-sm font-semibold shadow-md transition active:scale-95 cursor-pointer"
                    >
                        <span>Sign in with Google</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen py-16 px-4 sm:px-6 relative z-10 flex flex-col items-center justify-center bg-[#f8fafc]">
            {/* Header displaying dynamic settings */}
            <div className="w-full max-w-2xl text-center mb-8 space-y-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2563EB]/10 text-[#2563EB] text-xs font-bold tracking-wide border border-[#2563EB]/20">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Executive Committee Recruitment Drive</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] tracking-tight">{driveSettings.title}</h1>
                <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">{driveSettings.description}</p>
                {driveSettings.deadline && (
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#EA4335] bg-[#EA4335]/10 px-3 py-1 rounded-full border border-[#EA4335]/20">
                        <CalendarClock className="w-3.5 h-3.5" />
                        <span>Deadline: {new Date(driveSettings.deadline).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>
                )}
            </div>

            <div className="w-full max-w-2xl bg-[#ffffff] border border-[#d5d5d4] rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden transition-colors">
                {submitted ? (
                    <div className="text-center py-12 space-y-6">
                        <div className="w-20 h-20 rounded-full bg-[#34A853]/10 border border-[#34A853]/30 flex items-center justify-center mx-auto text-[#34A853]">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-[#2c2e2a] tracking-tight">Application Submitted!</h2>
                        <p className="text-sm text-[#80827f] max-w-md mx-auto leading-relaxed">
                            Thank you for stepping up to lead GDG AJCE! Your application has been received and is now under review by the core panel.
                        </p>
                        <div className="pt-2">
                            <button
                                onClick={() => window.location.href = "/"}
                                className="px-8 py-3 bg-[#2c2e2a] hover:bg-[#1a1a1a] text-white text-xs font-semibold rounded-xl transition shadow-sm cursor-pointer inline-flex items-center gap-2"
                            >
                                <span>Return to Homepage</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Applicant Information Form */}
                        <div className="bg-[#f5f1e4]/60 border border-[#d5d5d4] rounded-2xl p-6 space-y-5">
                            <div className="flex items-center gap-3.5 pb-4 border-b border-[#d5d5d4]">
                                <img
                                    src={(applicantProfile.photoURL || "").trim() || user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`}
                                    alt="Avatar"
                                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs shrink-0"
                                    onError={(e) => {
                                        e.currentTarget.src = user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`;
                                    }}
                                />
                                <div className="min-w-0">
                                    <h3 className="text-sm font-bold text-[#2c2e2a] flex items-center gap-1.5">
                                        <User className="w-4 h-4 text-[#4285F4]" />
                                        <span>Candidate Profile</span>
                                    </h3>
                                    <p className="text-xs text-[#80827f]">Verify your contact, academic, and profile details.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-[#2c2e2a] flex items-center justify-between">
                                        <span>Full Name</span>
                                        <span className="text-[#EA4335] text-[10px] font-mono">*Required</span>
                                    </Label>
                                    <Input
                                        type="text"
                                        value={applicantProfile.name}
                                        onChange={(e) => {
                                            setApplicantProfile({ ...applicantProfile, name: e.target.value });
                                            if (errors.name) setErrors({ ...errors, name: "" });
                                        }}
                                        placeholder="Your full name"
                                        error={Boolean(errors.name)}
                                    />
                                    {errors.name && <p className="text-[11px] text-[#EA4335] font-medium">{errors.name}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-[#2c2e2a]">
                                        Email Address
                                    </Label>
                                    <Input
                                        type="email"
                                        value={user.email || ""}
                                        disabled
                                        className="bg-[#f5f1e4]/80 text-[#80827f]"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-[#2c2e2a] flex items-center justify-between">
                                        <span>Phone / WhatsApp</span>
                                        <span className="text-[#EA4335] text-[10px] font-mono">*Required</span>
                                    </Label>
                                    <Input
                                        type="tel"
                                        value={applicantProfile.phone}
                                        onChange={(e) => {
                                            setApplicantProfile({ ...applicantProfile, phone: e.target.value });
                                            if (errors.phone) setErrors({ ...errors, phone: "" });
                                        }}
                                        placeholder="+91 XXXXX XXXXX"
                                        error={Boolean(errors.phone)}
                                    />
                                    {errors.phone && <p className="text-[11px] text-[#EA4335] font-medium">{errors.phone}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-[#2c2e2a]">
                                        Department / Branch
                                    </Label>
                                    <div className="relative">
                                        <select
                                            value={applicantProfile.department}
                                            onChange={(e) => setApplicantProfile({ ...applicantProfile, department: e.target.value })}
                                            className="flex h-10 w-full rounded-xl border border-[#d5d5d4] bg-white px-3.5 py-2 text-sm text-[#2c2e2a] shadow-xs transition-all duration-200 focus-visible:outline-none focus-visible:border-[#4285F4] focus-visible:ring-3 focus-visible:ring-[#4285F4]/20 hover:border-[#a0a29f] cursor-pointer appearance-none pr-10"
                                        >
                                            <option value="CSE">Computer Science & Engineering (CSE)</option>
                                            <option value="IT">Information Technology (IT)</option>
                                            <option value="ECE">Electronics & Communication (ECE)</option>
                                            <option value="EEE">Electrical & Electronics (EEE)</option>
                                            <option value="ME">Mechanical Engineering (ME)</option>
                                            <option value="CE">Civil Engineering (CE)</option>
                                            <option value="AI & DS">Artificial Intelligence & Data Science</option>
                                            <option value="MCA">Computer Applications (MCA)</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#80827f] pointer-events-none" />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-[#2c2e2a]">
                                        Current Semester
                                    </Label>
                                    <div className="relative">
                                        <select
                                            value={applicantProfile.semester}
                                            onChange={(e) => setApplicantProfile({ ...applicantProfile, semester: e.target.value })}
                                            className="flex h-10 w-full rounded-xl border border-[#d5d5d4] bg-white px-3.5 py-2 text-sm text-[#2c2e2a] shadow-xs transition-all duration-200 focus-visible:outline-none focus-visible:border-[#4285F4] focus-visible:ring-3 focus-visible:ring-[#4285F4]/20 hover:border-[#a0a29f] cursor-pointer appearance-none pr-10"
                                        >
                                            {["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"].map((sem) => (
                                                <option key={sem} value={sem}>{sem}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#80827f] pointer-events-none" />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-[#2c2e2a]">
                                        College
                                    </Label>
                                    <Input
                                        type="text"
                                        value={applicantProfile.college}
                                        disabled
                                        className="bg-[#f5f1e4]/80 text-[#80827f]"
                                    />
                                </div>

                                <div className="sm:col-span-2 pt-2">
                                    <CustomImageUploader
                                        value={applicantProfile.photoURL}
                                        onChange={(url) => setApplicantProfile({ ...applicantProfile, photoURL: url })}
                                        folder="execom_applicants"
                                        fallbackUrl={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`}
                                        label="Profile Photo / Custom Avatar"
                                        description="Upload a custom photo or leave empty to use your Gmail profile photo."
                                        allowUrlToggle={true}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Custom Form Questions */}
                        {driveSettings.fields && driveSettings.fields.length > 0 ? (
                            <div className="space-y-4 pt-2">
                                <div className="border-b border-[#d5d5d4] pb-2">
                                    <h3 className="text-base font-bold text-[#2c2e2a]">Application Questionnaire</h3>
                                    <p className="text-xs text-[#80827f]">Please respond thoughtfully to help us evaluate your nomination.</p>
                                </div>
                                <CustomFormRenderer 
                                    fields={driveSettings.fields}
                                    values={formValues}
                                    onChange={setFormValues}
                                    errors={errors}
                                />
                            </div>
                        ) : (
                            <div className="py-4 text-center text-sm text-[#80827f] bg-[#f5f1e4]/40 rounded-xl border border-dashed border-[#d5d5d4]">
                                No additional questions configured for this drive. You may submit your nomination directly.
                            </div>
                        )}

                        {errors.submit && (
                            <div className="flex items-center gap-2 p-3 bg-[#EA4335]/10 border border-[#EA4335]/30 rounded-xl text-xs text-[#EA4335]">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{errors.submit}</span>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-end pt-6 border-t border-[#d5d5d4]">
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="px-8 py-3.5 rounded-xl bg-[#2c2e2a] hover:bg-[#1a1a1a] text-white text-sm font-semibold shadow-md transition active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2.5"
                            >
                                {submitting ? "Submitting..." : "Submit Execom Application"}
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
