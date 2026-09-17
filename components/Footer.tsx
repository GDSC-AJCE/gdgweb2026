"use client";

import React from "react";
import Link from "next/link";
import PhysicsPlayground from "@/components/ui/PhysicsPlayground";
import { FaWhatsapp, FaInstagram, FaLinkedinIn, FaGithub } from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="relative w-full bg-white text-[#111111] select-none overflow-hidden border-t border-[#e5e5e5]">
      {/* INTERACTIVE PHYSICS BLOCK PLAYGROUND */}
      <div className="relative w-full bg-white">
        <PhysicsPlayground />
        {/* Baseline hairline divider where blocks rest */}
        <div className="w-full h-px bg-[#e5e5e5]" />
      </div>

      {/* SUB-BASELINE SECTION */}
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 pt-12 pb-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-12">
          
          {/* Left Column: Headline & Social / Newsletter Actions */}
          <div className="max-w-md">
            <h3 className="text-2xl sm:text-[26px] font-normal tracking-[-0.02em] text-[#111111] leading-[1.25]">
              Stay connected for early access to our<br className="hidden sm:inline" /> newest tools and local events
            </h3>

            <div className="flex flex-wrap items-center gap-2.5 mt-7">
              {/* WhatsApp */}
              <a
                href="https://chat.whatsapp.com/gdgajce"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Join WhatsApp Community"
                className="w-10 h-10 rounded-full border border-[#111111]/30 hover:border-[#111111] flex items-center justify-center text-[#111111] hover:bg-[#f5f5f5] transition active:scale-95"
              >
                <FaWhatsapp className="w-4 h-4" />
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com/gdgajce"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow on Instagram"
                className="w-10 h-10 rounded-full border border-[#111111]/30 hover:border-[#111111] flex items-center justify-center text-[#111111] hover:bg-[#f5f5f5] transition active:scale-95"
              >
                <FaInstagram className="w-4 h-4" />
              </a>

              {/* LinkedIn */}
              <a
                href="https://linkedin.com/company/gdgajce"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Connect on LinkedIn"
                className="w-10 h-10 rounded-full border border-[#111111]/30 hover:border-[#111111] flex items-center justify-center text-[#111111] hover:bg-[#f5f5f5] transition active:scale-95"
              >
                <FaLinkedinIn className="w-4 h-4" />
              </a>

              {/* GitHub */}
              <a
                href="https://github.com/gdgajce"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Organization"
                className="w-10 h-10 rounded-full border border-[#111111]/30 hover:border-[#111111] flex items-center justify-center text-[#111111] hover:bg-[#f5f5f5] transition active:scale-95"
              >
                <FaGithub className="w-4 h-4" />
              </a>

              {/* Sign up for our newsletter pill button */}
              <Link
                href="/newsletter"
                className="px-5 py-2.5 rounded-full border border-[#111111]/30 hover:border-[#111111] text-[13px] font-medium text-[#111111] hover:bg-[#f5f5f5] transition active:scale-98"
              >
                Sign up for our newsletter
              </Link>
            </div>
          </div>

          {/* Right Column: Navigation & Other teams side-by-side */}
          <div className="flex flex-wrap sm:flex-nowrap gap-12 sm:gap-20 lg:gap-28">
            {/* Navigation */}
            <div>
              <h4 className="text-[13px] font-semibold text-[#111111] mb-3.5">
                Navigation
              </h4>
              <ul className="space-y-2 text-[13px] text-[#5f6368]">
                <li>
                  <Link href="/about" className="hover:text-[#111111] transition">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/programs" className="hover:text-[#111111] transition">
                    Experiments
                  </Link>
                </li>
                <li>
                  <Link href="/events" className="hover:text-[#111111] transition">
                    Sessions
                  </Link>
                </li>
                <li>
                  <Link href="/newsletter" className="hover:text-[#111111] transition flex items-center gap-1.5">
                    <span>Newsletter</span>
                    <span className="text-[10px] bg-[#4285F4]/15 text-[#4285F4] font-bold px-1.5 py-0.2 rounded-full">New</span>
                  </Link>
                </li>
                <li>
                  <Link href="/team" className="hover:text-[#111111] transition">
                    Community
                  </Link>
                </li>
              </ul>
            </div>

            {/* Other teams and product areas */}
            <div>
              <h4 className="text-[13px] font-semibold text-[#111111] mb-3.5">
                Other teams and product areas
              </h4>
              <ul className="space-y-2 text-[13px] text-[#5f6368]">
                <li>
                  <a
                    href="https://ai.google"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#111111] transition"
                  >
                    Google AI
                  </a>
                </li>
                <li>
                  <a
                    href="https://cloud.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#111111] transition"
                  >
                    Google Cloud
                  </a>
                </li>
                <li>
                  <a
                    href="https://research.google"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#111111] transition"
                  >
                    Google Research
                  </a>
                </li>
                <li>
                  <a
                    href="https://deepmind.google"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#111111] transition"
                  >
                    Google DeepMind
                  </a>
                </li>
                <li>
                  <a
                    href="https://labs.google"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#111111] transition"
                  >
                    Search Labs
                  </a>
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* MONUMENTAL DISPLAY SIGNATURE: GDG AJCE */}
        <div className="pt-14 pb-6 overflow-hidden">
          <h2 className="font-bold text-[17.5vw] text-[#000000] tracking-[-0.045em] leading-[0.85] m-0 select-none text-left whitespace-nowrap">
            GDG AJCE
          </h2>
        </div>
      </div>

      {/* BOTTOM LEGAL & BRAND BAR */}
      <div className="w-full border-t border-[#e5e5e5] py-4 px-6 sm:px-10 lg:px-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px] uppercase tracking-wider text-[#5f6368] font-medium">
        <div className="flex flex-wrap items-center gap-6 sm:gap-10">
          <Link
            href="/"
            className="text-[15px] font-semibold text-[#111111] normal-case tracking-normal hover:opacity-80 transition"
          >
            GDG AJCE
          </Link>
          <Link
            href="/about"
            className="hover:text-[#111111] transition"
          >
            ABOUT GDG AJCE
          </Link>
          <Link
            href="/contact"
            className="hover:text-[#111111] transition"
          >
            HELP
          </Link>
          <Link
            href="/contact"
            className="hover:text-[#111111] transition"
          >
            CONTACT
          </Link>
        </div>
        <p className="text-[11px] text-[#80827f] font-normal normal-case">
          &copy; {new Date().getFullYear()} GDG on Campus AJCE
        </p>
      </div>
    </footer>
  );
}
