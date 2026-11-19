"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Shield, Award, User, LogOut, ChevronRight } from "lucide-react";
import GDGLogoMark from "@/components/ui/GDGLogoMark";
import GoogleLabsLoadingIcon from "@/components/ui/GoogleLabsLoadingIcon";
import CreativeProfileAvatar from "@/components/ui/CreativeProfileAvatar";
import { Button } from "@/components/ui/Button";
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

  if (pathname?.startsWith("/admin")) return null;

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
          <div className="pointer-events-auto bg-card border border-border rounded-full px-3.5 sm:px-5 py-2.5 flex items-center justify-between transition-all shadow-xs">
            
            {/* BRAND LOGO CONTAINER */}
            <Link href="/" className="flex items-center gap-2.5 group py-0.5">
              <div className="flex items-center justify-center group-hover:scale-105 transition-transform">
                <GDGLogoMark width={48} height={28} />
              </div>
              <div className="flex flex-col">
                <span className="text-[16px] font-bold tracking-tight text-foreground leading-none">
                  GDG AJCE
                </span>
                <span className="text-[11px] font-medium text-muted-foreground leading-tight">
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
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[15px] font-medium transition-colors ${
                      active
                        ? "bg-background text-foreground font-semibold"
                        : "text-foreground hover:bg-background hover:text-foreground"
                    }`}
                  >
                    <span>{link.label}</span>
                    {(link as any).badge && (
                      <span className="px-2 py-0.5 rounded-full bg-fresh-grass text-ink-black text-[10px] font-bold uppercase tracking-wider animate-pulse shadow-xs">
                        {(link as any).badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* RIGHT GROUP: Menu Toggle Button + Primary Action Button */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              
              {/* MENU TOGGLE BUTTON (Mobile / Overflow) */}
              <button
                onClick={() => setDrawerOpen(true)}
                className="w-10 h-10 rounded-full bg-card hover:bg-muted border border-border flex items-center justify-center text-foreground transition-all shadow-xs hover:scale-105 active:scale-95 cursor-pointer md:hidden"
                title="Open menu"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5 stroke-[2.2]" />
              </button>

              {/* PRIMARY ACTION / AUTH BUTTON */}
              {loading ? (
                <div className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center shadow-xs">
                  <GoogleLabsLoadingIcon size={20} variant="rosette" />
                </div>
              ) : !user ? (
                <Button
                  onClick={handleLogin}
                  variant="coral"
                  size="pill"
                  actionDot
                  className="px-4 sm:px-6"
                >
                  Get Started
                </Button>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 p-1 pr-3 rounded-full bg-background hover:bg-muted border border-border transition cursor-pointer"
                  >
                    <CreativeProfileAvatar
                      src={user.photoURL}
                      name={user.displayName || user.email}
                      size="custom"
                      className="w-7 h-7"
                    />
                    <span className="text-[13px] font-semibold text-foreground max-w-[90px] truncate">
                      {user.displayName?.split(" ")[0]}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-fresh-grass" />
                  </button>

                  <AnimatePresence>
                    {menuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        className="absolute right-0 mt-3 w-56 rounded-card border border-border bg-card p-2 z-50 text-left shadow-xs"
                      >
                        <div className="px-3 py-2 border-b border-border mb-1 flex items-center gap-2.5">
                          <CreativeProfileAvatar
                            src={user.photoURL}
                            name={user.displayName || user.email}
                            size="sm"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-foreground truncate">{user.displayName}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </div>

                        <Link
                          href="/profile"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium text-foreground hover:bg-background transition"
                        >
                          <User className="w-3.5 h-3.5 text-sky-pop" />
                          Profile & Tracks
                        </Link>

                        <Link
                          href="/profile/certificates"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium text-foreground hover:bg-background transition"
                        >
                          <Award className="w-3.5 h-3.5 text-fresh-grass" />
                          My Certificates
                        </Link>

                        {isCoreOrAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold text-foreground bg-background hover:bg-muted my-1 transition"
                          >
                            <Shield className="w-3.5 h-3.5 text-sky-pop" />
                            Admin Console
                          </Link>
                        )}

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 text-left px-3 py-2 rounded-full text-xs font-semibold text-coral-pop hover:bg-coral-pop/10 transition cursor-pointer"
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

      {/* OVERFLOW DRAWER (Mobile) */}
      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-50 pointer-events-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="absolute inset-0 bg-ink-black/40 backdrop-blur-xs"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="absolute right-0 top-0 bottom-0 w-[88%] max-w-sm bg-card border-l border-border p-7 flex flex-col h-full overflow-y-auto shadow-xs"
            >
              <div className="flex justify-between items-center pb-6 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center">
                    <GDGLogoMark width={44} height={26} />
                  </div>
                  <span className="text-[16px] font-bold text-foreground">GDG AJCE</span>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-9 h-9 rounded-full bg-background hover:bg-muted border border-border flex items-center justify-center text-foreground transition cursor-pointer"
                  aria-label="Close menu"
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
                    className="px-4 py-3 rounded-card text-[15px] font-medium text-foreground bg-background hover:bg-muted border border-border transition flex items-center justify-between"
                  >
                    <span>{item.label}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>

              <div className="mt-auto pt-6 border-t border-border">
                {!user ? (
                  <Button
                    onClick={() => {
                      handleLogin();
                      setDrawerOpen(false);
                    }}
                    variant="coral"
                    actionDot
                    className="w-full py-3.5"
                  >
                    Get Started
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-card bg-background border border-border flex items-center gap-3">
                      <CreativeProfileAvatar
                        src={user.photoURL}
                        name={user.displayName || user.email}
                        size="md"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-bold text-foreground truncate">{user.displayName}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                    <Button
                      onClick={handleLogout}
                      variant="coral"
                      size="sm"
                      className="w-full"
                    >
                      Sign Out
                    </Button>
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
