"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  X,
  GripVertical,
  Save,
  ArrowUpDown,
  Check,
  RotateCcw,
  Search,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { doc, writeBatch, addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ExecomMember } from "@/lib/data/TeamData";
import CreativeProfileAvatar from "@/components/ui/CreativeProfileAvatar";

interface ReorderExecomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  members: ExecomMember[];
  adminName?: string;
  cohortTitle?: string;
}

export default function ReorderExecomModal({
  isOpen,
  onClose,
  onSaved,
  members,
  adminName = "Admin",
  cohortTitle,
}: ReorderExecomModalProps) {
  const [ordered, setOrdered] = useState<ExecomMember[]>([]);
  const [initialList, setInitialList] = useState<ExecomMember[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const dragIndexRef = useRef<number | null>(null);
  const prevIsOpen = useRef(false);

  useEffect(() => {
    if (isOpen && !prevIsOpen.current) {
      const cloned = [...members];
      setOrdered(cloned);
      setInitialList(cloned);
      setSaved(false);
      setSearchQuery("");
      setDragOverIdx(null);
    }
    prevIsOpen.current = isOpen;
  }, [isOpen, members]);

  // Handle Drag Start
  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>, index: number) => {
      dragIndexRef.current = index;
      e.dataTransfer.effectAllowed = "move";
      try {
        e.dataTransfer.setData("text/plain", `${index}`);
      } catch (_) {}
    },
    []
  );

  // Handle Drag Over
  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>, index: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setDragOverIdx(index);
    },
    []
  );

  // Handle Drop
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
      e.preventDefault();
      let from = dragIndexRef.current;
      if (from === null) {
        try {
          const dataStr = e.dataTransfer.getData("text/plain");
          if (dataStr) from = parseInt(dataStr, 10);
        } catch (_) {}
      }
      setDragOverIdx(null);
      if (from === null || isNaN(from) || from === dropIndex) return;

      setOrdered((prev) => {
        const next = [...prev];
        const [moved] = next.splice(from, 1);
        next.splice(dropIndex, 0, moved);
        return next;
      });

      dragIndexRef.current = null;
    },
    []
  );

  const handleDragEnd = useCallback(() => {
    dragIndexRef.current = null;
    setDragOverIdx(null);
  }, []);

  // Move Up
  const moveUp = (index: number) => {
    if (index === 0) return;
    setOrdered((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  // Move Down
  const moveDown = (index: number) => {
    setOrdered((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  // Move to Top
  const moveToTop = (index: number) => {
    if (index === 0) return;
    setOrdered((prev) => {
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.unshift(moved);
      return next;
    });
  };

  // Reset to original order
  const handleReset = () => {
    setOrdered([...initialList]);
  };

  // Save changes to Firestore
  const handleSave = async () => {
    setSaving(true);
    try {
      const batch = writeBatch(db);

      ordered.forEach((member, idx) => {
        const docId = member.id || member.username || member.name.toLowerCase().replace(/\s+/g, "-");
        if (docId) {
          const ref = doc(db, "coreProfiles", docId);
          batch.set(
            ref,
            {
              name: member.name,
              role: member.role,
              track: member.track || "Technology",
              team: member.team || null,
              email: member.email || null,
              dept: member.dept || "CSE",
              year: member.year || "2026",
              username: member.username || docId,
              image: member.image || null,
              linkedin: member.linkedin || null,
              github: member.github || null,
              sortOrder: idx,
              updatedAt: Timestamp.now(),
            },
            { merge: true }
          );
        }
      });

      await batch.commit();

      try {
        await addDoc(collection(db, "auditLogs"), {
          action: "EXECOM_REORDER",
          performedBy: adminName,
          target: "Execom Roster",
          details: `Reordered ${ordered.length} Execom members (${cohortTitle || "all cohorts"})`,
          timestamp: Timestamp.now(),
        });
      } catch (_) {}

      setSaved(true);
      onSaved();

      setTimeout(() => {
        onClose();
        setSaved(false);
      }, 1000);
    } catch (err) {
      console.error("Error saving order:", err);
      alert("Failed to save Execom order. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const filteredOrdered = searchQuery.trim()
    ? ordered.filter(
        (m) =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (m.track && m.track.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : ordered;

  const isOrderChanged = JSON.stringify(ordered.map((m) => m.name)) !== JSON.stringify(initialList.map((m) => m.name));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Card */}
          <motion.div
            className="relative z-10 w-full max-w-xl bg-white rounded-[32px] border border-[#d5d5d4] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            initial={{ scale: 0.95, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 16 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#f5f1e4] bg-[#f5f1e4]/40 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-[#2ba0ff]/10 text-[#2ba0ff] flex items-center justify-center">
                  <ArrowUpDown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#2c2e2a]">
                    Rearrange Execom Members {cohortTitle ? `· ${cohortTitle}` : ""}
                  </h3>
                  <p className="text-[11px] text-[#80827f]">
                    Drag items or use arrow controls to reorder. Live updates on public directory.
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-white flex items-center justify-center transition text-[#80827f] hover:text-[#2c2e2a] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sub-toolbar: Quick search and reset */}
            <div className="px-6 py-3 border-b border-[#f5f1e4] flex items-center justify-between gap-3 shrink-0">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#80827f]" />
                <input
                  type="text"
                  placeholder="Filter by name, role or track..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-full bg-[#f5f1e4] border border-transparent focus:border-[#2ba0ff] text-xs text-[#2c2e2a] outline-hidden placeholder:text-[#80827f]"
                />
              </div>

              {isOrderChanged && (
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#80827f] hover:text-[#2c2e2a] hover:bg-[#f5f1e4] transition cursor-pointer"
                  title="Reset to original order"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Scrollable list of members */}
            <div className="flex-1 overflow-y-auto px-6 py-3 space-y-2">
              {filteredOrdered.map((member) => {
                const actualIndex = ordered.findIndex((m) => (m.id && m.id === member.id) || m.name === member.name);
                const isDragOver = dragOverIdx === actualIndex;

                return (
                  <div
                    key={member.id || member.username || member.name}
                    draggable
                    onDragStart={(e) => handleDragStart(e, actualIndex)}
                    onDragOver={(e) => handleDragOver(e, actualIndex)}
                    onDrop={(e) => handleDrop(e, actualIndex)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[20px] bg-[#f5f1e4]/70 border transition-all select-none ${
                      isDragOver
                        ? "border-[#2ba0ff] bg-[#2ba0ff]/5 scale-[1.01] shadow-sm"
                        : "border-[#d5d5d4] hover:border-[#2ba0ff]/40 hover:bg-[#f5f1e4]"
                    } cursor-grab active:cursor-grabbing group`}
                  >
                    {/* Drag Handle */}
                    <div className="text-[#c5c3be] group-hover:text-[#80827f] transition shrink-0">
                      <GripVertical className="w-4 h-4" />
                    </div>

                    {/* Order Index Pill */}
                    <div className="w-6 h-6 rounded-full bg-white border border-[#d5d5d4] text-[10px] font-bold font-mono text-[#2c2e2a] flex items-center justify-center shrink-0 shadow-2xs">
                      {actualIndex + 1}
                    </div>

                    {/* Member Avatar */}
                    <CreativeProfileAvatar
                      src={member.image}
                      name={member.name}
                      variant={actualIndex}
                      size="sm"
                      className="w-8 h-8 rounded-full border border-[#d5d5d4] shrink-0"
                    />

                    {/* Member Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-[#2c2e2a] truncate">
                          {member.name}
                        </p>
                        {member.year && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white border border-[#d5d5d4] text-[#80827f]">
                            {member.year}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#80827f] truncate">
                        <span className="font-semibold text-[#2c2e2a]">{member.role}</span>
                        {member.track ? ` · ${member.track}` : ""}
                      </p>
                    </div>

                    {/* Control Buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => moveToTop(actualIndex)}
                        disabled={actualIndex === 0}
                        className="px-1.5 py-1 rounded-md text-[10px] font-mono text-[#80827f] hover:text-[#2c2e2a] hover:bg-white transition disabled:opacity-20 disabled:cursor-not-allowed hidden sm:inline-block"
                        title="Move to top"
                      >
                        Top
                      </button>

                      <button
                        onClick={() => moveUp(actualIndex)}
                        disabled={actualIndex === 0}
                        className="w-6 h-6 rounded-md flex items-center justify-center text-[#80827f] hover:text-[#2c2e2a] hover:bg-white transition disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                        title="Move up"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => moveDown(actualIndex)}
                        disabled={actualIndex === ordered.length - 1}
                        className="w-6 h-6 rounded-md flex items-center justify-center text-[#80827f] hover:text-[#2c2e2a] hover:bg-white transition disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                        title="Move down"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#f5f1e4] bg-[#f5f1e4]/40 flex items-center justify-between shrink-0">
              <p className="text-[11px] text-[#80827f] font-mono">
                {ordered.length} members ordered
              </p>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-[#80827f] hover:bg-white transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSave}
                  disabled={saving || saved}
                  className={`inline-flex items-center gap-1.5 px-6 py-2 rounded-full text-xs font-bold shadow-md transition active:scale-95 cursor-pointer ${
                    saved
                      ? "bg-[#34A853] text-white"
                      : "bg-[#2c2e2a] hover:bg-[#141414] text-white disabled:opacity-60"
                  }`}
                >
                  {saved ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Order Saved!</span>
                    </>
                  ) : saving ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Saving Order...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Order</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
