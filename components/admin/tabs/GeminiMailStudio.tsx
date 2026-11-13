"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Send,
  Layout,
  Save,
  Code,
  Copy,
  Check,
  RotateCw,
  Monitor,
  Smartphone,
  Maximize2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  Key,
  Wand2,
  Sliders,
  ExternalLink,
  Loader2,
  Zap,
  Globe,
  Tag,
  Palette,
  Eye,
  Megaphone,
} from "lucide-react";
import { GeneratedEmailResult, GDG_COLORS } from "@/lib/gemini";

interface GeminiMailStudioProps {
  onSaveAsTemplate: (name: string, html: string, design: any) => Promise<void>;
  onApplyToDispatch: (templateId: string, subject: string, html: string) => void;
  onOpenInUnlayer: (design: any, html: string) => void;
  onSendTestEmail: (subject: string, html: string) => void;
  existingTemplates: { id: string; name: string }[];
}

export default function GeminiMailStudio({
  onSaveAsTemplate,
  onApplyToDispatch,
  onOpenInUnlayer,
  onSendTestEmail,
  existingTemplates,
}: GeminiMailStudioProps) {
  // Prompt & Generation Controls
  const [prompt, setPrompt] = useState(
    "Announce our upcoming GDG technical workshop covering modern AI & Cloud tools at AJCE campus next Saturday."
  );
  const [category, setCategory] = useState("Event Announcement");
  const [tone, setTone] = useState("GDG Community Energetic (Friendly, Tech-forward, Welcoming)");
  const [themeColor, setThemeColor] = useState(GDG_COLORS.blue);
  const [templateFormat, setTemplateFormat] = useState<"shortlisted" | "standard">("shortlisted");

  // Accordion details
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [details, setDetails] = useState({
    eventName: "Build with AI: Gemini & Cloud Jam",
    date: "Saturday, November 21, 2026",
    time: "10:00 AM - 1:00 PM IST",
    venue: "Central Computing Facility (CCF), AJCE",
    rsvpLink: "https://gdgajce.vercel.app/events/build-with-ai",
    meetLink: "https://meet.google.com/djf-bgpu-stt",
    whatsappLink: "https://chat.whatsapp.com/Ftflnf70DRrAXIhwWJQ2Bo",
    speaker: "Google Developer Experts & GDG Core Mentors",
    perks: "Hands-on Code, Google Developer Profile Badges, Food & Stickers",
    targetAudience: "All AJCE students across B.Tech, MCA & BCA",
  });

  // API Key & Connection Status
  const [apiKey, setApiKey] = useState("");
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [keyStatus, setKeyStatus] = useState<{
    tested: boolean;
    online: boolean;
    message: string;
    model?: string;
    loading: boolean;
  }>({
    tested: false,
    online: false,
    message: "Checking Gemini connection...",
    loading: true,
  });

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<GeneratedEmailResult | null>(null);
  const [activeResultTab, setActiveResultTab] = useState<"preview" | "subjects" | "html">("preview");
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);

  // Preview device & fullscreen modal
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  // Subject ideas list & generator
  const [subjectIdeas, setSubjectIdeas] = useState<{ text: string; style: string; emoji: string }[]>([]);
  const [generatingSubjects, setGeneratingSubjects] = useState(false);

  // Save template modal
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveTemplateName, setSaveTemplateName] = useState("");
  const [savingTemplate, setSavingTemplate] = useState(false);

  // Presets list
  const presets = [
    {
      label: "🚀 Event Announcement",
      cat: "Event Announcement",
      color: GDG_COLORS.blue,
      prompt: "Announce our upcoming GDG technical workshop covering modern AI & Cloud tools at AJCE campus.",
      details: {
        eventName: "Build with AI: Gemini & Cloud Jam",
        date: "Saturday, November 21, 2026",
        time: "10:00 AM - 1:00 PM IST",
        venue: "Central Computing Facility (CCF), AJCE",
        rsvpLink: "https://gdgajce.vercel.app/events/build-with-ai",
        perks: "Official Google Developer Badges, Food & Stickers",
      },
    },
    {
      label: "📱 Flutter & Mobile Sprint",
      cat: "Hands-on Workshop",
      color: "#0284c7",
      prompt: "Invite students to an intensive 2-hour Flutter hands-on sprint: build a real cross-platform mobile app connected to Firebase.",
      details: {
        eventName: "Flutter Forward: Zero to App Store",
        date: "Wednesday, November 18, 2026",
        time: "4:30 PM - 6:30 PM IST",
        venue: "Lab 3, Department of Computer Applications",
        rsvpLink: "https://gdgajce.vercel.app/workshops/flutter",
        perks: "Live code walkthrough & starter repositories",
      },
    },
    {
      label: "✨ Gemini 3.8 AI Hackathon",
      cat: "Hackathon & Contest",
      color: "#8b5cf6",
      prompt: "Launch team registrations for the 24-hour Gemini AI Innovation Hackathon. Mention high-value prizes, cloud credits, and mentor feedback.",
      details: {
        eventName: "Gemini AI Sprint: Multimodal Builders Hackathon",
        date: "December 5 - 6, 2026",
        time: "Starts 9:00 AM IST",
        venue: "Auditorium & Hybrid Online",
        rsvpLink: "https://gdgajce.vercel.app/hackathons/gemini",
        perks: "Cash prizes, Google Cloud credits & internship referrals",
      },
    },
    {
      label: "🎉 Core Team Shortlist",
      cat: "Core Team Selection",
      color: GDG_COLORS.green,
      prompt: "Congratulate applicant on being shortlisted for the GDG AJCE Core Team! Share their upcoming interview slot and Google Meet invite.",
      details: {
        eventName: "GDG on Campus AJCE Core Team Interviews",
        date: "{{date}}",
        time: "{{time}}",
        venue: "Google Meet",
        rsvpLink: "{{meet_link}}",
        perks: "Leadership roles, Google swag, event hosting privilege",
      },
    },
    {
      label: "💌 Community Appreciation",
      cat: "Application Outcome",
      color: GDG_COLORS.red,
      prompt: "Warm, empathetic email thanking applicant for their interest in GDG Core Team. Acknowledge high volume of applications and enthusiastically welcome them as an active chapter member with exclusive study group invites.",
      details: {
        eventName: "GDG Community Membership Welcome",
        date: "Ongoing 2026-2027 Season",
        venue: "Community Discord & WhatsApp Group",
        rsvpLink: "{{whatsapp_link}}",
        perks: "Access to workshops, hackathons, and study groups",
      },
    },
    {
      label: "⏰ Session Reminder",
      cat: "Event Reminder",
      color: GDG_COLORS.yellow,
      prompt: "Urgent 24-hour reminder email for tomorrow's scheduled session. Highlight confirmed seat, requirements (bring laptop + charger), and venue directions.",
      details: {
        eventName: "Tomorrow's GDG Technical Session",
        date: "Tomorrow",
        time: "10:00 AM sharp",
        venue: "CCF Seminar Hall, AJCE",
        rsvpLink: "https://gdgajce.vercel.app",
        perks: "Doors close 10 mins after start",
      },
    },
  ];

  // 1. Initial Load: Retrieve Saved Key & Test Status
  useEffect(() => {
    const savedKey = typeof window !== "undefined" ? localStorage.getItem("gdg_gemini_api_key") || "" : "";
    if (savedKey) setApiKey(savedKey);
    checkGeminiStatus(savedKey);
  }, []);

  const checkGeminiStatus = async (customKey?: string) => {
    setKeyStatus((prev) => ({ ...prev, loading: true }));
    try {
      const res = await fetch("/api/mail-sender/gemini", {
        headers: customKey ? { "x-gemini-key": customKey } : {},
      });
      const data = await res.json();
      if (data.connection && data.connection.success) {
        setKeyStatus({
          tested: true,
          online: true,
          message: data.connection.message || "Gemini 3.8 Flash is online!",
          model: data.connection.model || "gemini-3.8-flash",
          loading: false,
        });
      } else if (customKey) {
        // Test custom key via POST action
        const postRes = await fetch("/api/mail-sender/gemini", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "test-key", apiKey: customKey }),
        });
        const postData = await postRes.json();
        setKeyStatus({
          tested: true,
          online: postData.success,
          message: postData.message,
          model: postData.model || "gemini-3.8-flash",
          loading: false,
        });
      } else {
        setKeyStatus({
          tested: true,
          online: false,
          message: "No GEMINI_API_KEY detected in .env.local. Click 'Configure Key' to add one.",
          loading: false,
        });
      }
    } catch (err: any) {
      setKeyStatus({
        tested: true,
        online: false,
        message: err.message || "Failed to connect to Gemini API endpoint.",
        loading: false,
      });
    }
  };

  const handleSaveApiKey = () => {
    if (typeof window !== "undefined") {
      if (apiKey.trim()) {
        localStorage.setItem("gdg_gemini_api_key", apiKey.trim());
      } else {
        localStorage.removeItem("gdg_gemini_api_key");
      }
    }
    checkGeminiStatus(apiKey.trim());
    setKeyModalOpen(false);
  };

  // 2. Preset Selection
  const applyPreset = (p: (typeof presets)[0]) => {
    setPrompt(p.prompt);
    setCategory(p.cat);
    setThemeColor(p.color);
    setDetails((prev) => ({ ...prev, ...p.details }));
    setDetailsOpen(true);
  };

  // 3. Generate Email with Gemini
  const handleGenerateEmail = async () => {
    if (!prompt.trim()) {
      alert("Please enter a prompt or topic for the email.");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/mail-sender/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          prompt,
          category,
          tone,
          themeColor,
          details,
          templateFormat,
          apiKey: apiKey.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "Failed to generate email.");
      }

      setGeneratedData(json.data);
      if (json.data.suggestedSubjects && json.data.suggestedSubjects.length > 0) {
        setSubjectIdeas(
          json.data.suggestedSubjects.map((s: string, idx: number) => ({
            text: s,
            style: idx === 0 ? "Curiosity Hook" : idx === 1 ? "Urgent / Action" : "Community Vibe",
            emoji: "✨",
          }))
        );
      }
      setActiveResultTab("preview");
    } catch (err: any) {
      alert("Gemini AI Generation Error: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // 4. Generate More Subject Lines
  const handleGenerateSubjectLines = async () => {
    setGeneratingSubjects(true);
    try {
      const res = await fetch("/api/mail-sender/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate-subjects",
          topic: generatedData?.headline || prompt,
          category,
          apiKey: apiKey.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success && data.subjects) {
        setSubjectIdeas(data.subjects);
        setActiveResultTab("subjects");
      }
    } catch (e) {}
    setGeneratingSubjects(false);
  };

  // 5. Save as New Template
  const handleConfirmSaveTemplate = async () => {
    if (!saveTemplateName.trim()) {
      alert("Please enter a template name.");
      return;
    }
    if (!generatedData) return;

    setSavingTemplate(true);
    try {
      const cleanName = saveTemplateName.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-");
      await onSaveAsTemplate(cleanName, generatedData.fullHtml, generatedData.unlayerDesign);
      setSaveModalOpen(false);
      setSaveTemplateName("");
      alert(`Template '${cleanName}' saved successfully and available in Dispatch Hub!`);
    } catch (err: any) {
      alert("Error saving template: " + err.message);
    } finally {
      setSavingTemplate(false);
    }
  };

  // 6. Copy Subject or HTML
  const copySubject = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSubject(true);
    setTimeout(() => setCopiedSubject(false), 2000);
  };

  const copyHtml = () => {
    if (!generatedData) return;
    navigator.clipboard.writeText(generatedData.fullHtml);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ================= HERO AI CONTROL BAR ================= */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 via-purple-400 to-amber-300 p-0.5 flex items-center justify-center shadow-inner">
                <div className="w-full h-full bg-slate-900 rounded-[7px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-blue-300 animate-pulse" />
                </div>
              </div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center">
                Gemini AI Mail Studio
                <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  gemini-3.8-flash
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-xl">
              Write, design, and structure production-ready GDG emails with Google Gemini API.
              Generates high-converting subject lines, preheaders, bulletproof responsive HTML, and
              editable Unlayer visual layouts.
            </p>
          </div>

          {/* Right Status & Configure Button */}
          <div className="flex flex-wrap items-center gap-2">
            <div
              className={`flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-xl border backdrop-blur-md ${
                keyStatus.online
                  ? "bg-emerald-500/10 border-emerald-400/30 text-emerald-300"
                  : "bg-amber-500/10 border-amber-400/30 text-amber-300"
              }`}
            >
              {keyStatus.loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : keyStatus.online ? (
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span className="font-medium text-[11px]">
                {keyStatus.loading
                  ? "Verifying..."
                  : keyStatus.online
                  ? "Gemini API Active"
                  : "Key Setup Needed"}
              </span>
            </div>

            <button
              onClick={() => setKeyModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition flex items-center shadow-xs"
            >
              <Key className="w-3.5 h-3.5 mr-1.5 text-blue-300" />
              Configure API Key
            </button>
          </div>
        </div>

        {/* Quick Presets Scrollbar */}
        <div className="relative z-10 mt-4 pt-3 border-t border-white/10 flex items-center space-x-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap flex items-center mr-1">
            <Zap className="w-3 h-3 mr-1 text-amber-400" /> Quick Presets:
          </span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => applyPreset(p)}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-white text-[11px] font-medium transition whitespace-nowrap flex items-center shrink-0 hover:scale-102"
            >
              <span className="mr-1">{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ================= 2-COLUMN MAIN WORKSPACE ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ================= LEFT COLUMN: GENERATOR CONTROLS (5 Cols) ================= */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                  <Wand2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">Email Prompt & Concept</h3>
                  <p className="text-[11px] text-slate-500">
                    Describe what you want to communicate to students
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  setPrompt(
                    "Announce our upcoming GDG technical workshop covering modern AI & Cloud tools at AJCE campus next Saturday. Mention free Google Developer Profile badges and snacks."
                  )
                }
                className="text-[11px] text-blue-600 hover:underline font-semibold"
              >
                Sample Prompt
              </button>
            </div>

            {/* Prompt Textarea */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Prompt / Brief
              </label>
              <textarea
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Announce Flutter & Firebase build sprint, mention timing, lab venue, prerequisites, and registration link..."
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed resize-y font-normal"
              />
            </div>

            {/* Template Format Selector (Predefined Shortlisted vs Standard) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Predefined Template Layout
                </label>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {templateFormat === "shortlisted" ? "⭐ Shortlisted Format Active" : "Standard Layout"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTemplateFormat("shortlisted")}
                  className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                    templateFormat === "shortlisted"
                      ? "border-blue-500 bg-blue-50/70 ring-2 ring-blue-500/20"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center space-x-1.5 mb-1">
                    <span className="text-xs font-bold text-slate-900">⭐ Shortlisted Template</span>
                    {templateFormat === "shortlisted" && <Check className="w-3.5 h-3.5 text-blue-600 ml-auto" />}
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    Predefined shortlisted layout: GDG Header, Title, Details Table, WhatsApp + Meet Buttons, Guidelines & Footer.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setTemplateFormat("standard")}
                  className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                    templateFormat === "standard"
                      ? "border-blue-500 bg-blue-50/70 ring-2 ring-blue-500/20"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center space-x-1.5 mb-1">
                    <span className="text-xs font-bold text-slate-900">Standard Card</span>
                    {templateFormat === "standard" && <Check className="w-3.5 h-3.5 text-blue-600 ml-auto" />}
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    Standard card format with top Google color strip and single call to action.
                  </p>
                </button>
              </div>
            </div>

            {/* Category & Tone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Event Announcement">🚀 Event Announcement</option>
                  <option value="Hands-on Workshop">💻 Hands-on Workshop</option>
                  <option value="Hackathon & Contest">🏆 Hackathon & Contest</option>
                  <option value="Core Team Selection">🎉 Core Team Selection</option>
                  <option value="Application Outcome">💌 Application Outcome</option>
                  <option value="Speaker Invitation">🎙️ Speaker Invitation</option>
                  <option value="Certificate & Recognition">📜 Certificate Dispatch</option>
                  <option value="Event Reminder">⏰ Event Reminder</option>
                  <option value="Community Newsletter">📰 Community Newsletter</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="GDG Community Energetic (Friendly, Tech-forward, Welcoming)">
                    ⚡ GDG Community Energy
                  </option>
                  <option value="Professional, Executive & Direct">👔 Professional & Formal</option>
                  <option value="Urgent, Action-Oriented & Deadline Approaching">
                    ⏳ Urgent & High-Stakes
                  </option>
                  <option value="Warm, Empathetic, Encouraging & Celebratory">
                    🤝 Warm & Welcoming
                  </option>
                </select>
              </div>
            </div>

            {/* Theme Accent Color */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Primary Brand Color
              </label>
              <div className="flex items-center space-x-2">
                {[
                  { name: "Google Blue", hex: GDG_COLORS.blue },
                  { name: "Google Red", hex: GDG_COLORS.red },
                  { name: "Google Yellow", hex: GDG_COLORS.yellow },
                  { name: "Google Green", hex: GDG_COLORS.green },
                  { name: "Dark Tech", hex: GDG_COLORS.dark },
                  { name: "Indigo", hex: "#4f46e5" },
                ].map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    title={c.name}
                    onClick={() => setThemeColor(c.hex)}
                    className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center ${
                      themeColor === c.hex
                        ? "ring-2 ring-offset-2 ring-slate-800 scale-110 shadow-sm"
                        : "hover:scale-105 opacity-80"
                    }`}
                    style={{ backgroundColor: c.hex }}
                  >
                    {themeColor === c.hex && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
                <span className="text-xs font-mono text-slate-500 ml-2">{themeColor}</span>
              </div>
            </div>

            {/* Collapsible Details Accordion */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setDetailsOpen(!detailsOpen)}
                className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 transition"
              >
                <div className="flex items-center space-x-2">
                  <Sliders className="w-3.5 h-3.5 text-blue-600" />
                  <span>Key Event & Session Details</span>
                  <span className="text-[10px] font-normal text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                    Optional
                  </span>
                </div>
                {detailsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {detailsOpen && (
                <div className="p-3.5 space-y-3 bg-white border-t border-slate-200 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                      Event Title
                    </label>
                    <input
                      type="text"
                      value={details.eventName}
                      onChange={(e) => setDetails({ ...details, eventName: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                        Date
                      </label>
                      <input
                        type="text"
                        value={details.date}
                        onChange={(e) => setDetails({ ...details, date: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                        Time
                      </label>
                      <input
                        type="text"
                        value={details.time}
                        onChange={(e) => setDetails({ ...details, time: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                        Venue / Location
                      </label>
                      <input
                        type="text"
                        value={details.venue}
                        onChange={(e) => setDetails({ ...details, venue: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                        RSVP / Action Link
                      </label>
                      <input
                        type="text"
                        value={details.rsvpLink}
                        onChange={(e) => setDetails({ ...details, rsvpLink: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono text-[11px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                      Perks, Swag & Badges
                    </label>
                    <input
                      type="text"
                      value={details.perks}
                      onChange={(e) => setDetails({ ...details, perks: e.target.value })}
                      placeholder="e.g. Free stickers, Google Cloud credits, Snacks"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Merge Tag Chips */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-slate-600">Personalization Tags:</span>
                <span className="text-[10px] text-slate-400">Click to append to prompt</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {["{{name}}", "{{team}}", "{{date}}", "{{time}}", "{{meet_link}}", "{{whatsapp_link}}"].map(
                  (tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setPrompt((prev) => `${prev} ${tag}`)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 text-slate-700 rounded-md font-mono text-[10px] transition"
                    >
                      {tag}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Main Generate Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleGenerateEmail}
                disabled={isGenerating}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 transition shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Gemini is Architecting Your Email...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Generate Email with Gemini AI</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: INTERACTIVE CANVAS & LIVE PREVIEW (7 Cols) ================= */}
        <div className="lg:col-span-7 space-y-5">
          {!generatedData && !isGenerating && (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-xs space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100 shadow-inner">
                <Sparkles className="w-8 h-8 text-blue-600 animate-pulse" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-base font-bold text-slate-800">
                  Ready to Craft Your Next GDG Email
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Enter your prompt or choose one of the quick presets on the left. Gemini will
                  generate an engaging subject line, preview teaser, responsive email HTML, and an
                  Unlayer design ready for drag-and-drop customization.
                </p>
              </div>

              <div className="pt-3">
                <button
                  onClick={() => applyPreset(presets[0])}
                  className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition"
                >
                  <Zap className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                  Load Sample Event Announcement
                </button>
              </div>
            </div>
          )}

          {isGenerating && (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs space-y-4 animate-pulse">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto border border-indigo-100">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-slate-800">
                  Synthesizing Community Copy & Responsive Layout...
                </h3>
                <p className="text-xs text-slate-500">
                  Formatting Google Developer Groups styling, injecting personalization tags, and
                  building Unlayer schema.
                </p>
              </div>
            </div>
          )}

          {generatedData && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              {/* Header: Subject & Preheader */}
              <div className="pb-3 border-b border-slate-100 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Subject Line
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center">
                        <Check className="w-2.5 h-2.5 mr-1 text-emerald-600" />
                        {generatedData.templateFormat === "standard" ? "Standard Layout" : "Shortlisted Template Format"}
                      </span>
                      {generatedData.detectedVariables.length > 0 && (
                        <span className="text-[10px] font-semibold text-slate-500 flex items-center">
                          <Tag className="w-2.5 h-2.5 mr-1 text-slate-400" />
                          Variables: {generatedData.detectedVariables.join(", ")}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {generatedData.subject}
                    </h3>
                    <p className="text-xs text-slate-500">
                      <span className="font-semibold text-slate-600">Preheader:</span>{" "}
                      {generatedData.previewText}
                    </p>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    <button
                      onClick={() => copySubject(generatedData.subject)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition flex items-center"
                      title="Copy subject line"
                    >
                      {copiedSubject ? (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 mr-1" /> Copy Subject
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleGenerateSubjectLines}
                      disabled={generatingSubjects}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition flex items-center"
                    >
                      {generatingSubjects ? (
                        <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-600" />
                      )}
                      More Subjects
                    </button>
                  </div>
                </div>

                {/* Sub-Tabs: Visual Preview vs Alternative Subjects vs HTML Source */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex p-0.5 bg-slate-100 rounded-lg text-xs font-medium">
                    <button
                      onClick={() => setActiveResultTab("preview")}
                      className={`px-3 py-1 rounded-md transition flex items-center ${
                        activeResultTab === "preview"
                          ? "bg-white text-slate-900 shadow-2xs font-semibold"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5 mr-1 text-blue-600" />
                      Visual Preview
                    </button>
                    <button
                      onClick={() => setActiveResultTab("subjects")}
                      className={`px-3 py-1 rounded-md transition flex items-center ${
                        activeResultTab === "subjects"
                          ? "bg-white text-slate-900 shadow-2xs font-semibold"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1 text-purple-600" />
                      Subject Variations ({subjectIdeas.length})
                    </button>
                    <button
                      onClick={() => setActiveResultTab("html")}
                      className={`px-3 py-1 rounded-md transition flex items-center ${
                        activeResultTab === "html"
                          ? "bg-white text-slate-900 shadow-2xs font-semibold"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Code className="w-3.5 h-3.5 mr-1 text-amber-600" />
                      HTML Source
                    </button>
                  </div>

                  {activeResultTab === "preview" && (
                    <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg">
                      <button
                        onClick={() => setPreviewDevice("desktop")}
                        className={`p-1 rounded ${
                          previewDevice === "desktop"
                            ? "bg-white shadow-2xs text-slate-800"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                        title="Desktop view"
                      >
                        <Monitor className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setPreviewDevice("mobile")}
                        className={`p-1 rounded ${
                          previewDevice === "mobile"
                            ? "bg-white shadow-2xs text-slate-800"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                        title="Mobile view"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setFullscreenOpen(true)}
                        className="p-1 rounded text-slate-500 hover:text-slate-800"
                        title="Fullscreen preview"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* View 1: Visual Preview Frame */}
              {activeResultTab === "preview" && (
                <div
                  className={`bg-slate-50 rounded-xl border border-slate-200 transition-all duration-300 mx-auto overflow-hidden relative shadow-inner ${
                    previewDevice === "mobile" ? "max-w-[360px]" : "w-full"
                  }`}
                  style={{ height: "460px" }}
                >
                  <iframe
                    title="Gemini Email Visual Preview"
                    srcDoc={generatedData.fullHtml}
                    className="w-full h-full border-0 bg-white block overflow-y-auto"
                    style={{ height: "100%", width: "100%" }}
                  />
                </div>
              )}

              {/* View 2: Subject Ideas List */}
              {activeResultTab === "subjects" && (
                <div className="space-y-2.5 max-h-[460px] overflow-y-auto">
                  <div className="text-xs text-slate-500 flex justify-between items-center mb-1">
                    <span>Click any subject to apply it to this email:</span>
                    <button
                      onClick={handleGenerateSubjectLines}
                      disabled={generatingSubjects}
                      className="text-blue-600 hover:underline font-semibold flex items-center"
                    >
                      <RotateCw
                        className={`w-3 h-3 mr-1 ${generatingSubjects ? "animate-spin" : ""}`}
                      />
                      Regenerate
                    </button>
                  </div>

                  {subjectIdeas.map((subj, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setGeneratedData({ ...generatedData, subject: subj.text });
                        alert(`Subject updated to: "${subj.text}"`);
                      }}
                      className="p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition flex items-center justify-between group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">{subj.emoji}</span>
                          <span className="text-xs font-semibold text-slate-800 group-hover:text-blue-700">
                            {subj.text}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium ml-6">
                          Style: {subj.style}
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition">
                        Select →
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* View 3: HTML Source Code */}
              {activeResultTab === "html" && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>Responsive inline HTML email markup:</span>
                    <button
                      onClick={copyHtml}
                      className="px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center"
                    >
                      {copiedHtml ? (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 mr-1" /> Copy HTML
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    readOnly
                    value={generatedData.fullHtml}
                    className="w-full h-[410px] p-3 bg-slate-900 text-slate-100 font-mono text-[11px] rounded-xl focus:outline-none resize-none leading-relaxed"
                  />
                </div>
              )}

              {/* ================= ACTIONS TOOLBAR ================= */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSaveTemplateName(
                        generatedData.headline
                          ? generatedData.headline.toLowerCase().replace(/[^a-z0-9]/g, "-")
                          : "gemini-email"
                      );
                      setSaveModalOpen(true);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition flex items-center shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                    Save as Template
                  </button>

                  <button
                    onClick={() =>
                      onOpenInUnlayer(generatedData.unlayerDesign, generatedData.fullHtml)
                    }
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition flex items-center shadow-xs"
                  >
                    <Layout className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                    Open in Visual Editor
                  </button>

                  <button
                    onClick={() =>
                      onSendTestEmail(generatedData.subject, generatedData.fullHtml)
                    }
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition flex items-center"
                  >
                    <Send className="w-3.5 h-3.5 mr-1 text-blue-600" />
                    Send Test
                  </button>
                </div>

                <button
                  onClick={() =>
                    onApplyToDispatch("gemini-template", generatedData.subject, generatedData.fullHtml)
                  }
                  className="px-4 py-1.5 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition flex items-center shadow-xs"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  Use in Dispatch Hub →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= MODAL: CONFIGURE GEMINI API KEY ================= */}
      {keyModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 flex items-center text-sm">
                <Key className="w-4 h-4 text-blue-600 mr-2" /> Google Gemini API Key
              </h3>
              <button
                onClick={() => setKeyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Gemini AI models power the email generation engine. You can obtain a free Gemini API key
              at{" "}
              <a
                href="https://aistudio.google.com/"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline font-semibold inline-flex items-center"
              >
                Google AI Studio <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
              </a>
              .
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Stored locally in your browser session or set as <code>GEMINI_API_KEY</code> in{" "}
                <code>.env.local</code>.
              </span>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setKeyModalOpen(false)}
                className="px-4 py-2 text-xs font-medium rounded-lg text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveApiKey}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Save & Verify Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: SAVE NEW TEMPLATE ================= */}
      {saveModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 flex items-center text-sm">
                <Save className="w-4 h-4 text-emerald-600 mr-2" /> Save as Template
              </h3>
              <button
                onClick={() => setSaveModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Save this generated email into your template library. It will instantly be selectable in
              the Dispatch Hub and editable in Unlayer.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Template Name (ID)
              </label>
              <input
                type="text"
                value={saveTemplateName}
                onChange={(e) => setSaveTemplateName(e.target.value)}
                placeholder="e.g. workshop-flutter-nov26"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSaveModalOpen(false)}
                className="px-4 py-2 text-xs font-medium rounded-lg text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSaveTemplate}
                disabled={savingTemplate}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center shadow-xs"
              >
                {savingTemplate ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : null}
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: FULLSCREEN PREVIEW ================= */}
      {fullscreenOpen && generatedData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50">
          <div className="bg-white rounded-2xl max-w-5xl w-full h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex-none">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {generatedData.subject}
                </h3>
                <span className="text-[11px] text-slate-500">
                  Preheader: {generatedData.previewText}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setFullscreenOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-100 p-4 sm:p-6 overflow-y-auto flex justify-center items-start">
              <div
                className={`bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden transition-all duration-300 w-full ${
                  previewDevice === "mobile" ? "max-w-[420px]" : "max-w-[760px]"
                }`}
                style={{ height: "calc(92vh - 110px)" }}
              >
                <iframe
                  title="Fullscreen Gemini Preview"
                  srcDoc={generatedData.fullHtml}
                  className="w-full h-full border-0 bg-white block overflow-y-auto"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
