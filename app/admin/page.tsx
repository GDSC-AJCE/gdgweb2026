"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  Timestamp,
  getCountFromServer,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Lock, ArrowLeft, LogIn, Sparkles } from "lucide-react";
import Link from "next/link";
import GDGLogoMark from "@/components/ui/GDGLogoMark";
import AdminSidebar, { AdminTab } from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import OverviewTab from "@/components/admin/tabs/OverviewTab";
import AnalyticsTab from "@/components/admin/tabs/AnalyticsTab";
import ExecomManagementTab from "@/components/admin/tabs/ExecomManagementTab";
import EventsManagementTab from "@/components/admin/tabs/EventsManagementTab";
import UsersManagementTab from "@/components/admin/tabs/UsersManagementTab";
import ApplicationsTab from "@/components/admin/tabs/ApplicationsTab";
import FundsTab from "@/components/admin/tabs/FundsTab";
import AuditLogsTab from "@/components/admin/tabs/AuditLogsTab";
import MailStudioTab from "@/components/admin/tabs/MailStudioTab";
import WebsiteManagementTab from "@/components/admin/tabs/WebsiteManagementTab";
import AddExecomMemberModal from "@/components/admin/modals/AddExecomMemberModal";
import CreateEventModal from "@/components/core/CreateEventModal";
import LoadingSpinner from "@/components/LoadingSpinner";
import RestrictedAccessCard from "@/components/admin/RestrictedAccessCard";
import ExecomDriveSettingsModal from "@/components/admin/modals/ExecomDriveSettingsModal";
import { GDG_EXECOM_2026, ExecomMember } from "@/lib/data/TeamData";
import { resolveName, formatNameFromEmail } from "@/lib/utils";

const TAB_METADATA: Record<AdminTab, { title: string; subtitle: string }> = {
  overview: {
    title: "Chapter Overview",
    subtitle: "High-level metrics, velocity indicators, and quick administrative actions.",
  },
  analytics: {
    title: "Chapter Analytics & Telemetry",
    subtitle: "Visual breakdowns of member velocity, workshop RSVPs, treasury cashflow, and department demographics.",
  },
  execom: {
    title: "Execom Leadership",
    subtitle: "Manage the official student organizing leads displayed on the public showcase.",
  },
  events: {
    title: "Events & Workshops",
    subtitle: "Create, schedule, publish, and monitor attendee RSVPs for all community sessions.",
  },
  newsletter: {
    title: "Weekly Tech Newsletter",
    subtitle: "Draft, auto-generate, preview, and broadcast weekly developer updates to all active subscribers.",
  },
  mailer: {
    title: "Mail Studio & Dispatcher",
    subtitle: "Design templates with visual drag-and-drop editor, import Figma layouts, and broadcast personalized emails via Apps Script Gateway or Gmail SMTP.",
  },
  website: {
    title: "Website Configuration",
    subtitle: "Toggle and manage homepage sections and visibility.",
  },
  users: {
    title: "Members & Permissions",
    subtitle: "Search student accounts, view points/badges, and assign administrative roles.",
  },
  applications: {
    title: "Recruitment Pipeline",
    subtitle: "Review applications submitted by students eager to join the chapter Execom.",
  },
  funds: {
    title: "Chapter Treasury",
    subtitle: "Track incoming sponsorships, ticket allocations, and verified operational expenses.",
  },
  audit: {
    title: "Security Audit Trail",
    subtitle: "Immutable logs tracking all administrative role changes and publishing operations.",
  },
};

export default function AdminPage() {
  const { user, userData, isAdmin, loading: authLoading, googleSignIn } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab") as AdminTab;
      if (tabParam && ["overview", "analytics", "execom", "events", "newsletter", "mailer", "website", "users", "applications", "funds", "audit"].includes(tabParam)) {
        return tabParam;
      }
    }
    return "overview";
  });

  // Chapter Data States
  const [execomMembers, setExecomMembers] = useState<ExecomMember[]>(GDG_EXECOM_2026);
  const [events, setEvents] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [funds, setFunds] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Dev preview bypass for local design verification
  const [isDevPreview, setIsDevPreview] = useState(false);

  // Admin-only Theme (Light / Dark)
  const [adminTheme, setAdminTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("gdg_admin_theme") || localStorage.getItem("gdg_theme");
      if (saved === "dark" || saved === "light") {
        setAdminTheme(saved);
      } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setAdminTheme("dark");
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (adminTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
      document.documentElement.setAttribute("data-admin-theme", "dark");
      document.body.style.backgroundColor = "#0c0c0e";
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "light");
      document.documentElement.setAttribute("data-admin-theme", "light");
      document.body.style.backgroundColor = "#f8fafc";
    }
    return () => {
      document.body.style.backgroundColor = "";
      document.documentElement.removeAttribute("data-admin-theme");
    };
  }, [adminTheme]);

  const toggleAdminTheme = useCallback(() => {
    setAdminTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      try {
        localStorage.setItem("gdg_admin_theme", next);
        localStorage.setItem("gdg_theme", next);
      } catch {}
      return next;
    });
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("dev") === "true") {
        setIsDevPreview(true);
      }
      const tabParam = params.get("tab") as AdminTab;
      if (tabParam && ["overview", "analytics", "execom", "events", "newsletter", "mailer", "website", "users", "applications", "funds", "audit"].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  // Modals
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [isAddExecomOpen, setIsAddExecomOpen] = useState(false);
  const [editingExecomMember, setEditingExecomMember] = useState<ExecomMember | null>(null);
  const [isPromotingToExecom, setIsPromotingToExecom] = useState(false);
  const [isDriveSettingsOpen, setIsDriveSettingsOpen] = useState(false);

  // Stats
  const [totalUsersCount, setTotalUsersCount] = useState(0);

  const hasAccess =
    Boolean(isAdmin) ||
    Boolean(userData?.is_admin) ||
    ["core", "core-manage", "admin"].includes(userData?.role);

  // Fetch Execom from Firestore (coreProfiles)
  const fetchExecom = useCallback(async () => {
    try {
      const snap = await getDocs(collection(db, "coreProfiles"));

      if (!snap.empty) {
        const fetchedMap = new Map<string, ExecomMember>();

        snap.docs.forEach((d) => {
          const data = d.data();
          const email = data.email || null;
          const known = email
            ? GDG_EXECOM_2026.find((m) => m.email?.toLowerCase().trim() === email.toLowerCase().trim())
            : null;

          const member: ExecomMember = {
            id: d.id,
            name: resolveName(data.name, data.displayName, data.fullName, email, known?.name || "Member"),
            role: data.role || known?.role || "Lead",
            track: data.track || data.team || known?.track || "Technology",
            team: data.team || known?.team || null,
            dept: data.dept || known?.dept || "CSE",
            image: data.photoURL || data.avatarUrl || data.image || null,
            username: data.username || d.id,
            linkedin: data.linkedin || null,
            github: data.github || null,
            email,
            year: data.year || known?.year || "2026",
            sortOrder: typeof data.sortOrder === "number" ? data.sortOrder : undefined,
          };

          const key = (member.email || member.username || member.name).toLowerCase().replace(/[^a-z0-9]/g, "");
          if (fetchedMap.has(key)) {
            const existing = fetchedMap.get(key)!;
            fetchedMap.set(key, {
              ...existing,
              ...member,
              id: member.id || existing.id,
              sortOrder: typeof member.sortOrder === "number" ? member.sortOrder : existing.sortOrder,
            });
          } else {
            fetchedMap.set(key, member);
          }
        });

        const fetched = Array.from(fetchedMap.values());

        // Merge any GDG_EXECOM_2026 members not yet in Firestore
        const merged = [...fetched];
        GDG_EXECOM_2026.forEach((local) => {
          const key = (local.email || local.username || local.name).toLowerCase().replace(/[^a-z0-9]/g, "");
          if (!fetchedMap.has(key)) {
            merged.push(local);
          }
        });

        // Ensure super admin accounts are never added into Execom
        const isSuperAdminEmail = (email?: string) => {
          const e = (email || "").toLowerCase().trim();
          return e === "dsc@amaljyothi.ac.in" || e === "karthiksambhu123@gmail.com";
        };

        const execomOnly = merged.filter((m) => !isSuperAdminEmail(m.email));

        // Sort by sortOrder if defined
        execomOnly.sort((a, b) => {
          const orderA = typeof a.sortOrder === "number" ? a.sortOrder : 9999;
          const orderB = typeof b.sortOrder === "number" ? b.sortOrder : 9999;
          if (orderA !== orderB) return orderA - orderB;
          return a.name.localeCompare(b.name);
        });

        setExecomMembers(execomOnly);
      } else {
        setExecomMembers(
          GDG_EXECOM_2026.filter((m) => (m.email || "").toLowerCase().trim() !== "dsc@amaljyothi.ac.in" && (m.email || "").toLowerCase().trim() !== "karthiksambhu123@gmail.com")
        );
      }
    } catch (e) {
      setExecomMembers(
        GDG_EXECOM_2026.filter((m) => (m.email || "").toLowerCase().trim() !== "dsc@amaljyothi.ac.in" && (m.email || "").toLowerCase().trim() !== "karthiksambhu123@gmail.com")
      );
    }
  }, []);

  // Fetch Events
  const fetchEvents = useCallback(async () => {
    try {
      try {
        const q = query(collection(db, "events"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        const snap = await getDocs(collection(db, "events"));
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a: any, b: any) => {
          const tA = a.createdAt?.seconds || (a.createdAt ? new Date(a.createdAt).getTime() : 0);
          const tB = b.createdAt?.seconds || (b.createdAt ? new Date(b.createdAt).getTime() : 0);
          return tB - tA;
        });
        setEvents(list);
      }
    } catch (e) {
      console.error("Error fetching events:", e);
    }
  }, []);

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    try {
      const snap = await getDocs(collection(db, "users"));
      setUsersList(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setTotalUsersCount(snap.size);
    } catch (e) {
      console.error("Error fetching users:", e);
    }
  }, []);

  // Fetch Applications with hydration from user profiles & answers
  const fetchApplications = useCallback(async () => {
    try {
      let snap;
      try {
        const q = query(collection(db, "execomApplications"), orderBy("submittedAt", "desc"));
        snap = await getDocs(q);
      } catch {
        snap = await getDocs(collection(db, "execomApplications"));
      }

      const rawApps = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // Fetch users map to hydrate missing candidate details
      let usersMap = new Map<string, any>();
      let emailToUserMap = new Map<string, any>();
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        usersSnap.docs.forEach((u) => {
          const data = u.data();
          usersMap.set(u.id, data);
          if (data.email) emailToUserMap.set(data.email.toLowerCase().trim(), data);
        });
      } catch (userErr) {
        console.warn("Could not fetch users map for application hydration:", userErr);
      }

      const enrichedApps = rawApps.map((app: any) => {
        const email = (app.email || app.userEmail || app.answers?.email || "").trim();

        const userProfile =
          (app.userId ? usersMap.get(app.userId) : null) ||
          (email ? emailToUserMap.get(email.toLowerCase()) : null);

        const answers = app.answers || {};

        const knownMember = email
          ? GDG_EXECOM_2026.find((m) => m.email?.toLowerCase().trim() === email.toLowerCase())
          : null;

        // Check if answers contain custom questions for name
        let answerName = answers.name || answers.fullName || answers["Full Name"] || answers["Name"] || answers["Candidate Name"];
        if (!answerName) {
          for (const key of Object.keys(answers)) {
            if (key.toLowerCase().includes("name") && typeof answers[key] === "string" && answers[key].trim()) {
              answerName = answers[key].trim();
              break;
            }
          }
        }

        // Avoid generic chapter names like "Google Developers Group Kerala" or "GDSC AJCE"
        const isGenericChapterName = (val?: string) =>
          Boolean(
            val &&
              (val.toLowerCase().includes("developers group") ||
                val.toLowerCase().includes("gdsc") ||
                val.toLowerCase() === "member" ||
                val.toLowerCase() === "applicant")
          );

        const cleanRaw = (val?: string) => (val && !isGenericChapterName(val) ? val.trim() : "");

        const name = resolveName(
          cleanRaw(app.name) || cleanRaw(app.fullName) || cleanRaw(app.displayName) || cleanRaw(app.candidateName) || cleanRaw(app.applicantName),
          cleanRaw(answerName),
          cleanRaw(userProfile?.name) || cleanRaw(userProfile?.fullName) || cleanRaw(userProfile?.displayName),
          email,
          knownMember?.name || formatNameFromEmail(email) || "Applicant"
        );

        const phone =
          app.phone ||
          app.phoneNumber ||
          answers.phone ||
          answers.phoneNumber ||
          userProfile?.phoneNumber ||
          userProfile?.phone ||
          "";

        const department =
          app.department ||
          app.dept ||
          answers.department ||
          answers.dept ||
          userProfile?.department ||
          userProfile?.dept ||
          "CSE";

        const semester =
          app.semester ||
          app.sem ||
          answers.semester ||
          answers.sem ||
          userProfile?.semester ||
          "S1";

        const interests =
          (Array.isArray(app.interests) && app.interests.length > 0)
            ? app.interests
            : answers.track
            ? (Array.isArray(answers.track) ? answers.track : [answers.track])
            : answers.interests
            ? (Array.isArray(answers.interests) ? answers.interests : [answers.interests])
            : answers.domain
            ? [answers.domain]
            : [];

        const whyJoin =
          app.whyJoin ||
          answers.whyJoin ||
          answers.motivation ||
          answers.statement ||
          "";

        const photoURL =
          app.photoURL ||
          app.avatarUrl ||
          app.image ||
          userProfile?.photoURL ||
          userProfile?.avatarUrl ||
          (email ? `https://api.dicebear.com/7.x/initials/svg?seed=${email}` : null);

        return {
          ...app,
          name,
          email,
          phone,
          department,
          semester,
          interests,
          whyJoin,
          photoURL,
        };
      });

      enrichedApps.sort((a: any, b: any) => {
        const tA = a.submittedAt?.toMillis ? a.submittedAt.toMillis() : (a.submittedAt ? new Date(a.submittedAt).getTime() : 0);
        const tB = b.submittedAt?.toMillis ? b.submittedAt.toMillis() : (b.submittedAt ? new Date(b.submittedAt).getTime() : 0);
        return tB - tA;
      });

      setApplications(enrichedApps);
    } catch (e) {
      console.error("Error fetching applications:", e);
    }
  }, []);

  // Fetch Funds
  const fetchFunds = useCallback(async () => {
    try {
      const q = query(collection(db, "funds"), orderBy("date", "desc"));
      const snap = await getDocs(q);
      setFunds(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error("Error fetching funds:", e);
    }
  }, []);

  // Fetch Audit Logs
  const fetchAuditLogs = useCallback(async () => {
    try {
      const q = query(collection(db, "auditLogs"), orderBy("timestamp", "desc"));
      const snap = await getDocs(q);
      setAuditLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error("Error fetching audit logs:", e);
    }
  }, []);

  // Refresh All Data
  const refreshAll = useCallback(() => {
    fetchExecom();
    fetchEvents();
    fetchUsers();
    fetchApplications();
    fetchFunds();
    fetchAuditLogs();
  }, [fetchExecom, fetchEvents, fetchUsers, fetchApplications, fetchFunds, fetchAuditLogs]);

  useEffect(() => {
    if (user && hasAccess) {
      refreshAll();
    }
  }, [user, hasAccess, refreshAll]);

  // AUTH STATE 1: LOADING
  if (authLoading && !isDevPreview) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-[#0c0c0e] flex items-center justify-center select-none p-4 font-sans">
        <div className="p-8 sm:p-10 rounded-2xl bg-white dark:bg-[#141416] border border-slate-200 dark:border-zinc-800 shadow-xl text-center space-y-4 max-w-sm w-full flex flex-col items-center">
          <LoadingSpinner text="Connecting to Admin Deck..." size="lg" variant="cluster" />
          <p className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 -mt-2">Verifying organizer session...</p>
        </div>
      </main>
    );
  }

  // AUTH STATE 2: NOT SIGNED IN
  if (!user && !isDevPreview) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-[#0c0c0e] flex items-center justify-center select-none p-4 font-sans">
        <div className="p-8 sm:p-10 rounded-2xl bg-white dark:bg-[#141416] border border-slate-200 dark:border-zinc-800 shadow-xl text-center space-y-6 max-w-md w-full">
          <div className="size-14 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200/80 dark:border-blue-500/20 flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400">
            <Lock className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              GDG Chapter Admin
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              Sign in with your authorized Google Account to manage events, executive roster, student applications, and chapter telemetry.
            </p>
          </div>

          <button
            type="button"
            onClick={googleSignIn}
            className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md transition active:scale-95 cursor-pointer"
          >
            <Shield className="w-4 h-4 text-white" />
            <span>Sign in with Google Account</span>
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white transition pt-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Website</span>
          </Link>
        </div>
      </main>
    );
  }

  // AUTH STATE 3: SIGNED IN BUT UNAUTHORIZED
  if (!hasAccess && !isDevPreview) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-[#0c0c0e] flex items-center justify-center select-none p-4 font-sans">
        <div className="p-8 sm:p-10 rounded-2xl bg-white dark:bg-[#141416] border border-slate-200 dark:border-zinc-800 shadow-xl text-center space-y-6 max-w-md w-full">
          <div className="size-14 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200/80 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
            <Shield className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Restricted Area
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              You are signed in as <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.email}</span>, but your account does not have organizer privileges.
            </p>
          </div>

          <div className="p-3 bg-slate-100 dark:bg-zinc-800/60 rounded-xl text-[11px] text-slate-600 dark:text-zinc-400">
            Request access from the Chapter Lead or faculty advisor to manage events and chapter assets.
          </div>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-1.5 w-full px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-zinc-800 text-white text-xs font-semibold hover:bg-slate-800 dark:hover:bg-zinc-700 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </main>
    );
  }

  // AUTH STATE 4: AUTHORIZED ADMIN CONSOLE
  const isSuperAdmin = Boolean(isAdmin || userData?.is_admin || userData?.role === "admin");
  const pendingCount = applications.filter((a) => (a.status || "pending") === "pending").length;
  const adminName = user?.displayName || user?.email || "Chapter Organizer";

  return (
    <main
      data-admin-theme={adminTheme}
      data-theme={adminTheme}
      className={`min-h-screen select-none p-4 sm:p-6 lg:p-8 transition-colors duration-200 ${
        adminTheme === "dark"
          ? "dark bg-[#0c0c0e] text-slate-100"
          : "bg-[#f8fafc] text-[#0f172a]"
      }`}
    >
      <div className="max-w-[1536px] mx-auto space-y-6">
        {/* TOP ADMIN HEADER */}
        <AdminHeader
          title={TAB_METADATA[activeTab].title}
          subtitle={TAB_METADATA[activeTab].subtitle}
          activeTab={activeTab}
          theme={adminTheme}
          onToggleTheme={toggleAdminTheme}
        />

        {/* 2-COLUMN LAYOUT: SIDEBAR (LEFT) + ACTIVE TAB CONTENT (RIGHT) */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <AdminSidebar
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            pendingApplicationsCount={pendingCount}
            isSuperAdmin={isSuperAdmin}
            theme={adminTheme}
            onToggleTheme={toggleAdminTheme}
          />

          {/* MAIN TAB CONTENT CONTAINER */}
          <div className="flex-1 w-full min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                {activeTab === "overview" && (
                  <OverviewTab
                    stats={{
                      totalUsers: totalUsersCount || usersList.length,
                      coreUsers: execomMembers.length,
                      totalEvents: events.length,
                      pendingApplications: pendingCount,
                      totalFunds: funds.reduce((acc, f) => acc + ((f.type === "credit" || f.type === "income") ? (Number(f.amount) || 0) : -(Number(f.amount) || 0)), 0),
                    }}
                    users={usersList}
                    events={events}
                    applications={applications}
                    funds={funds}
                    onNavigateTab={setActiveTab}
                    onOpenCreateEvent={() => {
                      setEditingEvent(null);
                      setIsCreateEventOpen(true);
                    }}
                    onOpenAddExecom={() => {
                      setEditingExecomMember(null);
                      setIsPromotingToExecom(false);
                      setIsAddExecomOpen(true);
                    }}
                    recentLogs={auditLogs}
                    isSuperAdmin={isSuperAdmin}
                    theme={adminTheme}
                  />
                )}

                {activeTab === "analytics" && (
                  <AnalyticsTab
                    users={usersList}
                    events={events}
                    applications={applications}
                    funds={funds}
                    onNavigateTab={setActiveTab}
                    theme={adminTheme}
                  />
                )}

                {activeTab === "execom" && (
                  <ExecomManagementTab
                    members={execomMembers}
                    onRefresh={fetchExecom}
                    adminName={adminName}
                    isSuperAdmin={Boolean(isSuperAdmin || hasAccess)}
                    onOpenDriveSettings={() => setIsDriveSettingsOpen(true)}
                  />
                )}

                {activeTab === "events" && (
                  <EventsManagementTab
                    events={events}
                    onRefresh={fetchEvents}
                    onOpenCreateModal={() => {
                      setEditingEvent(null);
                      setIsCreateEventOpen(true);
                    }}
                    onOpenEditModal={(event) => {
                      setEditingEvent(event);
                      setIsCreateEventOpen(true);
                    }}
                    adminName={adminName}
                  />
                )}

                {activeTab === "mailer" && (
                  <MailStudioTab />
                )}

                {activeTab === "website" && (
                  isSuperAdmin ? (
                    <WebsiteManagementTab adminName={adminName} />
                  ) : (
                    <RestrictedAccessCard tab="website" onNavigateTab={setActiveTab} />
                  )
                )}

                {activeTab === "users" && (
                  isSuperAdmin ? (
                    <UsersManagementTab
                      users={usersList}
                      onRefresh={fetchUsers}
                      adminName={adminName}
                      onOpenAddExecom={(user) => {
                        setEditingExecomMember({
                          name: user.displayName || user.name || "",
                          email: user.email || "",
                          role: "",
                          track: "",
                          dept: user.department || user.dept || "CSE",
                          image: user.photoURL || user.avatarUrl || user.image || "",
                          username: user.email?.split("@")[0] || "",
                        } as ExecomMember);
                        setIsPromotingToExecom(true);
                        setIsAddExecomOpen(true);
                      }}
                    />
                  ) : (
                    <RestrictedAccessCard tab="users" onNavigateTab={setActiveTab} />
                  )
                )}

                {activeTab === "applications" && (
                  <ApplicationsTab
                    applications={applications}
                    onRefresh={fetchApplications}
                    adminName={adminName}
                    onOpenSettings={() => setIsDriveSettingsOpen(true)}
                  />
                )}

                {activeTab === "funds" && (
                  isSuperAdmin ? (
                    <FundsTab
                      funds={funds}
                      onRefresh={fetchFunds}
                      adminName={adminName}
                    />
                  ) : (
                    <RestrictedAccessCard tab="funds" onNavigateTab={setActiveTab} />
                  )
                )}

                {activeTab === "audit" && (
                  isSuperAdmin ? (
                    <AuditLogsTab logs={auditLogs} />
                  ) : (
                    <RestrictedAccessCard tab="audit" onNavigateTab={setActiveTab} />
                  )
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ADMIN PANEL CONSOLE FOOTER BAR */}
        <div className="pt-6 border-t border-slate-200/80 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-zinc-500">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold text-slate-700 dark:text-zinc-300">
              GDG on Campus AJCE Console
            </span>
            <span className="text-slate-300 dark:text-zinc-700">•</span>
            <span className="font-mono text-[11px]">Academic Year 2026</span>
            <span className="text-slate-300 dark:text-zinc-700">•</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Connected to Cloud Firestore
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
              Live Chapter Portal
            </Link>
            <Link href="/about" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
              About
            </Link>
            <Link href="/contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
              Organizer Support
            </Link>
          </div>
        </div>
      </div>

      {/* CREATE / EDIT EVENT MODAL */}
      {isCreateEventOpen && (
        <CreateEventModal
          onClose={() => {
            setIsCreateEventOpen(false);
            setEditingEvent(null);
          }}
          onSuccess={() => {
            setIsCreateEventOpen(false);
            setEditingEvent(null);
            fetchEvents();
          }}
          userEmail={user?.email}
          initialData={editingEvent}
          isEdit={!!editingEvent}
        />
      )}

      {/* ADD EXECOM MEMBER MODAL */}
      <AddExecomMemberModal
        isOpen={isAddExecomOpen}
        onClose={() => {
          setIsAddExecomOpen(false);
          setEditingExecomMember(null);
          setIsPromotingToExecom(false);
        }}
        onSaved={fetchExecom}
        initialData={editingExecomMember}
        adminName={adminName}
        isPromotingUser={isPromotingToExecom}
      />

      {/* EXECOM DRIVE SETTINGS MODAL */}
      <ExecomDriveSettingsModal
        isOpen={isDriveSettingsOpen}
        onClose={() => setIsDriveSettingsOpen(false)}
        adminName={adminName}
      />
    </main>
  );
}
