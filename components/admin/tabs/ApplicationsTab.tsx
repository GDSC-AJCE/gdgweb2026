"use client";

import React, { useState } from "react";
import {
  FileText,
  CheckCircle,
  XCircle,
  Trash2,
  Clock,
  ExternalLink,
  Eye,
  Calendar,
  Sparkles,
  Settings,
  LayoutGrid,
  List,
  User,
  GraduationCap,
  Mail,
  Phone,
  Search,
  Check,
  X,
  Shield,
  Layers,
} from "lucide-react";
import { doc, updateDoc, deleteDoc, addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ExecomDetailsModal from "@/components/core/ExecomDetailsModal";
import { resolveName } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface ApplicationsTabProps {
  applications: any[];
  onRefresh: () => void;
  adminName?: string;
  onOpenSettings: () => void;
}

export default function ApplicationsTab({
  applications,
  onRefresh,
  adminName = "Admin",
  onOpenSettings,
}: ApplicationsTabProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filter, setFilter] = useState<"all" | "pending" | "accepted" | "rejected">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Status Counts
  const counts = {
    all: applications.length,
    pending: applications.filter((a) => (a.status || "pending") === "pending").length,
    accepted: applications.filter((a) => a.status === "accepted").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  const filteredApps = applications.filter((app) => {
    const status = app.status || "pending";
    if (filter !== "all" && status !== filter) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const candidateName = resolveName(app.name, app.displayName, app.fullName, app.email, "").toLowerCase();
    const email = (app.email || "").toLowerCase();
    const dept = (app.department || app.dept || "").toLowerCase();
    const sem = (app.semester || app.sem || "").toLowerCase();

    return candidateName.includes(q) || email.includes(q) || dept.includes(q) || sem.includes(q);
  });

  const handleUpdateStatus = async (app: any, newStatus: "accepted" | "rejected" | "pending") => {
    setProcessingId(app.id);

    try {
      const appRef = doc(db, "execomApplications", app.id);
      await updateDoc(appRef, {
        status: newStatus,
        reviewedAt: Timestamp.now(),
        reviewedBy: adminName,
      });

      try {
        await addDoc(collection(db, "auditLogs"), {
          action: `EXECOM_${newStatus.toUpperCase()}`,
          performedBy: adminName,
          target: app.name,
          details: `Application marked as ${newStatus}`,
          timestamp: Timestamp.now(),
        });
      } catch (e) {}

      onRefresh();
    } catch (err) {
      console.error(`Error marking application as ${newStatus}:`, err);
      alert(`Failed to update application status.`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (app: any) => {
    if (!confirm(`Are you sure you want to delete the application from ${app.name}? This cannot be undone.`)) {
      return;
    }
    setProcessingId(app.id);

    try {
      const appRef = doc(db, "execomApplications", app.id);
      await deleteDoc(appRef);

      try {
        await addDoc(collection(db, "auditLogs"), {
          action: "EXECOM_APPLICATION_DELETE",
          performedBy: adminName,
          target: app.name,
          details: `Deleted application from ${app.name} (${app.email})`,
          timestamp: Timestamp.now(),
        });
      } catch (e) {}

      onRefresh();
    } catch (err) {
      console.error("Error deleting application:", err);
      alert("Failed to delete application.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div
          onClick={() => setFilter("all")}
          className={`p-4 rounded-[28px] border transition-all cursor-pointer ${
            filter === "all"
              ? "bg-white border-[#2c2e2a] shadow-xs"
              : "bg-white/80 border-[#d5d5d4] hover:border-[#a0a29f]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#80827f]">Total Submissions</span>
            <Layers className="w-4 h-4 text-[#4285F4]" />
          </div>
          <div className="text-2xl font-bold text-[#0f172a] mt-2 font-mono">{counts.all}</div>
        </div>

        <div
          onClick={() => setFilter("pending")}
          className={`p-4 rounded-[28px] border transition-all cursor-pointer ${
            filter === "pending"
              ? "bg-[#F59E0B]/10 border-[#F59E0B] shadow-sm"
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Under Review</span>
            <Clock className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="text-2xl font-bold text-[#D97706] mt-2 font-mono">{counts.pending}</div>
        </div>

        <div
          onClick={() => setFilter("accepted")}
          className={`p-4 rounded-[28px] border transition-all cursor-pointer ${
            filter === "accepted"
              ? "bg-[#10B981]/10 border-[#10B981] shadow-sm"
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Accepted</span>
            <CheckCircle className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="text-2xl font-bold text-[#059669] mt-2 font-mono">{counts.accepted}</div>
        </div>

        <div
          onClick={() => setFilter("rejected")}
          className={`p-4 rounded-[28px] border transition-all cursor-pointer ${
            filter === "rejected"
              ? "bg-[#EF4444]/10 border-[#EF4444] shadow-sm"
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Rejected</span>
            <XCircle className="w-4 h-4 text-[#EF4444]" />
          </div>
          <div className="text-2xl font-bold text-[#DC2626] mt-2 font-mono">{counts.rejected}</div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-[32px] bg-white border border-[#d5d5d4] shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[#2c2e2a]">
              Execom Applications ({filteredApps.length})
            </h3>
            <Badge label="EXECOM DRIVE" variant="blue" dot={true} />
          </div>
          <p className="text-xs text-[#80827f]">
            Candidate submissions from students applying for chapter leadership and track teams.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Search Box */}
          <div className="relative min-w-[200px] sm:min-w-[240px]">
            <Search className="w-4 h-4 text-[#80827f] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search candidate, email, dept..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-full bg-[#f5f1e4] border border-[#d5d5d4] text-xs text-[#2c2e2a] placeholder-[#80827f] outline-none focus:border-[#4285F4]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#80827f] hover:text-[#2c2e2a] text-xs"
              >
                &times;
              </button>
            )}
          </div>

          {/* View Mode Toggle: Grid vs List */}
          <div className="flex items-center p-1 rounded-full bg-[#f5f1e4] border border-[#d5d5d4]">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white text-[#2c2e2a] shadow-xs"
                  : "text-[#80827f] hover:text-[#2c2e2a]"
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                viewMode === "list"
                  ? "bg-white text-[#2c2e2a] shadow-xs"
                  : "text-[#80827f] hover:text-[#2c2e2a]"
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Drive Settings Button */}
          <button
            onClick={onOpenSettings}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0f172a] hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Form & Deadline Settings</span>
          </button>
        </div>
      </div>

      {/* APPLICATIONS CONTENT */}
      {filteredApps.length === 0 ? (
        <div className="p-16 text-center rounded-[32px] bg-white border border-[#d5d5d4] text-xs text-[#80827f] space-y-2">
          <User className="w-8 h-8 text-[#80827f] mx-auto opacity-40" />
          <p className="font-semibold text-sm text-[#2c2e2a]">No applications found</p>
          <p>Try clearing your search query or changing the status filter.</p>
        </div>
      ) : viewMode === "grid" ? (
        /* PROPER MODERN CARD LAYOUT */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredApps.map((app) => {
            const status = app.status || "pending";
            const isProcessing = processingId === app.id;
            const candidateName = resolveName(app.name, app.displayName, app.fullName, app.email, "Applicant");

            const formattedDate = app.submittedAt?.toDate
              ? app.submittedAt.toDate().toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
              : app.submittedAt
              ? new Date(app.submittedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })
              : "Recent";

            const rawInterests = (Array.isArray(app.interests) && app.interests.length > 0)
              ? app.interests
              : app.answers?.track
              ? (Array.isArray(app.answers.track) ? app.answers.track : [app.answers.track])
              : app.answers?.interests
              ? (Array.isArray(app.answers.interests) ? app.answers.interests : [app.answers.interests])
              : [];

            return (
              <div
                key={app.id}
                className="p-6 rounded-[28px] bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5 group"
              >
                {/* Top Section */}
                <div className="space-y-4">
                  {/* Status Badge + Academic Year */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="h-7 inline-flex items-center px-3 rounded-full bg-slate-100/90 border border-slate-200 text-xs font-semibold text-[#0f172a] truncate max-w-[210px]">
                      {app.semester || app.sem || "S1"} • {app.department || app.dept || "CSE"}
                    </span>

                    <span
                      className={`h-7 inline-flex items-center gap-1.5 px-3 rounded-full text-xs font-semibold capitalize shrink-0 ${
                        status === "accepted"
                          ? "bg-[#10B981]/15 text-[#059669]"
                          : status === "rejected"
                          ? "bg-[#EF4444]/15 text-[#DC2626]"
                          : "bg-[#F59E0B]/15 text-[#D97706]"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        status === "accepted" ? "bg-[#10B981]" : status === "rejected" ? "bg-[#EF4444]" : "bg-[#F59E0B]"
                      }`} />
                      {status}
                    </span>
                  </div>

                  {/* Candidate Profile Avatar & Header */}
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#0f172a] text-white border border-slate-200 overflow-hidden flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                      {app.photoURL ? (
                        <img
                          src={app.photoURL}
                          alt={candidateName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        (candidateName.substring(0, 2)).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-[15px] font-bold text-[#0f172a] truncate group-hover:text-[#2563EB] transition-colors">
                        {candidateName}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate mt-0.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{app.email || "No email"}</span>
                      </div>
                      {app.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate mt-0.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{app.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tracks / Domains Chips */}
                  {rawInterests.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">
                        Applied Track / Role
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {rawInterests.map((trackId: string) => (
                          <span
                            key={trackId}
                            className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-semibold text-[#0f172a]"
                          >
                            {String(trackId).replace(/_/g, " ").toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Motivation / Why Join snippet */}
                  {(app.whyJoin || app.answers?.motivation || app.technicalSkills) && (
                    <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/60 text-xs text-slate-600 line-clamp-2 leading-relaxed italic">
                      &ldquo;{app.whyJoin || app.answers?.motivation || app.technicalSkills}&rdquo;
                    </div>
                  )}

                  {/* Submission Timestamp */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Applied on {formattedDate}</span>
                  </div>
                </div>

                {/* Card Action Controls: Accept / Reject / View / Delete */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedApp(app)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-[#0f172a] transition cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>View Application</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {/* Accept Button */}
                    <button
                      type="button"
                      disabled={isProcessing || status === "accepted"}
                      onClick={() => handleUpdateStatus(app, "accepted")}
                      className={`p-2 rounded-full transition cursor-pointer ${
                        status === "accepted"
                          ? "bg-[#10B981]/15 text-[#10B981] opacity-70 cursor-default"
                          : "hover:bg-[#10B981]/15 text-slate-400 hover:text-[#10B981]"
                      }`}
                      title="Accept Candidate"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>

                    {/* Reject Button */}
                    <button
                      type="button"
                      disabled={isProcessing || status === "rejected"}
                      onClick={() => handleUpdateStatus(app, "rejected")}
                      className={`p-2 rounded-full transition cursor-pointer ${
                        status === "rejected"
                          ? "bg-[#EF4444]/15 text-[#EF4444] opacity-70 cursor-default"
                          : "hover:bg-[#EF4444]/15 text-slate-400 hover:text-[#EF4444]"
                      }`}
                      title="Reject Candidate"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleDelete(app)}
                      className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-[#EF4444] transition cursor-pointer"
                      title="Delete Application"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE / LIST VIEW */
        <div className="rounded-[32px] bg-white border border-[#d5d5d4] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#d5d5d4] bg-[#f5f1e4]/60 text-[11px] font-mono font-semibold uppercase text-[#80827f]">
                  <th className="px-6 py-4">Candidate</th>
                  <th className="px-4 py-4">Academic</th>
                  <th className="px-4 py-4">Track / Interests</th>
                  <th className="px-4 py-4">Submitted</th>
                  <th className="px-4 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f1e4]">
                {filteredApps.map((app) => {
                  const status = app.status || "pending";
                  const isProcessing = processingId === app.id;
                  const candidateName = resolveName(app.name, app.displayName, app.fullName, app.email, "Applicant");

                  const formattedDate = app.submittedAt?.toDate
                    ? app.submittedAt.toDate().toLocaleDateString("en-IN", { month: "short", day: "numeric" })
                    : app.submittedAt
                    ? new Date(app.submittedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })
                    : "—";

                  const rawInterests = (Array.isArray(app.interests) && app.interests.length > 0)
                    ? app.interests
                    : app.answers?.track
                    ? (Array.isArray(app.answers.track) ? app.answers.track : [app.answers.track])
                    : app.answers?.interests
                    ? (Array.isArray(app.answers.interests) ? app.answers.interests : [app.answers.interests])
                    : [];

                  return (
                    <tr key={app.id} className="hover:bg-[#faf9f6] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#f5f1e4] border border-[#d5d5d4] overflow-hidden flex items-center justify-center font-bold text-xs text-[#2c2e2a] shrink-0">
                            {app.photoURL ? (
                              <img
                                src={app.photoURL}
                                alt={candidateName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              (candidateName.substring(0, 2)).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-[#2c2e2a] truncate">
                              {candidateName}
                            </p>
                            <p className="text-xs text-[#80827f] truncate">
                              {app.email || "No email"} {app.phone || app.phoneNumber ? `• ${app.phone || app.phoneNumber}` : ""}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-2.5 py-1 rounded-full bg-[#f5f1e4] border border-[#d5d5d4] text-[10px] font-mono font-bold text-[#2c2e2a]">
                          {app.semester || app.sem || "S1"} • {app.department || app.dept || "CSE"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5 flex-wrap max-w-xs">
                          {rawInterests.length > 0 ? (
                            rawInterests.map((trackId: string) => (
                              <span
                                key={trackId}
                                className="px-2 py-0.5 rounded-full bg-[#f5f1e4] text-[10px] font-medium text-[#2c2e2a]"
                              >
                                {String(trackId).replace(/_/g, " ").toUpperCase()}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-[#80827f]">General</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs text-[#80827f] font-mono">
                        {formattedDate}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-mono font-bold capitalize ${
                            status === "accepted"
                              ? "bg-[#34A853]/15 text-[#34A853]"
                              : status === "rejected"
                              ? "bg-[#EA4335]/15 text-[#EA4335]"
                              : "bg-[#FBBC04]/15 text-[#b08000]"
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedApp(app)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[50px] bg-[#f5f1e4] hover:bg-[#eae5d7] text-xs font-semibold text-[#2c2e2a] transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>

                          {/* Accept */}
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(app, "accepted")}
                            disabled={isProcessing || status === "accepted"}
                            className={`p-1.5 rounded-full transition cursor-pointer ${
                              status === "accepted"
                                ? "text-[#34A853] opacity-50"
                                : "hover:bg-[#34A853]/15 text-[#80827f] hover:text-[#34A853]"
                            }`}
                            title="Accept Application"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>

                          {/* Reject */}
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(app, "rejected")}
                            disabled={isProcessing || status === "rejected"}
                            className={`p-1.5 rounded-full transition cursor-pointer ${
                              status === "rejected"
                                ? "text-[#EA4335] opacity-50"
                                : "hover:bg-[#EA4335]/15 text-[#80827f] hover:text-[#EA4335]"
                            }`}
                            title="Reject Application"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDelete(app)}
                            disabled={isProcessing}
                            className="p-1.5 rounded-full hover:bg-[#EA4335]/15 text-[#80827f] hover:text-[#EA4335] transition cursor-pointer"
                            title="Delete Application"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DETAILS MODAL */}
      <ExecomDetailsModal
        application={selectedApp}
        isOpen={Boolean(selectedApp)}
        onClose={() => setSelectedApp(null)}
        onAccept={
          selectedApp
            ? async () => {
                await handleUpdateStatus(selectedApp, "accepted");
                setSelectedApp(null);
              }
            : undefined
        }
        onReject={
          selectedApp
            ? async () => {
                await handleUpdateStatus(selectedApp, "rejected");
                setSelectedApp(null);
              }
            : undefined
        }
      />
    </div>
  );
}
