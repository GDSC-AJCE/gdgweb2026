"use client";

import React, { useState, useEffect } from "react";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import {
    doc,
    getDoc,
    setDoc,
    query,
    collection,
    where,
    getDocs,
} from "firebase/firestore";
import {
    XMarkIcon,
    UserCircleIcon,
    LinkIcon,
    PlusIcon,
    TrashIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    GlobeAltIcon,
    AtSymbolIcon,
    PencilSquareIcon,
    PaintBrushIcon,
    SparklesIcon,
    IdentificationIcon,
} from "@heroicons/react/24/outline";
import { FaGithub, FaLinkedin, FaInstagram, FaTwitter, FaYoutube, FaGlobe } from "react-icons/fa";
import { ensureAbsoluteUrl } from "@/lib/utils";
import CreativeProfileAvatar from "@/components/ui/CreativeProfileAvatar";

interface SocialLink {
    platform: string;
    url: string;
}

interface CustomLink {
    label: string;
    url: string;
}

export interface CoreProfileData {
    uid: string;
    username: string;
    displayName: string;
    bio: string;
    avatarUrl: string;
    socialLinks: SocialLink[];
    customLinks: CustomLink[];
    batchYears: string[];
    cardBgColor?: string;
    cardFgColor?: string;
    skills?: string;
    nowSection?: string;
    bgPattern?: string;
    bannerUrl?: string;
    motto?: string;
    featuredProjects?: { title: string; url: string; imageUrl?: string }[];
    themePreset?: string;
    widgets?: { type: string; data: any }[];
    createdAt?: any;
    updatedAt?: any;
}

interface CoreProfileModalProps {
    uid: string;
    displayName: string;
    photoURL?: string;
    onClose: () => void;
}

type TabType = "basics" | "theme" | "links" | "more";

const SOCIAL_PLATFORMS = [
    { id: "github", label: "GitHub", icon: FaGithub, placeholder: "https://github.com/yourhandle" },
    { id: "linkedin", label: "LinkedIn", icon: FaLinkedin, placeholder: "https://linkedin.com/in/yourhandle" },
    { id: "instagram", label: "Instagram", icon: FaInstagram, placeholder: "https://instagram.com/yourhandle" },
    { id: "twitter", label: "Twitter / X", icon: FaTwitter, placeholder: "https://twitter.com/yourhandle" },
    { id: "youtube", label: "YouTube", icon: FaYoutube, placeholder: "https://youtube.com/@yourchannel" },
    { id: "website", label: "Portfolio / Website", icon: FaGlobe, placeholder: "https://yourwebsite.com" },
];

const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;

const THEME_PRESETS = [
    { id: "google-blue", label: "Google Blue", bg: "#4285F4", fg: "#ffffff", pattern: "grid" },
    { id: "google-green", label: "Google Green", bg: "#34A853", fg: "#ffffff", pattern: "dots" },
    { id: "google-yellow", label: "Google Amber", bg: "#FBBC04", fg: "#18191b", pattern: "mesh" },
    { id: "google-red", label: "Google Red", bg: "#EA4335", fg: "#ffffff", pattern: "grid" },
    { id: "slate-minimal", label: "Deep Slate", bg: "#1f2023", fg: "#e3e3e3", pattern: "dots" },
];

export default function CoreProfileModal({
    uid,
    displayName,
    photoURL,
    onClose,
}: CoreProfileModalProps) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>("basics");

    const [username, setUsername] = useState("");
    const [usernameError, setUsernameError] = useState("");
    const [checkingUsername, setCheckingUsername] = useState(false);
    const [bio, setBio] = useState("");
    const [avatarUrl, setAvatarUrl] = useState(photoURL || "");
    const [cardBgColor, setCardBgColor] = useState("#4285F4");
    const [cardFgColor, setCardFgColor] = useState("#ffffff");
    const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
        { platform: "github", url: "" },
    ]);
    const [customLinks, setCustomLinks] = useState<CustomLink[]>([]);
    const [skills, setSkills] = useState("");
    const [nowSection, setNowSection] = useState("");
    const [bgPattern, setBgPattern] = useState("grid");
    const [bannerUrl, setBannerUrl] = useState("");
    const [motto, setMotto] = useState("");
    const [featuredProjects, setFeaturedProjects] = useState<{ title: string; url: string; imageUrl?: string }[]>([]);
    const [themePreset, setThemePreset] = useState("google-blue");
    const [batchYears, setBatchYears] = useState<string[]>([]);

    useEffect(() => {
        const load = async () => {
            try {
                const snap = await getDoc(doc(db, "coreProfiles", uid));
                if (snap.exists()) {
                    const d = snap.data() as CoreProfileData;
                    setUsername(d.username || "");
                    setBio(d.bio || "");
                    setAvatarUrl(d.avatarUrl || photoURL || "");
                    setCardBgColor(d.cardBgColor || "#4285F4");
                    setCardFgColor(d.cardFgColor || "#ffffff");
                    setSocialLinks(d.socialLinks?.length ? d.socialLinks : [{ platform: "github", url: "" }]);
                    setCustomLinks(d.customLinks || []);
                    setBatchYears(d.batchYears || []);
                    setSkills(d.skills || "");
                    setNowSection(d.nowSection || "");
                    setBgPattern(d.bgPattern || "grid");
                    setBannerUrl(d.bannerUrl || "");
                    setMotto(d.motto || "");
                    setFeaturedProjects(d.featuredProjects || []);
                    setThemePreset(d.themePreset || "google-blue");
                }
            } catch (e) {
                console.error("Error loading core profile:", e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [uid, photoURL]);

    const validateUsername = async (value: string) => {
        setUsernameError("");
        if (!value) { setUsernameError("Username is required."); return false; }
        if (!USERNAME_REGEX.test(value)) {
            setUsernameError("3–20 chars: lowercase letters, numbers, underscores only.");
            return false;
        }
        setCheckingUsername(true);
        try {
            const q = query(collection(db, "coreProfiles"), where("username", "==", value));
            const snap = await getDocs(q);
            const taken = snap.docs.some(d => d.id !== uid);
            if (taken) { setUsernameError("That username is already taken."); return false; }
        } catch {
            // Ignore offline errors during pre-check
        } finally {
            setCheckingUsername(false);
        }
        return true;
    };

    const addSocial = () => setSocialLinks(prev => [...prev, { platform: "github", url: "" }]);
    const removeSocial = (i: number) => setSocialLinks(prev => prev.filter((_, idx) => idx !== i));
    const updateSocial = (i: number, field: "platform" | "url", val: string) =>
        setSocialLinks(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s));

    const addCustomLink = () => setCustomLinks(prev => [...prev, { label: "", url: "" }]);
    const removeCustomLink = (i: number) => setCustomLinks(prev => prev.filter((_, idx) => idx !== i));
    const updateCustomLink = (i: number, field: "label" | "url", val: string) =>
        setCustomLinks(prev => prev.map((l, idx) => idx === i ? { ...l, [field]: val } : l));

    const handleSave = async () => {
        setSaveMsg(null);
        const usernameOk = await validateUsername(username);
        if (!usernameOk) {
            setActiveTab("basics");
            return;
        }

        setSaving(true);
        try {
            const now = new Date();
            const snap = await getDoc(doc(db, "coreProfiles", uid));
            const existingBatchYears = snap.exists() ? snap.data().batchYears || [] : [];

            const profileData: CoreProfileData = {
                uid,
                username: username.toLowerCase().trim(),
                displayName,
                bio: bio.trim(),
                avatarUrl: avatarUrl.trim(),
                cardBgColor: cardBgColor || "#4285F4",
                cardFgColor: cardFgColor || "#ffffff",
                socialLinks: socialLinks
                    .filter(s => s.url.trim())
                    .map(s => ({ ...s, url: ensureAbsoluteUrl(s.url) })),
                customLinks: customLinks
                    .filter(l => l.url.trim() && l.label.trim())
                    .map(l => ({ ...l, url: ensureAbsoluteUrl(l.url) })),
                batchYears: existingBatchYears,
                skills: skills.trim(),
                nowSection: nowSection.trim(),
                bgPattern: bgPattern,
                bannerUrl: bannerUrl.trim(),
                motto: motto.trim(),
                featuredProjects: featuredProjects.filter(p => p.title.trim() && p.url.trim()),
                themePreset: themePreset,
                updatedAt: now,
            };

            if (!snap.exists()) profileData.createdAt = now;

            await setDoc(doc(db, "coreProfiles", uid), profileData, { merge: true });
            setSaveMsg({ ok: true, text: "Profile updated successfully!" });
        } catch (e: any) {
            setSaveMsg({ ok: false, text: e.message || "Failed to save profile." });
        } finally {
            setSaving(false);
            setTimeout(() => setSaveMsg(null), 3000);
        }
    };

    useBodyScrollLock();

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6 font-sans">
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-5xl h-[85vh] sm:h-[750px] flex flex-col bg-[#ffffff] border border-[#d5d5d4] rounded-3xl shadow-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#f5f1e4] bg-[#ffffff] flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#f5f1e4] border border-[#d5d5d4] flex items-center justify-center">
                            <PencilSquareIcon className="w-5 h-5 text-[#2c2e2a]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-[#2c2e2a] tracking-tight">Core Profile Settings</h2>
                            <p className="text-xs text-[#80827f]">Configure your public showcase on GDG</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg text-[#80827f] hover:text-[#2c2e2a] hover:bg-[#f5f1e4] transition">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-[#4285F4] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                        {/* Nav Tabs */}
                        <div className="w-full md:w-56 border-b md:border-b-0 md:border-r border-[#f5f1e4] bg-[#ffffff] p-4 flex flex-row md:flex-col gap-1.5 flex-shrink-0">
                            {[
                                { id: "basics", label: "Identity & Bio", icon: IdentificationIcon },
                                { id: "theme", label: "Theme & Palette", icon: PaintBrushIcon },
                                { id: "links", label: "Social & Links", icon: LinkIcon },
                                { id: "more", label: "Skills & Projects", icon: SparklesIcon },
                            ].map(tab => {
                                const Icon = tab.icon;
                                const active = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as TabType)}
                                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all w-full text-left ${active ? "bg-[#f5f1e4] text-[#2c2e2a] border border-[#d5d5d4]" : "text-[#80827f] hover:text-[#2c2e2a] hover:bg-[#f5f1e4] border border-transparent"}`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
                            {activeTab === "basics" && (
                                <div className="space-y-6 max-w-xl">
                                    <div>
                                        <label className="text-xs font-bold text-[#80827f] uppercase tracking-wider block mb-1.5">
                                            Username / Handle *
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#80827f]">
                                                <AtSymbolIcon className="w-4 h-4" />
                                            </div>
                                            <input
                                                type="text"
                                                value={username}
                                                onChange={e => {
                                                    setUsername(e.target.value.toLowerCase());
                                                    setUsernameError("");
                                                }}
                                                onBlur={() => username && validateUsername(username)}
                                                placeholder="yourhandle"
                                                className="w-full bg-[#f5f1e4] border border-[#d5d5d4] rounded-2xl pl-10 pr-4 py-2.5 text-[#2c2e2a] text-sm focus:border-[#4285F4] focus:bg-[#ffffff] outline-none font-mono transition-colors"
                                            />
                                        </div>
                                        {usernameError && <p className="text-xs text-[#EA4335] mt-1.5">{usernameError}</p>}
                                        {username && !usernameError && (
                                            <p className="text-xs text-[#80827f] mt-1.5">
                                                Public URL: <span className="text-[#4285F4]">/team/{username}</span>
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-[#80827f] uppercase tracking-wider block mb-1.5">
                                            Avatar URL
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 border border-[#d5d5d4]">
                                                <CreativeProfileAvatar
                                                    src={avatarUrl}
                                                    name={displayName}
                                                    size="custom"
                                                    showBorder={false}
                                                    className="w-12 h-12 rounded-xl"
                                                />
                                            </div>
                                            <input
                                                type="url"
                                                value={avatarUrl}
                                                onChange={e => setAvatarUrl(e.target.value)}
                                                placeholder="https://..."
                                                className="flex-1 bg-[#f5f1e4] border border-[#d5d5d4] rounded-2xl px-4 py-2.5 text-[#2c2e2a] text-sm focus:border-[#4285F4] focus:bg-[#ffffff] outline-none font-mono transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-[#80827f] uppercase tracking-wider block mb-1.5">
                                            Motto or Tagline
                                        </label>
                                        <input
                                            type="text"
                                            value={motto}
                                            onChange={e => setMotto(e.target.value)}
                                            placeholder="e.g. Building scalable cloud apps and mentoring engineers."
                                            className="w-full bg-[#f5f1e4] border border-[#d5d5d4] rounded-2xl px-4 py-2.5 text-[#2c2e2a] text-sm focus:border-[#4285F4] focus:bg-[#ffffff] outline-none transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-[#80827f] uppercase tracking-wider block mb-1.5">
                                            Bio (Markdown)
                                        </label>
                                        <div data-color-mode="light">
                                            <MDEditor
                                                value={bio}
                                                onChange={val => setBio(val || "")}
                                                preview="edit"
                                                height={200}
                                                visibleDragbar={false}
                                                style={{ backgroundColor: "transparent", border: "1px solid #d5d5d4", borderRadius: "16px" }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "theme" && (
                                <div className="space-y-6 max-w-xl">
                                    <label className="text-xs font-bold text-[#80827f] uppercase tracking-wider block">
                                        Color Presets
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {THEME_PRESETS.map(preset => (
                                            <button
                                                key={preset.id}
                                                onClick={() => {
                                                    setThemePreset(preset.id);
                                                    setCardBgColor(preset.bg);
                                                    setCardFgColor(preset.fg);
                                                    setBgPattern(preset.pattern);
                                                }}
                                                className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${themePreset === preset.id ? "bg-[#ffffff] border-[#4285F4] shadow-sm" : "bg-[#f5f1e4] border-[#d5d5d4] hover:bg-[#e0dbce]"}`}
                                            >
                                                <div className="w-5 h-5 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: preset.bg }} />
                                                <span className="text-xs font-semibold text-[#2c2e2a] truncate">{preset.label}</span>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div>
                                            <label className="text-xs font-bold text-[#80827f] uppercase tracking-wider block mb-1.5">Card Background</label>
                                            <div className="flex items-center gap-2">
                                                <input type="color" value={cardBgColor} onChange={e => setCardBgColor(e.target.value)} className="w-9 h-9 rounded-xl bg-transparent border border-[#d5d5d4] cursor-pointer" />
                                                <input type="text" value={cardBgColor} onChange={e => setCardBgColor(e.target.value)} className="w-full bg-[#f5f1e4] border border-[#d5d5d4] rounded-2xl px-3 py-1.5 text-xs text-[#2c2e2a] font-mono transition-colors focus:border-[#4285F4] focus:bg-[#ffffff] outline-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-[#80827f] uppercase tracking-wider block mb-1.5">Card Foreground</label>
                                            <div className="flex items-center gap-2">
                                                <input type="color" value={cardFgColor} onChange={e => setCardFgColor(e.target.value)} className="w-9 h-9 rounded-xl bg-transparent border border-[#d5d5d4] cursor-pointer" />
                                                <input type="text" value={cardFgColor} onChange={e => setCardFgColor(e.target.value)} className="w-full bg-[#f5f1e4] border border-[#d5d5d4] rounded-2xl px-3 py-1.5 text-xs text-[#2c2e2a] font-mono transition-colors focus:border-[#4285F4] focus:bg-[#ffffff] outline-none" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "links" && (
                                <div className="space-y-6 max-w-xl">
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <label className="text-xs font-bold text-[#80827f] uppercase tracking-wider">Social Links</label>
                                            <button onClick={addSocial} className="text-xs text-[#4285F4] hover:underline flex items-center gap-1 font-medium">
                                                <PlusIcon className="w-3.5 h-3.5" /> Add Link
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            {socialLinks.map((s, idx) => (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <select
                                                        value={s.platform}
                                                        onChange={e => updateSocial(idx, "platform", e.target.value)}
                                                        className="bg-[#ffffff] border border-[#d5d5d4] rounded-2xl px-3 py-2 text-xs text-[#2c2e2a] outline-none transition-colors"
                                                    >
                                                        {SOCIAL_PLATFORMS.map(p => (
                                                            <option key={p.id} value={p.id}>{p.label}</option>
                                                        ))}
                                                    </select>
                                                    <input
                                                        type="url"
                                                        value={s.url}
                                                        onChange={e => updateSocial(idx, "url", e.target.value)}
                                                        placeholder="URL..."
                                                        className="flex-1 bg-[#f5f1e4] border border-[#d5d5d4] rounded-2xl px-3 py-2 text-xs text-[#2c2e2a] font-mono outline-none focus:border-[#4285F4] focus:bg-[#ffffff] transition-colors"
                                                    />
                                                    <button onClick={() => removeSocial(idx)} className="p-2 text-[#80827f] hover:text-[#EA4335] transition-colors">
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-[#f5f1e4]">
                                        <div className="flex items-center justify-between mb-3">
                                            <label className="text-xs font-bold text-[#80827f] uppercase tracking-wider">Custom Links</label>
                                            <button onClick={addCustomLink} className="text-xs text-[#4285F4] hover:underline flex items-center gap-1 font-medium">
                                                <PlusIcon className="w-3.5 h-3.5" /> Add Link
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            {customLinks.map((l, idx) => (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={l.label}
                                                        onChange={e => updateCustomLink(idx, "label", e.target.value)}
                                                        placeholder="Label"
                                                        className="w-36 bg-[#f5f1e4] border border-[#d5d5d4] rounded-2xl px-3 py-2 text-xs text-[#2c2e2a] outline-none focus:border-[#4285F4] focus:bg-[#ffffff] transition-colors"
                                                    />
                                                    <input
                                                        type="url"
                                                        value={l.url}
                                                        onChange={e => updateCustomLink(idx, "url", e.target.value)}
                                                        placeholder="https://..."
                                                        className="flex-1 bg-[#f5f1e4] border border-[#d5d5d4] rounded-2xl px-3 py-2 text-xs text-[#2c2e2a] font-mono outline-none focus:border-[#4285F4] focus:bg-[#ffffff] transition-colors"
                                                    />
                                                    <button onClick={() => removeCustomLink(idx)} className="p-2 text-[#80827f] hover:text-[#EA4335] transition-colors">
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "more" && (
                                <div className="space-y-6 max-w-xl">
                                    <div>
                                        <label className="text-xs font-bold text-[#80827f] uppercase tracking-wider block mb-1.5">
                                            Skills / Focus Areas (Comma-separated)
                                        </label>
                                        <input
                                            type="text"
                                            value={skills}
                                            onChange={e => setSkills(e.target.value)}
                                            placeholder="e.g. Flutter, Android Jetpack, Gemini API, Cloud Run, Firebase"
                                            className="w-full bg-[#f5f1e4] border border-[#d5d5d4] rounded-2xl px-4 py-2.5 text-[#2c2e2a] text-sm focus:border-[#4285F4] focus:bg-[#ffffff] outline-none transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-[#80827f] uppercase tracking-wider block mb-1.5">
                                            What I'm Working On ("Now" Section)
                                        </label>
                                        <textarea
                                            value={nowSection}
                                            onChange={e => setNowSection(e.target.value)}
                                            rows={3}
                                            placeholder="Exploring LLM agents and preparing the next GDG workshop..."
                                            className="w-full bg-[#f5f1e4] border border-[#d5d5d4] rounded-2xl p-3 text-[#2c2e2a] text-xs focus:border-[#4285F4] focus:bg-[#ffffff] outline-none resize-none transition-colors"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="p-4 border-t border-[#f5f1e4] bg-[#ffffff] flex items-center justify-between flex-shrink-0">
                    <div>
                        {saveMsg && (
                            <p className={`text-xs font-semibold ${saveMsg.ok ? "text-[#34A853]" : "text-[#EA4335]"}`}>
                                {saveMsg.text}
                            </p>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-[#80827f] hover:text-[#2c2e2a] hover:bg-[#f5f1e4] rounded-full transition-colors">
                            Close
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-6 py-2 rounded-full bg-[#2c2e2a] hover:bg-[#1a1a1a] text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                        >
                            {saving ? "Saving..." : "Save Profile"}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
