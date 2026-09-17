"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaDiscord, FaReddit, FaTwitter } from "react-icons/fa";
import Link from "next/link";
import { useDialog } from "@/context/DialogContext";

export default function LabsStayConnected() {
  const dialog = useDialog();
  const [newsletterOpen, setNewsletterOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setTimeout(() => {
      dialog.alert("Thank you for signing up for the Labs newsletter!", "Subscribed");
      setNewsletterOpen(false);
      setEmail("");
      setSubmitted(false);
    }, 800);
  };

  return (
    <section className="relative bg-[#F3F0E6] text-[#1F1F1F] py-28 px-4 sm:px-8 overflow-hidden select-none">
      {/* Floating Colorful Geometric Shapes (matching video frame 00:14 - 00:18) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Yellow Rounded Blob top left */}
        <div className="absolute -top-10 left-10 w-44 h-44 bg-[#FBBC04] rounded-[40%_60%_70%_30%/40%_50%_60%_50%] opacity-90" />

        {/* Emerald/Green Rotated Rounded Diamond (video 00:16) */}
        <motion.div
          animate={{ rotate: [45, 48, 45], y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-16 left-8 sm:left-24 w-32 h-32 sm:w-44 sm:h-44 bg-[#25EA7A] rounded-3xl"
        />

        {/* Orange Hexagon / Octagon shape (video 00:16) */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-20 left-48 sm:left-80 w-28 h-28 sm:w-36 sm:h-36 bg-[#FF7744] rounded-[30%_70%_70%_30%/30%_30%_70%_70%]"
        />

        {/* Blue Circle (video 00:16) */}
        <div className="absolute bottom-16 left-1/2 -translate-x-12 w-28 h-28 sm:w-36 sm:h-36 bg-[#4285F4] rounded-full" />

        {/* Pink Rotated Square (video 00:16) */}
        <motion.div
          animate={{ rotate: [12, 8, 12], y: [0, -8, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute -top-8 right-1/3 w-36 h-36 sm:w-48 sm:h-48 bg-[#FF77B8] rounded-3xl"
        />

        {/* Yellow Clover/Flower shape (video 00:16) */}
        <div className="absolute bottom-16 right-48 sm:right-72 w-32 h-32 sm:w-40 sm:h-40 bg-[#FBBC04] rounded-[50%_50%_50%_50%/60%_60%_40%_40%]" />

        {/* Blue Circle right (video 00:16) */}
        <div className="absolute bottom-16 right-10 sm:right-24 w-28 h-28 sm:w-36 sm:h-36 bg-[#4285F4] rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10 text-center space-y-8">
        {/* HEADLINE: GDG Community Connection */}
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-normal tracking-tight text-[#1F1F1F] font-sans max-w-2xl mx-auto leading-tight">
          Stay connected for upcoming workshops, hackathons & tech events
        </h2>

        {/* BUTTON PILLS */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={() => setNewsletterOpen(!newsletterOpen)}
            className="px-8 py-3.5 rounded-full bg-white text-black font-semibold text-xs border border-black/10 hover:bg-zinc-100 transition-all shadow-md active:scale-95"
          >
            Subscribe to Chapter Updates
          </button>
          <Link
            href="/execom"
            className="px-8 py-3.5 rounded-full bg-white text-black font-semibold text-xs border border-black/10 hover:bg-zinc-100 transition-all shadow-md active:scale-95"
          >
            Become a Core Organizer
          </Link>
        </div>

        {/* Newsletter Expandable Form */}
        {newsletterOpen && (
          <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleNewsletter}
            className="max-w-md mx-auto flex items-center gap-2 p-1.5 rounded-full bg-white border border-black/15 shadow-lg"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email..."
              className="flex-1 px-5 py-2 text-xs text-black bg-transparent outline-none"
            />
            <button
              type="submit"
              disabled={submitted}
              className="px-6 py-2 rounded-full bg-[#1F1F1F] text-white text-xs font-semibold hover:bg-black transition"
            >
              {submitted ? "Subscribed" : "Join"}
            </button>
          </motion.form>
        )}

        {/* SOCIAL PILL BAR: Discord, Reddit, X (exact rounded pill from video 00:14 - 00:15) */}
        <div className="pt-2 flex justify-center">
          <div className="inline-flex items-center gap-4 px-6 py-2.5 rounded-full bg-white/90 backdrop-blur-md border border-black/10 shadow-md">
            <a
              href="https://discord.gg/google"
              target="_blank"
              rel="noreferrer"
              className="p-2 text-black hover:text-[#5865F2] transition"
              aria-label="Discord"
            >
              <FaDiscord className="w-5 h-5" />
            </a>
            <span className="w-px h-4 bg-black/10" />
            <a
              href="https://reddit.com"
              target="_blank"
              rel="noreferrer"
              className="p-2 text-black hover:text-[#FF4500] transition"
              aria-label="Reddit"
            >
              <FaReddit className="w-5 h-5" />
            </a>
            <span className="w-px h-4 bg-black/10" />
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="p-2 text-black hover:text-blue-500 transition"
              aria-label="X / Twitter"
            >
              <FaTwitter className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
