"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Shield, Award, User, LogOut, ChevronRight } from "lucide-react";
import GDGLogoMark from "@/components/ui/GDGLogoMark";
import GoogleLabsLoadingIcon from "@/components/ui/GoogleLabsLoadingIcon";
import CreativeProfileAvatar from "@/components/ui/CreativeProfileAvatar";

export default function Navbar() {
  const pathname = usePathname();
  const { user, userData, googleSignIn, logOut, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

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
      {/* FLOATING PILL NAVIGATION BAR (Shortened length with generous top margin) */}
      <header className="sticky top-6 sm:top-8 z-50 w-full px-4 sm:px-6 select-none pointer-events-none transition-all">
        <div className="max-w-[980px] mx-auto">
          <div className="pointer-events-auto bg-[#ffffff] border border-[#d5d5d4] rounded-[50px] px-3.5 sm:px-5 py-2.5 flex items-center justify-between transition-all shadow-xs">
            
            {/* BRAND LOGO CONTAINER */}
            <Link href="/" className="flex items-center gap-2.5 group py-0.5">
              <div className="flex items-center justify-center group-hover:scale-105 transition-transform">
                <GDGLogoMark width={48} height={28} />
              </div>
              <div className="flex flex-col">
                <span className="text-[16px] font-semibold tracking-tight text-[#2c2e2a] leading-none">
                  GDG AJCE
                </span>
                <span className="text-[11px] font-normal text-[#80827f] leading-tight">
                  On Campus
                </span>
              </div>
            </Link>

            {/* DESKTOP NAV LINKS (15px Inter 500 in #2c2e2a with 17-20px horizontal padding) */}
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
                    className={`px-4 py-2 rounded-[50px] text-[15px] font-medium transition-colors ${
                      active
                        ? "bg-[#f5f1e4] text-[#2c2e2a] font-semibold"
                        : "text-[#2c2e2a] hover:text-[#000000] hover:bg-[#f5f1e4]/70"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* RIGHT GROUP: Menu Toggle Button (#8ed462) + Primary Ghost CTA */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* MENU TOGGLE BUTTON (Circular ~40px button with #8ed462 green fill and dark menu icon) */}
              <button
                onClick={() => setDrawerOpen(true)}
                className="w-10 h-10 rounded-[50px] bg-[#8ed462] hover:bg-[#7ec452] flex items-center justify-center text-[#2c2e2a] transition active:scale-95"
                title="Open menu"
              >
                <Menu className="w-5 h-5 stroke-[2.2]" />
              </button>

              {/* PRIMARY CTA BUTTON (Ghost/white pill with 50px radius, 15px Inter 500 text, embedded Sky Pop #2ba0ff dot) */}
              {loading ? (
                <div className="w-10 h-10 rounded-[50px] bg-[#ffffff] border border-[#d5d5d4] flex items-center justify-center shadow-2xs">
                  <GoogleLabsLoadingIcon size={20} variant="rosette" />
                </div>
              ) : !user ? (
                <button
                  onClick={handleLogin}
                  className="group inline-flex items-center gap-2.5 px-5 py-2.5 rounded-[50px] bg-[#ffffff] hover:bg-[#f5f1e4] text-[#2c2e2a] text-[15px] font-medium border border-[#d5d5d4] hover:border-[#2c2e2a]/30 transition-all duration-300 hover:-translate-y-[1px] active:scale-95 transition-mindmarket"
                >
                  <span>Get Started</span>
                  {/* Small circular Sky Pop #2ba0ff dot embedded at right edge as visual action affordance */}
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2ba0ff] action-dot-expand" />
                </button>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 p-1 pr-3 rounded-[50px] bg-[#f5f1e4] hover:bg-[#e0dbce] border border-[#d5d5d4] transition"
                  >
                    <CreativeProfileAvatar
                      src={user.photoURL}
                      name={user.displayName || user.email}
                      size="custom"
                      className="w-7 h-7"
                    />
                    <span className="text-[13px] font-medium text-[#2c2e2a] max-w-[90px] truncate">
                      {user.displayName?.split(" ")[0]}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-[#8ed462]" />
                  </button>

                  <AnimatePresence>
                    {menuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        className="absolute right-0 mt-3 w-56 rounded-[24px] border border-[#d5d5d4] bg-[#ffffff] p-2 z-50 text-left"
                      >
                        <div className="px-3 py-2 border-b border-[#f5f1e4] mb-1 flex items-center gap-2.5">
                          <CreativeProfileAvatar
                            src={user.photoURL}
                            name={user.displayName || user.email}
                            size="sm"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-[#2c2e2a] truncate">{user.displayName}</p>
                            <p className="text-[11px] text-[#80827f] truncate">{user.email}</p>
                          </div>
                        </div>

                        <Link
                          href="/profile"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-[50px] text-xs font-medium text-[#2c2e2a] hover:bg-[#f5f1e4] transition"
                        >
                          <User className="w-3.5 h-3.5 text-[#80827f]" />
                          Profile Settings
                        </Link>

                        <Link
                          href="/profile/certificates"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-[50px] text-xs font-medium text-[#2c2e2a] hover:bg-[#f5f1e4] transition"
                        >
                          <Award className="w-3.5 h-3.5 text-[#8ed462]" />
                          My Certificates
                        </Link>

                        {isCoreOrAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-[50px] text-xs font-medium text-[#2c2e2a] bg-[#f5f1e4] my-1"
                          >
                            <Shield className="w-3.5 h-3.5 text-[#2ba0ff]" />
                            Admin Panel
                          </Link>
                        )}

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 text-left px-3 py-2 rounded-[50px] text-xs font-medium text-[#ff705d] hover:bg-[#ff705d]/10 transition"
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

      {/* OVERFLOW DRAWER (MindMarket Storybook Drawer) */}
      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-50 pointer-events-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="absolute inset-0 bg-[#2c2e2a]/30 backdrop-blur-xs"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="absolute right-0 top-0 bottom-0 w-[88%] max-w-sm bg-[#f5f1e4] border-l border-[#d5d5d4] p-7 flex flex-col h-full overflow-y-auto"
            >
              <div className="flex justify-between items-center pb-6 border-b border-[#e0dbce]">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center">
                    <GDGLogoMark width={44} height={26} />
                  </div>
                  <span className="text-[16px] font-semibold text-[#2c2e2a]">GDG AJCE</span>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-9 h-9 rounded-full bg-[#ffffff] border border-[#d5d5d4] flex items-center justify-center text-[#2c2e2a]"
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
                    className="px-4 py-3 rounded-[50px] text-[15px] font-medium text-[#2c2e2a] bg-[#ffffff] hover:bg-[#e0dbce] transition flex items-center justify-between"
                  >
                    <span>{item.label}</span>
                    <ChevronRight className="w-4 h-4 text-[#80827f]" />
                  </Link>
                ))}
              </div>

              <div className="mt-auto pt-6 border-t border-[#e0dbce]">
                {!user ? (
                  <button
                    onClick={() => {
                      handleLogin();
                      setDrawerOpen(false);
                    }}
                    className="w-full py-3.5 bg-[#ffffff] text-[#2c2e2a] border border-[#d5d5d4] font-medium rounded-[50px] text-[15px] flex items-center justify-center gap-2"
                  >
                    <span>Get Started</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2ba0ff]" />
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-[20px] bg-[#ffffff] border border-[#d5d5d4] flex items-center gap-3">
                      <CreativeProfileAvatar
                        src={user.photoURL}
                        name={user.displayName || user.email}
                        size="md"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-medium text-[#2c2e2a] truncate">{user.displayName}</p>
                        <p className="text-[11px] text-[#80827f] truncate">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full py-2.5 rounded-[50px] bg-[#ff705d] text-[#ffffff] font-medium text-xs"
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
