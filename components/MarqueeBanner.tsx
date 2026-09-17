"use client";

import React from "react";

export default function MarqueeBanner() {
  const message = "GDG ON CAMPUS AJCE • BUILD WITH GOOGLE AI • CLOUD • ANDROID • OPEN SOURCE • REGISTER FOR UPCOMING HACKATHONS • ALL THINGS DEV • ";

  return (
    <div className="w-full bg-[#000000] text-[#ffffff] overflow-hidden whitespace-nowrap select-none py-2 z-50 border-b border-[#000000]">
      <div className="inline-flex animate-marquee">
        <span className="text-[12px] sm:text-[13px] font-bold uppercase tracking-[0.032em] px-4 font-sans">
          {message.repeat(8)}
        </span>
      </div>
    </div>
  );
}
