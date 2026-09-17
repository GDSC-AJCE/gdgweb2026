"use client";

import React, { useState } from "react";
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  Users,
  Download,
  ExternalLink,
  Clock,
  MapPin,
} from "lucide-react";
import { doc, deleteDoc, addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import * as XLSX from "xlsx";
import Link from "next/link";
import CreativeEventPoster from "@/components/programs/CreativeEventPoster";

interface EventsManagementTabProps {
  events: any[];
  onRefresh: () => void;
  onOpenCreateModal: () => void;
  onOpenEditModal: (event: any) => void;
  adminName?: string;
}

export default function EventsManagementTab({
  events,
  onRefresh,
  onOpenCreateModal,
  onOpenEditModal,
  adminName = "Admin",
}: EventsManagementTabProps) {
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredEvents = events.filter((e) => {
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
    XLSX.writeFile(wb, `${(event.title || "event").replace(/[^a-zA-Z0-9]/g, "_")}_attendees.xlsx`);
  };

  return (
    <div className="space-y-6 select-none">
      {/* TOOLBAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-[32px] bg-white border border-[#d5d5d4] shadow-xs">
        <div>
          <h3 className="text-base font-bold text-[#2c2e2a]">
            Events & Workshops ({events.length})
          </h3>
          <p className="text-xs text-[#80827f]">
            Manage registrations, published status, and attendee rosters.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events..."
            className="px-4 py-2 rounded-[50px] bg-[#f5f1e4] border border-[#d5d5d4] text-xs font-medium text-[#2c2e2a] focus:outline-none focus:border-[#2ba0ff] w-40 sm:w-48"
          />

          {/* Filter Pills */}
          <div className="flex items-center p-1 rounded-full bg-[#f5f1e4] border border-[#d5d5d4]">
            {(["all", "upcoming", "past"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition ${
                  filter === f
                    ? "bg-white text-[#2c2e2a] shadow-xs"
                    : "text-[#80827f] hover:text-[#2c2e2a]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Create Event Button */}
          <button
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-[50px] bg-[#2c2e2a] hover:bg-[#141414] text-white text-xs font-semibold shadow-md transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Event</span>
          </button>
        </div>
      </div>

      {/* EVENTS GRID */}
      {filteredEvents.length === 0 ? (
        <div className="p-12 text-center rounded-[32px] bg-white border border-[#d5d5d4] text-xs text-[#80827f]">
          No events found matching your filter criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const attendeeCount = (event.attendees || event.rsvps || []).length;
            const isPast = event.date && new Date(event.date) < new Date();

            return (
              <div
                key={event.id}
                className="rounded-[32px] bg-white border border-[#d5d5d4] p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 overflow-hidden"
              >
                {/* Poster Thumbnail */}
                <div className="w-full h-36 -mx-6 -mt-6 mb-2 rounded-t-[32px] overflow-hidden border-b border-[#d5d5d4]">
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
                    <span className="px-3 py-1 rounded-full bg-[#f5f1e4] border border-[#d5d5d4] text-[10px] font-mono font-bold text-[#2c2e2a]">
                      {event.category || "Codelab"}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        isPast
                          ? "bg-gray-100 text-gray-600"
                          : "bg-[#34A853]/15 text-[#34A853]"
                      }`}
                    >
                      {isPast ? "Past Event" : "Upcoming"}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h4 className="text-lg font-bold text-[#2c2e2a] leading-tight line-clamp-2">
                      {event.title}
                    </h4>
                    <p className="text-xs text-[#80827f] line-clamp-2 mt-1.5">
                      {event.description || "Hands-on developer workshop hosted by GDG AJCE."}
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-1.5 pt-2 text-xs text-[#80827f]">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#ff705d]" />
                      <span>{event.date ? new Date(event.date).toLocaleDateString() : "TBA"} • {event.time || "10:00 AM"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#4285F4]" />
                      <span className="truncate">{event.location || "Auditorium / Online"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-[#34A853]" />
                      <span>{attendeeCount} Registered Attendees</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-4 border-t border-[#f5f1e4] flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenEditModal(event)}
                      className="p-2 rounded-full hover:bg-[#f5f1e4] text-[#2ba0ff] transition"
                      title="Edit Event"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => exportAttendees(event)}
                      className="p-2 rounded-full hover:bg-[#f5f1e4] text-[#34A853] transition"
                      title="Export XLSX Attendee List"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(event)}
                      disabled={deletingId === event.id}
                      className="p-2 rounded-full hover:bg-[#ff705d]/15 text-[#ff705d] transition"
                      title="Delete Event"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {event.slug && (
                    <Link
                      href={`/programs/${event.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#2c2e2a] hover:underline"
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
    </div>
  );
}
