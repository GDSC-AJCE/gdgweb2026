"use client";

import React, { useState } from "react";
import {
  FileText,
  CheckCircle,
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
} from "lucide-react";
import { doc, updateDoc, deleteDoc, addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ExecomDetailsModal from "@/components/core/ExecomDetailsModal";
import { resolveName } from "@/lib/utils";

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
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [filter, setFilter] = useState<"all" | "pending" | "accepted">("all");
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const filteredApps = applications.filter((app) => {
    if (filter === "all") return true;
    return (app.status || "pending") === filter;
  });

  const handleAccept = async (app: any) => {
    setProcessingId(app.id);

    try {
      const appRef = doc(db, "execomApplications", app.id);
      await updateDoc(appRef, {
        status: "accepted",
        reviewedAt: Timestamp.now(),
        reviewedBy: adminName,
      });

      try {
        await addDoc(collection(db, "auditLogs"), {
          action: "EXECOM_ACCEPT",
          performedBy: adminName,
          target: app.name,
          details: `Application marked as accepted`,
          timestamp: Timestamp.now(),
        });
      } catch (e) {}

      onRefresh();
    } catch (err) {
      console.error("Error updating application status:", err);
      alert("Failed to accept application.");
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
    <div className="space-y-6 select-none">
      {/* TOOLBAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-[32px] bg-white border border-[#d5d5d4] shadow-xs">
        <div>
          <h3 className="text-base font-bold text-[#2c2e2a]">
            Execom Applications ({applications.length})
          </h3>
          <p className="text-xs text-[#80827f]">
            Candidate submissions from students applying for chapter leadership.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
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
              title="Grid View"
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
              title="List / Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={onOpenSettings}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2c2e2a] hover:bg-[#1a1a1a] text-white text-xs font-semibold shadow-xs transition"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Drive Settings</span>
          </button>
          
          {/* Filter Pills */}
          <div className="flex items-center p-1 rounded-full bg-[#f5f1e4] border border-[#d5d5d4]">
            {(["all", "pending", "accepted"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition cursor-pointer ${
                  filter === f
                    ? "bg-white text-[#2c2e2a] shadow-xs"
                    : "text-[#80827f] hover:text-[#2c2e2a]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* APPLICATIONS CONTENT */}
      {filteredApps.length === 0 ? (
        <div className="p-12 text-center rounded-[32px] bg-white border border-[#d5d5d4] text-xs text-[#80827f]">
          No applications found matching the "{filter}" filter.
        </div>
      ) : viewMode === "list" ? (
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
                  const formattedDate = app.submittedAt?.toDate
                    ? app.submittedAt.toDate().toLocaleDateString("en-IN", { month: "short", day: "numeric" })
                    : app.submittedAt
                    ? new Date(app.submittedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })
                    : "—";

                  return (
                    <tr key={app.id} className="hover:bg-[#faf9f6] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#f5f1e4] border border-[#d5d5d4] overflow-hidden flex items-center justify-center font-bold text-xs text-[#2c2e2a] shrink-0">
                            {app.photoURL ? (
                              <img
                                src={app.photoURL}
                                alt={app.name || "Candidate"}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              (resolveName(app.name, app.displayName, app.fullName, app.email, "A").substring(0, 2)).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-[#2c2e2a] truncate">
                              {resolveName(app.name, app.displayName, app.fullName, app.email, "Applicant")}
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
                          {((Array.isArray(app.interests) && app.interests.length > 0)
                            ? app.interests
                            : app.answers?.track
                            ? (Array.isArray(app.answers.track) ? app.answers.track : [app.answers.track])
                            : app.answers?.interests
                            ? (Array.isArray(app.answers.interests) ? app.answers.interests : [app.answers.interests])
                            : []
                          ).length > 0 ? (
                            ((Array.isArray(app.interests) && app.interests.length > 0)
                              ? app.interests
                              : app.answers?.track
                              ? (Array.isArray(app.answers.track) ? app.answers.track : [app.answers.track])
                              : (Array.isArray(app.answers?.interests) ? app.answers.interests : [app.answers?.interests])
                            ).map((trackId: string) => (
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
                              : "bg-[#FBBC04]/15 text-[#b08000]"
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedApp(app)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[50px] bg-[#f5f1e4] hover:bg-[#eae5d7] text-xs font-semibold text-[#2c2e2a] transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
                          {status !== "accepted" && (
                            <button
                              onClick={() => handleAccept(app)}
                              disabled={isProcessing}
                              className="p-1.5 rounded-full hover:bg-[#34A853]/15 text-[#34A853] transition cursor-pointer"
                              title="Accept Application"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
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
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredApps.map((app) => {
            const status = app.status || "pending";
            const isProcessing = processingId === app.id;

            return (
              <div
                key={app.id}
                className="p-6 rounded-[32px] bg-white border border-[#d5d5d4] shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Bar: Semester & Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-[#f5f1e4] border border-[#d5d5d4] font-mono text-[10px] font-bold text-[#2c2e2a]">
                        {app.semester || app.sem || "S1"} • {app.department || app.dept || "CSE"}
                      </span>
                    </div>

                    <span
                      className={`px-3 py-0.5 rounded-full text-[10px] font-mono font-bold capitalize ${
                        status === "accepted"
                          ? "bg-[#34A853]/15 text-[#34A853]"
                          : "bg-[#FBBC04]/15 text-[#b08000]"
                      }`}
                    >
                      {status}
                    </span>
                  </div>

                  {/* Candidate Name & Contact with Avatar */}
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-[#f5f1e4] border border-[#d5d5d4] overflow-hidden flex items-center justify-center font-bold text-xs text-[#2c2e2a] shrink-0">
                      {app.photoURL ? (
                        <img
                          src={app.photoURL}
                          alt={app.name || "Candidate"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        (resolveName(app.name, app.displayName, app.fullName, app.email, "A").substring(0, 2)).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-lg font-bold text-[#2c2e2a] truncate">
                        {resolveName(app.name, app.displayName, app.fullName, app.email, "Applicant")}
                      </h4>
                      <p className="text-xs text-[#80827f] mt-0.5 truncate">
                        {app.email || "No email"} {app.phone || app.phoneNumber ? `• ${app.phone || app.phoneNumber}` : ""}
                      </p>
                    </div>
                  </div>

                  {/* Interests / Tracks */}
                  {((Array.isArray(app.interests) && app.interests.length > 0)
                    ? app.interests
                    : app.answers?.track
                    ? (Array.isArray(app.answers.track) ? app.answers.track : [app.answers.track])
                    : app.answers?.interests
                    ? (Array.isArray(app.answers.interests) ? app.answers.interests : [app.answers.interests])
                    : []
                  ).length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {((Array.isArray(app.interests) && app.interests.length > 0)
                        ? app.interests
                        : app.answers?.track
                        ? (Array.isArray(app.answers.track) ? app.answers.track : [app.answers.track])
                        : (Array.isArray(app.answers?.interests) ? app.answers.interests : [app.answers?.interests])
                      ).map((trackId: string) => (
                        <span
                          key={trackId}
                          className="px-2.5 py-0.5 rounded-full bg-[#f5f1e4] text-[10px] font-medium text-[#2c2e2a]"
                        >
                          {String(trackId).replace(/_/g, " ").toUpperCase()}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Why Join Snippet */}
                  {app.whyJoin && (
                    <p className="text-xs text-[#80827f] line-clamp-2 italic bg-[#f5f1e4]/60 p-3 rounded-[20px] border border-[#d5d5d4]/60">
                      "{app.whyJoin}"
                    </p>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 border-t border-[#f5f1e4] flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedApp(app)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[50px] bg-[#f5f1e4] hover:bg-[#eae5d7] text-xs font-semibold text-[#2c2e2a] transition cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Application</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {status !== "accepted" && (
                      <button
                        onClick={() => handleAccept(app)}
                        disabled={isProcessing}
                        className="p-2 rounded-full hover:bg-[#34A853]/15 text-[#34A853] transition cursor-pointer"
                        title="Accept Application"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(app)}
                      disabled={isProcessing}
                      className="p-2 rounded-full hover:bg-[#EA4335]/15 text-[#80827f] hover:text-[#EA4335] transition cursor-pointer"
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
      )}

      {/* DETAILS MODAL */}
      <ExecomDetailsModal
        application={selectedApp}
        isOpen={Boolean(selectedApp)}
        onClose={() => setSelectedApp(null)}
      />
    </div>
  );
}
