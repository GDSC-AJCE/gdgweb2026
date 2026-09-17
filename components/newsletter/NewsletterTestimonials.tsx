"use client";

import React from "react";
import { motion } from "framer-motion";
import { Quote, Star, MessageSquare } from "lucide-react";

export default function NewsletterTestimonials() {
  const testimonials = [
    {
      quote: "The Cloud Run with GPU write-up in Issue #1 gave our team the exact blueprint we needed for our final-year project backend without bankrupting our student budget.",
      author: "Rahul M.",
      batch: "S7 CSE • Amal Jyothi",
      tag: "Cloud & AI Track",
      color: "#4285F4"
    },
    {
      quote: "Most tech newsletters dump 40 links with zero context. Tech Pulse gives 4 focused breakdowns with actual code snippets. It takes 4 minutes during morning bus travel.",
      author: "Ananya S.",
      batch: "S5 CSE • Amal Jyothi",
      tag: "Mobile & Web Track",
      color: "#34A853"
    },
    {
      quote: "The Firebase Genkit walkthrough saved our team at least two days of trial-and-error during the DevFest hackathon prep. Highly recommended!",
      author: "Kevin Thomas",
      batch: "S7 ECE • Amal Jyothi",
      tag: "Open Source Track",
      color: "#EA4335"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#d5d5d4] text-[11px] font-semibold text-[#8ed462] mb-2 shadow-2xs">
            <MessageSquare className="w-3 h-3 text-[#34A853]" />
            <span className="text-[#2c2e2a]">Community Voices</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#2c2e2a] tracking-tight">
            Loved By Campus Developers
          </h2>
        </div>
        <div className="flex items-center gap-1 text-xs text-[#80827f]">
          <div className="flex text-[#FBBC04]">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-[#FBBC04]" />
            ))}
          </div>
          <span className="font-semibold text-[#2c2e2a] ml-1">4.9/5</span>
          <span>from 180+ readers</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {testimonials.map((item, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="bg-[#ffffff] border border-[#d5d5d4] rounded-[28px] p-6 flex flex-col justify-between shadow-xs hover:border-[#2c2e2a]/30 transition"
          >
            <div className="space-y-3">
              <Quote className="w-6 h-6 text-[#d5d5d4]" />
              <p className="text-xs sm:text-sm text-[#2c2e2a] leading-relaxed font-normal">
                "{item.quote}"
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-[#f5f1e4] flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#2c2e2a]">{item.author}</p>
                <p className="text-[11px] text-[#80827f]">{item.batch}</p>
              </div>
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full font-mono"
                style={{ backgroundColor: `${item.color}15`, color: item.color }}
              >
                {item.tag}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
