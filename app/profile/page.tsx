"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import LoadingSpinner, { useFullPageLoader } from "@/components/LoadingSpinner";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { motion } from "framer-motion";
import { 
    ArrowRightIcon, 
    ArrowLeftOnRectangleIcon, 
    BriefcaseIcon, 
    DocumentTextIcon, 
    SparklesIcon, 
    LinkIcon,
    UserIcon,
    CheckCircleIcon,
} from "@heroicons/react/24/outline";
import CoreProfileModal from "@/components/CoreProfileModal";
import { normalizeUrl, toTitleCase } from "@/lib/utils";
import CreativeProfileAvatar from "@/components/ui/CreativeProfileAvatar";

export default function ProfilePage() {
    const { user, userData, logOut } = useAuth();
    const router = useRouter();

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [college, setCollege] = useState("");
    const [dept, setDept] = useState("");
    const [gradYear, setGradYear] = useState("");
    const [github, setGithub] = useState("");
    const [linkedin, setLinkedin] = useState("");
    const [portfolio, setPortfolio] = useState("");

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: "success" | "error" } | null>(null);

    const [showCoreProfileModal, setShowCoreProfileModal] = useState(false);
    const [coreUsername, setCoreUsername] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;
        setName(user.displayName || "");

        if (userData) {
            setPhone(userData.phoneNumber || user.phoneNumber || "");
            setCollege(userData.college || "");
            setDept(userData.department || "");
            setGradYear(userData.graduationYear || "");
            if (userData.socialLinks) {
                setGithub(userData.socialLinks.github || "");
                setLinkedin(userData.socialLinks.linkedin || "");
                setPortfolio(userData.socialLinks.portfolio || "");
            }
        }

        if (['core', 'ex-core', 'core-manage'].includes(userData?.role) || userData?.isAdmin) {
            getDoc(doc(db, "coreProfiles", user.uid)).then(snap => {
                if (snap.exists()) setCoreUsername(snap.data().username || null);
            }).catch(() => {});
        }
    }, [user, userData]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setSaving(true);
        setMessage(null);

        try {
            const titleCaseName = toTitleCase(name);
            if (titleCaseName !== user.displayName) {
                await updateProfile(user, { displayName: titleCaseName });
            }

            await setDoc(
                doc(db, "users", user.uid),
                {
                    uid: user.uid,
                    email: user.email,
                    displayName: titleCaseName,
                    phoneNumber: phone,
                    college: college,
                    department: dept,
                    graduationYear: gradYear,
                    socialLinks: {
                        github: normalizeUrl(github),
                        linkedin: normalizeUrl(linkedin),
                        portfolio: normalizeUrl(portfolio),
                    },
                    updatedAt: new Date(),
                },
                { merge: true }
            );

            setMessage({ text: "Profile updated successfully!", type: "success" });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error("Error updating profile:", error);
            setMessage({ text: "Failed to save profile.", type: "error" });
        } finally {
            setSaving(false);
        }
    };

    if (!user) return <LoadingSpinner text="Loading profile..." />;

    const isCore = ['core', 'ex-core', 'core-manage'].includes(userData?.role) || userData?.isAdmin;
    const canManageEvents = ['core', 'core-manage'].includes(userData?.role) || userData?.isAdmin;

    return (
        <main className="min-h-screen text-[var(--foreground)] relative overflow-hidden pb-32">
            <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Sidebar */}
                    <div className="lg:w-1/3 shrink-0">
                        <div className="p-6 rounded-3xl bg-[#ffffff] border border-[#d5d5d4] text-center space-y-4 shadow-xs transition-colors">
                            <div className="mx-auto flex justify-center">
                                <CreativeProfileAvatar
                                    src={user.photoURL}
                                    name={user.displayName || user.email}
                                    size="xl"
                                    className="border-2 border-[#d5d5d4] shadow-xs"
                                />
                            </div>

                            <div>
                                <h2 className="text-lg font-bold text-[#2c2e2a] tracking-tight">{user.displayName}</h2>
                                <p className="text-xs text-[#80827f] font-mono">{user.email}</p>
                            </div>

                            {isCore && (
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4285F4]/10 border border-[#4285F4]/30 text-[#4285F4] text-[10px] font-mono font-bold uppercase tracking-wider">
                                    <BriefcaseIcon className="w-3.5 h-3.5" /> GDG Core Organizer
                                </div>
                            )}

                            <div className="space-y-2 pt-2 border-t border-[#f5f1e4]">
                                {canManageEvents && (
                                    <button
                                        onClick={() => router.push('/core')}
                                        className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#f5f1e4] hover:bg-[#e0dbce] border border-[#d5d5d4] text-xs font-semibold text-[#2c2e2a] transition-all"
                                    >
                                        <span>Core Operations Deck</span>
                                        <ArrowRightIcon className="w-3.5 h-3.5 text-[#80827f]" />
                                    </button>
                                )}

                                {isCore && (
                                    <button
                                        onClick={() => setShowCoreProfileModal(true)}
                                        className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#f5f1e4] hover:bg-[#e0dbce] border border-[#d5d5d4] text-xs font-semibold text-[#2c2e2a] transition-all"
                                    >
                                        <div className="flex items-center gap-2">
                                            <SparklesIcon className="w-3.5 h-3.5 text-[#FBBC04]" />
                                            <span>Customize Public Card</span>
                                        </div>
                                        <ArrowRightIcon className="w-3.5 h-3.5 text-[#80827f]" />
                                    </button>
                                )}

                                {coreUsername && (
                                    <a
                                        href={`/team/${coreUsername}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full flex items-center justify-between p-3 rounded-2xl bg-blue-50/60 hover:bg-blue-100/60 border border-blue-200 text-xs font-semibold text-[#4285F4] transition-all"
                                    >
                                        <span>View Public Portfolio</span>
                                        <LinkIcon className="w-3.5 h-3.5" />
                                    </a>
                                )}

                                <button
                                    onClick={() => router.push('/profile/certificates')}
                                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#f5f1e4] hover:bg-[#e0dbce] border border-[#d5d5d4] text-xs font-semibold text-[#2c2e2a] transition-all"
                                >
                                    <div className="flex items-center gap-2">
                                        <DocumentTextIcon className="w-3.5 h-3.5 text-[#34A853]" />
                                        <span>Credential Wallet</span>
                                    </div>
                                    <ArrowRightIcon className="w-3.5 h-3.5 text-[#80827f]" />
                                </button>

                                <button
                                    onClick={async () => {
                                        await logOut();
                                        router.push('/');
                                    }}
                                    className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl text-[#EA4335] hover:bg-[#EA4335]/10 text-xs font-semibold transition-all pt-3"
                                >
                                    <ArrowLeftOnRectangleIcon className="w-4 h-4" />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Main Edit Deck */}
                    <div className="flex-1 bg-[#ffffff] border border-[#d5d5d4] rounded-3xl p-6 sm:p-8 shadow-xs transition-colors">
                        <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#f5f1e4]">
                            <div>
                                <h3 className="text-xl font-bold text-[#2c2e2a] tracking-tight">Account Details</h3>
                                <p className="text-xs text-[#80827f]">Keep your attendee credential information current.</p>
                            </div>
                        </div>

                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-[#2c2e2a]">Display Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="w-full bg-[#f5f1e4] border border-[#d5d5d4] rounded-2xl px-4 py-2.5 text-xs text-[#2c2e2a] focus:border-[#4285F4] focus:bg-[#ffffff] outline-none transition-colors"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-[#2c2e2a]">WhatsApp / Phone</label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                        className="w-full bg-[#f5f1e4] border border-[#d5d5d4] rounded-2xl px-4 py-2.5 text-xs text-[#2c2e2a] focus:border-[#4285F4] focus:bg-[#ffffff] outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1.5 sm:col-span-1">
                                    <label className="text-xs font-semibold text-[#2c2e2a]">College / Institution</label>
                                    <input
                                        type="text"
                                        value={college}
                                        onChange={e => setCollege(e.target.value)}
                                        className="w-full bg-[#f5f1e4] border border-[#d5d5d4] rounded-2xl px-4 py-2.5 text-xs text-[#2c2e2a] focus:border-[#4285F4] focus:bg-[#ffffff] outline-none transition-colors"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-[#2c2e2a]">Department</label>
                                    <input
                                        type="text"
                                        value={dept}
                                        onChange={e => setDept(e.target.value)}
                                        className="w-full bg-[#f5f1e4] border border-[#d5d5d4] rounded-2xl px-4 py-2.5 text-xs text-[#2c2e2a] focus:border-[#4285F4] focus:bg-[#ffffff] outline-none transition-colors"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-[#2c2e2a]">Graduation Year</label>
                                    <input
                                        type="text"
                                        value={gradYear}
                                        onChange={e => setGradYear(e.target.value)}
                                        placeholder="2027"
                                        className="w-full bg-[#f5f1e4] border border-[#d5d5d4] rounded-2xl px-4 py-2.5 text-xs text-[#2c2e2a] focus:border-[#4285F4] focus:bg-[#ffffff] outline-none font-mono transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-[#f5f1e4]">
                                <h4 className="text-xs font-mono font-bold text-[#80827f] uppercase tracking-wider">Social Links</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <input
                                        type="url"
                                        placeholder="GitHub URL"
                                        value={github}
                                        onChange={e => setGithub(e.target.value)}
                                        className="w-full bg-[#f5f1e4] border border-[#d5d5d4] rounded-2xl px-4 py-2 text-xs text-[#2c2e2a] outline-none focus:border-[#4285F4] focus:bg-[#ffffff] transition-colors"
                                    />
                                    <input
                                        type="url"
                                        placeholder="LinkedIn URL"
                                        value={linkedin}
                                        onChange={e => setLinkedin(e.target.value)}
                                        className="w-full bg-[#f5f1e4] border border-[#d5d5d4] rounded-2xl px-4 py-2 text-xs text-[#2c2e2a] outline-none focus:border-[#4285F4] focus:bg-[#ffffff] transition-colors"
                                    />
                                    <input
                                        type="url"
                                        placeholder="Portfolio URL"
                                        value={portfolio}
                                        onChange={e => setPortfolio(e.target.value)}
                                        className="w-full bg-[#f5f1e4] border border-[#d5d5d4] rounded-2xl px-4 py-2 text-xs text-[#2c2e2a] outline-none focus:border-[#4285F4] focus:bg-[#ffffff] transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-[#f5f1e4]">
                                <div>
                                    {message && (
                                        <p className={`text-xs font-semibold ${message.type === 'success' ? 'text-[#34A853]' : 'text-[#EA4335]'}`}>
                                            {message.text}
                                        </p>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-2.5 bg-[#2c2e2a] hover:bg-[#1a1a1a] text-white text-xs font-semibold rounded-[50px] transition shadow-xs disabled:opacity-50 cursor-pointer"
                                >
                                    {saving ? "Saving Changes..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>

            {showCoreProfileModal && (
                <CoreProfileModal
                    uid={user.uid}
                    displayName={user.displayName || ""}
                    photoURL={user.photoURL || undefined}
                    onClose={() => setShowCoreProfileModal(false)}
                />
            )}
        </main>
    );
}
