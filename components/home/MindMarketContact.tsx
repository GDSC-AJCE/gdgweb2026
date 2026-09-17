"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useDialog } from "@/context/DialogContext";
import TextLoop from "@/components/ui/TextLoop";
import { Send, Copy, Check, Sparkles } from "lucide-react";
import { FaGithub, FaLinkedinIn, FaXTwitter, FaDiscord, FaWhatsapp } from "react-icons/fa6";

export default function MindMarketContact() {
  const dialog = useDialog();
  const [submitting, setSubmitting] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [mascotSpeech, setMascotSpeech] = useState("Hey! Drop us a note 👋");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const fireConfetti = (e?: React.MouseEvent) => {
    try {
      let x = 0.5;
      let y = 0.5;
      if (e) {
        const rect = e.currentTarget.getBoundingClientRect();
        x = (rect.left + rect.width / 2) / window.innerWidth;
        y = (rect.top + rect.height / 2) / window.innerHeight;
      }
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { x, y },
        colors: ["#ff705d", "#8ed462", "#2ba0ff", "#ffd600"],
        disableForReducedMotion: true,
      });
    } catch {
      // fallback
    }
  };

  const handleMascotClick = (e: React.MouseEvent) => {
    fireConfetti(e);
    const quips = [
      "I'm the chapter mascot! 👋",
      "We read every note! 📬",
      "Let's build cool stuff! ✨",
      "Codelabs over lectures! 💻",
      "Ready when you are! 🚀",
    ];
    setMascotSpeech(quips[Math.floor(Math.random() * quips.length)]);
  };

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText("gdgajce@gmail.com");
    setCopiedEmail(true);
    setMascotSpeech("Email copied! 📋");
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      dialog.alert("Please fill in your name, email, and message.", "Missing Information");
      setMascotSpeech("Don't forget the required fields! ✍️");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      dialog.alert("Please provide a valid email address.", "Invalid Email");
      setMascotSpeech("Double-check that email! 📬");
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, "contactFormResponses"), {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        message: formData.message.trim(),
        submittedAt: Timestamp.now(),
        isRead: false,
        replied: false,
        source: "landing_page_stacked_card",
      });

      fireConfetti();
      setMascotSpeech("Woohoo! Dispatched! 🎉");
      dialog.alert(
        "Your inquiry has been received! Our dispatch desk will get back to you shortly.",
        "Inquiry Sent"
      );
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      console.error("Error submitting contact form:", error);
      dialog.alert("Could not send right now. Please email gdgajce@gmail.com directly!", "Error");
      setMascotSpeech("Oops! Try emailing us directly. 💌");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact-section" className="relative w-full bg-transparent pt-10 sm:pt-14 pb-20 sm:pb-28 px-4 sm:px-6 select-none overflow-hidden">
      
      {/* ========================================================================= */}
      {/* 1. TOP FULL-BLEED TEXT-ROLLING RIBBON (Edge-to-edge, seamless wave)       */}
      {/* ========================================================================= */}
      <div className="w-screen relative left-1/2 -translate-x-1/2 overflow-hidden pt-1 pb-16 sm:pb-22 pointer-events-auto">
        <TextLoop
          text="GET IN TOUCH ✦ GDG ON CAMPUS AJCE ✦ DROP A NOTE ✦ LET'S BUILD TOGETHER ✦ SAY HELLO ✦ CONNECT WITH US"
          shape="wave"
          speed={50}
          direction="forward"
          separator="✦"
          curviness={14}
          viewBoxHeight={95}
          fontSize={20}
          fontWeight={700}
          letterSpacing={2}
          uppercase
          color="#2c2e2a"
          ribbon={true}
          ribbonColor="#ffffff"
          ribbonWidth={54}
          pauseOnHover={true}
          preserveAspectRatio="none"
          className="w-full drop-shadow-xs"
        />
      </div>

      {/* ========================================================================= */}
      {/* 2. PLAYFUL DOODLE NOODLE ARM (Left Side Only)                            */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <svg
          className="hidden xl:block absolute -left-10 top-1/2 -translate-y-1/2 w-[340px] h-[340px] opacity-75 drop-shadow-xs"
          viewBox="0 0 320 320"
          fill="none"
        >
          <path
            d="M 20 280 C 70 260, 130 300, 180 250 C 220 210, 170 150, 90 170 C 30 185, 35 110, 100 80 C 170 50, 230 110, 290 140"
            stroke="#95A8FE"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <g transform="translate(290, 140) rotate(15)">
            <ellipse cx="0" cy="0" rx="14" ry="12" fill="#95A8FE" />
            <circle cx="10" cy="-8" r="6" fill="#95A8FE" />
            <circle cx="15" cy="0" r="6" fill="#95A8FE" />
            <circle cx="10" cy="8" r="6" fill="#95A8FE" />
            <circle cx="1" cy="14" r="5" fill="#95A8FE" />
          </g>
        </svg>
      </div>

      {/* ========================================================================= */}
      {/* 3. CENTERED CONTENT: Proper Heading, Subtitle, Stacked Card Form         */}
      {/* ========================================================================= */}
      <div className="max-w-[900px] mx-auto relative z-10 space-y-8 sm:space-y-10 text-center">
        
        {/* Proper Editorial Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-3.5 max-w-2xl mx-auto"
        >
          {/* Chapter Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-[50px] bg-white border border-[#d5d5d4] text-[13px] font-medium text-[#2c2e2a] shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#ff705d] animate-pulse" />
            <span>Direct Desk & Chapter Dispatch</span>
          </div>

          {/* Proper Headline */}
          <h2 className="text-[38px] sm:text-[54px] md:text-[64px] font-medium tracking-[-0.04em] text-[#2c2e2a] leading-[1.05]">
            Get in Touch with Our Chapter
          </h2>

          {/* Subtitle */}
          <p className="text-sm sm:text-[16px] font-normal text-[#80827f] max-w-lg mx-auto leading-relaxed">
            Have inquiries about workshops, speaker invitations, hackathon partnerships, or chapter tracks? Send our organizing crew a direct message.
          </p>
        </motion.div>

        {/* Stacked Form Card (Enlarged Form Card with Hairline Dividers) */}
        <div className="relative max-w-[560px] sm:max-w-[620px] md:max-w-[660px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, ease: [0.38, 0.005, 0.215, 1.0] }}
            className="rounded-[36px] sm:rounded-[40px] bg-white border border-[#e5e1d5] shadow-[0_12px_36px_rgba(0,0,0,0.04)] overflow-hidden text-left"
          >
            <form onSubmit={handleSubmit} className="divide-y divide-[#ece7db]">
              
              {/* Row 1: Name */}
              <div className="px-7 py-5 sm:py-5.5 bg-[#fdfbf7] transition-colors focus-within:bg-white">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#80827f] mb-1">
                  Full Name <span className="text-[#ff705d]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex Developer"
                  value={formData.name}
                  onFocus={() => setMascotSpeech("What should we call you? 😊")}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-transparent text-sm sm:text-[16px] text-[#2c2e2a] placeholder-[#9a9c98] font-normal outline-none"
                />
              </div>

              {/* Row 2: Email */}
              <div className="px-7 py-5 sm:py-5.5 bg-[#fdfbf7] transition-colors focus-within:bg-white">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#80827f] mb-1">
                  Email Address <span className="text-[#ff705d]">*</span>
                </label>
                <input
                  type="email"
                  placeholder="alex@gmail.com"
                  value={formData.email}
                  onFocus={() => setMascotSpeech("We'll write back here! 📬")}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-transparent text-sm sm:text-[16px] text-[#2c2e2a] placeholder-[#9a9c98] font-normal outline-none"
                />
              </div>

              {/* Row 3: Phone */}
              <div className="px-7 py-5 sm:py-5.5 bg-[#fdfbf7] transition-colors focus-within:bg-white">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#80827f] mb-1">
                  Phone Number <span className="text-[#80827f]/60 font-sans font-normal">(optional)</span>
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onFocus={() => setMascotSpeech("Optional, but great for quick syncs! 📞")}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-transparent text-sm sm:text-[16px] text-[#2c2e2a] placeholder-[#9a9c98] font-normal outline-none"
                />
              </div>

              {/* Row 4: Message */}
              <div className="px-7 py-5 sm:py-5.5 bg-[#fdfbf7] transition-colors focus-within:bg-white">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#80827f] mb-1">
                  Message Details <span className="text-[#ff705d]">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Tell us about your proposal, questions, or ideas..."
                  value={formData.message}
                  onFocus={() => setMascotSpeech("Tell us everything! ✨")}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-transparent text-sm sm:text-[16px] text-[#2c2e2a] placeholder-[#9a9c98] font-normal outline-none resize-none leading-relaxed min-h-[110px]"
                />
              </div>

              {/* Row 5: Full-Width Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="group w-full py-5 sm:py-5.5 bg-[#ff705d] hover:bg-[#ee6350] text-white font-medium text-[16px] sm:text-[17px] transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? "Submitting inquiry..." : "Send Message"}</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-white transition-all duration-300 group-hover:scale-125" />
                </button>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Quick Links Below Form */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          {/* Email Copy Pill */}
          <button
            type="button"
            onClick={handleCopyEmail}
            className="px-4 py-2 rounded-full bg-white/90 hover:bg-white border border-[#d5d5d4] transition flex items-center gap-2 text-xs text-[#2c2e2a] cursor-pointer shadow-2xs group"
          >
            <span className="font-mono text-[12px]">gdgajce@gmail.com</span>
            <span className="text-[#80827f] group-hover:text-[#2c2e2a]">
              {copiedEmail ? <Check className="w-3.5 h-3.5 text-[#8ed462]" /> : <Copy className="w-3.5 h-3.5" />}
            </span>
          </button>

          {/* Social Channels */}
          <div className="flex items-center gap-2">
            <a
              href="https://chat.whatsapp.com/gdgajce"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="w-8 h-8 rounded-full bg-white hover:bg-[#f5f1e4] border border-[#d5d5d4] flex items-center justify-center text-[#2c2e2a] hover:text-[#25D366] transition shadow-2xs hover:scale-110 active:scale-95"
            >
              <FaWhatsapp className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://linkedin.com/company/gdgajce"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="w-8 h-8 rounded-full bg-white hover:bg-[#f5f1e4] border border-[#d5d5d4] flex items-center justify-center text-[#2c2e2a] hover:text-[#0A66C2] transition shadow-2xs hover:scale-110 active:scale-95"
            >
              <FaLinkedinIn className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://github.com/gdgajce"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="w-8 h-8 rounded-full bg-white hover:bg-[#f5f1e4] border border-[#d5d5d4] flex items-center justify-center text-[#2c2e2a] hover:text-black transition shadow-2xs hover:scale-110 active:scale-95"
            >
              <FaGithub className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://twitter.com/gdgajce"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter / X"
              className="w-8 h-8 rounded-full bg-white hover:bg-[#f5f1e4] border border-[#d5d5d4] flex items-center justify-center text-[#2c2e2a] hover:text-black transition shadow-2xs hover:scale-110 active:scale-95"
            >
              <FaXTwitter className="w-3 h-3" />
            </a>
            <a
              href="https://discord.gg"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Discord"
              className="w-8 h-8 rounded-full bg-white hover:bg-[#f5f1e4] border border-[#d5d5d4] flex items-center justify-center text-[#2c2e2a] hover:text-[#5865F2] transition shadow-2xs hover:scale-110 active:scale-95"
            >
              <FaDiscord className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. ANIMATED MASCOT: Positioned near the Right Corner (Not on top of form) */}
      {/* ========================================================================= */}
      <div className="mt-8 sm:mt-10 lg:mt-0 lg:absolute lg:right-8 xl:right-16 lg:bottom-16 z-20 flex justify-end">
        <div
          className="flex flex-col items-center sm:items-end cursor-pointer group select-none"
          onClick={handleMascotClick}
          title="Click me for confetti!"
        >
          {/* Dynamic Interactive Speech Bubble */}
          <motion.div
            key={mascotSpeech}
            initial={{ opacity: 0, scale: 0.88, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 25 }}
            className="relative z-30 mb-2 px-3.5 py-1.5 rounded-[18px] bg-white border border-[#d5d5d4] shadow-md text-[11px] sm:text-xs font-semibold text-[#2c2e2a] flex items-center gap-1.5 whitespace-nowrap hover:border-[#ff705d] transition-colors"
          >
            <span>{mascotSpeech}</span>
            <Sparkles className="w-3 h-3 text-[#ff705d]" />
            {/* Bubble arrow pointing towards the mascot */}
            <div className="absolute -bottom-1 right-8 sm:right-6 w-2.5 h-2.5 bg-white border-b border-r border-[#d5d5d4] rotate-45" />
          </motion.div>

          {/* 2D Animated Mascot Video / Image */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            whileHover={{ scale: 1.12, rotate: [0, -4, 4, 0] }}
            whileTap={{ scale: 0.94 }}
            className="relative w-[95px] sm:w-[115px] md:w-[130px] aspect-square"
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-contain pointer-events-none select-none"
            >
              <source src="/mascot.webm" type="video/webm; codecs=vp9" />
              <Image
                src="/mascot-animated.webp"
                alt="GDG AJCE Mascot"
                width={130}
                height={130}
                unoptimized
                priority
                className="w-full h-full object-contain pointer-events-none select-none"
              />
            </video>
          </motion.div>

          <span className="text-[10px] font-mono uppercase tracking-widest text-[#80827f] mt-1 text-center sm:text-right">
            Tap mascot for vibes ✨
          </span>
        </div>
      </div>

    </section>
  );
}
