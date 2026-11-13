"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Plus,
  Edit2,
  Trash2,
  Users,
  Download,
  ExternalLink,
  Clock,
  MapPin,
  Search,
  Bell,
  Mail,
  ChevronLeft,
  ChevronRight,
  Grid,
  List,
  Check,
  Share2,
  Send,
  CalendarPlus,
  Info,
  X,
  Sparkles,
  Link2,
  Video,
  Award,
} from "lucide-react";
import { doc, getDoc, deleteDoc, addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import * as XLSX from "xlsx";
import Link from "next/link";
import CreativeEventPoster from "@/components/programs/CreativeEventPoster";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";

interface EventsManagementTabProps {
  events: any[];
  onRefresh: () => void;
  onOpenCreateModal: () => void;
  onOpenEditModal: (event: any) => void;
  adminName?: string;
  theme?: "light" | "dark";
}

// Color palettes for event badges matching BoardUI reference image
const EVENT_COLOR_PALETTES_DARK = [
  {
    bg: "bg-emerald-950/80 hover:bg-emerald-900/90",
    text: "text-emerald-400",
    border: "border-emerald-800/60",
    dot: "bg-emerald-400",
  },
  {
    bg: "bg-rose-950/80 hover:bg-rose-900/90",
    text: "text-rose-400",
    border: "border-rose-800/60",
    dot: "bg-rose-400",
  },
  {
    bg: "bg-purple-950/80 hover:bg-purple-900/90",
    text: "text-purple-300",
    border: "border-purple-800/60",
    dot: "bg-purple-400",
  },
  {
    bg: "bg-blue-950/80 hover:bg-blue-900/90",
    text: "text-blue-300",
    border: "border-blue-800/60",
    dot: "bg-blue-400",
  },
  {
    bg: "bg-teal-950/80 hover:bg-teal-900/90",
    text: "text-teal-300",
    border: "border-teal-800/60",
    dot: "bg-teal-400",
  },
];

const EVENT_COLOR_PALETTES_LIGHT = [
  {
    bg: "bg-emerald-50 hover:bg-emerald-100",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  {
    bg: "bg-rose-50 hover:bg-rose-100",
    text: "text-rose-700",
    border: "border-rose-200",
    dot: "bg-rose-500",
  },
  {
    bg: "bg-purple-50 hover:bg-purple-100",
    text: "text-purple-700",
    border: "border-purple-200",
    dot: "bg-purple-500",
  },
  {
    bg: "bg-blue-50 hover:bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  {
    bg: "bg-teal-50 hover:bg-teal-100",
    text: "text-teal-700",
    border: "border-teal-200",
    dot: "bg-teal-500",
  },
];

// Helper to detect if an item is a meeting, activity, or event
function getItemType(item: any): "meeting" | "activity" | "event" {
  const cat = (item.category || "").toLowerCase();
  const title = (item.title || "").toLowerCase();
  const desc = (item.description || "").toLowerCase();
  const loc = (item.location || "").toLowerCase();

  if (
    item.isMeeting ||
    cat === "meeting" ||
    cat === "execom_call" ||
    cat === "meetup" ||
    title.includes("meeting") ||
    title.includes("sync") ||
    title.includes("call") ||
    title.includes("interview") ||
    loc.includes("meet.google.com") ||
    loc.includes("zoom") ||
    item.meetingLink
  ) {
    return "meeting";
  }

  if (
    cat === "activity" ||
    cat === "workshop" ||
    cat === "hackathon" ||
    cat === "studyjam" ||
    cat === "competition" ||
    title.includes("activity") ||
    title.includes("workshop") ||
    title.includes("hackathon") ||
    title.includes("challenge") ||
    desc.includes("activity")
  ) {
    return "activity";
  }

  return "event";
}

// Robust date parser that handles Timestamps, ISO strings, and local dates safely
function parseEventDate(val: any): Date | null {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  if (typeof val?.toDate === "function") {
    try {
      const d = val.toDate();
      return isNaN(d.getTime()) ? null : d;
    } catch {
      // ignore
    }
  }
  if (typeof val?.seconds === "number") {
    const d = new Date(val.seconds * 1000);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof val === "string") {
    const trimmed = val.trim();
    const dateMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed);
    if (dateMatch) {
      const y = parseInt(dateMatch[1], 10);
      const m = parseInt(dateMatch[2], 10) - 1;
      const d = parseInt(dateMatch[3], 10);
      return new Date(y, m, d);
    }
    const parsed = new Date(trimmed);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  if (typeof val === "number") {
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

// Helper to pick consistent color palette for an event, meeting, or activity
function getEventColor(event: any, isDark: boolean = true) {
  const itemType = getItemType(event);

  if (itemType === "meeting") {
    return isDark
      ? {
          bg: "bg-purple-950/80 hover:bg-purple-900/90",
          text: "text-purple-300",
          border: "border-purple-800/70",
          dot: "bg-purple-400",
        }
      : {
          bg: "bg-purple-50 hover:bg-purple-100",
          text: "text-purple-700",
          border: "border-purple-200",
          dot: "bg-purple-500",
        };
  }

  if (itemType === "activity") {
    return isDark
      ? {
          bg: "bg-emerald-950/80 hover:bg-emerald-900/90",
          text: "text-emerald-300",
          border: "border-emerald-800/70",
          dot: "bg-emerald-400",
        }
      : {
          bg: "bg-emerald-50 hover:bg-emerald-100",
          text: "text-emerald-700",
          border: "border-emerald-200",
          dot: "bg-emerald-500",
        };
  }

  const str = (event.title || "") + (event.category || "") + (event.id || "");
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const palettes = isDark ? EVENT_COLOR_PALETTES_DARK : EVENT_COLOR_PALETTES_LIGHT;
  const index = Math.abs(hash) % palettes.length;
  return palettes[index];
}

// Helper to generate Google Calendar Web Intent URL
function getGoogleCalendarUrl(event: any) {
  const title = encodeURIComponent(event.title || "GDG AJCE Event");
  const details = encodeURIComponent(
    `${event.description || "Organized by Google Developer Groups on Campus AJCE."}\n\nCategory: ${event.category || "Workshop"}\nVenue: ${event.location || "Amal Jyothi College of Engineering"}`
  );
  const location = encodeURIComponent(
    event.location || "Amal Jyothi College of Engineering, Koovappally, Kerala"
  );

  let startIso = "";
  let endIso = "";

  try {
    const eventDate = event.date ? new Date(event.date) : new Date();
    const timeStr = event.time || "10:00";
    const [hours, minutes] = timeStr.split(":").map(Number);
    if (!isNaN(hours)) eventDate.setHours(hours, minutes || 0, 0);

    const endDate = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000); // 2 hrs

    const formatGcalDate = (d: Date) =>
      d.toISOString().replace(/-|:|\.\d\d\d/g, "");

    startIso = formatGcalDate(eventDate);
    endIso = formatGcalDate(endDate);
  } catch {
    const now = new Date();
    startIso = now.toISOString().replace(/-|:|\.\d\d\d/g, "");
    endIso = new Date(now.getTime() + 2 * 60 * 60 * 1000)
      .toISOString()
      .replace(/-|:|\.\d\d\d/g, "");
  }

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
}

// Helper to trigger direct client-side .ICS download
function downloadIcsFile(event: any) {
  try {
    const d = event.date ? new Date(event.date) : new Date();
    const [h, m] = (event.time || "10:00").split(":").map(Number);
    if (!isNaN(h)) d.setHours(h, m || 0, 0);
    const end = new Date(d.getTime() + 2 * 60 * 60 * 1000);

    const formatIcs = (date: Date) =>
      date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//GDG on Campus AJCE//Events//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${event.id || Date.now()}@gdgajce.org`,
      `DTSTAMP:${formatIcs(new Date())}`,
      `DTSTART:${formatIcs(d)}`,
      `DTEND:${formatIcs(end)}`,
      `SUMMARY:${(event.title || "GDG Event").replace(/\n/g, " ")}`,
      `DESCRIPTION:${(event.description || "Organized by GDG on Campus AJCE").replace(/\n/g, "\\n")}`,
      `LOCATION:${(event.location || "Amal Jyothi College of Engineering").replace(/\n/g, " ")}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob(["\ufeff" + icsContent], {
      type: "text/calendar;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(event.title || "event").toLowerCase().replace(/[^a-z0-9]/g, "_")}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Failed to download ICS:", err);
    alert("Could not generate calendar file.");
  }
}

export default function EventsManagementTab({
  events,
  onRefresh,
  onOpenCreateModal,
  onOpenEditModal,
  adminName = "Admin",
  theme = "light",
}: EventsManagementTabProps) {
  const isDark = theme === "dark";
  // View mode: month-grid (BoardUI reference) vs cards (detailed list)
  const [viewMode, setViewMode] = useState<"calendar" | "cards">("calendar");

  // Filter & Search
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Calendar State (defaults to current month/year)
  const [currentDate, setCurrentDate] = useState(() => new Date());

  // Modals state
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [isNotifyCoreOpen, setIsNotifyCoreOpen] = useState(false);
  const [notifyTargetEvent, setNotifyTargetEvent] = useState<any | null>(null);
  const [customNotifyMessage, setCustomNotifyMessage] = useState("");
  const [isSendingNotification, setIsSendingNotification] = useState(false);
  const [notifySuccessMsg, setNotifySuccessMsg] = useState<string | null>(null);

  const [isGCalModalOpen, setIsGCalModalOpen] = useState(false);
  const [isNotificationBellOpen, setIsNotificationBellOpen] = useState(false);
  const [copiedIcsUrl, setCopiedIcsUrl] = useState(false);

  // Additional meetings and activities loaded from settings/execomSchedule
  const [scheduledMeetings, setScheduledMeetings] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchScheduledMeetings = async () => {
      try {
        const snap = await getDoc(doc(db, "settings", "execomSchedule"));
        if (snap.exists() && snap.data()?.days && isMounted) {
          const daysList = snap.data().days as any[];
          const meetingEvents: any[] = [];
          daysList.forEach((day: any) => {
            if (!day.date) return;
            const firstPanel = day.panels?.[0];
            const panelNames = (day.panels || []).map((p: any) => p.name).join(", ");
            meetingEvents.push({
              id: `sched-meeting-${day.id || Math.random().toString(36).slice(2)}`,
              title: day.sessionName ? `Meeting: ${day.sessionName}` : "Execom Meeting / Sync",
              date: day.date,
              time: firstPanel?.startTime || "14:00",
              category: "meeting",
              isMeeting: true,
              location: firstPanel?.meetingLink ? "Google Meet" : "Campus Conference Hall",
              meetingLink: firstPanel?.meetingLink || "https://meet.google.com",
              description: `Official chapter meeting or interview review session. Panels: ${panelNames || "General Execom"}.`,
              attendees: (day.panels || []).flatMap((p: any) => p.slots || []),
            });
          });
          setScheduledMeetings(meetingEvents);
        }
      } catch (err) {
        console.warn("Could not load execom schedule meetings:", err);
      }
    };

    fetchScheduledMeetings();
    return () => {
      isMounted = false;
    };
  }, []);

  // Merge events with scheduled meetings and activities
  const allCalendarEvents = useMemo(() => {
    const existingIds = new Set(events.map((e) => e.id));
    const extra = scheduledMeetings.filter((m) => !existingIds.has(m.id));
    return [...events, ...extra];
  }, [events, scheduledMeetings]);

  // Month navigation helpers
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0 - 11

  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const monthYearLabel = `${monthName} ${currentYear}`;

  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Calendar Grid Days Calculation
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun, 1 = Mon, ...
    const totalDaysInMonth = lastDayOfMonth.getDate();

    // Days from previous month
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    const days: Array<{
      date: Date;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      events: any[];
    }> = [];

    // Fill leading days from previous month
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1, prevMonthLastDay - i);
      days.push({
        date: d,
        dayNumber: prevMonthLastDay - i,
        isCurrentMonth: false,
        isToday: false,
        events: [],
      });
    }

    const today = new Date();
    const isTodayDate = (d: Date) =>
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();

    // Fill current month days
    for (let i = 1; i <= totalDaysInMonth; i++) {
      const d = new Date(currentYear, currentMonth, i);
      days.push({
        date: d,
        dayNumber: i,
        isCurrentMonth: true,
        isToday: isTodayDate(d),
        events: [],
      });
    }

    // Fill trailing days to complete a multiple of 7 (target 35 or 42 cells for uniform rectangular layout)
    const targetLength = days.length <= 35 ? 35 : 42;
    const remainingCells = targetLength - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const d = new Date(currentYear, currentMonth + 1, i);
      days.push({
        date: d,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: false,
        events: [],
      });
    }

    // Map all events, meetings, and activities into calendar days using robust date parsing
    allCalendarEvents.forEach((ev) => {
      const evDate = parseEventDate(ev.date || ev.startDate || ev.sessionDate || ev.scheduledAt);
      if (!evDate) return;

      days.forEach((cell) => {
        if (
          cell.date.getFullYear() === evDate.getFullYear() &&
          cell.date.getMonth() === evDate.getMonth() &&
          cell.date.getDate() === evDate.getDate()
        ) {
          cell.events.push(ev);
        }
      });
    });

    return days;
  }, [currentYear, currentMonth, allCalendarEvents]);

  // Filtered events for cards view
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchesSearch =
        (e.title || "").toLowerCase().includes(search.toLowerCase()) ||
        (e.location || "").toLowerCase().includes(search.toLowerCase()) ||
        (e.category || "").toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      const eventDate = e.date ? new Date(e.date) : null;
      const now = new Date();

      if (filter === "upcoming") return eventDate && eventDate >= now;
      if (filter === "past") return eventDate && eventDate < now;
      return true;
    });
  }, [events, search, filter]);

  // Upcoming events count for notification badge
  const upcomingEventsCount = useMemo(() => {
    const now = new Date();
    return events.filter((e) => e.date && new Date(e.date) >= now).length;
  }, [events]);

  const handleDelete = async (event: any) => {
    if (!confirm(`Are you sure you want to delete "${event.title}"?`)) return;
    setDeletingId(event.id);

    try {
      await deleteDoc(doc(db, "events", event.id));
      try {
        await addDoc(collection(db, "auditLogs"), {
          action: "EVENT_DELETE",
          performedBy: adminName,
          target: event.title,
          details: `Deleted event: ${event.title}`,
          timestamp: Timestamp.now(),
        });
      } catch (e) {}

      if (selectedEvent?.id === event.id) {
        setSelectedEvent(null);
      }

      onRefresh();
    } catch (err) {
      console.error("Error deleting event:", err);
      alert("Failed to delete event.");
    } finally {
      setDeletingId(null);
    }
  };

  const exportAttendees = (event: any) => {
    const attendees = event.attendees || event.rsvps || [];
    if (attendees.length === 0) {
      alert("No registered attendees for this event yet.");
      return;
    }

    const data = attendees.map((a: any, i: number) => ({
      "No.": i + 1,
      Name: a.name || a.displayName || "Unknown",
      Email: a.email || "",
      Department: a.department || a.dept || "",
      "Phone / WhatsApp": a.phone || a.phoneNumber || "",
      "Registered At": a.registeredAt || "",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendees");
    XLSX.writeFile(
      wb,
      `${(event.title || "event").replace(/[^a-zA-Z0-9]/g, "_")}_attendees.xlsx`
    );
  };

  // Dispatch email notification to core team
  const handleSendCoreNotification = async () => {
    if (!notifyTargetEvent) return;
    setIsSendingNotification(true);
    setNotifySuccessMsg(null);

    try {
      const res = await fetch("/api/events/notify-core", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: notifyTargetEvent,
          customMessage: customNotifyMessage,
          adminName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to dispatch email notification");
      }

      setNotifySuccessMsg(
        `Notification successfully delivered to ${data.recipientCount} core members!`
      );
      setCustomNotifyMessage("");
      setTimeout(() => {
        setIsNotifyCoreOpen(false);
        setNotifySuccessMsg(null);
      }, 2500);
    } catch (err: any) {
      alert(err.message || "Failed to notify core members.");
    } finally {
      setIsSendingNotification(false);
    }
  };

  const copyIcsSubscriptionUrl = () => {
    const url = `${window.location.origin}/api/events/calendar.ics`;
    navigator.clipboard.writeText(url);
    setCopiedIcsUrl(true);
    setTimeout(() => setCopiedIcsUrl(false), 2000);
  };

  return (
    <div className={`space-y-6 select-none font-sans ${isDark ? "text-zinc-100" : "text-slate-800"}`}>
      {/* ======================================================== */}
      {/* BOARDUI TOP TOOLBAR & CONTROLS */}
      {/* ======================================================== */}
      <div className={`rounded-3xl p-5 shadow-xs border transition-colors ${
        isDark ? "bg-[#18181b] border-zinc-800" : "bg-white border-slate-200/80"
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Title & Quick Stats */}
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className={`text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                {monthYearLabel}
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-mono transition-colors ${
                isDark
                  ? "bg-zinc-800 border-zinc-700/60 text-zinc-300"
                  : "bg-slate-100 border-slate-200 text-slate-700"
              }`}>
                {events.length} total events
              </span>
            </div>
            <p className={`text-xs mt-1 ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
              Google Calendar integrated scheduling, core alerts, and attendee
              rosters.
            </p>
          </div>

          {/* Right: BoardUI Action Bar matching reference image */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Notification Bell with red badge */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationBellOpen(!isNotificationBellOpen)}
                className={`relative p-2.5 rounded-xl border transition cursor-pointer ${
                  isDark
                    ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800"
                    : "bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                }`}
                title="Event Notifications & Reminders"
              >
                <Bell className="w-4 h-4" />
                {upcomingEventsCount > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[10px] font-bold leading-tight">
                    {upcomingEventsCount}
                  </span>
                )}
              </button>

              {/* Bell dropdown */}
              <AnimatePresence>
                {isNotificationBellOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className={`absolute right-0 mt-2 w-80 p-4 rounded-2xl border shadow-xl z-50 space-y-3 ${
                      isDark
                        ? "bg-zinc-900 border-zinc-800 text-white"
                        : "bg-white border-slate-200 text-slate-900"
                    }`}
                  >
                    <div className={`flex items-center justify-between border-b pb-2 ${
                      isDark ? "border-zinc-800" : "border-slate-200"
                    }`}>
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-blue-500" />
                        <h4 className={`text-xs font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                          Upcoming Events Alert
                        </h4>
                      </div>
                      <button
                        onClick={() => setIsNotificationBellOpen(false)}
                        className={isDark ? "text-zinc-400 hover:text-white" : "text-slate-400 hover:text-slate-900"}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {events
                        .filter((e) => e.date && new Date(e.date) >= new Date())
                        .slice(0, 4)
                        .map((ev) => (
                          <div
                            key={ev.id}
                            onClick={() => {
                              setSelectedEvent(ev);
                              setIsNotificationBellOpen(false);
                            }}
                            className={`p-2.5 rounded-xl border cursor-pointer transition ${
                              isDark
                                ? "bg-zinc-800/60 hover:bg-zinc-800 border-zinc-700/50"
                                : "bg-slate-50 hover:bg-slate-100 border-slate-200"
                            }`}
                          >
                            <p className={`text-xs font-semibold truncate ${isDark ? "text-white" : "text-slate-900"}`}>
                              {ev.title}
                            </p>
                            <div className={`flex items-center gap-2 text-[10px] mt-1 ${
                              isDark ? "text-zinc-400" : "text-slate-500"
                            }`}>
                              <span>
                                {new Date(ev.date).toLocaleDateString()}
                              </span>
                              <span>•</span>
                              <span>{ev.time || "10:00 AM"}</span>
                            </div>
                          </div>
                        ))}

                      {events.filter(
                        (e) => e.date && new Date(e.date) >= new Date()
                      ).length === 0 && (
                        <p className={`text-xs text-center py-4 ${isDark ? "text-zinc-500" : "text-slate-400"}`}>
                          No upcoming events scheduled.
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mail / Envelope Icon - Broadcast to Core Members */}
            <button
              onClick={() => {
                const upcoming = events.find(
                  (e) => e.date && new Date(e.date) >= new Date()
                );
                setNotifyTargetEvent(upcoming || events[0] || null);
                setIsNotifyCoreOpen(true);
              }}
              className={`p-2.5 rounded-xl border transition cursor-pointer ${
                isDark
                  ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800"
                  : "bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
              }`}
              title="Send Notification to Core Members"
            >
              <Mail className="w-4 h-4" />
            </button>

            {/* Google Calendar Sync Button */}
            <button
              onClick={() => setIsGCalModalOpen(true)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs transition cursor-pointer ${
                isDark
                  ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800"
                  : "bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200"
              }`}
              title="Sync & Connect Google Calendar"
            >
              <CalendarPlus className="w-4 h-4 text-[#4285F4]" />
              <span className="hidden sm:inline">Google Calendar</span>
            </button>

            {/* Month Navigator Capsule: < [Month Year] > */}
            <div className={`flex items-center rounded-xl border px-1 py-1 ${
              isDark ? "bg-zinc-900 border-zinc-800" : "bg-slate-100 border-slate-200"
            }`}>
              <button
                onClick={prevMonth}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  isDark
                    ? "text-zinc-400 hover:text-white hover:bg-zinc-800"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-200"
                }`}
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={goToToday}
                className={`px-2.5 py-1 text-xs font-semibold transition ${
                  isDark
                    ? "text-zinc-200 hover:text-white"
                    : "text-slate-700 hover:text-slate-900"
                }`}
                title="Jump to Today"
              >
                {monthYearLabel}
              </button>
              <button
                onClick={nextMonth}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  isDark
                    ? "text-zinc-400 hover:text-white hover:bg-zinc-800"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-200"
                }`}
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* View Mode Toggle: Calendar vs Cards */}
            <div className={`flex items-center p-1 rounded-xl border ${
              isDark ? "bg-zinc-900 border-zinc-800" : "bg-slate-100 border-slate-200"
            }`}>
              <button
                onClick={() => setViewMode("calendar")}
                className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                  viewMode === "calendar"
                    ? isDark
                      ? "bg-zinc-800 text-white shadow-xs"
                      : "bg-white text-slate-900 shadow-xs border border-slate-200/60"
                    : isDark
                      ? "text-zinc-400 hover:text-zinc-200"
                      : "text-slate-500 hover:text-slate-900"
                }`}
                title="Month Calendar Grid"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("cards")}
                className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                  viewMode === "cards"
                    ? isDark
                      ? "bg-zinc-800 text-white shadow-xs"
                      : "bg-white text-slate-900 shadow-xs border border-slate-200/60"
                    : isDark
                      ? "text-zinc-400 hover:text-zinc-200"
                      : "text-slate-500 hover:text-slate-900"
                }`}
                title="Card List View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* + New Event Button (BoardUI Blue Accent) */}
            <Button
              onClick={onOpenCreateModal}
              className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>New event</span>
            </Button>
          </div>
        </div>

        {/* Search & Filters (active in Cards view or available for quick search) */}
        {viewMode === "cards" && (
          <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 mt-4 border-t ${
            isDark ? "border-zinc-800/80" : "border-slate-200"
          }`}>
            <div className="relative w-full sm:w-64">
              <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${
                isDark ? "text-zinc-500" : "text-slate-400"
              }`} />
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events, venues..."
                className={`pl-9 h-9 w-full rounded-xl text-xs ${
                  isDark
                    ? "bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
                    : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
                }`}
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              {(["all", "upcoming", "past"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition cursor-pointer ${
                    filter === f
                      ? isDark
                        ? "bg-zinc-800 text-white border border-zinc-700/60"
                        : "bg-slate-900 text-white border border-slate-800 shadow-xs"
                      : isDark
                        ? "text-zinc-400 hover:text-zinc-200"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* VIEW 1: BOARDUI MONTH GRID (EXACT REFERENCE DESIGN)      */}
      {/* ======================================================== */}
      {viewMode === "calendar" && (
        <div className="space-y-3">
          {/* Calendar Category Legend & Status Indicator */}
          <div className="flex items-center justify-between flex-wrap gap-2 px-1">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${
                isDark ? "text-zinc-500" : "text-slate-400"
              }`}>
                Legend:
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition ${
                isDark
                  ? "bg-purple-950/60 border-purple-800/60 text-purple-300"
                  : "bg-purple-50 border-purple-200 text-purple-700"
              }`}>
                <Video className="w-3.5 h-3.5 text-purple-500" />
                <span>Meetings & Syncs</span>
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition ${
                isDark
                  ? "bg-emerald-950/60 border-emerald-800/60 text-emerald-300"
                  : "bg-emerald-50 border-emerald-200 text-emerald-700"
              }`}>
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>Activities & Workshops</span>
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition ${
                isDark
                  ? "bg-blue-950/60 border-blue-800/60 text-blue-300"
                  : "bg-blue-50 border-blue-200 text-blue-700"
              }`}>
                <CalendarIcon className="w-3.5 h-3.5 text-blue-500" />
                <span>Chapter Events</span>
              </span>
            </div>

            <span className={`text-[11px] font-mono ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
              {allCalendarEvents.length} total scheduled
            </span>
          </div>

          {/* Day of Week Headers - Exactly 7 Columns matching the grid */}
          <div className="grid grid-cols-7 gap-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className={`text-center py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors border ${
                  isDark
                    ? "bg-[#18181b]/80 text-zinc-400 border-zinc-800/60"
                    : "bg-slate-100 text-slate-600 border-slate-200/60"
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Month Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((cell, idx) => {
              const hasEvents = cell.events.length > 0;
              const displayEvents = cell.events.slice(0, 3);
              const overflowCount = cell.events.length - 3;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (hasEvents) {
                      setSelectedEvent(cell.events[0]);
                    } else {
                      onOpenCreateModal();
                    }
                  }}
                  className={`min-h-[125px] rounded-2xl p-2.5 flex flex-col justify-start transition-all cursor-pointer group border ${
                    cell.isCurrentMonth
                      ? isDark
                        ? "bg-[#18181b] border-zinc-800/80 hover:border-zinc-600 hover:shadow-md"
                        : "bg-white border-slate-200/90 hover:border-slate-400 shadow-2xs hover:shadow-md"
                      : isDark
                        ? "bg-[#18181b]/40 border-zinc-800/30 opacity-40 hover:opacity-75"
                        : "bg-slate-50/60 border-slate-200/50 opacity-40 hover:opacity-75"
                  }`}
                >
                  {/* Top Bar: Uniform Date Number Badge & Month Indicator */}
                  <div className="flex items-center justify-between w-full mb-1.5 pb-1 border-b border-zinc-700/15 dark:border-zinc-800/60">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold transition-all ${
                          cell.isToday
                            ? "bg-blue-600 text-white shadow-xs ring-2 ring-blue-400/40"
                            : cell.isCurrentMonth
                              ? isDark
                                ? "text-zinc-200 group-hover:bg-zinc-800"
                                : "text-slate-800 group-hover:bg-slate-100"
                              : isDark
                                ? "text-zinc-600"
                                : "text-slate-400"
                        }`}
                      >
                        {cell.dayNumber}
                      </span>

                      {/* Display month tag on the 1st day of the month */}
                      {cell.dayNumber === 1 && (
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                          cell.isCurrentMonth
                            ? isDark ? "bg-zinc-800 text-zinc-300" : "bg-slate-200 text-slate-700"
                            : isDark ? "bg-zinc-900 text-zinc-600" : "bg-slate-100 text-slate-400"
                        }`}>
                          {cell.date.toLocaleString("default", { month: "short" })}
                        </span>
                      )}
                    </div>

                    {/* Quick Add indicator on hover for current month days */}
                    {cell.isCurrentMonth && (
                      <span
                        className={`opacity-0 group-hover:opacity-100 transition text-xs font-bold px-1 rounded-md ${
                          isDark
                            ? "text-zinc-400 hover:text-white hover:bg-zinc-800"
                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-200"
                        }`}
                        title="Add Event or Meeting"
                      >
                        +
                      </span>
                    )}
                  </div>

                  {/* Event Badges List - Top-aligned vertical stack */}
                  <div className="space-y-1.5 w-full flex-1">
                    {displayEvents.map((ev: any) => {
                      const itemType = getItemType(ev);
                      const palette = getEventColor(ev, isDark);
                      const timeStr = ev.time || "10:00";

                      return (
                        <div
                          key={ev.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(ev);
                          }}
                          className={`rounded-lg px-2 py-1 text-[11px] font-medium border flex items-center justify-between gap-1 transition-all hover:scale-[1.02] shadow-2xs ${palette.bg} ${palette.text} ${palette.border}`}
                          title={`${ev.title} (${timeStr})`}
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            {itemType === "meeting" ? (
                              <Video className="w-3 h-3 text-purple-400 shrink-0" />
                            ) : itemType === "activity" ? (
                              <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
                            ) : (
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${palette.dot}`} />
                            )}
                            <span className="truncate max-w-[85px] sm:max-w-[100px] font-semibold">
                              {ev.title}
                            </span>
                          </div>
                          <span className="text-[10px] opacity-75 font-mono shrink-0">
                            {timeStr}
                          </span>
                        </div>
                      );
                    })}

                    {/* Overflow Badge */}
                    {overflowCount > 0 && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(cell.events[0]);
                        }}
                        className={`text-[10px] font-bold pl-1 transition cursor-pointer ${
                          isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"
                        }`}
                      >
                        +{overflowCount} more...
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 2: CARDS GRID (DETAILED MANAGEMENT & ROSTERS)       */}
      {/* ======================================================== */}
      {viewMode === "cards" && (
        <>
          {filteredEvents.length === 0 ? (
            <div className={`p-12 text-center rounded-3xl border text-xs ${
              isDark ? "bg-[#18181b] border-zinc-800 text-zinc-400" : "bg-white border-slate-200 text-slate-500 shadow-xs"
            }`}>
              No events found matching your filter criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => {
                const attendeeCount = (event.attendees || event.rsvps || []).length;
                const isPast = event.date && new Date(event.date) < new Date();
                const gcalUrl = getGoogleCalendarUrl(event);

                return (
                  <div
                    key={event.id}
                    className={`rounded-3xl border p-6 shadow-xs transition flex flex-col justify-between space-y-4 overflow-hidden ${
                      isDark
                        ? "bg-[#18181b] border-zinc-800 hover:border-zinc-700"
                        : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md"
                    }`}
                  >
                    {/* Poster Thumbnail */}
                    <div className={`w-full h-36 -mx-6 -mt-6 mb-2 rounded-t-3xl overflow-hidden border-b ${
                      isDark ? "border-zinc-800" : "border-slate-200"
                    }`}>
                      <CreativeEventPoster
                        posterUrl={event.posterUrl}
                        title={event.title}
                        category={event.category || "Event"}
                        isClosed={isPast}
                        seed={event.slug || event.title}
                        showBadges={false}
                        aspectRatio="auto"
                      />
                    </div>

                    <div className="space-y-3">
                      {/* Top Bar: Category & Status */}
                      <div className="flex items-center justify-between">
                        <span className={`px-3 py-1 rounded-full border text-[10px] font-mono font-bold ${
                          isDark
                            ? "bg-zinc-900 border-zinc-800 text-zinc-300"
                            : "bg-slate-100 border-slate-200 text-slate-700"
                        }`}>
                          {event.category || "Workshop"}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            isPast
                              ? isDark ? "bg-zinc-800 text-zinc-500" : "bg-slate-100 text-slate-500 border border-slate-200"
                              : isDark
                                ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/50"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {isPast ? "Past Event" : "Upcoming"}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h4 className={`text-lg font-bold leading-tight line-clamp-2 ${
                          isDark ? "text-white" : "text-slate-900"
                        }`}>
                          {event.title}
                        </h4>
                        <p className={`text-xs line-clamp-2 mt-1.5 ${
                          isDark ? "text-zinc-400" : "text-slate-600"
                        }`}>
                          {event.description ||
                            "Hands-on developer workshop hosted by GDG on Campus AJCE."}
                        </p>
                      </div>

                      {/* Metadata */}
                      <div className={`space-y-1.5 pt-2 text-xs ${
                        isDark ? "text-zinc-400" : "text-slate-500"
                      }`}>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-[#ff705d]" />
                          <span>
                            {event.date
                              ? new Date(event.date).toLocaleDateString()
                              : "TBA"}{" "}
                            • {event.time || "10:00 AM"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-[#4285F4]" />
                          <span className="truncate">
                            {event.location ||
                              "Amal Jyothi College of Engineering"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5 text-[#34A853]" />
                          <span>{attendeeCount} Registered Attendees</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className={`pt-4 border-t flex items-center justify-between flex-wrap gap-2 ${
                      isDark ? "border-zinc-800" : "border-slate-200"
                    }`}>
                      <div className="flex items-center gap-1">
                        {/* Add to Google Calendar */}
                        <a
                          href={gcalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`p-2 rounded-xl transition ${
                            isDark ? "bg-zinc-900 hover:bg-zinc-800 text-[#4285F4]" : "bg-slate-100 hover:bg-slate-200 text-[#4285F4]"
                          }`}
                          title="Add to Google Calendar"
                        >
                          <CalendarPlus className="w-3.5 h-3.5" />
                        </a>

                        {/* Export .ICS */}
                        <button
                          onClick={() => downloadIcsFile(event)}
                          className={`p-2 rounded-xl transition ${
                            isDark ? "bg-zinc-900 hover:bg-zinc-800 text-zinc-300" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                          }`}
                          title="Download .ICS file"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        {/* Notify Core Members */}
                        <button
                          onClick={() => {
                            setNotifyTargetEvent(event);
                            setIsNotifyCoreOpen(true);
                          }}
                          className={`p-2 rounded-xl transition ${
                            isDark ? "bg-zinc-900 hover:bg-zinc-800 text-purple-400" : "bg-slate-100 hover:bg-slate-200 text-purple-600"
                          }`}
                          title="Send Core Notification"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => onOpenEditModal(event)}
                          className={`p-2 rounded-xl transition ${
                            isDark ? "bg-zinc-900 hover:bg-zinc-800 text-blue-400" : "bg-slate-100 hover:bg-slate-200 text-blue-600"
                          }`}
                          title="Edit Event"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Export XLSX */}
                        <button
                          onClick={() => exportAttendees(event)}
                          className={`p-2 rounded-xl transition ${
                            isDark ? "bg-zinc-900 hover:bg-zinc-800 text-emerald-400" : "bg-slate-100 hover:bg-slate-200 text-emerald-600"
                          }`}
                          title="Export XLSX Attendee List"
                        >
                          <Users className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(event)}
                          disabled={deletingId === event.id}
                          className={`p-2 rounded-xl transition ${
                            isDark
                              ? "bg-zinc-900 hover:bg-rose-950 text-rose-400"
                              : "bg-slate-100 hover:bg-rose-50 text-rose-600"
                          }`}
                          title="Delete Event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {event.slug && (
                        <Link
                          href={`/programs/${event.slug}`}
                          target="_blank"
                          className={`inline-flex items-center gap-1 text-xs font-semibold transition ${
                            isDark ? "text-zinc-300 hover:text-white" : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          <span>Public Page</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: EVENT QUICK VIEW & ACTIONS (BOARDUI STYLE)      */}
      {/* ======================================================== */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-5 border ${
                isDark
                  ? "bg-[#18181b] border-zinc-800 text-zinc-200"
                  : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-bold uppercase ${
                      getItemType(selectedEvent) === "meeting"
                        ? isDark ? "bg-purple-950/80 border-purple-800 text-purple-300" : "bg-purple-50 border-purple-200 text-purple-700"
                        : getItemType(selectedEvent) === "activity"
                          ? isDark ? "bg-emerald-950/80 border-emerald-800 text-emerald-300" : "bg-emerald-50 border-emerald-200 text-emerald-700"
                          : isDark ? "bg-zinc-800 border-zinc-700/60 text-zinc-300" : "bg-slate-100 border-slate-200 text-slate-700"
                    }`}>
                      {getItemType(selectedEvent) === "meeting"
                        ? "Meeting / Sync"
                        : getItemType(selectedEvent) === "activity"
                          ? "Activity / Workshop"
                          : selectedEvent.category || "Event"}
                    </span>
                    {(selectedEvent.isMeeting || selectedEvent.meetingLink) && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-500">
                        <Video className="w-3 h-3" />
                        <span>Online Session</span>
                      </span>
                    )}
                  </div>
                  <h3 className={`text-xl font-bold mt-1.5 ${isDark ? "text-white" : "text-slate-900"}`}>
                    {selectedEvent.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className={`p-1.5 rounded-xl transition cursor-pointer ${
                    isDark
                      ? "bg-zinc-900 text-zinc-400 hover:text-white"
                      : "bg-slate-100 text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Event Description */}
              <p className={`text-xs leading-relaxed ${isDark ? "text-zinc-400" : "text-slate-600"}`}>
                {selectedEvent.description ||
                  "No detailed description provided for this session."}
              </p>

              {/* Metadata Details */}
              <div className={`grid grid-cols-2 gap-3 p-3.5 rounded-2xl border text-xs ${
                isDark ? "bg-zinc-900/80 border-zinc-800" : "bg-slate-50 border-slate-200"
              }`}>
                <div>
                  <span className={`text-[10px] uppercase tracking-wider block ${
                    isDark ? "text-zinc-500" : "text-slate-400 font-semibold"
                  }`}>
                    Date & Time
                  </span>
                  <p className={`font-semibold mt-0.5 ${isDark ? "text-zinc-200" : "text-slate-800"}`}>
                    {selectedEvent.date
                      ? (parseEventDate(selectedEvent.date)?.toLocaleDateString() || selectedEvent.date)
                      : "TBA"}{" "}
                    • {selectedEvent.time || "10:00 AM"}
                  </p>
                </div>
                <div>
                  <span className={`text-[10px] uppercase tracking-wider block ${
                    isDark ? "text-zinc-500" : "text-slate-400 font-semibold"
                  }`}>
                    Venue
                  </span>
                  <p className={`font-semibold mt-0.5 truncate ${isDark ? "text-zinc-200" : "text-slate-800"}`}>
                    {selectedEvent.location || (selectedEvent.meetingLink ? "Google Meet" : "Amal Jyothi Campus")}
                  </p>
                </div>
                <div>
                  <span className={`text-[10px] uppercase tracking-wider block ${
                    isDark ? "text-zinc-500" : "text-slate-400 font-semibold"
                  }`}>
                    Attendees
                  </span>
                  <p className={`font-semibold mt-0.5 ${isDark ? "text-zinc-200" : "text-slate-800"}`}>
                    {(selectedEvent.attendees || selectedEvent.rsvps || []).length}{" "}
                    Registered
                  </p>
                </div>
                <div>
                  <span className={`text-[10px] uppercase tracking-wider block ${
                    isDark ? "text-zinc-500" : "text-slate-400 font-semibold"
                  }`}>
                    Status
                  </span>
                  <p className="font-semibold text-emerald-500 mt-0.5">
                    {selectedEvent.date &&
                    new Date(selectedEvent.date) < new Date()
                      ? "Completed"
                      : "Upcoming / Scheduled"}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                {/* Core Event Operations: Certificates & Mailer */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-zinc-800/40">
                  <Link
                    href={`/core/events/${selectedEvent.id}?tab=certificates`}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#4285F4] hover:bg-[#3367d6] text-white text-xs font-semibold shadow-sm transition active:scale-95"
                  >
                    <Award className="w-4 h-4" />
                    <span>Issue Certificates</span>
                  </Link>

                  <Link
                    href={`/core/events/${selectedEvent.id}?tab=mail`}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm transition active:scale-95"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Send Mail to Attendees</span>
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* Join Video Meeting if meeting link exists, otherwise Add to Google Cal */}
                  {selectedEvent.meetingLink ? (
                    <a
                      href={selectedEvent.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm transition active:scale-95 cursor-pointer"
                    >
                      <Video className="w-4 h-4" />
                      <span>Join Meeting</span>
                    </a>
                  ) : (
                    <a
                      href={getGoogleCalendarUrl(selectedEvent)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition active:scale-95 cursor-pointer"
                    >
                      <CalendarPlus className="w-4 h-4" />
                      <span>Add to Google Cal</span>
                    </a>
                  )}

                  {/* Send Core Member Notification */}
                  <button
                    onClick={() => {
                      setNotifyTargetEvent(selectedEvent);
                      setIsNotifyCoreOpen(true);
                      setSelectedEvent(null);
                    }}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm transition active:scale-95 cursor-pointer"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Notify Core Team</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => downloadIcsFile(selectedEvent)}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition cursor-pointer ${
                      isDark
                        ? "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                    }`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>.ICS File</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenEditModal(selectedEvent);
                      setSelectedEvent(null);
                    }}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition cursor-pointer ${
                      isDark
                        ? "bg-zinc-900 hover:bg-zinc-800 text-blue-400 border-zinc-800"
                        : "bg-slate-100 hover:bg-slate-200 text-blue-600 border-slate-200"
                    }`}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Event</span>
                  </button>

                  <button
                    onClick={() => exportAttendees(selectedEvent)}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition cursor-pointer ${
                      isDark
                        ? "bg-zinc-900 hover:bg-zinc-800 text-emerald-400 border-zinc-800"
                        : "bg-slate-100 hover:bg-slate-200 text-emerald-600 border-slate-200"
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Roster (.xlsx)</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL 2: NOTIFY CORE MEMBERS WITH GOOGLE CALENDAR INVITE */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isNotifyCoreOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-5 border ${
                isDark
                  ? "bg-[#18181b] border-zinc-800 text-zinc-200"
                  : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2.5 rounded-xl border ${
                    isDark
                      ? "bg-purple-950/80 border-purple-800/60 text-purple-400"
                      : "bg-purple-50 border-purple-200 text-purple-600"
                  }`}>
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                      Notify Core Members
                    </h3>
                    <p className={`text-xs ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
                      Dispatches an official email broadcast with 1-click Google
                      Calendar RSVP.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsNotifyCoreOpen(false)}
                  className={`p-1.5 rounded-xl transition cursor-pointer ${
                    isDark
                      ? "bg-zinc-900 text-zinc-400 hover:text-white"
                      : "bg-slate-100 text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Event Picker if not preselected */}
              <div className="space-y-1.5">
                <label className={`text-xs font-semibold ${isDark ? "text-zinc-300" : "text-slate-700"}`}>
                  Target Event
                </label>
                <select
                  value={notifyTargetEvent?.id || ""}
                  onChange={(e) => {
                    const ev = events.find((x) => x.id === e.target.value);
                    setNotifyTargetEvent(ev || null);
                  }}
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-hidden ${
                    isDark
                      ? "bg-zinc-900 border-zinc-800 text-white focus:border-purple-500"
                      : "bg-white border-slate-300 text-slate-900 focus:border-purple-600"
                  }`}
                >
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title} (
                      {ev.date
                        ? new Date(ev.date).toLocaleDateString()
                        : "TBA"}
                      )
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Message Field */}
              <div className="space-y-1.5">
                <label className={`text-xs font-semibold ${isDark ? "text-zinc-300" : "text-slate-700"}`}>
                  Custom Organizer Instructions (Optional)
                </label>
                <textarea
                  value={customNotifyMessage}
                  onChange={(e) => setCustomNotifyMessage(e.target.value)}
                  placeholder="e.g. All core leads are requested to arrive 45 minutes prior for audio/visual setup..."
                  rows={3}
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-hidden ${
                    isDark
                      ? "bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-purple-500"
                      : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-purple-600"
                  }`}
                />
              </div>

              {/* Feature Highlights Card */}
              <div className={`p-3.5 rounded-2xl border space-y-2 text-xs ${
                isDark
                  ? "bg-zinc-900/60 border-zinc-800/80 text-zinc-400"
                  : "bg-slate-50 border-slate-200 text-slate-600"
              }`}>
                <div className={`flex items-center gap-2 font-medium ${isDark ? "text-zinc-300" : "text-slate-800"}`}>
                  <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                  <span>Automatic Execom Directory Broadcast</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Emails are dispatched to all verified GDG Execom leads and
                  coordinators. Each email includes an embedded{" "}
                  <strong className={isDark ? "text-zinc-200" : "text-slate-800"}>
                    "Add to Google Calendar"
                  </strong>{" "}
                  button, venue directions, and audit tracking.
                </p>
              </div>

              {/* Success Message Banner */}
              {notifySuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{notifySuccessMsg}</span>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsNotifyCoreOpen(false)}
                  className={`h-9 px-4 rounded-xl text-xs cursor-pointer ${
                    isDark
                      ? "border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                      : "border-slate-300 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendCoreNotification}
                  disabled={isSendingNotification || !notifyTargetEvent}
                  className="h-9 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {isSendingNotification ? "Dispatching..." : "Send Notification"}
                  </span>
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL 3: GOOGLE CALENDAR SYNC & SUBSCRIPTION DIALOG      */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isGCalModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-5 border ${
                isDark
                  ? "bg-[#18181b] border-zinc-800 text-zinc-200"
                  : "bg-white border-slate-200 text-slate-800"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2.5 rounded-xl border ${
                    isDark
                      ? "bg-blue-950/80 border-blue-800/60 text-blue-400"
                      : "bg-blue-50 border-blue-200 text-blue-600"
                  }`}>
                    <CalendarPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                      Google Calendar Integration
                    </h3>
                    <p className={`text-xs ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
                      Sync chapter events seamlessly with personal or Google
                      Workspace calendars.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsGCalModalOpen(false)}
                  className={`p-1.5 rounded-xl transition cursor-pointer ${
                    isDark
                      ? "bg-zinc-900 text-zinc-400 hover:text-white"
                      : "bg-slate-100 text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {/* 1. Live Calendar ICS Feed URL */}
                <div className={`p-3.5 rounded-2xl border space-y-2 ${
                  isDark ? "bg-zinc-900/80 border-zinc-800" : "bg-slate-50 border-slate-200"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${isDark ? "text-zinc-200" : "text-slate-800"}`}>
                      Chapter iCal Subscription Feed (.ICS)
                    </span>
                    <button
                      onClick={copyIcsSubscriptionUrl}
                      className="inline-flex items-center gap-1 text-[11px] text-blue-500 hover:underline cursor-pointer"
                    >
                      {copiedIcsUrl ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Link2 className="w-3 h-3" />
                          <span>Copy URL</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className={`text-[11px] ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
                    Add this subscription link to Google Calendar (under{" "}
                    <em>Other Calendars &gt; From URL</em>) to auto-sync all GDG
                    events in real-time.
                  </p>
                </div>

                {/* 2. Direct Open Google Calendar */}
                <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                  isDark ? "bg-zinc-900/80 border-zinc-800" : "bg-slate-50 border-slate-200"
                }`}>
                  <div>
                    <h4 className={`text-xs font-semibold ${isDark ? "text-zinc-200" : "text-slate-800"}`}>
                      Open Google Calendar
                    </h4>
                    <p className={`text-[11px] ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
                      Launch Google Calendar in your browser.
                    </p>
                  </div>
                  <a
                    href="https://calendar.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                      isDark
                        ? "bg-zinc-800 hover:bg-zinc-700 text-white"
                        : "bg-slate-200 hover:bg-slate-300 text-slate-800"
                    }`}
                  >
                    <span>Launch</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* 3. Download Full Calendar ICS */}
                <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                  isDark ? "bg-zinc-900/80 border-zinc-800" : "bg-slate-50 border-slate-200"
                }`}>
                  <div>
                    <h4 className={`text-xs font-semibold ${isDark ? "text-zinc-200" : "text-slate-800"}`}>
                      Download Master .ICS
                    </h4>
                    <p className={`text-[11px] ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
                      Import all chapter workshops into Apple, Outlook, or
                      Android calendars.
                    </p>
                  </div>
                  <a
                    href="/api/events/calendar.ics"
                    download="gdg_ajce_events.ics"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs text-white font-semibold transition"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download</span>
                  </a>
                </div>
              </div>

              {/* Close */}
              <div className="pt-2 flex justify-end">
                <Button
                  onClick={() => setIsGCalModalOpen(false)}
                  className={`h-9 px-5 rounded-xl text-xs font-semibold cursor-pointer ${
                    isDark
                      ? "bg-zinc-800 hover:bg-zinc-700 text-white"
                      : "bg-slate-200 hover:bg-slate-300 text-slate-800"
                  }`}
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
