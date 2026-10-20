"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Shield, Award, User, LogOut, ChevronRight, Sparkles } from "lucide-react";
import GDGLogoMark from "@/components/ui/GDGLogoMark";
import GoogleLabsLoadingIcon from "@/components/ui/GoogleLabsLoadingIcon";
import CreativeProfileAvatar from "@/components/ui/CreativeProfileAvatar";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Navbar() {
  const pathname = usePathname();
  const { user, userData, googleSignIn, logOut, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [driveOpen, setDriveOpen] = useState(false);

  useEffect(() => {
    const checkDrive = async () => {
      try {
        const snap = await getDoc(doc(db, "settings", "execomRecruitment"));
        if (snap.exists() && snap.data()?.isOpen) {
          setDriveOpen(true);
        }
      } catch (e) {
        console.error("Error checking recruitment:", e);
      }
    };
    checkDrive();
  }, []);

  const handleLogin = async () => {
    try {
      await googleSignIn();
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    try {
      await logOut();
      setMenuOpen(false);
      setDrawerOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const isCoreOrAdmin =
    userData?.role === "core" ||
    userData?.role === "core-manage" ||
    userData?.role === "ex-core" ||
    userData?.isAdmin ||
    userData?.is_admin;

  const NAV_LINKS = [
    { href: "/", label: "Home" },
    ...(driveOpen ? [{ href: "/execom", label: "Execom Apply", badge: "Hiring" }] : []),
    { href: "/programs", label: "Events" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/about", label: "About" },
    { href: "/gallery", label: "Gallery" },
  ];

  const OVERFLOW_LINKS = [
    { href: "/programs/ongoing", label: "Live & Ongoing" },
    { href: "/programs/past", label: "Conducted Events" },
    { href: "/design-system", label: "Design System" },
    { href: "/contact", label: "Contact Desk" },
  ];

  return (
    <>
      {/* FLOATING PILL NAVIGATION BAR */}
      <header className="sticky top-6 sm:top-8 z-50 w-full px-4 sm:px-6 select-none pointer-events-none transition-all">
        <div className="max-w-[980px] mx-auto">
          <div className="pointer-events-auto bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-[50px] px-3.5 sm:px-5 py-2.5 flex items-center justify-between transition-all shadow-md shadow-slate-900/5">
            
            {/* BRAND LOGO CONTAINER */}
            <Link href="/" className="flex items-center gap-2.5 group py-0.5">
              <div className="flex items-center justify-center group-hover:scale-105 transition-transform">
                <GDGLogoMark width={48} height={28} />
              </div>
              <div className="flex flex-col">
                <span className="text-[16px] font-bold tracking-tight text-[#0f172a] leading-none">
                  GDG AJCE
                </span>
                <span className="text-[11px] font-medium text-slate-500 leading-tight">
                  On Campus
                </span>
              </div>
            </Link>

            {/* DESKTOP NAV LINKS */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                const active =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname === link.href || pathname.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-[50px] text-[15px] font-medium transition-colors ${
                      active
                        ? "bg-slate-100 text-[#0f172a] font-bold"
                        : "text-slate-600 hover:text-[#0f172a] hover:bg-slate-100/70"
                    }`}
                  >
                    <span>{link.label}</span>
                    {(link as any).badge && (
                      <span className="px-2 py-0.5 rounded-full bg-[#10B981] text-white text-[10px] font-bold uppercase tracking-wider animate-pulse shadow-xs">
                        {(link as any).badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* RIGHT GROUP: Menu Toggle Button (#10B981) + Primary CTA */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* MENU TOGGLE BUTTON (Vibrant Emerald Button with icon) */}
              <button
                onClick={() => setDrawerOpen(true)}
                className="w-10 h-10 rounded-[50px] bg-[#10B981] hover:bg-[#059669] flex items-center justify-center text-white transition-all shadow-sm hover:shadow-md hover:scale-105 active:scale-95 cursor-pointer"
                title="Open menu"
              >
                <Menu className="w-5 h-5 stroke-[2.4]" />
              </button>

              {/* PRIMARY CTA BUTTON */}
              {loading ? (
                <div className="w-10 h-10 rounded-[50px] bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                  <GoogleLabsLoadingIcon size={20} variant="rosette" />
                </div>
              ) : !user ? (
                <button
                  onClick={handleLogin}
                  className="group inline-flex items-center gap-2 sm:gap-2.5 px-3 sm:px-5 py-2.5 rounded-[50px] bg-white hover:bg-slate-50 text-[#0f172a] text-[14px] sm:text-[15px] font-semibold border border-slate-200 hover:border-blue-500/50 shadow-sm hover:shadow transition-all duration-300 hover:-translate-y-[1px] active:scale-95 cursor-pointer"
                >
                  <span className="hidden sm:inline">Get Started</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] action-dot-expand shadow-xs" />
                </button>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 p-1 pr-3 rounded-[50px] bg-slate-100 hover:bg-slate-200 border border-slate-200 transition cursor-pointer"
                  >
                    <CreativeProfileAvatar
                      src={user.photoURL}
                      name={user.displayName || user.email}
                      size="custom"
                      className="w-7 h-7"
                    />
                    <span className="text-[13px] font-semibold text-[#0f172a] max-w-[90px] truncate">
                      {user.displayName?.split(" ")[0]}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                  </button>

                  <AnimatePresence>
                    {menuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        className="absolute right-0 mt-3 w-56 rounded-[24px] border border-slate-200 bg-white p-2 z-50 text-left shadow-xl"
                      >
                        <div className="px-3 py-2 border-b border-slate-100 mb-1 flex items-center gap-2.5">
                          <CreativeProfileAvatar
                            src={user.photoURL}
                            name={user.displayName || user.email}
                            size="sm"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-[#0f172a] truncate">{user.displayName}</p>
                            <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                          </div>
                        </div>

                        <Link
                          href="/profile"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-[50px] text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
                        >
                          <User className="w-3.5 h-3.5 text-[#2563EB]" />
                          Profile & Tracks
                        </Link>

                        <Link
                          href="/profile/certificates"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-[50px] text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
                        >
                          <Award className="w-3.5 h-3.5 text-[#10B981]" />
                          My Certificates
                        </Link>

                        {isCoreOrAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-[50px] text-xs font-semibold text-[#2563EB] bg-blue-50 hover:bg-blue-100 my-1 transition"
                          >
                            <Shield className="w-3.5 h-3.5 text-[#2563EB]" />
                            Admin Console
                          </Link>
                        )}

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 text-left px-3 py-2 rounded-[50px] text-xs font-semibold text-[#EF4444] hover:bg-red-50 transition cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* OVERFLOW DRAWER */}
      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-50 pointer-events-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="absolute right-0 top-0 bottom-0 w-[88%] max-w-sm bg-white border-l border-slate-200 p-7 flex flex-col h-full overflow-y-auto shadow-2xl"
            >
              <div className="flex justify-between items-center pb-6 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center">
                    <GDGLogoMark width={44} height={26} />
                  </div>
                  <span className="text-[16px] font-bold text-[#0f172a]">GDG AJCE</span>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-[#0f172a] transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col gap-2 py-6">
                {[...NAV_LINKS, ...OVERFLOW_LINKS].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
                    className="px-4 py-3 rounded-2xl text-[15px] font-semibold text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-100 transition flex items-center justify-between"
                  >
                    <span>{item.label}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>
                ))}
              </div>

              <div className="mt-auto pt-6 border-t border-slate-100">
                {!user ? (
                  <button
                    onClick={() => {
                      handleLogin();
                      setDrawerOpen(false);
                    }}
                    className="w-full py-3.5 bg-[#0f172a] hover:bg-black text-white font-semibold rounded-2xl text-[15px] flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
                  >
                    <span>Get Started</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                      <CreativeProfileAvatar
                        src={user.photoURL}
                        name={user.displayName || user.email}
                        size="md"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-bold text-[#0f172a] truncate">{user.displayName}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full py-2.5 rounded-xl bg-[#EF4444] hover:bg-[#DC2626] text-white font-semibold text-xs shadow-xs transition cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
