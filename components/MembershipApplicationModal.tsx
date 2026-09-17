"use client";

import { useState } from "react";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon, CheckCircleIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

interface MembershipApplicationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginRequired: () => void;
}

const teams = [
    {
        id: "ai_ml",
        name: "AI & Machine Learning",
        description: "Gemini API, TensorFlow, Vertex AI, agents, and computer vision projects",
        icon: "✨"
    },
    {
        id: "cloud",
        name: "Cloud & DevOps",
        description: "Google Cloud Platform, Docker, Kubernetes, CI/CD, and serverless architectures",
        icon: "☁️"
    },
    {
        id: "mobile_web",
        name: "Mobile & Web",
        description: "Flutter, Android (Jetpack Compose), Next.js, React, and modern UI engineering",
        icon: "📱"
    },
    {
        id: "design",
        name: "UI/UX & Branding",
        description: "Design systems, visual storytelling, prototypes, and community media assets",
        icon: "🎨"
    },
    {
        id: "community",
        name: "Operations & Outreach",
        description: "Event organizing, speaker relations, hackathons, and developer engagement",
        icon: "🚀"
    }
];

export default function MembershipApplicationModal({
    isOpen,
    onClose,
    onLoginRequired
}: MembershipApplicationModalProps) {
    const { user, userData } = useAuth();

    const [selectedTeam, setSelectedTeam] = useState<string>("");
    const [whyJoin, setWhyJoin] = useState("");
    const [skills, setSkills] = useState("");
    const [experience, setExperience] = useState("");
    const [availability, setAvailability] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            onLoginRequired();
            return;
        }

        if (!selectedTeam) {
            setError("Please select a domain or team track");
            return;
        }

        if (!whyJoin.trim()) {
            setError("Please share your motivation for joining GDG");
            return;
        }

        setSubmitting(true);
        setError("");

        try {
            await addDoc(collection(db, "membershipApplications"), {
                userId: user.uid,
                name: user.displayName || userData?.displayName || "Anonymous",
                email: user.email,
                photoURL: user.photoURL || null,
                department: userData?.department || "",
                college: userData?.college || "",
                graduationYear: userData?.graduationYear || "",
                phoneNumber: userData?.phoneNumber || "",
                team: selectedTeam,
                teamName: teams.find(t => t.id === selectedTeam)?.name || selectedTeam,
                whyJoin: whyJoin.trim(),
                skills: skills.trim(),
                experience: experience.trim(),
                availability: availability.trim(),
                status: "pending",
                submittedAt: Timestamp.now(),
                reviewedAt: null,
                reviewedBy: null,
                reviewNote: null
            });

            setSuccess(true);
        } catch (err) {
            console.error("Error submitting application:", err);
            setError("Failed to submit application. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!submitting) {
            setSelectedTeam("");
            setWhyJoin("");
            setSkills("");
            setExperience("");
            setAvailability("");
            setError("");
            setSuccess(false);
            onClose();
        }
    };

    useBodyScrollLock(isOpen);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleClose}
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-2xl bg-[#131314] border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#18191b]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#4285F4]/10 border border-[#4285F4]/30 flex items-center justify-center">
                            <UserGroupIcon className="w-5 h-5 text-[#4285F4]" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Apply for GDG Membership</h3>
                            <p className="text-xs text-gray-400">Join the Google Developer Groups Community</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={submitting}
                        className="text-gray-400 hover:text-white transition disabled:opacity-50"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {success ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-12"
                        >
                            <div className="w-16 h-16 rounded-full bg-[#34A853]/10 border border-[#34A853]/30 flex items-center justify-center mx-auto mb-4">
                                <CheckCircleIcon className="w-8 h-8 text-[#34A853]" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Application Submitted!</h3>
                            <p className="text-gray-400 mb-6 max-w-sm mx-auto text-sm">
                                Thank you for applying to join GDG! Our leads will review your application and follow up via email.
                            </p>
                            <button
                                onClick={handleClose}
                                className="px-6 py-2.5 bg-[#4285F4] hover:bg-[#3367D6] text-white font-semibold text-sm rounded-full transition"
                            >
                                Done
                            </button>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Track Selection */}
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                                    Select Your Track / Domain *
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {teams.map((team) => (
                                        <button
                                            key={team.id}
                                            type="button"
                                            onClick={() => setSelectedTeam(team.id)}
                                            className={`p-3.5 rounded-2xl border text-left transition-all ${selectedTeam === team.id
                                                ? "bg-[#4285F4]/10 border-[#4285F4] shadow-md shadow-[#4285F4]/5"
                                                : "bg-white/[0.02] border-white/10 hover:border-white/20"
                                                }`}
                                        >
                                            <div className="flex items-center gap-2.5 mb-1">
                                                <span className="text-lg">{team.icon}</span>
                                                <span className={`font-semibold text-sm ${selectedTeam === team.id ? "text-[#4285F4]" : "text-white"
                                                    }`}>
                                                    {team.name}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-400 pl-7 line-clamp-2">{team.description}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Why Join */}
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                    Why do you want to join GDG? *
                                </label>
                                <textarea
                                    value={whyJoin}
                                    onChange={(e) => setWhyJoin(e.target.value)}
                                    placeholder="Tell us about your enthusiasm for Google technologies and community growth..."
                                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-3.5 text-white focus:border-[#4285F4] outline-none transition placeholder-gray-500 h-24 resize-none text-sm"
                                    required
                                />
                            </div>

                            {/* Skills */}
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                    Relevant Skills & Technologies
                                </label>
                                <textarea
                                    value={skills}
                                    onChange={(e) => setSkills(e.target.value)}
                                    placeholder="e.g. Flutter, Android, Python, Firebase, Figma, Cloud Run..."
                                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-3.5 text-white focus:border-[#4285F4] outline-none transition placeholder-gray-500 h-20 resize-none text-sm"
                                />
                            </div>

                            {/* Experience */}
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                    Prior Experience / Projects
                                </label>
                                <textarea
                                    value={experience}
                                    onChange={(e) => setExperience(e.target.value)}
                                    placeholder="GitHub repositories, portfolio links, or previous club activities..."
                                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-3.5 text-white focus:border-[#4285F4] outline-none transition placeholder-gray-500 h-20 resize-none text-sm"
                                />
                            </div>

                            {/* Availability */}
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                    Estimated Weekly Commitment
                                </label>
                                <input
                                    type="text"
                                    value={availability}
                                    onChange={(e) => setAvailability(e.target.value)}
                                    placeholder="e.g., 5-8 hours per week"
                                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-[#4285F4] outline-none transition placeholder-gray-500 text-sm"
                                />
                            </div>

                            {error && (
                                <p className="text-xs text-[#EA4335]">{error}</p>
                            )}

                            {/* Actions */}
                            <div className="pt-2 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    disabled={submitting}
                                    className="px-5 py-2.5 rounded-full text-xs font-semibold text-gray-400 hover:text-white transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-6 py-2.5 bg-[#4285F4] hover:bg-[#3367D6] text-white font-semibold text-xs rounded-full transition shadow-md disabled:opacity-50"
                                >
                                    {submitting ? "Submitting..." : "Submit Application"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
