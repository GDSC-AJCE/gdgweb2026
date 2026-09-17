"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Terminal, Cpu, Database, Smartphone, Flame, ArrowRight, Check, Copy } from "lucide-react";

interface PreviewSection {
  id: string;
  title: string;
  category: string;
  icon: any;
  color: string;
  bgLight: string;
  readTime: string;
  excerpt: string;
  codeSnippet?: {
    lang: string;
    code: string;
  };
  highlights: string[];
}

const PREVIEW_SECTIONS: PreviewSection[] = [
  {
    id: "tldr",
    title: "Executive TL;DR Radar",
    category: "Quick Briefing",
    icon: Flame,
    color: "#EA4335",
    bgLight: "bg-[#EA4335]/10",
    readTime: "45 sec",
    excerpt: "Everything critical that moved in Google tech, open-source AI, and mobile engineering this week—summarized in 4 bullet points.",
    highlights: [
      "Firebase Data Connect: Native PostgreSQL relational schemas now fully integrated with Firebase Auth & Cloud SQL.",
      "Autonomous Developer Agents: Shifting from inline autocomplete to tool-calling feedback loops with compiler verification.",
      "Flutter Impeller GPU: 120Hz deterministic frame rates eliminating shader jank across Android and iOS.",
      "DevFest AJCE 2026: Campus project tracks officially open for submission."
    ]
  },
  {
    id: "ai",
    title: "Agentic Engineering & Gemini 1.5",
    category: "AI & Machine Learning",
    icon: Cpu,
    color: "#4285F4",
    bgLight: "bg-[#4285F4]/10",
    readTime: "1.5 min",
    excerpt: "How modern AI systems utilize tool calling, structured JSON output, and execution feedback loops to compile and verify code iteratively.",
    codeSnippet: {
      lang: "typescript",
      code: `import { GoogleGenerativeAI } from "@google/generative-ai";

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const agent = ai.getGenerativeModel({
  model: "gemini-1.5-pro",
  tools: [{ functionDeclarations: [compileCodeTool, runUnitTestsTool] }]
});

// Autonomous tool-loop executing in self-healing pipeline
const res = await agent.generateContent("Refactor and verify auth handler");`
    },
    highlights: [
      "Zero hallucinations via tool feedback and schema enforcement.",
      "Local developer evaluation using Firebase Genkit visual inspector.",
      "Running distilled 2B models locally in Chrome via MediaPipe."
    ]
  },
  {
    id: "cloud",
    title: "Firebase Data Connect with PostgreSQL",
    category: "Cloud & Database",
    icon: Database,
    color: "#34A853",
    bgLight: "bg-[#34A853]/10",
    readTime: "1 min",
    excerpt: "The power of relational schemas meets the speed of Firebase. Instant GraphQL APIs and type-safe SDK generation directly from SQL tables.",
    codeSnippet: {
      lang: "graphql",
      code: `# schema.gql
type Event @table {
  id: UUID! @default(expr: "uuid_generate_v4()")
  title: String!
  date: Date!
  attendees: [User!]! @relation
}`
    },
    highlights: [
      "ACID transactions with Cloud SQL for PostgreSQL.",
      "Native Row-Level Security bound to Firebase Auth tokens.",
      "Automatic Flutter & TypeScript client SDK generation."
    ]
  },
  {
    id: "mobile",
    title: "Flutter Impeller & Jetpack Compose 1.7",
    category: "Mobile & Web",
    icon: Smartphone,
    color: "#FBBC04",
    bgLight: "bg-[#FBBC04]/10",
    readTime: "1 min",
    excerpt: "GPU hardware acceleration leaps on both Flutter and native Android. Say goodbye to dropped frames during complex physics and gestures.",
    highlights: [
      "Impeller pre-compiles custom shaders to Vulkan and Metal.",
      "Jetpack Compose 1.7 reduces garbage collection allocation pauses by 40%.",
      "WasmGC web runtime bringing near-native speeds to browser Flutter apps."
    ]
  }
];

export default function NewsletterInteractivePreview() {
  const [activeTab, setActiveTab] = useState<string>("tldr");
  const [copied, setCopied] = useState(false);

  const currentSection = PREVIEW_SECTIONS.find((s) => s.id === activeTab) || PREVIEW_SECTIONS[0];

  const handleCopySnippet = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffffff] border border-[#d5d5d4] text-[11px] font-semibold text-[#4285F4] mb-2 shadow-2xs">
            <Sparkles className="w-3 h-3 text-[#4285F4]" />
            <span>Interactive Sample Issue</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#2c2e2a] tracking-tight">
            Peek Inside A Weekly Issue
          </h2>
          <p className="text-xs sm:text-sm text-[#80827f] mt-1">
            Click through the tracks below to see the exact signal-to-noise ratio delivered every Monday.
          </p>
        </div>

        <Link
          href="/newsletter/issue-3-coding-agents-data-connect-flutter-gpu"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2c2e2a] hover:text-[#4285F4] transition self-start sm:self-auto group"
        >
          <span>Read complete edition #3</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Simulated Email / Browser Card */}
      <div className="bg-[#ffffff] border border-[#d5d5d4] rounded-[32px] sm:rounded-[40px] overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md">
        {/* Browser / Email Chrome Top Bar */}
        <div className="bg-[#fbfaf7] border-b border-[#e5e1d5] px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#EA4335]/70 inline-block" />
            <span className="w-3 h-3 rounded-full bg-[#FBBC04]/70 inline-block" />
            <span className="w-3 h-3 rounded-full bg-[#34A853]/70 inline-block" />
            <span className="ml-2 text-[11px] font-mono text-[#80827f] hidden sm:inline-block">
              GDG-Tech-Pulse-Issue-03.email
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-[#80827f]">
            <span className="px-2 py-0.5 rounded bg-[#f5f1e4] text-[#2c2e2a] font-semibold">
              4 Min Read
            </span>
            <span>Monday 9:00 AM</span>
          </div>
        </div>

        {/* Email Meta Info Bar */}
        <div className="px-4 sm:px-8 py-3 bg-[#ffffff] border-b border-[#f0ede4] text-xs space-y-1 text-[#80827f]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[#2c2e2a] font-semibold">From: </span>
              <span>GDG Tech Pulse &lt;pulse@gdgajce.com&gt;</span>
            </div>
            <div className="text-[11px] font-mono text-[#34A853] bg-[#34A853]/10 px-2 py-0.5 rounded-full font-semibold">
              ✓ Verified GDG AJCE Dispatch
            </div>
          </div>
          <div>
            <span className="text-[#2c2e2a] font-semibold">Subject: </span>
            <span className="text-[#2c2e2a] font-medium">⚡ GDG Tech Pulse #3: Autonomous Coding Agents, Firebase Data Connect & Flutter GPU</span>
          </div>
        </div>

        {/* Track Selection Pills */}
        <div className="p-4 sm:px-8 bg-[#fdfcf9] border-b border-[#f0ede4] flex items-center gap-2 overflow-x-auto no-scrollbar">
          {PREVIEW_SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive = activeTab === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveTab(section.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-[#2c2e2a] text-white shadow-xs"
                    : "bg-[#ffffff] text-[#80827f] hover:text-[#2c2e2a] border border-[#d5d5d4]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : ""}`} style={{ color: isActive ? "#ffffff" : section.color }} />
                <span>{section.title}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-[#f5f1e4] text-[#80827f]"}`}>
                  {section.readTime}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content Section Preview with Motion */}
        <div className="p-6 sm:p-8 md:p-10 min-h-[340px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSection.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f5f1e4] pb-4">
                <div>
                  <span
                    className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full inline-block mb-1.5"
                    style={{ backgroundColor: `${currentSection.color}15`, color: currentSection.color }}
                  >
                    {currentSection.category}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#2c2e2a] tracking-tight">
                    {currentSection.title}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#80827f]">
                  <span>Track Read Time: </span>
                  <span className="font-mono font-bold text-[#2c2e2a]">{currentSection.readTime}</span>
                </div>
              </div>

              <p className="text-sm sm:text-[15px] text-[#2c2e2a]/80 leading-relaxed font-medium">
                {currentSection.excerpt}
              </p>

              {/* Code snippet if present */}
              {currentSection.codeSnippet && (
                <div className="rounded-2xl bg-[#1c1e1d] text-gray-200 p-4 font-mono text-xs overflow-x-auto relative border border-[#333734]">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-[11px] text-gray-400">
                    <span>{currentSection.codeSnippet.lang.toUpperCase()}</span>
                    <button
                      onClick={() => handleCopySnippet(currentSection.codeSnippet!.code)}
                      className="inline-flex items-center gap-1 text-[11px] hover:text-white transition cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 text-[#34A853]" />
                          <span className="text-[#34A853]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Snippet</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="leading-relaxed select-text">
                    <code>{currentSection.codeSnippet.code}</code>
                  </pre>
                </div>
              )}

              {/* Key Bullet Highlights */}
              <div className="space-y-2.5 pt-1">
                <p className="text-[12px] font-bold uppercase tracking-wider text-[#80827f]">
                  Key Takeaways In This Dispatch:
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {currentSection.highlights.map((h, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 p-3 rounded-xl bg-[#f5f1e4]/50 border border-[#e5e1d5] text-xs sm:text-[13px] text-[#2c2e2a]"
                    >
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: `${currentSection.color}25`, color: currentSection.color }}
                      >
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span className="leading-snug">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Bottom Card Footer with Jump-In CTA */}
          <div className="pt-6 mt-6 border-t border-[#f5f1e4] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-xs text-[#80827f]">
              Ready to get deep dives like this every Monday at 9:00 AM?
            </span>

            <a
              href="#subscribe-card"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#2c2e2a] hover:bg-[#1c1d1a] text-white text-xs font-semibold transition active:scale-95 shadow-xs"
            >
              <span>Subscribe for Free</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#8ed462]" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
