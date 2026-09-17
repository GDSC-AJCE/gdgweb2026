"use client";

import { useState, useEffect, useRef } from "react";
import { doc, setDoc, collectionGroup, query, where, getDocs, updateDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { User, updateProfile, signOut } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { normalizeUrl, toTitleCase } from "@/lib/utils";
import { isAdminEmail } from "@/lib/constants";
import { FaGithub, FaLinkedin, FaInstagram, FaGlobe } from "react-icons/fa6";
import { 
  Sparkles, 
  User as UserIcon, 
  Phone, 
  Building2, 
  GraduationCap, 
  Link2, 
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  Check,
  Calendar,
  School,
  Code,
  Laptop,
  Layers,
  ShieldCheck,
  LogOut
} from "lucide-react";
import GDGLogoMark from "./ui/GDGLogoMark";
import { useAuth } from "@/context/AuthContext";
import { 
  YellowHexagon, 
  BlueWavyRosette, 
  LimeClover, 
  CoralDonut, 
  DaisyStarburst, 
  PaperCutCloud, 
  SmallCloud 
} from "./shapes/GoogleLabsShapes";

type OnboardingStep = "welcome" | "name" | "contact" | "college" | "academic" | "presence" | "review";

const DEPARTMENTS = [
  "Computer Science & Engineering",
  "Information Technology",
  "Artificial Intelligence and Data Science",
  "Electronics and Communication Engineering",
  "Electrical and Electronics Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "BCA / MCA",
  "Other"
];

const COLLEGES = [
  "Amal Jyothi College of Engineering",
  "Other"
];

export default function Onboarding({ user }: { user: User }) {
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [fullName, setFullName] = useState(() => {
    const rawName = user.displayName || "";
    return rawName.split(/\s+/).filter(word => !/[0-9-]/.test(word)).join(" ").trim();
  });
  const [countryCode, setCountryCode] = useState("91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [college, setCollege] = useState("Amal Jyothi College of Engineering");
  const [otherCollege, setOtherCollege] = useState("");
  const [dept, setDept] = useState("");
  const [otherDept, setOtherDept] = useState("");
  const [gradYear, setGradYear] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [instagram, setInstagram] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);

  const deptDropdownRef = useRef<HTMLDivElement>(null);

  const { logOut } = useAuth();
  const [exiting, setExiting] = useState(false);

  const handleExitAndSwitchAccount = async () => {
    if (exiting) return;
    setExiting(true);
    try {
      if (logOut) {
        await logOut();
      }
      await signOut(auth);
    } catch (err) {
      console.error("Sign out error:", err);
      try {
        await signOut(auth);
      } catch (fallbackErr) {
        console.error("Direct signOut error:", fallbackErr);
      }
    } finally {
      window.location.href = "/";
    }
  };

  const steps: OnboardingStep[] = ["welcome", "name", "contact", "college", "academic", "presence", "review"];
  const currentStepIndex = steps.indexOf(step);
  const progressRatio = Math.max(0.14, (currentStepIndex + 1) / steps.length);

  // Close department dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (deptDropdownRef.current && !deptDropdownRef.current.contains(event.target as Node)) {
        setShowDeptDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const nextStep = () => {
    if (step === "name" && !fullName.trim()) return;
    if (step === "contact" && (!phoneNumber.trim() || phoneNumber.length < 10)) return;
    if (step === "college" && college === "Other" && !otherCollege.trim()) return;
    if (step === "academic" && (!dept || !gradYear || (dept === "Other" && !otherDept.trim()))) return;

    if (currentStepIndex < steps.length - 1) {
      setStep(steps[currentStepIndex + 1]);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setStep(steps[currentStepIndex - 1]);
    }
  };

  const skipPresence = () => {
    setStep("review");
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    const finalCollege = college === "Other" ? otherCollege : college;
    const finalDept = dept === "Other" ? otherDept : dept;
    const fullPhone = `+${countryCode} ${phoneNumber.trim()}`;

    const socialLinks = {
      github: normalizeUrl(github),
      linkedin: normalizeUrl(linkedin),
      instagram: normalizeUrl(instagram),
      portfolio: normalizeUrl(portfolio)
    };

    confetti({
      particleCount: 130,
      spread: 85,
      origin: { y: 0.55 },
      colors: ["#4285F4", "#EA4335", "#FBBC04", "#34A853"]
    });

    try {
      const titleCaseName = toTitleCase(fullName);
      await updateProfile(user, { displayName: titleCaseName });

      const userEmail = user.email ? user.email.toLowerCase() : "";

      await setDoc(
        doc(db, "users", user.uid),
        {
          fullName: titleCaseName,
          displayName: titleCaseName,
          name: titleCaseName,
          department: finalDept,
          graduationYear: parseInt(gradYear) || 2026,
          phoneNumber: fullPhone,
          college: finalCollege,
          email: user.email,
          uid: user.uid,
          photoURL: user.photoURL,
          role: isAdminEmail(userEmail) ? "admin" : "member",
          is_admin: isAdminEmail(userEmail),
          isAdmin: isAdminEmail(userEmail),
          socialLinks,
          onboardingCompleted: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        { merge: true }
      );

      // Link any prior manual event registrations
      if (userEmail) {
        const partsQ = query(
          collectionGroup(db, "participants"),
          where("email", "==", userEmail),
          where("userId", "==", "manual")
        );
        const partsSnap = await getDocs(partsQ);
        await Promise.all(
          partsSnap.docs.map(docSnap => updateDoc(docSnap.ref, { userId: user.uid }))
        );

        // Link any prior manual certificates
        const certsQ = query(
          collectionGroup(db, "issuedCertificates"),
          where("recipientEmail", "==", userEmail),
          where("userId", "==", "manual")
        );
        const certsSnap = await getDocs(certsQ);
        await Promise.all(
          certsSnap.docs.map(docSnap => updateDoc(docSnap.ref, { userId: user.uid }))
        );
      }
    } catch (error) {
      console.error("Onboarding error:", error);
      setSubmitting(false);
    }
  };

  // Continuous organic horizontal wavy path across the canvas
  const horizontalWavePath = "M -80,220 C 180,120 380,310 700,210 C 1020,110 1220,300 1680,190";
  const horizontalWavePath2 = "M -80,250 C 200,160 400,340 720,240 C 1040,140 1240,330 1680,220";

  return (
    <div className="relative min-h-screen w-full bg-[#f5f1e4] text-[#2c2e2a] flex flex-col justify-between items-center py-6 sm:py-10 px-4 overflow-x-hidden overflow-y-auto">
      
      {/* 1. ATTRACTIVE STORYBOOK BACKGROUND ELEMENTS */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none">
        {/* Soft Ambient Google Glows */}
        <div className="absolute top-1/4 left-1/4 w-[480px] h-[480px] bg-[#4285F4]/6 rounded-full blur-[150px] -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-[480px] h-[480px] bg-[#34A853]/6 rounded-full blur-[150px] -z-10" />
        <div className="absolute top-2/3 left-1/3 w-[380px] h-[380px] bg-[#FBBC04]/5 rounded-full blur-[130px] -z-10" />

        {/* Floating Paper-Cut Storybook Clouds */}
        <div className="absolute top-8 left-6 hidden lg:block opacity-65">
          <PaperCutCloud scale={1} />
        </div>
        <div className="absolute bottom-12 right-8 hidden lg:block opacity-55">
          <SmallCloud />
        </div>

        {/* Google Labs Organic Geometries framing the edges */}
        <div className="absolute top-16 right-12 hidden md:block opacity-75">
          <DaisyStarburst />
        </div>
        <div className="absolute bottom-20 left-12 hidden md:block opacity-70">
          <BlueWavyRosette />
        </div>
        <div className="absolute top-1/2 left-8 -translate-y-1/2 hidden xl:block opacity-55">
          <LimeClover />
        </div>
        <div className="absolute top-1/2 right-8 -translate-y-1/2 hidden xl:block opacity-60">
          <CoralDonut />
        </div>
      </div>

      {/* 2. CONTINUOUS HORIZONTAL LINE ANIMATION THROUGHOUT THE SECTIONS */}
      <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center overflow-hidden select-none">
        <svg
          className="w-full h-[420px] overflow-visible select-none opacity-90"
          viewBox="0 0 1600 420"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Brand continuous horizontal gradient */}
            <linearGradient id="horizontalBrandGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2ba0ff" />
              <stop offset="30%" stopColor="#ff705d" />
              <stop offset="68%" stopColor="#ffd600" />
              <stop offset="100%" stopColor="#8ed462" />
            </linearGradient>

            {/* Soft glow filter for the horizontal stroke */}
            <filter id="softHorizontalGlow" x="-20%" y="-30%" width="140%" height="160%">
              <feGaussianBlur stdDeviation="7" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Faint dashed secondary wave guide rail */}
          <path
            d={horizontalWavePath2}
            fill="none"
            stroke="#2c2e2a"
            strokeWidth={3}
            strokeDasharray="10 14"
            strokeOpacity={0.06}
            strokeLinecap="round"
          />

          {/* Faint dashed primary guide rail */}
          <path
            d={horizontalWavePath}
            fill="none"
            stroke="#2c2e2a"
            strokeWidth={3}
            strokeDasharray="10 14"
            strokeOpacity={0.08}
            strokeLinecap="round"
          />

          {/* Primary Continuous Horizontal Animated Line */}
          <motion.path
            d={horizontalWavePath}
            fill="none"
            stroke="url(#horizontalBrandGradient)"
            strokeWidth={7.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#softHorizontalGlow)"
            initial={{ pathLength: 0.14 }}
            animate={{ pathLength: progressRatio }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* Inner crisp stroke for definition */}
          <motion.path
            d={horizontalWavePath}
            fill="none"
            stroke="url(#horizontalBrandGradient)"
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0.14 }}
            animate={{ pathLength: progressRatio }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>
      </div>

      {/* Top Header Navigation Pill */}
      <div className="relative z-10 w-full max-w-[480px] flex items-center justify-between pb-2 gap-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[50px] bg-[#ffffff] border border-[#d5d5d4] text-[13px] font-medium text-[#2c2e2a] shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[#8ed462]" />
          <span>GDG on Campus</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[50px] bg-[#ffffff] border border-[#d5d5d4] text-xs font-mono text-[#80827f] shadow-xs">
            <span>{currentStepIndex + 1}</span>
            <span className="text-[#d5d5d4]">/</span>
            <span>{steps.length}</span>
          </div>

          {/* Exit & Switch Account Pill Button */}
          <button
            type="button"
            onClick={handleExitAndSwitchAccount}
            disabled={exiting}
            className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[50px] bg-[#ffffff] hover:bg-[#eae5d7] text-xs font-medium text-[#80827f] hover:text-[#EA4335] border border-[#d5d5d4] transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
            title={`Signed in as ${user.email}. Click to sign out.`}
          >
            <LogOut className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>{exiting ? "Exiting..." : "Exit / Switch"}</span>
          </button>
        </div>
      </div>

      {/* SINGLE CLEAN CARD (rounded-[36px], pure white #ffffff, border #e5e1d5) */}
      <div className="relative z-10 w-full max-w-[480px] bg-[#ffffff] border border-[#e5e1d5] rounded-[36px] p-7 sm:p-9 shadow-xs my-auto">
        
        {/* Step Progress Dots in Card Header */}
        <div className="flex items-center justify-between pb-5 mb-6 border-b border-[#e5e1d5]">
          <div className="flex items-center gap-2.5">
            <div className="p-1 rounded-[12px] bg-[#f5f1e4] border border-[#d5d5d4] flex items-center justify-center">
              <GDGLogoMark size="sm" />
            </div>
            <span className="text-xs font-mono uppercase tracking-wider text-[#80827f]">Member Enrollment</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            {steps.map((s, idx) => (
              <span
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStepIndex
                    ? "w-4 bg-[#ff705d]"
                    : idx < currentStepIndex
                    ? "w-1.5 bg-[#8ed462]"
                    : "w-1.5 bg-[#d5d5d4]"
                }`}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          
          {/* 1. WELCOME STEP */}
          {step === "welcome" && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-6"
            >
              <div className="w-12 h-12 rounded-[20px] bg-[#f5f1e4] border border-[#d5d5d4] flex items-center justify-center text-[#ff705d]">
                <Sparkles className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-[#2c2e2a] tracking-tight">
                  Welcome to GDG AJCE
                </h2>
                <p className="text-[#80827f] text-sm leading-relaxed">
                  Join our developer community at Amal Jyothi College of Engineering. Activate your official member credentials in under a minute.
                </p>
              </div>

              {/* Feature Highlights with Proper Icons */}
              <div className="p-4 rounded-[28px] bg-[#f5f1e4] border border-[#d5d5d4] space-y-2.5 text-xs text-[#80827f]">
                <div className="flex items-center gap-2.5 text-[#2c2e2a] font-medium">
                  <div className="w-6 h-6 rounded-full bg-white border border-[#d5d5d4] flex items-center justify-center text-[#2ba0ff] shrink-0">
                    <Laptop className="w-3.5 h-3.5" />
                  </div>
                  <span>Hands-on workshops, hackathons & technical labs</span>
                </div>
                <div className="flex items-center gap-2.5 text-[#2c2e2a] font-medium">
                  <div className="w-6 h-6 rounded-full bg-white border border-[#d5d5d4] flex items-center justify-center text-[#8ed462] shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span>Verified credentials & event participation badges</span>
                </div>
              </div>

              <button
                onClick={nextStep}
                type="button"
                className="group w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-[50px] bg-[#ff705d] hover:bg-[#ee6350] text-[#ffffff] text-sm font-medium transition-all shadow-xs cursor-pointer active:scale-[0.99]"
              >
                <span>Get Started</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#ffffff] transition-all duration-300 group-hover:scale-125" />
              </button>
            </motion.div>
          )}

          {/* 2. NAME STEP */}
          {step === "name" && (
            <motion.div
              key="name"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-6"
            >
              <div className="w-12 h-12 rounded-[20px] bg-[#f5f1e4] border border-[#d5d5d4] flex items-center justify-center text-[#2ba0ff]">
                <UserIcon className="w-6 h-6" />
              </div>

              <div className="space-y-1.5">
                <h2 className="text-2xl font-semibold text-[#2c2e2a] tracking-tight">
                  What is your full name?
                </h2>
                <p className="text-[#80827f] text-xs">
                  This will be printed on official event certificates and member records.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center bg-[#ffffff] border border-[#d5d5d4] hover:border-[#2c2e2a]/40 focus-within:border-[#2c2e2a] rounded-[28px] px-4 py-3 gap-3 transition-all shadow-xs">
                  <div className="w-7 h-7 rounded-full bg-[#f5f1e4] flex items-center justify-center text-[#80827f] shrink-0">
                    <UserIcon className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && nextStep()}
                    placeholder="e.g. Alex Morgan"
                    autoFocus
                    className="flex-1 bg-transparent text-sm font-medium text-[#2c2e2a] outline-none placeholder-[#80827f]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={prevStep}
                  className="inline-flex items-center justify-center px-5 py-3 rounded-[50px] bg-[#ffffff] hover:bg-[#eae5d7] text-[#2c2e2a] text-sm font-medium border border-[#d5d5d4] transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!fullName.trim()}
                  className="group flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[50px] bg-[#2c2e2a] hover:bg-[#1f201d] disabled:opacity-50 text-[#ffffff] text-sm font-medium transition-all shadow-xs cursor-pointer active:scale-[0.99]"
                >
                  <span>Continue</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#8ed462] transition-all duration-300 group-hover:scale-125" />
                </button>
              </div>
            </motion.div>
          )}

          {/* 3. CONTACT STEP */}
          {step === "contact" && (
            <motion.div
              key="contact"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-6"
            >
              <div className="w-12 h-12 rounded-[20px] bg-[#f5f1e4] border border-[#d5d5d4] flex items-center justify-center text-[#8ed462]">
                <Phone className="w-6 h-6" />
              </div>

              <div className="space-y-1.5">
                <h2 className="text-2xl font-semibold text-[#2c2e2a] tracking-tight">
                  Your contact number
                </h2>
                <p className="text-[#80827f] text-xs">
                  For WhatsApp community updates and event coordination.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center bg-[#ffffff] border border-[#d5d5d4] hover:border-[#2c2e2a]/40 focus-within:border-[#2c2e2a] rounded-[28px] px-3.5 py-2.5 gap-2.5 transition-all shadow-xs">
                  <div className="w-7 h-7 rounded-full bg-[#f5f1e4] flex items-center justify-center text-[#34A853] shrink-0">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <span className="px-3 py-1 rounded-[50px] bg-[#f5f1e4] border border-[#d5d5d4] text-xs font-mono font-bold text-[#2c2e2a] shrink-0 select-none">
                    +{countryCode}
                  </span>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ""))}
                    onKeyDown={(e) => e.key === "Enter" && nextStep()}
                    placeholder="9876543210"
                    maxLength={10}
                    autoFocus
                    className="flex-1 bg-transparent text-sm font-medium text-[#2c2e2a] outline-none placeholder-[#80827f]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={prevStep}
                  className="inline-flex items-center justify-center px-5 py-3 rounded-[50px] bg-[#ffffff] hover:bg-[#eae5d7] text-[#2c2e2a] text-sm font-medium border border-[#d5d5d4] transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!phoneNumber.trim() || phoneNumber.length < 10}
                  className="group flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[50px] bg-[#2c2e2a] hover:bg-[#1f201d] disabled:opacity-50 text-[#ffffff] text-sm font-medium transition-all shadow-xs cursor-pointer active:scale-[0.99]"
                >
                  <span>Continue</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#8ed462] transition-all duration-300 group-hover:scale-125" />
                </button>
              </div>
            </motion.div>
          )}

          {/* 4. CAMPUS STEP */}
          {step === "college" && (
            <motion.div
              key="college"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-6"
            >
              <div className="w-12 h-12 rounded-[20px] bg-[#f5f1e4] border border-[#d5d5d4] flex items-center justify-center text-[#ffd600]">
                <Building2 className="w-6 h-6" />
              </div>

              <div className="space-y-1.5">
                <h2 className="text-2xl font-semibold text-[#2c2e2a] tracking-tight">
                  Your campus
                </h2>
                <p className="text-[#80827f] text-xs">
                  Select your current educational institution.
                </p>
              </div>

              <div className="space-y-2.5">
                {COLLEGES.map((c) => {
                  const isSelected = college === c;
                  const isHost = c === "Amal Jyothi College of Engineering";
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCollege(c)}
                      className={`w-full p-4 rounded-[28px] border text-left transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? "bg-[#2c2e2a] text-[#ffffff] border-[#2c2e2a] shadow-xs"
                          : "bg-[#ffffff] border-[#d5d5d4] hover:bg-[#f5f1e4] text-[#2c2e2a]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          isSelected ? "bg-white/10 text-white" : "bg-[#f5f1e4] text-[#2c2e2a]"
                        }`}>
                          {isHost ? <Building2 className="w-4 h-4" /> : <School className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{c}</p>
                          <p className={`text-xs ${isSelected ? "text-gray-300" : "text-[#80827f]"}`}>
                            {isHost ? "Host Chapter Campus" : "External Institution"}
                          </p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        isSelected ? "border-white bg-[#8ed462] text-[#2c2e2a]" : "border-[#d5d5d4]"
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}

                {college === "Other" && (
                  <div className="flex items-center bg-[#ffffff] border border-[#d5d5d4] hover:border-[#2c2e2a]/40 focus-within:border-[#2c2e2a] rounded-[28px] px-4 py-3 gap-2.5 transition-all shadow-xs">
                    <School className="w-4 h-4 text-[#80827f] shrink-0" />
                    <input
                      type="text"
                      value={otherCollege}
                      onChange={(e) => setOtherCollege(e.target.value)}
                      placeholder="Enter campus / college name"
                      className="flex-1 bg-transparent text-sm font-medium text-[#2c2e2a] outline-none placeholder-[#80827f]"
                      autoFocus
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={prevStep}
                  className="inline-flex items-center justify-center px-5 py-3 rounded-[50px] bg-[#ffffff] hover:bg-[#eae5d7] text-[#2c2e2a] text-sm font-medium border border-[#d5d5d4] transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={college === "Other" && !otherCollege.trim()}
                  className="group flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[50px] bg-[#2c2e2a] hover:bg-[#1f201d] disabled:opacity-50 text-[#ffffff] text-sm font-medium transition-all shadow-xs cursor-pointer active:scale-[0.99]"
                >
                  <span>Continue</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ffd600] transition-all duration-300 group-hover:scale-125" />
                </button>
              </div>
            </motion.div>
          )}

          {/* 5. ACADEMIC STEP */}
          {step === "academic" && (
            <motion.div
              key="academic"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-6"
            >
              <div className="w-12 h-12 rounded-[20px] bg-[#f5f1e4] border border-[#d5d5d4] flex items-center justify-center text-[#ff705d]">
                <GraduationCap className="w-6 h-6" />
              </div>

              <div className="space-y-1.5">
                <h2 className="text-2xl font-semibold text-[#2c2e2a] tracking-tight">
                  Academic details
                </h2>
                <p className="text-[#80827f] text-xs">
                  Your engineering discipline and expected graduation year.
                </p>
              </div>

              <div className="space-y-3">
                {/* Department dropdown */}
                <div className="relative" ref={deptDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowDeptDropdown(!showDeptDropdown)}
                    className="w-full flex items-center justify-between bg-[#ffffff] border border-[#d5d5d4] hover:border-[#2c2e2a]/40 rounded-[28px] px-4 py-3 text-left text-sm font-medium text-[#2c2e2a] transition-all cursor-pointer shadow-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <GraduationCap className="w-4 h-4 text-[#80827f] shrink-0" />
                      <span className={dept ? "text-[#2c2e2a] font-semibold" : "text-[#80827f]"}>
                        {dept || "Select Department Track"}
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-[#80827f] transition-transform duration-200 ${showDeptDropdown ? "rotate-180" : ""}`} />
                  </button>

                  {showDeptDropdown && (
                    <div 
                      data-lenis-prevent="true"
                      onWheel={(e) => e.stopPropagation()}
                      onTouchMove={(e) => e.stopPropagation()}
                      className="absolute top-full mt-2 left-0 right-0 max-h-60 overflow-y-auto overscroll-contain bg-[#ffffff] border border-[#d5d5d4] rounded-[28px] p-2 z-50 shadow-lg space-y-1 touch-pan-y"
                      style={{ 
                        scrollbarWidth: "thin", 
                        scrollbarColor: "#d5d5d4 transparent",
                        WebkitOverflowScrolling: "touch"
                      }}
                    >
                      {DEPARTMENTS.map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => {
                            setDept(d);
                            setShowDeptDropdown(false);
                          }}
                          className={`w-full px-3.5 py-2.5 rounded-[20px] text-left text-xs font-semibold transition cursor-pointer flex items-center justify-between ${
                            dept === d ? "bg-[#2c2e2a] text-white" : "text-[#2c2e2a] hover:bg-[#f5f1e4]"
                          }`}
                        >
                          <span>{d}</span>
                          {dept === d && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {dept === "Other" && (
                  <div className="flex items-center bg-[#ffffff] border border-[#d5d5d4] hover:border-[#2c2e2a]/40 focus-within:border-[#2c2e2a] rounded-[28px] px-4 py-3 gap-2.5 transition-all shadow-xs">
                    <Code className="w-4 h-4 text-[#80827f] shrink-0" />
                    <input
                      type="text"
                      value={otherDept}
                      onChange={(e) => setOtherDept(e.target.value)}
                      placeholder="Specify department name"
                      className="flex-1 bg-transparent text-sm font-medium text-[#2c2e2a] outline-none placeholder-[#80827f]"
                      autoFocus
                    />
                  </div>
                )}

                {/* Graduation Year */}
                <div className="flex items-center bg-[#ffffff] border border-[#d5d5d4] hover:border-[#2c2e2a]/40 focus-within:border-[#2c2e2a] rounded-[28px] px-4 py-3 gap-2.5 transition-all shadow-xs">
                  <Calendar className="w-4 h-4 text-[#80827f] shrink-0" />
                  <input
                    type="number"
                    value={gradYear}
                    onChange={(e) => setGradYear(e.target.value)}
                    placeholder="Graduation Year (e.g. 2027)"
                    min={2020}
                    max={2035}
                    className="flex-1 bg-transparent text-sm font-medium text-[#2c2e2a] outline-none placeholder-[#80827f]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={prevStep}
                  className="inline-flex items-center justify-center px-5 py-3 rounded-[50px] bg-[#ffffff] hover:bg-[#eae5d7] text-[#2c2e2a] text-sm font-medium border border-[#d5d5d4] transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!dept || !gradYear || (dept === "Other" && !otherDept.trim())}
                  className="group flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[50px] bg-[#2c2e2a] hover:bg-[#1f201d] disabled:opacity-50 text-[#ffffff] text-sm font-medium transition-all shadow-xs cursor-pointer active:scale-[0.99]"
                >
                  <span>Continue</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff705d] transition-all duration-300 group-hover:scale-125" />
                </button>
              </div>
            </motion.div>
          )}

          {/* 6. ONLINE PRESENCE STEP (With Dual "Skip For Now" Options) */}
          {step === "presence" && (
            <motion.div
              key="presence"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-5"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-[20px] bg-[#f5f1e4] border border-[#d5d5d4] flex items-center justify-center text-[#2ba0ff]">
                  <Link2 className="w-6 h-6" />
                </div>

                {/* Option 1: Top Skip Button in Header */}
                <button
                  type="button"
                  onClick={skipPresence}
                  className="text-xs font-medium text-[#80827f] hover:text-[#2c2e2a] px-3 py-1.5 rounded-[50px] hover:bg-[#f5f1e4] transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>Skip for now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl font-semibold text-[#2c2e2a] tracking-tight">
                  Developer links
                </h2>
                <p className="text-[#80827f] text-xs">
                  Optional · Showcase your GitHub, LinkedIn, or portfolio.
                </p>
              </div>

              {/* Clean inline flex groups with website icons only (No URL extension prefix) */}
              <div className="space-y-2.5 pt-1">
                {/* GitHub */}
                <div className="flex items-center bg-[#ffffff] border border-[#d5d5d4] hover:border-[#2c2e2a]/40 focus-within:border-[#2c2e2a] rounded-[28px] px-3.5 py-2.5 gap-2.5 transition-all shadow-xs">
                  <div className="w-7 h-7 rounded-full bg-[#2c2e2a] flex items-center justify-center text-white shrink-0 shadow-xs">
                    <FaGithub className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="GitHub"
                    className="flex-1 bg-transparent text-sm font-medium text-[#2c2e2a] outline-none placeholder-[#80827f]"
                  />
                </div>

                {/* LinkedIn */}
                <div className="flex items-center bg-[#ffffff] border border-[#d5d5d4] hover:border-[#2c2e2a]/40 focus-within:border-[#2c2e2a] rounded-[28px] px-3.5 py-2.5 gap-2.5 transition-all shadow-xs">
                  <div className="w-7 h-7 rounded-full bg-[#0A66C2] flex items-center justify-center text-white shrink-0 shadow-xs">
                    <FaLinkedin className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="LinkedIn"
                    className="flex-1 bg-transparent text-sm font-medium text-[#2c2e2a] outline-none placeholder-[#80827f]"
                  />
                </div>

                {/* Instagram */}
                <div className="flex items-center bg-[#ffffff] border border-[#d5d5d4] hover:border-[#2c2e2a]/40 focus-within:border-[#2c2e2a] rounded-[28px] px-3.5 py-2.5 gap-2.5 transition-all shadow-xs">
                  <div className="w-7 h-7 rounded-full bg-[#E4405F] flex items-center justify-center text-white shrink-0 shadow-xs">
                    <FaInstagram className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="Instagram"
                    className="flex-1 bg-transparent text-sm font-medium text-[#2c2e2a] outline-none placeholder-[#80827f]"
                  />
                </div>

                {/* Portfolio */}
                <div className="flex items-center bg-[#ffffff] border border-[#d5d5d4] hover:border-[#2c2e2a]/40 focus-within:border-[#2c2e2a] rounded-[28px] px-3.5 py-2.5 gap-2.5 transition-all shadow-xs">
                  <div className="w-7 h-7 rounded-full bg-[#2ba0ff] flex items-center justify-center text-white shrink-0 shadow-xs">
                    <FaGlobe className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={portfolio}
                    onChange={(e) => setPortfolio(e.target.value)}
                    placeholder="Portfolio or personal website"
                    className="flex-1 bg-transparent text-sm font-medium text-[#2c2e2a] outline-none placeholder-[#80827f]"
                  />
                </div>
              </div>

              {/* Action Buttons with Option 2: Dedicated button beneath */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="inline-flex items-center justify-center px-5 py-3 rounded-[50px] bg-[#ffffff] hover:bg-[#eae5d7] text-[#2c2e2a] text-sm font-medium border border-[#d5d5d4] transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="group flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-[50px] bg-[#2c2e2a] hover:bg-[#1f201d] text-[#ffffff] text-sm font-medium transition-all shadow-xs cursor-pointer active:scale-[0.99]"
                  >
                    <span>Save & Review</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2ba0ff] transition-all duration-300 group-hover:scale-125" />
                  </button>
                </div>

                {/* Option 2: Dedicated Skip button right beneath */}
                <button
                  type="button"
                  onClick={skipPresence}
                  className="w-full py-2 text-xs text-[#80827f] hover:text-[#2c2e2a] text-center font-medium transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Skip for now · I&apos;ll link these later</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* 7. REVIEW STEP */}
          {step === "review" && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-6"
            >
              <div className="w-12 h-12 rounded-[20px] bg-[#f5f1e4] border border-[#d5d5d4] flex items-center justify-center text-[#8ed462]">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div className="space-y-1.5">
                <h2 className="text-2xl font-semibold text-[#2c2e2a] tracking-tight">
                  Confirm credentials
                </h2>
                <p className="text-[#80827f] text-xs">
                  Review your information to complete chapter activation.
                </p>
              </div>

              {/* Review summary box with proper icons */}
              <div className="p-4 rounded-[28px] bg-[#f5f1e4] border border-[#d5d5d4] space-y-2.5 text-xs">
                <div className="flex items-center justify-between border-b border-[#d5d5d4] pb-2">
                  <div className="flex items-center gap-2 text-[#80827f]">
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>Member Name</span>
                  </div>
                  <span className="font-semibold text-[#2c2e2a]">{toTitleCase(fullName)}</span>
                </div>

                <div className="flex items-center justify-between border-b border-[#d5d5d4] pb-2">
                  <div className="flex items-center gap-2 text-[#80827f]">
                    <Phone className="w-3.5 h-3.5" />
                    <span>Phone</span>
                  </div>
                  <span className="font-mono font-semibold text-[#2c2e2a]">+{countryCode} {phoneNumber}</span>
                </div>

                <div className="flex items-center justify-between border-b border-[#d5d5d4] pb-2">
                  <div className="flex items-center gap-2 text-[#80827f]">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Campus</span>
                  </div>
                  <span className="font-semibold text-[#2c2e2a] truncate max-w-[200px]">
                    {college === "Other" ? otherCollege : college}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-[#d5d5d4] pb-2">
                  <div className="flex items-center gap-2 text-[#80827f]">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Academic</span>
                  </div>
                  <span className="font-semibold text-[#2c2e2a] truncate max-w-[200px]">
                    {dept === "Other" ? otherDept : dept} ({gradYear})
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#80827f]">
                    <Link2 className="w-3.5 h-3.5" />
                    <span>Profiles</span>
                  </div>
                  <span className="font-semibold text-[#2c2e2a]">
                    {(github || linkedin || instagram || portfolio) ? "Linked" : "None (can add later)"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={submitting}
                  className="inline-flex items-center justify-center px-5 py-3.5 rounded-[50px] bg-[#ffffff] hover:bg-[#eae5d7] text-[#2c2e2a] text-sm font-medium border border-[#d5d5d4] transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="group flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-[50px] bg-[#ff705d] hover:bg-[#ee6350] disabled:opacity-50 text-[#ffffff] text-sm font-medium transition-all shadow-xs cursor-pointer active:scale-[0.99]"
                >
                  <span>{submitting ? "Activating..." : "Complete Setup"}</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ffffff] transition-all duration-300 group-hover:scale-125" />
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Bottom Subtle Footer Brand & Account Switch Link */}
      <div className="relative z-10 w-full max-w-[480px] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#80827f] font-mono pt-4 text-center sm:text-left">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#8ed462] shrink-0" />
          <span>Amal Jyothi College of Engineering</span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="truncate max-w-[150px] text-[#2c2e2a] font-medium">{user.email}</span>
          <span className="text-[#d5d5d4]">•</span>
          <button
            type="button"
            onClick={handleExitAndSwitchAccount}
            disabled={exiting}
            className="text-[#EA4335] hover:underline cursor-pointer font-sans font-medium disabled:opacity-50"
          >
            {exiting ? "Signing out..." : "Sign out & Exit"}
          </button>
        </div>
      </div>

    </div>
  );
}
