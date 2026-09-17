"use client";

import React, { useState } from "react";
import { X, Sparkles, Save, Eye } from "lucide-react";
import { doc, setDoc, addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import GoogleLabsMemberCard from "@/components/cards/GoogleLabsMemberCard";
import { ExecomMember } from "@/lib/data/TeamData";
import CustomImageUploader from "@/components/ui/CustomImageUploader";

interface AddExecomMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: ExecomMember | null;
  adminName?: string;
  isPromotingUser?: boolean;
}

const DEPARTMENTS = ["CSE", "ECE", "EEE", "IT", "AIDS", "ME", "CE", "Cyber Security", "Robotics"];

export default function AddExecomMemberModal({
  isOpen,
  onClose,
  onSaved,
  initialData,
  adminName = "Admin",
  isPromotingUser = false,
}: AddExecomMemberModalProps) {
  const [formData, setFormData] = useState<ExecomMember>({
    name: initialData?.name || "",
    role: initialData?.role || "",
    track: initialData?.track || "",
    dept: initialData?.dept || "CSE",
    image: initialData?.image || "",
    username: initialData?.username || "",
    email: initialData?.email || "",
    linkedin: initialData?.linkedin || "",
    github: initialData?.github || "",
    year: initialData?.year || "2026",
  });

  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        name: initialData?.name || "",
        role: initialData?.role || "",
        track: initialData?.track || "",
        dept: initialData?.dept || "CSE",
        image: initialData?.image || "",
        username: initialData?.username || "",
        email: initialData?.email || "",
        linkedin: initialData?.linkedin || "",
        github: initialData?.github || "",
        year: initialData?.year || "2026",
      });
      setError("");
    }
  }, [isOpen, initialData]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.role.trim() || !formData.track.trim()) {
      setError("Please fill in Name, Role, and Track.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const docId = initialData?.id || (formData.username ? formData.username.toLowerCase().trim() : undefined);
      
      const payload = {
        name: formData.name.trim(),
        role: formData.role.trim(),
        track: formData.track.trim(),
        dept: formData.dept || "CSE",
        email: formData.email?.trim() || null,
        image: formData.image?.trim() || null,
        username: (formData.username || formData.name.toLowerCase().replace(/\s+/g, "-")).trim(),
        linkedin: formData.linkedin?.trim() || null,
        github: formData.github?.trim() || null,
        year: formData.year || "2026",
        updatedAt: Timestamp.now(),
      };

      if (docId) {
        await setDoc(doc(db, "coreProfiles", docId), payload, { merge: true });
      } else {
        await addDoc(collection(db, "coreProfiles"), {
          ...payload,
          createdAt: Timestamp.now(),
        });
      }

      // Create audit log
      try {
        await addDoc(collection(db, "auditLogs"), {
          action: initialData ? "EXECOM_UPDATE" : "EXECOM_CREATE",
          performedBy: adminName,
          target: formData.name,
          details: `Updated Execom role: ${formData.role} (${formData.track})`,
          timestamp: Timestamp.now(),
        });
      } catch (err) {
        // Non-blocking
      }

      onSaved();
      onClose();
    } catch (err: any) {
      console.error("Error saving Execom member:", err);
      setError(err.message || "Failed to save member.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-4xl bg-white border border-[#d5d5d4] rounded-[36px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* HEADER */}
        <div className="p-6 border-b border-[#d5d5d4] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#ff705d]/15 text-[#ff705d] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#2c2e2a]">
                {isPromotingUser ? "Promote Member to Execom" : initialData ? "Edit Execom Member" : "Add Execom Member"}
              </h3>
              <p className="text-xs text-[#80827f]">
                Updates will instantly reflect on the public <span className="font-mono text-[#2ba0ff]">/about#execom</span> showcase.
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

        {/* BODY (Split: Form on Left, Live Card Preview on Right) */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* FORM (7 cols) */}
          <form onSubmit={handleSave} className="md:col-span-7 space-y-4">
            {error && (
              <div className="p-3 rounded-[20px] bg-[#ff705d]/10 border border-[#ff705d]/30 text-xs font-semibold text-[#ff705d]">
                {error}
              </div>
            )}

            {isPromotingUser && (
              <div className="p-4 rounded-[24px] bg-[#f5f1e4] border border-[#d5d5d4] flex flex-col space-y-1">
                <span className="text-[10px] font-bold text-[#80827f] uppercase tracking-wider">Promoting Member</span>
                <span className="text-sm font-bold text-[#2c2e2a]">{formData.name}</span>
                <span className="text-xs text-[#80827f]">{formData.email} • {formData.dept}</span>
              </div>
            )}

            {!isPromotingUser && (
              <div>
                <label className="block text-xs font-bold text-[#2c2e2a] mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Aiswarya Tom"
                  required
                  className="w-full px-4 py-2.5 rounded-[50px] bg-[#f5f1e4] border border-[#d5d5d4] text-xs font-medium text-[#2c2e2a] focus:outline-none focus:border-[#2ba0ff]"
                />
              </div>
            )}

            <div className={!isPromotingUser ? "grid grid-cols-2 gap-3" : ""}>
              <div>
                <label className="block text-xs font-bold text-[#2c2e2a] mb-1.5">
                  Official Role *
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g. Technical Lead"
                  required
                  className="w-full px-4 py-2.5 rounded-[50px] bg-[#f5f1e4] border border-[#d5d5d4] text-xs font-medium text-[#2c2e2a] focus:outline-none focus:border-[#2ba0ff]"
                />
              </div>

              {!isPromotingUser && (
                <div>
                  <label className="block text-xs font-bold text-[#2c2e2a] mb-1.5">
                    Department
                  </label>
                  <select
                    value={formData.dept}
                    onChange={(e) => setFormData({ ...formData, dept: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-[50px] bg-[#f5f1e4] border border-[#d5d5d4] text-xs font-medium text-[#2c2e2a] focus:outline-none focus:border-[#2ba0ff]"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#2c2e2a] mb-1.5">
                  Track & Specialty *
                </label>
                <input
                  type="text"
                  value={formData.track}
                  onChange={(e) => setFormData({ ...formData, track: e.target.value })}
                  placeholder="e.g. Full Stack & Distributed Systems"
                  required
                  className="w-full px-4 py-2.5 rounded-[50px] bg-[#f5f1e4] border border-[#d5d5d4] text-xs font-medium text-[#2c2e2a] focus:outline-none focus:border-[#2ba0ff]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2c2e2a] mb-1.5">
                  Year
                </label>
                <select
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-[50px] bg-[#f5f1e4] border border-[#d5d5d4] text-xs font-medium text-[#2c2e2a] focus:outline-none focus:border-[#2ba0ff]"
                >
                  <option value="2026">2025-26 Cohort (Active)</option>
                  <option value="2025">2024-25 Alumni</option>
                  <option value="2024">2023-24 Alumni</option>
                  <option value="2023">2022-23 Alumni</option>
                  <option value="2022">2021-22 Alumni</option>
                  {formData.year && !["2026", "2025", "2024", "2023", "2022"].includes(formData.year) && (
                    <option value={formData.year}>{formData.year} Cohort</option>
                  )}
                </select>
              </div>
            </div>

            <div>
              <CustomImageUploader
                value={formData.image || ""}
                onChange={(url) => setFormData({ ...formData, image: url })}
                folder="execom_members"
                label="Profile Photo / Avatar"
                description="Upload an image from your computer or enter an image URL."
                allowUrlToggle={true}
              />
            </div>

            {!isPromotingUser && (
              <div>
                <label className="block text-xs font-bold text-[#2c2e2a] mb-1.5">
                  Profile Username (for /team/[user])
                </label>
                <input
                  type="text"
                  value={formData.username || ""}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="e.g. aiswarya-tom"
                  className="w-full px-4 py-2.5 rounded-[50px] bg-[#f5f1e4] border border-[#d5d5d4] text-xs font-medium text-[#2c2e2a] focus:outline-none focus:border-[#2ba0ff]"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#2c2e2a] mb-1.5">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={formData.linkedin || ""}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full px-4 py-2.5 rounded-[50px] bg-[#f5f1e4] border border-[#d5d5d4] text-xs font-medium text-[#2c2e2a] focus:outline-none focus:border-[#2ba0ff]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2c2e2a] mb-1.5">
                  GitHub URL
                </label>
                <input
                  type="url"
                  value={formData.github || ""}
                  onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                  placeholder="https://github.com/..."
                  className="w-full px-4 py-2.5 rounded-[50px] bg-[#f5f1e4] border border-[#d5d5d4] text-xs font-medium text-[#2c2e2a] focus:outline-none focus:border-[#2ba0ff]"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-[50px] bg-white border border-[#d5d5d4] text-xs font-medium text-[#2c2e2a] hover:bg-[#f5f1e4] transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-[50px] bg-[#2c2e2a] hover:bg-[#1a1a1a] text-white text-xs font-semibold shadow-md transition active:scale-95 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? "Saving..." : "Save Member"}</span>
              </button>
            </div>
          </form>

          {/* PREVIEW (5 cols) */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-4 rounded-[32px] bg-[#f5f1e4] border border-[#d5d5d4]">
            <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-[#80827f] mb-3">
              <Eye className="w-3.5 h-3.5" />
              <span>LIVE GOOGLE LABS CARD PREVIEW</span>
            </div>
            <div className="w-full max-w-[280px]">
              <GoogleLabsMemberCard
                member={{
                  name: formData.name || "Member Name",
                  role: formData.role || "Track Lead",
                  track: formData.track || "Google Technology & Track",
                  dept: formData.dept || "CSE",
                  image: formData.image,
                  username: formData.username,
                  linkedin: formData.linkedin,
                  github: formData.github,
                }}
                index={0}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
