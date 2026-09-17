"use client";

import React, { useState } from "react";
import { Search, UserCheck, Shield, Award, Edit3, Filter } from "lucide-react";
import ChangeUserRoleModal from "../modals/ChangeUserRoleModal";
import CreativeProfileAvatar from "@/components/ui/CreativeProfileAvatar";
import { resolveName } from "@/lib/utils";

interface UsersManagementTabProps {
  users: any[];
  onRefresh: () => void;
  adminName?: string;
  onOpenAddExecom?: (user: any) => void;
}

export default function UsersManagementTab({
  users,
  onRefresh,
  adminName = "Admin",
  onOpenAddExecom,
}: UsersManagementTabProps) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "core" | "admin" | "member">("all");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const filteredUsers = users.filter((u) => {
    const term = search.toLowerCase();
    const matchesSearch =
      (u.displayName || u.name || "").toLowerCase().includes(term) ||
      (u.email || "").toLowerCase().includes(term) ||
      (u.department || u.dept || "").toLowerCase().includes(term);

    if (!matchesSearch) return false;

    if (roleFilter === "core") return ["core", "core-manage", "ex-core"].includes(u.role);
    if (roleFilter === "admin") return Boolean(u.isAdmin || u.is_admin);
    if (roleFilter === "member") return !u.role || u.role === "member";
    return true;
  });

  return (
    <div className="space-y-6 select-none">
      {/* TOOLBAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-[32px] bg-white border border-[#d5d5d4] shadow-xs">
        <div>
          <h3 className="text-base font-bold text-[#2c2e2a]">
            Member Directory ({users.length})
          </h3>
          <p className="text-xs text-[#80827f]">
            Search, verify student profiles, and assign administrative roles.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#80827f]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, dept..."
              className="pl-9 pr-4 py-2 rounded-[50px] bg-[#f5f1e4] border border-[#d5d5d4] text-xs font-medium text-[#2c2e2a] focus:outline-none focus:border-[#2ba0ff] w-56 sm:w-64"
            />
          </div>

          {/* Role Filter Pills */}
          <div className="flex items-center p-1 rounded-full bg-[#f5f1e4] border border-[#d5d5d4]">
            {(["all", "core", "admin", "member"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition ${
                  roleFilter === r
                    ? "bg-white text-[#2c2e2a] shadow-xs"
                    : "text-[#80827f] hover:text-[#2c2e2a]"
                }`}
              >
                {r === "all" ? "All Users" : r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* USERS TABLE */}
      <div className="rounded-[32px] bg-white border border-[#d5d5d4] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f5f1e4] border-b border-[#d5d5d4] font-mono text-[#80827f] uppercase">
              <tr>
                <th className="px-6 py-3.5">User</th>
                <th className="px-6 py-3.5">Academic Department</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Badges / Pts</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f1e4]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-xs text-[#80827f]">
                    No members found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isAdminUser = Boolean(u.isAdmin || u.is_admin);
                  const isCore = ["core", "core-manage"].includes(u.role);

                  return (
                    <tr key={u.id} className="hover:bg-[#f5f1e4]/50 transition">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <CreativeProfileAvatar
                          src={u.photoURL}
                          name={resolveName(u.name, u.displayName, u.fullName, u.email, "Community Member")}
                          size="sm"
                        />
                        <div>
                          <p className="font-bold text-[#2c2e2a]">
                            {resolveName(u.name, u.displayName, u.fullName, u.email, "Community Member")}
                          </p>
                          <p className="text-[11px] text-[#80827f] truncate max-w-[200px]">
                            {u.email}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#f5f1e4] border border-[#d5d5d4] font-mono text-[10px] font-bold">
                          {u.department || u.dept || "Campus Member"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                              isAdminUser
                                ? "bg-[#EA4335]/15 text-[#EA4335]"
                                : isCore
                                ? "bg-[#4285F4]/15 text-[#4285F4]"
                                : u.role === "ex-core"
                                ? "bg-[#FBBC04]/15 text-[#b08000]"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {isAdminUser ? "Super Admin" : u.role || "Member"}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-mono text-xs text-[#2c2e2a]">
                        {u.points || 0} pts
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedUser(u)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[50px] bg-[#f5f1e4] hover:bg-[#2c2e2a] hover:text-white border border-[#d5d5d4] text-xs font-semibold text-[#2c2e2a] transition"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Change Role</span>
                          </button>
                          {onOpenAddExecom && (
                            <button
                              onClick={() => onOpenAddExecom(u)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[50px] bg-[#f5f1e4] hover:bg-[#ff705d] hover:text-white border border-[#d5d5d4] text-xs font-semibold text-[#2c2e2a] transition"
                              title="Add to Execom"
                            >
                              <Shield className="w-3 h-3" />
                              <span>To Execom</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ROLE CHANGE MODAL */}
      <ChangeUserRoleModal
        isOpen={Boolean(selectedUser)}
        onClose={() => setSelectedUser(null)}
        user={selectedUser}
        onRoleUpdated={onRefresh}
        adminName={adminName}
      />
    </div>
  );
}
