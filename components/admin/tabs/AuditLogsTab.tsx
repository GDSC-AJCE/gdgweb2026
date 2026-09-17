"use client";

import React, { useState } from "react";
import { History, ShieldCheck, Search, Filter } from "lucide-react";

interface AuditLogsTabProps {
  logs: any[];
}

// Helper to safely render log details without crashing when details is an object
function formatLogDetails(details: any, target?: any): string {
  if (details) {
    if (typeof details === "string") return details;
    if (typeof details === "object") {
      if (details.title) return String(details.title);
      if (details.name) return String(details.name);
      if (details.message) return String(details.message);
      if (details.description) return String(details.description);
      try {
        const entries = Object.entries(details).filter(
          ([k]) => !["eventId", "userId", "id"].includes(k)
        );
        if (entries.length > 0) {
          return entries
            .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : v}`)
            .join(", ");
        }
        return JSON.stringify(details);
      } catch {
        return "";
      }
    }
    return String(details);
  }
  if (target) {
    if (typeof target === "string") return target;
    if (typeof target === "object") {
      return target.title || target.name || "";
    }
    return String(target);
  }
  return "";
}

export default function AuditLogsTab({ logs }: AuditLogsTabProps) {
  const [search, setSearch] = useState("");

  const filteredLogs = logs.filter((log) => {
    const term = search.toLowerCase();
    const detailsStr = formatLogDetails(log.details);
    const targetStr = typeof log.target === "string" ? log.target : "";
    return (
      (log.action || "").toLowerCase().includes(term) ||
      (log.performedBy || "").toLowerCase().includes(term) ||
      targetStr.toLowerCase().includes(term) ||
      detailsStr.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 select-none">
      {/* TOOLBAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-[32px] bg-white border border-[#d5d5d4] shadow-xs">
        <div>
          <h3 className="text-base font-bold text-[#2c2e2a]">
            Security Audit Trail ({logs.length})
          </h3>
          <p className="text-xs text-[#80827f]">
            Immutable record of all administrative operations and permission changes.
          </p>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#80827f]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit trail..."
            className="pl-9 pr-4 py-2 rounded-[50px] bg-[#f5f1e4] border border-[#d5d5d4] text-xs font-medium text-[#2c2e2a] focus:outline-none focus:border-[#2ba0ff] w-56 sm:w-64"
          />
        </div>
      </div>

      {/* AUDIT LOG TABLE */}
      <div className="rounded-[32px] bg-white border border-[#d5d5d4] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f5f1e4] border-b border-[#d5d5d4] font-mono text-[#80827f] uppercase">
              <tr>
                <th className="px-6 py-3.5">Action</th>
                <th className="px-6 py-3.5">Admin Operator</th>
                <th className="px-6 py-3.5">Details & Target</th>
                <th className="px-6 py-3.5 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f1e4]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-xs text-[#80827f]">
                    No audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => (
                  <tr key={log.id || idx} className="hover:bg-[#f5f1e4]/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#2ba0ff]" />
                        <span className="font-mono font-bold text-[11px] text-[#2c2e2a]">
                          {log.action || "OPERATION"}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-semibold text-[#2c2e2a]">{typeof log.performedBy === "string" ? log.performedBy : "Admin"}</span>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-[#2c2e2a] font-medium">{formatLogDetails(log.details) || "No details provided"}</p>
                      {log.target && typeof log.target === "string" && (
                        <p className="text-[10px] text-[#80827f] font-mono mt-0.5">
                          Target: {log.target}
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right font-mono text-[11px] text-[#80827f]">
                      {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString() : "Recent"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
