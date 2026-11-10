"use client";

import React, { useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  LayoutGrid,
  List,
  UploadCloud,
  ExternalLink,
  Lock,
  Settings,
  ArrowUpDown,
  Users,
} from "lucide-react";
import { doc, deleteDoc, writeBatch, collection, Timestamp, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import GoogleLabsMemberCard from "@/components/cards/GoogleLabsMemberCard";
import CreativeProfileAvatar from "@/components/ui/CreativeProfileAvatar";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import { GDG_EXECOM_2026, ExecomMember } from "@/lib/data/TeamData";
import AddExecomMemberModal from "../modals/AddExecomMemberModal";
import UploadPreviousExecomModal from "../modals/UploadPreviousExecomModal";
import ReorderExecomModal from "../modals/ReorderExecomModal";

interface ExecomManagementTabProps {
  members: ExecomMember[];
  onRefresh: () => void;
  adminName?: string;
  isSuperAdmin?: boolean;
  onOpenDriveSettings?: () => void;
}

export default function ExecomManagementTab({
  members,
  onRefresh,
  adminName = "Admin",
  isSuperAdmin = true,
  onOpenDriveSettings,
}: ExecomManagementTabProps) {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadPastOpen, setIsUploadPastOpen] = useState(false);
  const [isReorderOpen, setIsReorderOpen] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState<string>("all");
  const [editingMember, setEditingMember] = useState<ExecomMember | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  // Compute available cohorts dynamically from Firestore members
  const availableCohorts = React.useMemo(() => {
    const set = new Set<string>(["2026", "2025", "2024"]);
    members.forEach((m) => {
      if (m.year) set.add(m.year);
    });
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [members]);

  // Filter members by cohort
  const displayedMembers = React.useMemo(() => {
    if (selectedCohort === "all") return members;
    return members.filter((m) => (m.year || "2026") === selectedCohort);
  }, [members, selectedCohort]);

  // Handle Deleting Member
  const handleDelete = async (member: ExecomMember) => {
    if (!confirm(`Are you sure you want to remove ${member.name} from the Execom roster?`)) return;
    setDeletingId(member.id || member.username || member.name);

    try {
      if (member.id) {
        await deleteDoc(doc(db, "coreProfiles", member.id));
      }
      try {
        await addDoc(collection(db, "auditLogs"), {
          action: "EXECOM_DELETE",
          performedBy: adminName,
          target: member.name,
          details: `Removed ${member.name} (${member.role}) from Execom`,
          timestamp: Timestamp.now(),
        });
      } catch (e) {}

      onRefresh();
    } catch (err) {
      console.error("Error deleting member:", err);
      alert("Failed to delete member.");
    } finally {
      setDeletingId(null);
    }
  };

  // Seed Default Execom Members into Firestore
  const handleSeed = async () => {
    if (!confirm(`Seed all ${GDG_EXECOM_2026.length} official GDG 2025-26 Execom members with creative illustrations, emails, and profiles into Firestore?`)) return;
    setSeeding(true);

    try {
      const batch = writeBatch(db);
      GDG_EXECOM_2026.forEach((m) => {
        const docRef = doc(db, "coreProfiles", m.username || m.name.toLowerCase().replace(/\s+/g, "-"));
        batch.set(docRef, {
          name: m.name,
          role: m.role,
          track: m.track,
          team: m.team || null,
          email: m.email || null,
          dept: m.dept || "CSE",
          year: m.year || null,
          username: m.username || m.name.toLowerCase().replace(/\s+/g, "-"),
          linkedin: m.linkedin || null,
          github: m.github || null,
          createdAt: Timestamp.now(),
        }, { merge: true });
      });

      await batch.commit();
      onRefresh();
      alert(`Successfully seeded ${GDG_EXECOM_2026.length} Execom members into Firestore!`);
    } catch (err) {
      console.error("Error seeding Execom:", err);
      alert("Failed to seed Execom members.");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6 select-none">
      {/* TOOLBAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-[28px] bg-white border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              Chapter Leadership & Execom ({members.length})
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200/60">
              Core Roster
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            All changes sync directly with the public <span className="font-mono text-blue-600 font-medium">/about#execom</span> directory.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* PRIMARY: Add Execom Member Button (Always Prominent & Accessible) */}
          <button
            onClick={() => {
              setEditingMember(selectedCohort !== "all" ? ({ year: selectedCohort } as any) : ({ year: "2026" } as any));
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Execom Member</span>
          </button>

          {/* Grid / Table view toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/80">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              title="Google Labs Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                viewMode === "table"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Rearrange Order Button */}
          <button
            onClick={() => setIsReorderOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs font-semibold text-slate-700 transition cursor-pointer"
            title="Rearrange Execom member display order"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-blue-600" />
            <span>Rearrange Order</span>
          </button>

          {/* Upload Past Execom Button */}
          <button
            onClick={() => setIsUploadPastOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs font-semibold text-slate-700 transition cursor-pointer"
            title="Upload previous year's Execom roster (CSV, spreadsheet text, or manual)"
          >
            <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
            <span>Upload Past</span>
          </button>

          {/* Seed 2026 Roster button */}
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs font-medium text-slate-700 transition disabled:opacity-50 cursor-pointer"
            title="Seed default leads from TeamData"
          >
            <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
            <span>{seeding ? "Seeding..." : "Seed 2026"}</span>
          </button>

          {onOpenDriveSettings && (
            <button
              onClick={onOpenDriveSettings}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-xs font-semibold text-slate-700 transition cursor-pointer"
              title="Configure Application Form & Questions"
            >
              <Settings className="w-3.5 h-3.5 text-blue-600" />
              <span>Drive Settings</span>
            </button>
          )}
        </div>
      </div>

      {/* COHORT / YEAR FILTER PILLS */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setSelectedCohort("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
              selectedCohort === "all"
                ? "bg-slate-900 text-white shadow-2xs"
                : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
            }`}
          >
            All Rosters ({members.length})
          </button>
          {availableCohorts.map((year) => {
            const count = members.filter((m) => (m.year || "2026") === year).length;
            const label =
              year === "2026"
                ? "2025-26 (Active)"
                : year === "2025"
                ? "2024-25 Alumni"
                : year === "2024"
                ? "2023-24 Alumni"
                : `${year} Cohort`;
            return (
              <button
                key={year}
                onClick={() => setSelectedCohort(year)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
                  selectedCohort === year
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
                }`}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>

        {/* Quick Add Button in Filter Bar */}
        <button
          onClick={() => {
            setEditingMember(selectedCohort !== "all" ? ({ year: selectedCohort } as any) : ({ year: "2026" } as any));
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold shrink-0 cursor-pointer transition"
        >
          <Plus className="w-3 h-3" />
          <span>Add to {selectedCohort !== "all" ? selectedCohort : "2026"}</span>
        </button>
      </div>

      {displayedMembers.length === 0 ? (
        <div className="p-12 rounded-[28px] bg-white border border-slate-200 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">No members found for this roster</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              No executive committee members exist for {selectedCohort !== "all" ? `cohort ${selectedCohort}` : "the selected filter"}. Upload past archives or add members to populate this roster.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => {
                setEditingMember(selectedCohort !== "all" ? ({ year: selectedCohort } as any) : ({ year: "2026" } as any));
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Execom Member</span>
            </button>
            <button
              onClick={() => setIsUploadPastOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition cursor-pointer border border-slate-200"
            >
              <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
              <span>Upload Past Execom</span>
            </button>
          </div>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedMembers.map((member, idx) => (
            <div key={member.id || member.username || idx} className="relative group/card">
              <GoogleLabsMemberCard member={member} index={idx} />

              {/* Admin Action Overlay on Top-Right */}
              {isSuperAdmin && (
                <div className="absolute top-3 right-3 z-20 flex items-center gap-1 opacity-90 group-hover/card:opacity-100 transition">
                  <button
                    onClick={() => {
                      setEditingMember(member);
                      setIsModalOpen(true);
                    }}
                    className="w-7 h-7 rounded-full bg-white/90 hover:bg-white text-[#2c2e2a] shadow-md flex items-center justify-center transition hover:scale-105"
                    title="Edit Member"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(member)}
                    disabled={deletingId === (member.id || member.username)}
                    className="w-7 h-7 rounded-full bg-white/90 hover:bg-[#ff705d] hover:text-white text-[#ff705d] shadow-md flex items-center justify-center transition hover:scale-105"
                    title="Delete Member"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* CONTENT: TABLE VIEW */
        <div className="rounded-[32px] bg-white border border-[#d5d5d4] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f5f1e4] border-b border-[#d5d5d4] font-mono text-[#80827f] uppercase">
                <tr>
                  <th className="px-6 py-3.5">Member</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Track / Specialty</th>
                  <th className="px-6 py-3.5">Dept</th>
                  <th className="px-6 py-3.5">Year</th>
                  <th className="px-6 py-3.5 text-right">{isSuperAdmin ? "Actions" : "Status"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f1e4]">
                {displayedMembers.map((member, idx) => (
                  <tr key={member.id || idx} className="hover:bg-[#f5f1e4]/50 transition">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <CreativeProfileAvatar
                        src={member.image}
                        name={member.name}
                        variant={idx}
                        size="sm"
                        className="w-8 h-8 rounded-full border border-[#d5d5d4]"
                      />
                      <div>
                        <p className="font-bold text-[#2c2e2a]">{member.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-[#80827f] font-mono">
                            @{member.username || "gdg-lead"}
                          </span>
                          {member.linkedin && (
                            <a
                              href={member.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#80827f] hover:text-[#0077b5] transition"
                              title="LinkedIn"
                            >
                              <FaLinkedin className="w-3 h-3" />
                            </a>
                          )}
                          {member.github && (
                            <a
                              href={member.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#80827f] hover:text-black transition"
                              title="GitHub"
                            >
                              <FaGithub className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#2c2e2a]">{member.role}</td>
                    <td className="px-6 py-4 text-[#80827f]">{member.track}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#f5f1e4] border border-[#d5d5d4] font-mono text-[10px] font-bold">
                        {member.dept || "CSE"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#f5f1e4] border border-[#d5d5d4] font-mono text-[10px] font-bold">
                        {member.year || "2026"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {isSuperAdmin ? (
                        <>
                          <button
                            onClick={() => {
                              setEditingMember(member);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 rounded-full hover:bg-[#f5f1e4] text-[#2ba0ff] transition"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(member)}
                            className="p-1.5 rounded-full hover:bg-[#ff705d]/15 text-[#ff705d] transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <span className="text-[10px] font-mono text-[#34A853] bg-[#8ed462]/20 px-2.5 py-1 rounded-full font-semibold">
                          Active Lead
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      <AddExecomMemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={onRefresh}
        initialData={editingMember}
        adminName={adminName}
      />

      {/* UPLOAD PAST EXECOM MODAL */}
      <UploadPreviousExecomModal
        isOpen={isUploadPastOpen}
        onClose={() => setIsUploadPastOpen(false)}
        onSaved={onRefresh}
        adminName={adminName}
      />

      {/* REARRANGE / REORDER EXECOM MODAL */}
      <ReorderExecomModal
        isOpen={isReorderOpen}
        onClose={() => setIsReorderOpen(false)}
        onSaved={onRefresh}
        members={displayedMembers}
        adminName={adminName}
        cohortTitle={
          selectedCohort === "all"
            ? "All Rosters"
            : selectedCohort === "2026"
            ? "2025-26 Active"
            : `${selectedCohort} Cohort`
        }
      />
    </div>
  );
}
