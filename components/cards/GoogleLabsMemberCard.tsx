"use client";

import React, { useId, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import { ExecomMember } from "@/lib/data/TeamData";
import CreativeProfileAvatar from "@/components/ui/CreativeProfileAvatar";

// Google Labs signature pastel/pop color palette from reference
const LABS_COLOR_PALETTE = [
  { bg: "#FF7D45", text: "#181818", border: "rgba(0,0,0,0.12)", badgeBg: "rgba(255,255,255,0.4)" }, // Coral Orange
  { bg: "#D4F53B", text: "#181818", border: "rgba(0,0,0,0.12)", badgeBg: "rgba(255,255,255,0.4)" }, // Electric Lime
  { bg: "#8C9EFF", text: "#181818", border: "rgba(0,0,0,0.12)", badgeBg: "rgba(255,255,255,0.4)" }, // Periwinkle Blue
  { bg: "#F8EC3B", text: "#181818", border: "rgba(0,0,0,0.12)", badgeBg: "rgba(255,255,255,0.4)" }, // Lemon Yellow
  { bg: "#FFAFF6", text: "#181818", border: "rgba(0,0,0,0.12)", badgeBg: "rgba(255,255,255,0.4)" }, // Candy Pink
  { bg: "#4E95F7", text: "#181818", border: "rgba(0,0,0,0.12)", badgeBg: "rgba(255,255,255,0.4)" }, // Sky Blue
];

/**
 * Returns smooth parametric SVG path data for 6 distinct organic shapes
 * matching Google Labs experiments visual language.
 */
export function getOrganicShapePath(shapeIndex: number): string {
  const steps = 120;
  let pathD = "";

  switch (shapeIndex % 6) {
    case 0: {
      // 14-wave Scalloped Rosette (Flower Badge)
      const numWaves = 14;
      const baseR = 40;
      const amp = 5.5;
      for (let i = 0; i <= steps; i++) {
        const theta = (i / steps) * Math.PI * 2;
        const r = baseR + amp * Math.cos(numWaves * theta);
        const x = 50 + Math.cos(theta) * r;
        const y = 50 + Math.sin(theta) * r;
        pathD += i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
      }
      break;
    }
    case 1: {
      // 4-Lobed Organic Clover
      const numWaves = 4;
      const baseR = 39;
      const amp = 7.5;
      for (let i = 0; i <= steps; i++) {
        const theta = (i / steps) * Math.PI * 2;
        const r = baseR + amp * Math.cos(numWaves * theta);
        const x = 50 + Math.cos(theta) * r;
        const y = 50 + Math.sin(theta) * r;
        pathD += i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
      }
      break;
    }
    case 2: {
      // Smooth Superellipse / Bulging TV Squircle
      for (let i = 0; i <= steps; i++) {
        const theta = (i / steps) * Math.PI * 2;
        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);
        const x = 50 + 44 * Math.sign(cosT) * Math.pow(Math.abs(cosT), 0.65);
        const y = 50 + 44 * Math.sign(sinT) * Math.pow(Math.abs(sinT), 0.65);
        pathD += i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
      }
      break;
    }
    case 3: {
      // 10-Wave Smooth Scalloped Bloom (Balanced 1:1 portrait frame)
      const numWaves = 10;
      const baseR = 41;
      const amp = 5;
      for (let i = 0; i <= steps; i++) {
        const theta = (i / steps) * Math.PI * 2;
        const r = baseR + amp * Math.cos(numWaves * theta);
        const x = 50 + Math.cos(theta) * r;
        const y = 50 + Math.sin(theta) * r;
        pathD += i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
      }
      break;
    }
    case 4: {
      // 8-Petal Scallop Starburst
      const numWaves = 8;
      const baseR = 40;
      const amp = 6;
      for (let i = 0; i <= steps; i++) {
        const theta = (i / steps) * Math.PI * 2;
        const r = baseR + amp * Math.cos(numWaves * theta);
        const x = 50 + Math.cos(theta) * r;
        const y = 50 + Math.sin(theta) * r;
        pathD += i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
      }
      break;
    }
    case 5: {
      // 6-Petal Daisy Flower
      const numWaves = 6;
      const baseR = 40;
      const amp = 7;
      for (let i = 0; i <= steps; i++) {
        const theta = (i / steps) * Math.PI * 2;
        const r = baseR + amp * Math.cos(numWaves * theta);
        const x = 50 + Math.cos(theta) * r;
        const y = 50 + Math.sin(theta) * r;
        pathD += i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
      }
      break;
    }
  }

  pathD += " Z";
  return pathD;
}

interface GoogleLabsMemberCardProps {
  member: ExecomMember;
  index: number;
}

export default function GoogleLabsMemberCard({ member, index }: GoogleLabsMemberCardProps) {
  const uniqueId = useId().replace(/[:]/g, "_");
  const clipId = `labs_clip_${uniqueId}_${index}`;
  const [imgError, setImgError] = useState(false);

  const palette = LABS_COLOR_PALETTE[index % LABS_COLOR_PALETTE.length];
  const pathD = getOrganicShapePath(index);
  const displayImage = member.image;

  const profileUrl = member.username
    ? `/team/${member.username}`
    : `/team/${encodeURIComponent(member.name.toLowerCase().replace(/\s+/g, "-"))}`;

  const linkedinUrl = member.linkedin || (member.username ? `https://www.linkedin.com/in/${member.username}` : undefined);
  const githubUrl = member.github || (member.username ? `https://github.com/${member.username}` : undefined);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: (index % 6) * 0.06 }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className="group relative flex flex-col justify-between rounded-[32px] sm:rounded-[36px] p-5 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-300 select-none overflow-hidden"
      style={{
        backgroundColor: palette.bg,
        color: palette.text,
      }}
    >
      {/* TOP: ORGANIC SHAPE WINDOW CONTAINING PHOTO */}
      <div className="relative w-full aspect-square max-w-[240px] mx-auto flex items-center justify-center">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-md transition-transform duration-500 group-hover:scale-[1.03]"
        >
          <defs>
            <clipPath id={clipId}>
              <path d={pathD} />
            </clipPath>
          </defs>

          {/* Underlay Shape Fill */}
          <path
            d={pathD}
            fill="#ffffff"
            className="transition-colors"
          />

          {/* Demo Image clipped to organic shape */}
          {displayImage && !imgError ? (
            <image
              href={displayImage}
              x="0"
              y="0"
              width="100"
              height="100"
              preserveAspectRatio="xMidYMid slice"
              clipPath={`url(#${clipId})`}
              onError={() => setImgError(true)}
            />
          ) : (
            // Storybook Character Illustration Fallback
            <foreignObject x="0" y="0" width="100" height="100" clipPath={`url(#${clipId})`}>
              <div className="w-full h-full">
                <CreativeProfileAvatar
                  src={null}
                  name={member.name}
                  variant={index}
                  size="custom"
                  showBorder={false}
                  className="w-full h-full rounded-none"
                />
              </div>
            </foreignObject>
          )}

          {/* Crisp organic boundary outline */}
          <path
            d={pathD}
            fill="none"
            stroke="rgba(0, 0, 0, 0.18)"
            strokeWidth="1.25"
          />
        </svg>

        {/* Small subtle role pill floating on top-right of shape */}
        {member.dept && (
          <div className="absolute top-1 right-1 px-2.5 py-0.5 rounded-full bg-white/85 backdrop-blur-md border border-black/10 text-[10px] font-mono font-semibold text-black shadow-xs">
            {member.dept}
          </div>
        )}
      </div>

      {/* MIDDLE: MEMBER DETAILS */}
      <div className="pt-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase font-bold tracking-wider text-black/70 mb-1">
            <Sparkles className="w-3 h-3 text-black/80" />
            <span>{member.role}</span>
          </div>

          <h3 className="text-[19px] sm:text-[21px] font-bold text-[#141414] tracking-tight leading-tight line-clamp-1">
            {member.name}
          </h3>

          <p className="text-[12.5px] sm:text-[13px] text-black/75 font-normal leading-snug line-clamp-2 mt-1.5 min-h-[36px]">
            {member.track}
          </p>
        </div>

        {/* BOTTOM: ACTION ROW (View Profile + LinkedIn + GitHub) */}
        <div className="pt-4 mt-2 flex items-center justify-between gap-2">
          <Link
            href={profileUrl}
            className="group/btn inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full border border-black/80 bg-black/5 hover:bg-black hover:text-white text-black text-xs font-medium transition-all duration-200 active:scale-95 shadow-xs"
          >
            <span>View Profile</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
          </Link>

          <div className="flex items-center gap-1.5">
            {linkedinUrl && (
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={`${member.name} on LinkedIn`}
                aria-label={`${member.name} on LinkedIn`}
                className="w-7 h-7 rounded-full border border-black/70 bg-black/5 hover:bg-black hover:text-white text-black/80 flex items-center justify-center transition-all duration-200 active:scale-95 shadow-xs"
              >
                <FaLinkedin className="w-3.5 h-3.5" />
              </a>
            )}
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={`${member.name} on GitHub`}
                aria-label={`${member.name} on GitHub`}
                className="w-7 h-7 rounded-full border border-black/70 bg-black/5 hover:bg-black hover:text-white text-black/80 flex items-center justify-center transition-all duration-200 active:scale-95 shadow-xs"
              >
                <FaGithub className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
