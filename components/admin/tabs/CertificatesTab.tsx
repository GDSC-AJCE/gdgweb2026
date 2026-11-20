"use client";

import React, { useState, useEffect } from "react";
import {
    Award,
    Calendar,
    Users,
    Sparkles,
    ChevronRight,
    ExternalLink,
    Search,
    Mail,
    RefreshCw,
    SlidersHorizontal,
    CheckCircle2
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, Timestamp } from "firebase/firestore";
import CertificateGenerator from "@/components/certificates/CertificateGenerator";
import EventMailTab from "@/components/certificates/EventMailTab";
import GoogleBadge from "@/components/GoogleBadge";
import Link from "next/link";

interface CertificatesTabProps {
    events?: any[];
    adminName?: string;
    theme?: "light" | "dark";
}

interface Participant {
    id: string;
    name: string;
    email: string;
    userId: string;
    department?: string;
    college?: string;
    phoneNumber?: string;
    registeredAt?: any;
}

export default function CertificatesTab({
    events = [],
    adminName,
    theme = "light",
}: CertificatesTabProps) {
    const isDark = theme === "dark";

    const [allEvents, setAllEvents] = useState<any[]>(events);
    const [selectedEventId, setSelectedEventId] = useState<string>("");
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [loadingParticipants, setLoadingParticipants] = useState(false);
    const [activeSubView, setActiveSubView] = useState<"certificates" | "mailer">("certificates");
    const [eventSearch, setEventSearch] = useState("");

    // If events prop is empty, fetch from Firestore
    useEffect(() => {
        if (events && events.length > 0) {
            setAllEvents(events);
            if (!selectedEventId) setSelectedEventId(events[0].id);
        } else {
            const fetchEventsList = async () => {
                try {
                    const snap = await getDocs(query(collection(db, "events"), orderBy("createdAt", "desc")));
                    const fetched = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
                    setAllEvents(fetched);
                    if (fetched.length > 0 && !selectedEventId) {
                        setSelectedEventId(fetched[0].id);
                    }
                } catch (e) {
                    console.log("Error loading events in CertificatesTab:", e);
                }
            };
            fetchEventsList();
        }
    }, [events]);

    // Fetch participants for currently selected event
    useEffect(() => {
        if (!selectedEventId) return;

        const loadEventAttendees = async () => {
            setLoadingParticipants(true);
            try {
                const snap = await getDocs(
                    query(collection(db, "events", selectedEventId, "participants"), orderBy("registeredAt", "desc"))
                );
                const list = snap.docs.map((d) => ({
                    id: d.id,
                    ...d.data(),
                })) as Participant[];
                setParticipants(list);
            } catch (err) {
                console.error("Error loading event participants:", err);
                // Fallback to checking root attendees array
                const ev = allEvents.find((e) => e.id === selectedEventId);
                if (ev && Array.isArray(ev.attendees)) {
                    setParticipants(
                        ev.attendees.map((a: any, idx: number) => ({
                            id: `att_${idx}`,
                            name: a.name || a.displayName || "Attendee",
                            email: a.email || "",
                            userId: a.uid || "manual",
                            department: a.department || "",
                            college: a.college || "AJCE",
                        }))
                    );
                } else {
                    setParticipants([]);
                }
            } finally {
                setLoadingParticipants(false);
            }
        };

        loadEventAttendees();
    }, [selectedEventId, allEvents]);

    const selectedEvent = allEvents.find((e) => e.id === selectedEventId) || allEvents[0];

    const filteredEvents = allEvents.filter(
        (e) =>
            e.title?.toLowerCase().includes(eventSearch.toLowerCase()) ||
            e.category?.toLowerCase().includes(eventSearch.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header Card */}
            <div
                className={`p-6 rounded-3xl border shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors ${
                    isDark ? "bg-[#18181b] border-zinc-800 text-white" : "bg-white border-slate-200 text-slate-900"
                }`}
            >
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#4285F4]/10 border border-[#4285F4]/20 flex items-center justify-center text-[#4285F4] shrink-0">
                        <Award className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold tracking-tight">Event Certificates & Credential Engine</h2>
                            <GoogleBadge label="AUTOMATED ISSUANCE" variant="blue" size="sm" />
                        </div>
                        <p className={`text-xs ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
                            Select an event to upload custom frames, auto-generate student certificates with QR codes, and dispatch emails.
                        </p>
                    </div>
                </div>

                {selectedEvent && (
                    <div className="flex items-center gap-2">
                        <Link
                            href={`/core/events/${selectedEvent.id}`}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#f5f1e4] hover:bg-[#eae5d8] dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-[#d5d5d4] dark:border-zinc-700 text-xs font-semibold text-[#2c2e2a] dark:text-zinc-200 transition"
                        >
                            <span>Open Full Deck</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                )}
            </div>

            {/* Event Selector Toolbar */}
            <div
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
                    isDark ? "bg-[#141417] border-zinc-800" : "bg-slate-50 border-slate-200"
                }`}
            >
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <span className="text-xs font-mono uppercase font-bold text-slate-500 dark:text-zinc-400 shrink-0">
                        Choose Event:
                    </span>
                    <select
                        value={selectedEventId}
                        onChange={(e) => setSelectedEventId(e.target.value)}
                        className={`w-full sm:w-80 px-3 py-2 rounded-xl text-xs font-medium border outline-none cursor-pointer ${
                            isDark
                                ? "bg-zinc-900 border-zinc-700 text-white focus:border-blue-500"
                                : "bg-white border-slate-300 text-slate-900 focus:border-blue-500"
                        }`}
                    >
                        {allEvents.map((ev) => (
                            <option key={ev.id} value={ev.id}>
                                {ev.title} {ev.date ? `(${ev.date})` : ""}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Sub-view Switcher: Certificates vs Mailer */}
                <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 p-1 rounded-xl border border-slate-200 dark:border-zinc-700 shrink-0">
                    <button
                        type="button"
                        onClick={() => setActiveSubView("certificates")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            activeSubView === "certificates"
                                ? "bg-blue-600 text-white shadow-xs"
                                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                    >
                        <Award className="w-3.5 h-3.5" />
                        <span>Certificate Studio</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveSubView("mailer")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            activeSubView === "mailer"
                                ? "bg-blue-600 text-white shadow-xs"
                                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                    >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Email Attendees</span>
                    </button>
                </div>
            </div>

            {/* Main Interactive Work Area */}
            {loadingParticipants ? (
                <div className="p-12 text-center space-y-2">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-500" />
                    <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono">Loading attendee records...</p>
                </div>
            ) : selectedEvent ? (
                activeSubView === "certificates" ? (
                    <CertificateGenerator
                        eventId={selectedEvent.id}
                        eventTitle={selectedEvent.title}
                        eventDate={selectedEvent.date}
                        participants={participants}
                        isWriter={true}
                    />
                ) : (
                    <EventMailTab
                        eventId={selectedEvent.id}
                        eventTitle={selectedEvent.title}
                        eventDate={selectedEvent.date}
                        participants={participants}
                        isWriter={true}
                        whatsappLink={selectedEvent.whatsappUrl || selectedEvent.whatsappLink || selectedEvent.postRegistrationLink || ""}
                    />
                )
            ) : (
                <div className="p-12 text-center text-xs text-slate-500 dark:text-zinc-400">
                    No events available. Create an event under "Manage Events" first!
                </div>
            )}
        </div>
    );
}
