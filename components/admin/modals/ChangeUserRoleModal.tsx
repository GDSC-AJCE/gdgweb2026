"use client";

import React, { useState } from "react";
import { X, ShieldAlert, Check } from "lucide-react";
import { doc, updateDoc, addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface ChangeUserRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onRoleUpdated: () => void;
  adminName?: string;
}

const ROLES: { id: string; label: string; description: string; color: string }[] = [
  { id: "member", label: "Community Member", description: "Standard member with RSVP and community profile access", color: "#80827f" },
  { id: "core", label: "Core Organizer", description: "Can view chapter dashboards, attendee lists, and candidate submissions", color: "#4285F4" },
  { id: "core-manage", label: "Core Manager", description: "Write permissions to create events, manage Execom, and record funds", color: "#34A853" },
  { id: "ex-core", label: "Ex-Core Alumni", description: "Former leadership alumnus with honorary community privileges", color: "#FBBC04" },
];

export default function ChangeUserRoleModal({
  isOpen,
  onClose,
  user,
  onRoleUpdated,
  adminName = "Admin",
}: ChangeUserRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState(user?.role || "member");
  const [makeAdmin, setMakeAdmin] = useState(Boolean(user?.isAdmin || user?.is_admin));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !user) return null;

  const handleUpdate = async () => {
    setSaving(true);
    setError("");

    try {
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, {
        role: selectedRole,
        isAdmin: makeAdmin,
        is_admin: makeAdmin,
        updatedAt: Timestamp.now(),
      });

      // Audit Log
      try {
        await addDoc(collection(db, "auditLogs"), {
          action: "ROLE_CHANGE",
          performedBy: adminName,
          target: user.displayName || user.name || user.email,
          targetId: user.id,
          details: `Role updated to ${selectedRole} (Admin: ${makeAdmin ? "Yes" : "No"})`,
          timestamp: Timestamp.now(),
        });
      } catch (e) {
        // non-blocking
      }

      onRoleUpdated();
      onClose();
    } catch (err: any) {
      console.error("Error updating user role:", err);
      setError(err.message || "Failed to update user role.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-lg bg-white border border-[#d5d5d4] rounded-[36px] shadow-2xl p-6 sm:p-8 space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-[#d5d5d4] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#4285F4]/15 text-[#4285F4] flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2c2e2a]">Change User Role</h3>
              <p className="text-xs text-[#80827f] truncate max-w-[260px]">
                {user.displayName || user.email}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#f5f1e4] flex items-center justify-center text-[#80827f] hover:text-[#2c2e2a] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-[20px] bg-[#ff705d]/10 border border-[#ff705d]/30 text-xs font-semibold text-[#ff705d]">
            {error}
          </div>
        )}

        {/* ROLE OPTIONS */}
        <div className="space-y-2.5">
          <label className="block text-xs font-bold text-[#2c2e2a]">Select Chapter Role</label>
          {ROLES.map((r) => {
            const isSelected = selectedRole === r.id;
            return (
              <div
                key={r.id}
                onClick={() => setSelectedRole(r.id)}
                className={`p-3.5 rounded-[24px] border cursor-pointer transition-all flex items-start justify-between ${
                  isSelected
                    ? "bg-[#f5f1e4] border-[#2c2e2a] shadow-xs"
                    : "bg-white border-[#d5d5d4] hover:border-[#2c2e2a]/30"
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
                    <span className="text-xs font-bold text-[#2c2e2a]">{r.label}</span>
                  </div>
                  <p className="text-[11px] text-[#80827f]">{r.description}</p>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-[#2c2e2a] text-white flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* SUPER ADMIN TOGGLE */}
        <div className="p-4 rounded-[24px] bg-[#f5f1e4] border border-[#d5d5d4] flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#2c2e2a]">Grant Super Admin Privileges</p>
            <p className="text-[11px] text-[#80827f]">Gives full write access across all chapter collections</p>
          </div>
          <input
            type="checkbox"
            checked={makeAdmin}
            onChange={(e) => setMakeAdmin(e.target.checked)}
            className="w-5 h-5 accent-[#2c2e2a] rounded cursor-pointer"
          />
        </div>

        {/* ACTIONS */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-[50px] bg-white border border-[#d5d5d4] text-xs font-medium text-[#2c2e2a] hover:bg-[#f5f1e4] transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpdate}
            disabled={saving}
            className="px-6 py-2.5 rounded-[50px] bg-[#2c2e2a] hover:bg-[#1a1a1a] text-white text-xs font-semibold shadow-md transition active:scale-95 disabled:opacity-50"
          >
            {saving ? "Updating..." : "Save Role"}
          </button>
        </div>
      </div>
    </div>
  );
}
