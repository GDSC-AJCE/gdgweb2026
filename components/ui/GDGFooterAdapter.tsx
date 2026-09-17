"use client";

import React from "react";
import GDGLogoMark from "./GDGLogoMark";
import { ExternalLink } from "lucide-react";
import { FaInstagram, FaTwitter, FaLinkedin } from "react-icons/fa";

export default function GDGFooterAdapter({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-[#18191b] border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden ${className}`}
    >
      <div className="flex flex-col lg:flex-row items-start justify-between gap-8 pb-8 border-b border-white/10">
        {/* Left Column: GDG Logo, Name & Coordinates */}
        <div className="space-y-4 max-w-xl">
          <div className="flex items-center gap-4">
            <GDGLogoMark size="lg" />
            <div>
              <h3 className="text-2xl font-bold text-white tracking-tight">GDG AJCE</h3>
              <p className="text-xs font-mono font-medium text-[#4285F4]">
                Google Developer Groups • Amal Jyothi College of Engineering
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-sans">
            📍 Amal Jyothi College of Engineering, Kanjirappally, Kerala, India
          </p>

          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-gray-300">
            <span>✉️ dsc@amaljyothi.ac.in</span>
            <span className="text-gray-600">|</span>
            <span>gdgajce@gmail.com</span>
            <span className="text-gray-600">|</span>
            <span className="text-[#34A853] font-semibold">Official GDG Chapter</span>
          </div>
        </div>

        {/* Right Column: Social Channels & Links */}
        <div className="space-y-3 shrink-0">
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400">
            Connect & Socials
          </p>

          <div className="space-y-2 text-xs font-sans">
            <a
              href="https://gdgajce.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-gray-300 hover:text-white transition group"
            >
              <span className="font-mono">gdgajce.vercel.app</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#4285F4] group-hover:translate-x-0.5 transition-transform" />
            </a>

            <a
              href="https://instagram.com/gdgajce"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-gray-300 hover:text-white transition"
            >
              <FaInstagram className="w-3.5 h-3.5 text-[#EA4335]" />
              <span className="text-gray-400">Instagram:</span>
              <span className="font-mono font-semibold text-white">@gdgajce</span>
            </a>

            <a
              href="https://twitter.com/gdgajce"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-gray-300 hover:text-white transition"
            >
              <FaTwitter className="w-3.5 h-3.5 text-[#4285F4]" />
              <span className="text-gray-400">X (Twitter):</span>
              <span className="font-mono font-semibold text-white">@gdgajce</span>
            </a>

            <a
              href="https://linkedin.com/company/gdscajce"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-gray-300 hover:text-white transition"
            >
              <FaLinkedin className="w-3.5 h-3.5 text-[#FBBC04]" />
              <span className="text-gray-400">LinkedIn:</span>
              <span className="font-mono font-semibold text-white">gdscajce</span>
            </a>
          </div>
        </div>
      </div>

      {/* Sub-footer Banner matching Figma token */}
      <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-gray-400">
        <p>© 2026 GDG AJCE Design System. Created for Professional Developer Communities.</p>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[11px] text-gray-300">
            Next.js 16 + React 19
          </span>
          <span className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[11px] text-gray-300">
            Tailwind CSS v4
          </span>
        </div>
      </div>
    </div>
  );
}
