"use client";

import React from "react";
import Link from "next/link";
import PhysicsPlayground from "@/components/ui/PhysicsPlayground";
import { FaWhatsapp, FaInstagram, FaLinkedinIn, FaGithub } from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="relative w-full bg-[#ffffff] text-[#2c2e2a] select-none overflow-hidden border-t border-[#d5d5d4]">
      {/* INTERACTIVE PHYSICS BLOCK PLAYGROUND (resting on white surface) */}
      <div className="relative w-full bg-[#ffffff]">
        <PhysicsPlayground />
        {/* Baseline hairline divider where blocks rest */}
        <div className="w-full h-px bg-[#d5d5d4]" />
      </div>

      {/* SUB-BASELINE SECTION */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-10 lg:px-16 pt-8 sm:pt-12 pb-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-10 sm:gap-12">
          
          {/* Left Column: Headline & Community Actions */}
          <div className="max-w-md">
            <h3 className="text-2xl sm:text-[26px] font-medium tracking-[-0.03em] text-[#2c2e2a] leading-[1.25]">
              Stay connected for early access to our<br className="hidden sm:inline" /> newest tools and local events
            </h3>

            <div className="flex flex-wrap items-center gap-2.5 mt-7">
              {/* WhatsApp */}
              <a
                href="https://chat.whatsapp.com/gdgajce"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Join WhatsApp Community"
                className="w-10 h-10 rounded-full border border-[#d5d5d4] hover:border-[#2c2e2a] flex items-center justify-center text-[#2c2e2a] hover:bg-[#f5f1e4] transition active:scale-95 shadow-xs"
              >
                <FaWhatsapp className="w-4 h-4" />
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com/gdgajce"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow on Instagram"
                className="w-10 h-10 rounded-full border border-[#d5d5d4] hover:border-[#2c2e2a] flex items-center justify-center text-[#2c2e2a] hover:bg-[#f5f1e4] transition active:scale-95 shadow-xs"
              >
                <FaInstagram className="w-4 h-4" />
              </a>

              {/* LinkedIn */}
              <a
                href="https://linkedin.com/company/gdgajce"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Connect on LinkedIn"
                className="w-10 h-10 rounded-full border border-[#d5d5d4] hover:border-[#2c2e2a] flex items-center justify-center text-[#2c2e2a] hover:bg-[#f5f1e4] transition active:scale-95 shadow-xs"
              >
                <FaLinkedinIn className="w-4 h-4" />
              </a>

              {/* GitHub */}
              <a
                href="https://github.com/gdgajce"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Organization"
                className="w-10 h-10 rounded-full border border-[#d5d5d4] hover:border-[#2c2e2a] flex items-center justify-center text-[#2c2e2a] hover:bg-[#f5f1e4] transition active:scale-95 shadow-xs"
              >
                <FaGithub className="w-4 h-4" />
              </a>

              {/* Join our community pill button */}
              <a
                href="https://chat.whatsapp.com/gdgajce"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-[50px] border border-[#d5d5d4] hover:border-[#2c2e2a] text-[13px] font-medium text-[#2c2e2a] hover:bg-[#f5f1e4] transition active:scale-98 shadow-xs"
              >
                Join our community
              </a>
            </div>
          </div>

          {/* Right Column: Navigation & Other teams side-by-side */}
          <div className="flex flex-wrap sm:flex-nowrap gap-12 sm:gap-20 lg:gap-28">
            {/* Navigation */}
            <div>
              <h4 className="text-[13px] font-semibold text-[#2c2e2a] mb-3.5">
                Navigation
              </h4>
              <ul className="space-y-2 text-[13px] text-[#80827f]">
                <li>
                  <Link href="/about" className="hover:text-[#2c2e2a] transition">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/programs" className="hover:text-[#2c2e2a] transition">
                    Events
                  </Link>
                </li>
                <li>
                  <Link href="/programs/ongoing" className="hover:text-[#2c2e2a] transition">
                    Live & Ongoing
                  </Link>
                </li>
                <li>
                  <Link href="/about#execom" className="hover:text-[#2c2e2a] transition">
                    Community
                  </Link>
                </li>
              </ul>
            </div>

            {/* Other teams and product areas */}
            <div>
              <h4 className="text-[13px] font-semibold text-[#2c2e2a] mb-3.5">
                Other teams and product areas
              </h4>
              <ul className="space-y-2 text-[13px] text-[#80827f]">
                <li>
                  <a
                    href="https://ai.google"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#2c2e2a] transition"
                  >
                    Google AI
                  </a>
                </li>
                <li>
                  <a
                    href="https://cloud.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#2c2e2a] transition"
                  >
                    Google Cloud
                  </a>
                </li>
                <li>
                  <a
                    href="https://research.google"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#2c2e2a] transition"
                  >
                    Google Research
                  </a>
                </li>
                <li>
                  <a
                    href="https://deepmind.google"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#2c2e2a] transition"
                  >
                    Google DeepMind
                  </a>
                </li>
                <li>
                  <a
                    href="https://labs.google"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#2c2e2a] transition"
                  >
                    Google Labs
                  </a>
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* MONUMENTAL DISPLAY SIGNATURE: GDG AJCE */}
        <div className="pt-14 pb-6 overflow-hidden">
          <h2 className="font-black text-[17.5vw] text-[#2c2e2a] tracking-[-0.045em] leading-[0.85] m-0 select-none text-left whitespace-nowrap">
            GDG AJCE
          </h2>
        </div>
      </div>

      {/* BOTTOM LEGAL & BRAND BAR */}
      <div className="w-full border-t border-[#d5d5d4] py-4 px-4 sm:px-10 lg:px-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 text-[10px] sm:text-[11px] uppercase tracking-wider text-[#80827f] font-medium">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 lg:gap-10">
          <Link
            href="/"
            className="text-[13px] sm:text-[15px] font-semibold text-[#2c2e2a] normal-case tracking-normal hover:opacity-80 transition"
          >
            GDG AJCE
          </Link>
          <Link
            href="/about"
            className="hover:text-[#2c2e2a] transition"
          >
            ABOUT GDG AJCE
          </Link>
          <Link
            href="/contact"
            className="hover:text-[#2c2e2a] transition"
          >
            HELP
          </Link>
          <Link
            href="/contact"
            className="hover:text-[#2c2e2a] transition"
          >
            CONTACT
          </Link>
        </div>
        <p className="text-[10px] sm:text-[11px] text-[#80827f] font-normal normal-case">
          &copy; {new Date().getFullYear()} GDG on Campus AJCE
        </p>
      </div>
    </footer>
  );
}
