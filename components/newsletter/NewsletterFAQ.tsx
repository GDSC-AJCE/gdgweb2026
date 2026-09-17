"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

export default function NewsletterFAQ() {
  const faqs: FAQItem[] = [
    {
      question: "When does the newsletter get delivered?",
      answer: "Every Monday at 9:00 AM IST. It is formatted specifically as a 4-minute read so you can absorb the most important updates over morning coffee or on your commute to college."
    },
    {
      question: "Is there any cost or subscription fee?",
      answer: "None at all. GDG Tech Pulse is 100% free and open to everyone—whether you are a student at Amal Jyothi, an alumnus, or a developer from anywhere across the globe."
    },
    {
      question: "Can I customize which topics I receive?",
      answer: "Yes! You can toggle any combination of our 5 tracks (AI & Machine Learning, Cloud & DevOps, Web & Mobile, Open Source, and Campus Codelabs) directly on the signup form, or update your preferences at any time."
    },
    {
      question: "How do I unsubscribe if I change my mind?",
      answer: "Every single email includes an immediate 1-click unsubscribe link at the bottom. No dark patterns, no confirmations, and no spam."
    },
    {
      question: "Can I submit our campus project or student research to be featured?",
      answer: "Absolutely! We love spotlighting student innovations from AJCE. Simply reply directly to any newsletter email or connect with the GDG core team on campus."
    }
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="space-y-6">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#d5d5d4] text-[11px] font-semibold text-[#2c2e2a] shadow-2xs">
          <HelpCircle className="w-3 h-3 text-[#4285F4]" />
          <span>Frequently Asked Questions</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#2c2e2a] tracking-tight">
          Everything You Need to Know
        </h2>
      </div>

      <div className="max-w-2xl mx-auto space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-white border border-[#d5d5d4] rounded-[24px] overflow-hidden transition-all duration-200 shadow-2xs"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-[15px] text-[#2c2e2a] cursor-pointer hover:text-[#4285F4] transition"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#80827f] shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-[#2c2e2a]" : ""
                  }`}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-[#80827f] leading-relaxed border-t border-[#f5f1e4]">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
