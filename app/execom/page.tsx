"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp, doc, getDoc } from "firebase/firestore";
import { CheckCircleIcon, XCircleIcon, ArrowRightIcon, ShieldExclamationIcon } from "@heroicons/react/24/outline";
import { Lock } from "lucide-react";
import confetti from "canvas-confetti";
import { useAuth } from "@/context/AuthContext";
import CustomFormRenderer from "@/components/CustomFormRenderer";
import LoadingSpinner from "@/components/LoadingSpinner";
import { resolveName, formatNameFromEmail } from "@/lib/utils";
import { GDG_EXECOM_2026 } from "@/lib/data/TeamData";
import CustomImageUploader from "@/components/ui/CustomImageUploader";

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

            // Also sync profile to users/{uid} so user profile details are remembered
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
            <main className="min-h-screen py-16 px-4 flex items-center justify-center bg-[#f5f1e4]">
                <LoadingSpinner text="Loading Application..." size="lg" variant="cluster" />
            </main>
        );
    }

    if (!driveSettings?.isOpen) {
        return (
            <main className="min-h-screen py-16 px-4 sm:px-6 relative z-10 flex flex-col items-center justify-center bg-[#f5f1e4]">
                <div className="w-full max-w-lg bg-[#ffffff] border border-[#d5d5d4] rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xs">
                    <div className="w-20 h-20 rounded-full bg-[#f5f1e4] flex items-center justify-center mx-auto text-[#80827f]">
                        <XCircleIcon className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-[#2c2e2a] tracking-tight">{driveSettings?.title || "Recruitment Closed"}</h2>
                    <p className="text-sm text-[#80827f] leading-relaxed max-w-md mx-auto">
                        {driveSettings?.description || "We are not currently accepting applications for the core team."}
                    </p>
                    <button
                        onClick={() => window.location.href = "/"}
                        className="px-8 py-3 bg-[#2c2e2a] hover:bg-[#1a1a1a] text-white text-xs font-semibold rounded-[50px] transition shadow-xs cursor-pointer"
                    >
                        Return to Homepage
                    </button>
                </div>
            </main>
        );
    }

    if (!user) {
        return (
            <main className="min-h-screen bg-[#f5f1e4] flex items-center justify-center select-none p-4">
                <div className="p-8 sm:p-10 rounded-[40px] bg-white border border-[#d5d5d4] shadow-xl text-center space-y-6 max-w-md w-full">
                    <div className="w-16 h-16 rounded-full bg-[#f5f1e4] border border-[#d5d5d4] flex items-center justify-center mx-auto">
                        <Lock className="w-7 h-7 text-[#2c2e2a]" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-[#2c2e2a] tracking-tight">
                            Sign In to Apply
                        </h2>
                        <p className="text-xs text-[#80827f] leading-relaxed">
                            You must be signed in with your GDG Member account to submit an application.
                        </p>
                    </div>

                    <button
                        onClick={googleSignIn}
                        className="w-full inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-[50px] bg-[#2c2e2a] hover:bg-[#1a1a1a] text-white text-xs font-semibold shadow-md transition active:scale-95 cursor-pointer"
                    >
                        <span>Sign in with Google</span>
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen py-16 px-4 sm:px-6 relative z-10 flex flex-col items-center justify-center bg-[#f5f1e4]">
            {/* Header displaying dynamic settings */}
            <div className="w-full max-w-2xl text-center mb-8 space-y-2">
                <h1 className="text-4xl font-extrabold text-[#2c2e2a] tracking-tight">{driveSettings.title}</h1>
                <p className="text-sm text-[#80827f] max-w-xl mx-auto">{driveSettings.description}</p>
                {driveSettings.deadline && (
                    <p className="text-xs font-mono font-bold text-[#EA4335] mt-2">
                        Deadline: {new Date(driveSettings.deadline).toLocaleDateString()}
                    </p>
                )}
            </div>

            <div className="w-full max-w-2xl bg-[#ffffff] border border-[#d5d5d4] rounded-3xl p-6 sm:p-10 shadow-xs relative overflow-hidden transition-colors">
                {submitted ? (
                    <div className="text-center py-12 space-y-6">
                        <div className="w-20 h-20 rounded-full bg-[#34A853]/10 border border-[#34A853]/30 flex items-center justify-center mx-auto text-[#34A853]">
                            <CheckCircleIcon className="w-10 h-10" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-[#2c2e2a] tracking-tight">Application Dispatched!</h2>
                        <p className="text-sm text-[#80827f] max-w-md mx-auto leading-relaxed">
                            Thank you for applying. We have received your submission and our organizing panel will reach out regarding next steps.
                        </p>
                        <button
                            onClick={() => window.location.href = "/"}
                            className="px-8 py-3 bg-[#2c2e2a] hover:bg-[#1a1a1a] text-white text-xs font-semibold rounded-[50px] transition shadow-xs cursor-pointer"
                        >
                            Return to Homepage
                        </button>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Applicant Information Form */}
                        <div className="bg-[#f5f1e4] border border-[#d5d5d4] rounded-2xl p-6 space-y-4">
                            <div className="flex items-center gap-3 pb-3 border-b border-[#d5d5d4]">
                                <img
                                    src={(applicantProfile.photoURL || "").trim() || user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`}
                                    alt="Avatar"
                                    className="w-12 h-12 rounded-full object-cover border border-[#d5d5d4] bg-white shrink-0"
                                    onError={(e) => {
                                        e.currentTarget.src = user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`;
                                    }}
                                />
                                <div className="min-w-0">
                                    <h3 className="text-sm font-bold text-[#2c2e2a] leading-tight">Candidate Profile</h3>
                                    <p className="text-[11px] text-[#80827f]">Please verify your contact, academic, and profile details.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[11px] font-mono uppercase text-[#80827f] font-semibold block mb-1">
                                        Full Name <span className="text-[#EA4335]">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={applicantProfile.name}
                                        onChange={(e) => {
                                            setApplicantProfile({ ...applicantProfile, name: e.target.value });
                                            if (errors.name) setErrors({ ...errors, name: "" });
                                        }}
                                        placeholder="Your full name"
                                        className="w-full px-4 py-2.5 rounded-[50px] bg-white border border-[#d5d5d4] text-xs font-semibold text-[#2c2e2a] focus:outline-none focus:border-[#2ba0ff]"
                                    />
                                    {errors.name && <p className="text-[10px] text-[#EA4335] mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="text-[11px] font-mono uppercase text-[#80827f] font-semibold block mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={user.email || ""}
                                        disabled
                                        className="w-full px-4 py-2.5 rounded-[50px] bg-white/70 border border-[#d5d5d4] text-xs font-semibold text-[#80827f] cursor-not-allowed"
                                    />
                                </div>

                                <div>
                                    <label className="text-[11px] font-mono uppercase text-[#80827f] font-semibold block mb-1">
                                        Phone Number / WhatsApp <span className="text-[#EA4335]">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={applicantProfile.phone}
                                        onChange={(e) => {
                                            setApplicantProfile({ ...applicantProfile, phone: e.target.value });
                                            if (errors.phone) setErrors({ ...errors, phone: "" });
                                        }}
                                        placeholder="+91 XXXXX XXXXX"
                                        className="w-full px-4 py-2.5 rounded-[50px] bg-white border border-[#d5d5d4] text-xs font-semibold text-[#2c2e2a] focus:outline-none focus:border-[#2ba0ff]"
                                    />
                                    {errors.phone && <p className="text-[10px] text-[#EA4335] mt-1">{errors.phone}</p>}
                                </div>

                                <div>
                                    <label className="text-[11px] font-mono uppercase text-[#80827f] font-semibold block mb-1">
                                        Department / Branch <span className="text-[#EA4335]">*</span>
                                    </label>
                                    <select
                                        value={applicantProfile.department}
                                        onChange={(e) => setApplicantProfile({ ...applicantProfile, department: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-[50px] bg-white border border-[#d5d5d4] text-xs font-semibold text-[#2c2e2a] focus:outline-none focus:border-[#2ba0ff] cursor-pointer"
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
                                </div>

                                <div>
                                    <label className="text-[11px] font-mono uppercase text-[#80827f] font-semibold block mb-1">
                                        Current Semester <span className="text-[#EA4335]">*</span>
                                    </label>
                                    <select
                                        value={applicantProfile.semester}
                                        onChange={(e) => setApplicantProfile({ ...applicantProfile, semester: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-[50px] bg-white border border-[#d5d5d4] text-xs font-semibold text-[#2c2e2a] focus:outline-none focus:border-[#2ba0ff] cursor-pointer"
                                    >
                                        {["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"].map((sem) => (
                                            <option key={sem} value={sem}>{sem}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[11px] font-mono uppercase text-[#80827f] font-semibold block mb-1">
                                        College
                                    </label>
                                    <input
                                        type="text"
                                        value={applicantProfile.college}
                                        disabled
                                        className="w-full px-4 py-2.5 rounded-[50px] bg-white/70 border border-[#d5d5d4] text-xs font-semibold text-[#80827f] cursor-not-allowed"
                                    />
                                </div>

                                <div className="sm:col-span-2 pt-1">
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
                            <div className="space-y-4 pt-4">
                                <h3 className="text-lg font-bold text-[#2c2e2a]">Application Details</h3>
                                <CustomFormRenderer 
                                    fields={driveSettings.fields}
                                    values={formValues}
                                    onChange={setFormValues}
                                    errors={errors}
                                />
                            </div>
                        ) : (
                            <div className="py-4 text-center text-sm text-[#80827f]">
                                No additional questions required. Click submit below.
                            </div>
                        )}

                        {errors.submit && <p className="text-xs text-[#EA4335] text-center">{errors.submit}</p>}

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-end pt-6 border-t border-[#f5f1e4]">
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="px-8 py-3 rounded-[50px] bg-[#2c2e2a] hover:bg-[#1a1a1a] text-white text-xs font-semibold shadow-xs transition disabled:opacity-50 cursor-pointer flex items-center gap-2"
                            >
                                {submitting ? "Submitting..." : "Submit Application"}
                                <ArrowRightIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
