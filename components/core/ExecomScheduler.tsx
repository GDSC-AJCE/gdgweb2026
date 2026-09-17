"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    X,
    Calendar,
    Clock,
    Trash2,
    Check,
    Link as LinkIcon,
    Users,
    Video,
    UserCheck,
    Save
} from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { fmtDate, slotTime } from "@/lib/scheduler-utils";
import GoogleBadge from "../GoogleBadge";

interface Slot {
    appId: string;
    name: string;
    slotIndex: number;
}

interface Panel {
    id: string;
    name: string;
    startTime: string;
    slotMinutes: number;
    totalSlots: number;
    slots: Slot[];
    meetingLink?: string;
}

interface ScheduleDay {
    id: string;
    date: string;
    sessionName: string;
    panels: Panel[];
}

interface ExecomSchedulerProps {
    pendingApplicants: { id: string; name: string; email: string }[];
}

const uid = () => Math.random().toString(36).slice(2, 8);

export default function ExecomScheduler({ pendingApplicants }: ExecomSchedulerProps) {
    const [scheduleDays, setScheduleDays] = useState<ScheduleDay[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeDayId, setActiveDayId] = useState<string | null>(null);
    const [showAddDayModal, setShowAddDayModal] = useState(false);
    const [selectedApplicant, setSelectedApplicant] = useState<{ id: string; name: string } | null>(null);

    // New day form state
    const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);
    const [newSessionName, setNewSessionName] = useState("Afternoon Session");
    const [newStartTime, setNewStartTime] = useState("14:00");
    const [newSlotMinutes, setNewSlotMinutes] = useState(15);
    const [newTotalSlots, setNewTotalSlots] = useState(6);

    useEffect(() => {
        const loadSchedule = async () => {
            try {
                const snap = await getDoc(doc(db, "settings", "execomSchedule"));
                if (snap.exists() && snap.data().days) {
                    const days = snap.data().days as ScheduleDay[];
                    setScheduleDays(days);
                    if (days.length > 0) setActiveDayId(days[0].id);
                }
            } catch (err) {
                console.error("Error loading schedule:", err);
            } finally {
                setLoading(false);
            }
        };
        loadSchedule();
    }, []);

    const saveSchedule = async (updatedDays: ScheduleDay[]) => {
        setSaving(true);
        try {
            await setDoc(doc(db, "settings", "execomSchedule"), {
                days: updatedDays,
                updatedAt: new Date()
            }, { merge: true });
        } catch (err) {
            console.error("Error saving schedule:", err);
        } finally {
            setSaving(false);
        }
    };

    const handleAddDay = () => {
        const day: ScheduleDay = {
            id: uid(),
            date: newDate,
            sessionName: newSessionName,
            panels: [
                {
                    id: uid(),
                    name: "Panel Alpha (Technical)",
                    startTime: newStartTime,
                    slotMinutes: newSlotMinutes,
                    totalSlots: newTotalSlots,
                    slots: [],
                    meetingLink: "https://meet.google.com/"
                },
                {
                    id: uid(),
                    name: "Panel Beta (Design & Media)",
                    startTime: newStartTime,
                    slotMinutes: newSlotMinutes,
                    totalSlots: newTotalSlots,
                    slots: [],
                    meetingLink: "https://meet.google.com/"
                }
            ]
        };

        const updated = [...scheduleDays, day];
        setScheduleDays(updated);
        setActiveDayId(day.id);
        setShowAddDayModal(false);
        saveSchedule(updated);
    };

    const handleRemoveDay = (dayId: string) => {
        const updated = scheduleDays.filter(d => d.id !== dayId);
        setScheduleDays(updated);
        if (activeDayId === dayId) {
            setActiveDayId(updated.length > 0 ? updated[0].id : null);
        }
        saveSchedule(updated);
    };

    const handleAssignSlot = (panelId: string, slotIdx: number) => {
        if (!selectedApplicant || !activeDayId) return;

        const updated = scheduleDays.map(day => {
            if (day.id !== activeDayId) return day;
            return {
                ...day,
                panels: day.panels.map(panel => {
                    if (panel.id !== panelId) return panel;
                    const existingSlotIdx = panel.slots.findIndex(s => s.slotIndex === slotIdx);
                    let newSlots = [...panel.slots];
                    if (existingSlotIdx >= 0) {
                        newSlots[existingSlotIdx] = {
                            appId: selectedApplicant.id,
                            name: selectedApplicant.name,
                            slotIndex: slotIdx
                        };
                    } else {
                        newSlots.push({
                            appId: selectedApplicant.id,
                            name: selectedApplicant.name,
                            slotIndex: slotIdx
                        });
                    }
                    return { ...panel, slots: newSlots };
                })
            };
        });

        setScheduleDays(updated);
        setSelectedApplicant(null);
        saveSchedule(updated);
    };

    const handleClearSlot = (panelId: string, slotIdx: number) => {
        if (!activeDayId) return;
        const updated = scheduleDays.map(day => {
            if (day.id !== activeDayId) return day;
            return {
                ...day,
                panels: day.panels.map(panel => {
                    if (panel.id !== panelId) return panel;
                    return {
                        ...panel,
                        slots: panel.slots.filter(s => s.slotIndex !== slotIdx)
                    };
                })
            };
        });

        setScheduleDays(updated);
        saveSchedule(updated);
    };

    const activeDay = scheduleDays.find(d => d.id === activeDayId);

    // List of already assigned applicant IDs across all panels in all days
    const assignedIds = new Set<string>();
    scheduleDays.forEach(d => d.panels.forEach(p => p.slots.forEach(s => assignedIds.add(s.appId))));

    const unassignedApplicants = pendingApplicants.filter(a => !assignedIds.has(a.id));

    return (
        <div className="space-y-6 text-xs">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#4285F4]" />
                    <h3 className="text-base font-bold text-white tracking-tight">Interview Slot Matrix</h3>
                    {saving && <span className="text-[10px] text-zinc-500 font-mono animate-pulse">Syncing...</span>}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowAddDayModal(true)}
                        className="px-4 py-2 rounded-2xl bg-[#4285F4] hover:bg-[#3367D6] text-white font-semibold transition flex items-center gap-1.5 shadow-md"
                    >
                        <Plus className="w-4 h-4" />
                        Add Interview Day
                    </button>
                </div>
            </div>

            {/* Days Tabs */}
            {scheduleDays.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {scheduleDays.map(day => (
                        <div
                            key={day.id}
                            onClick={() => setActiveDayId(day.id)}
                            className={`px-4 py-2.5 rounded-2xl border transition cursor-pointer flex items-center gap-2.5 shrink-0 ${
                                activeDayId === day.id
                                    ? "bg-[#4285F4]/15 border-[#4285F4]/50 text-white"
                                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                            }`}
                        >
                            <Calendar className="w-4 h-4 text-[#4285F4]" />
                            <div>
                                <p className="font-bold text-xs">{day.sessionName}</p>
                                <p className="text-[10px] font-mono text-zinc-400">{day.date}</p>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleRemoveDay(day.id); }}
                                className="ml-1 text-zinc-500 hover:text-red-400 p-1"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Main Scheduling Area: Left Pool, Right Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Applicant Pool */}
                <div className="lg:col-span-4 bg-[#18191b] border border-white/10 rounded-3xl p-5 flex flex-col max-h-[580px]">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                        <span className="font-bold text-white uppercase tracking-wider text-[11px] font-mono">
                            Applicants Pool ({unassignedApplicants.length})
                        </span>
                        <GoogleBadge label="READY TO SLOT" variant="blue" size="sm" />
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                        {unassignedApplicants.length === 0 ? (
                            <div className="p-8 text-center text-zinc-500">
                                All candidate slots allocated.
                            </div>
                        ) : (
                            unassignedApplicants.map(app => {
                                const isSelected = selectedApplicant?.id === app.id;
                                return (
                                    <div
                                        key={app.id}
                                        onClick={() => setSelectedApplicant(isSelected ? null : app)}
                                        className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                                            isSelected
                                                ? "bg-[#4285F4] border-[#4285F4] text-white shadow-md"
                                                : "bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-300"
                                        }`}
                                    >
                                        <div>
                                            <p className="font-bold text-xs">{app.name}</p>
                                            <p className={`text-[10px] font-mono ${isSelected ? "text-white/80" : "text-zinc-500"}`}>{app.email}</p>
                                        </div>
                                        <span className="text-[10px] font-mono uppercase font-bold">
                                            {isSelected ? "Selected" : "Tap"}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {selectedApplicant && (
                        <div className="mt-3 p-3 rounded-2xl bg-[#4285F4]/15 border border-[#4285F4]/30 text-center text-[#4285F4] font-medium">
                            Click any open slot on the right to place <strong>{selectedApplicant.name}</strong>.
                        </div>
                    )}
                </div>

                {/* Right: Panels & Slots Grid */}
                <div className="lg:col-span-8 space-y-6">
                    {activeDay ? (
                        activeDay.panels.map(panel => (
                            <div key={panel.id} className="bg-[#18191b] border border-white/10 rounded-3xl p-5 space-y-4">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-white/10">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-[#4285F4]" />
                                        <h4 className="font-bold text-white text-sm">{panel.name}</h4>
                                        <span className="text-[10px] font-mono text-zinc-400">
                                            {panel.slotMinutes} mins &bull; Starts {panel.startTime}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
                                        <Video className="w-3.5 h-3.5 text-[#34A853]" />
                                        <input
                                            type="text"
                                            value={panel.meetingLink || ""}
                                            onChange={(e) => {
                                                const updated = scheduleDays.map(d => d.id === activeDay.id ? {
                                                    ...d,
                                                    panels: d.panels.map(p => p.id === panel.id ? { ...p, meetingLink: e.target.value } : p)
                                                } : d);
                                                setScheduleDays(updated);
                                                saveSchedule(updated);
                                            }}
                                            placeholder="Google Meet Link"
                                            className="px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs w-44"
                                        />
                                    </div>
                                </div>

                                {/* Slots Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                    {Array.from({ length: panel.totalSlots }).map((_, slotIdx) => {
                                        const assignedSlot = panel.slots.find(s => s.slotIndex === slotIdx);
                                        const timeLabel = slotTime(panel.startTime, slotIdx, panel.slotMinutes);

                                        return (
                                            <div
                                                key={slotIdx}
                                                onClick={() => {
                                                    if (selectedApplicant) {
                                                        handleAssignSlot(panel.id, slotIdx);
                                                    }
                                                }}
                                                className={`p-3.5 rounded-2xl border transition relative flex flex-col justify-between min-h-[90px] ${
                                                    assignedSlot
                                                        ? "bg-zinc-900 border-white/10"
                                                        : selectedApplicant
                                                        ? "bg-[#4285F4]/10 border-[#4285F4]/40 hover:bg-[#4285F4]/20 cursor-pointer border-dashed"
                                                        : "bg-zinc-900/40 border-white/5 border-dashed"
                                                }`}
                                            >
                                                <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500">
                                                    <span>{timeLabel}</span>
                                                    <span>Slot {slotIdx + 1}</span>
                                                </div>

                                                {assignedSlot ? (
                                                    <div className="flex items-center justify-between mt-2">
                                                        <div className="truncate pr-1">
                                                            <p className="font-bold text-white text-xs truncate">{assignedSlot.name}</p>
                                                            <p className="text-[10px] text-[#34A853] font-mono">Confirmed</p>
                                                        </div>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleClearSlot(panel.id, slotIdx); }}
                                                            className="text-zinc-500 hover:text-red-400 p-1 shrink-0"
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <p className="text-zinc-600 text-[11px] italic mt-2">
                                                        {selectedApplicant ? "Tap to assign" : "Available Slot"}
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-[#18191b] border border-white/10 rounded-3xl p-12 text-center text-zinc-500">
                            No interview days defined. Click "Add Interview Day" above to configure panels and time slots.
                        </div>
                    )}
                </div>
            </div>

            {/* Modal: Add Day */}
            <AnimatePresence>
                {showAddDayModal && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAddDayModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative w-full max-w-md bg-[#18191b] border border-white/10 rounded-3xl p-6 space-y-4 shadow-2xl"
                        >
                            <div className="flex justify-between items-center pb-3 border-b border-white/10">
                                <h3 className="text-base font-bold text-white">Create Interview Session</h3>
                                <button onClick={() => setShowAddDayModal(false)} className="p-1 text-zinc-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Session Title</label>
                                    <input
                                        type="text"
                                        value={newSessionName}
                                        onChange={(e) => setNewSessionName(e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs"
                                        placeholder="e.g. Day 1: Technical Rounds"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Date</label>
                                        <input
                                            type="date"
                                            value={newDate}
                                            onChange={(e) => setNewDate(e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Start Time</label>
                                        <input
                                            type="time"
                                            value={newStartTime}
                                            onChange={(e) => setNewStartTime(e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Slot Duration</label>
                                        <select
                                            value={newSlotMinutes}
                                            onChange={(e) => setNewSlotMinutes(parseInt(e.target.value))}
                                            className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs"
                                        >
                                            <option value={10}>10 minutes</option>
                                            <option value={15}>15 minutes</option>
                                            <option value={20}>20 minutes</option>
                                            <option value={30}>30 minutes</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Slots Per Panel</label>
                                        <input
                                            type="number"
                                            min={2}
                                            max={20}
                                            value={newTotalSlots}
                                            onChange={(e) => setNewTotalSlots(parseInt(e.target.value) || 6)}
                                            className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-3 flex justify-end gap-2 border-t border-white/10">
                                <button
                                    onClick={() => setShowAddDayModal(false)}
                                    className="px-4 py-2 rounded-full border border-zinc-700 text-zinc-300 text-xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddDay}
                                    className="px-5 py-2 rounded-full bg-[#4285F4] hover:bg-[#3367D6] text-white font-semibold text-xs shadow-md"
                                >
                                    Add Session
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
