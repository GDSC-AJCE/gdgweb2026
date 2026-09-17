"use client";

import { motion } from "framer-motion";
import ContactForm from "@/components/contact/ContactForm";
import { EnvelopeIcon, MapPinIcon, ChatBubbleBottomCenterTextIcon } from "@heroicons/react/24/outline";
import { FaGithub, FaLinkedin, FaTwitter, FaDiscord } from "react-icons/fa";

export default function ContactPage() {
  return (
    <main className="min-h-screen text-[#2c2e2a] relative overflow-hidden pb-32 select-none">
      <section className="relative z-10 w-full max-w-[1200px] mx-auto px-4 sm:px-6 pt-12 sm:pt-16 grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        {/* Left Side: Info */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-[50px] bg-[#ffffff] border border-[#d5d5d4] text-[13px] font-medium text-[#2c2e2a] shadow-xs">
              <ChatBubbleBottomCenterTextIcon className="w-3.5 h-3.5 text-[#ff705d]" />
              <span>Direct Desk</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-medium text-[#2c2e2a] tracking-[-0.04em] leading-[1.05]">
              Connect with the <br />
              <span className="text-[#2c2e2a]">
                GDG AJCE Chapter
              </span>
            </h1>
            <p className="text-[16px] text-[#80827f] leading-relaxed max-w-lg">
              Have inquiries regarding speaker opportunities, workshop partnerships, hackathons, or community tracks? Reach out to the GDG AJCE organizing team.
            </p>
          </div>

          <div className="space-y-4 pt-4 border-t border-[#d5d5d4]">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-[#ffffff] border border-[#d5d5d4] flex items-center justify-center text-[#2ba0ff] shadow-xs">
                <EnvelopeIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-mono text-[#80827f] uppercase tracking-wider">Email Contact</p>
                <a href="mailto:gdgajce@gmail.com" className="text-sm font-semibold text-[#2c2e2a] hover:text-[#ff705d] transition-colors">
                  gdgajce@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-[#ffffff] border border-[#d5d5d4] flex items-center justify-center text-[#8ed462] shadow-xs">
                <MapPinIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-mono text-[#80827f] uppercase tracking-wider">Campus Hub Location</p>
                <p className="text-sm font-medium text-[#2c2e2a]">Amal Jyothi College of Engineering, Koovappally, Kerala</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-mono text-[#80827f] uppercase tracking-wider mb-3">Community Hubs</p>
            <div className="flex gap-3">
              <a href="https://github.com/gdgajce" target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full bg-[#ffffff] border border-[#d5d5d4] flex items-center justify-center text-[#2c2e2a] hover:bg-[#eae5d7] transition-all shadow-xs">
                <FaGithub className="w-4 h-4" />
              </a>
              <a href="https://linkedin.com/company/gdgajce" target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full bg-[#ffffff] border border-[#d5d5d4] flex items-center justify-center text-[#2c2e2a] hover:bg-[#eae5d7] transition-all shadow-xs">
                <FaLinkedin className="w-4 h-4" />
              </a>
              <a href="https://twitter.com/gdgajce" target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full bg-[#ffffff] border border-[#d5d5d4] flex items-center justify-center text-[#2c2e2a] hover:bg-[#eae5d7] transition-all shadow-xs">
                <FaTwitter className="w-4 h-4" />
              </a>
              <a href="https://discord.gg" target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full bg-[#ffffff] border border-[#d5d5d4] flex items-center justify-center text-[#2c2e2a] hover:bg-[#eae5d7] transition-all shadow-xs">
                <FaDiscord className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Right Side: Form Card */}
        <div className="bg-[#ffffff] border border-[#e5e1d5] p-7 sm:p-9 rounded-[36px] shadow-xs">
          <h3 className="text-xl font-medium text-[#2c2e2a] mb-1">Send a Message</h3>
          <p className="text-xs text-[#80827f] mb-6">Fill in the fields and our dispatch desk will automatically assign your ticket.</p>
          <ContactForm />
        </div>
      </section>
    </main>
  );
}
