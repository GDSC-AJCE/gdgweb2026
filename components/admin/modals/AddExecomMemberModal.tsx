"use client";

import React, { useState } from "react";
import { X, Sparkles, Save, Eye, ChevronDown } from "lucide-react";
import { doc, setDoc, addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import GoogleLabsMemberCard from "@/components/cards/GoogleLabsMemberCard";
import { ExecomMember } from "@/lib/data/TeamData";
import CustomImageUploader from "@/components/ui/CustomImageUploader";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/Button";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

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
  useBodyScrollLock(isOpen);
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

  const [isCustomYear, setIsCustomYear] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      const yr = initialData?.year || "2026";
      const isKnown = ["2028", "2027", "2026", "2025", "2024", "2023", "2022"].includes(yr);
      setIsCustomYear(!isKnown);
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
        year: yr,
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
      <div
        data-lenis-prevent
        className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* HEADER */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {isPromotingUser ? "Promote Member to Execom" : initialData ? "Edit Execom Member" : "Add Execom Member"}
              </h3>
              <p className="text-xs text-slate-500">
                Updates will instantly reflect on the public <span className="font-mono text-blue-600">/about#execom</span> showcase.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY (Split: Form on Left, Live Card Preview on Right) */}
        <div
          data-scroll-allow
          data-lenis-prevent
          className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-8 overscroll-contain"
        >
          {/* FORM (7 cols) */}
          <form onSubmit={handleSave} className="md:col-span-7 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-600">
                {error}
              </div>
            )}

            {isPromotingUser && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Promoting Member</span>
                <span className="text-sm font-bold text-slate-900">{formData.name}</span>
                <span className="text-xs text-slate-500">{formData.email} • {formData.dept}</span>
              </div>
            )}

            {!isPromotingUser && (
              <div className="space-y-1.5">
                <Label htmlFor="execom-name" className="text-xs font-semibold text-slate-800">
                  Full Name <span className="text-[#EA4335]">*</span>
                </Label>
                <Input
                  id="execom-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Aiswarya Tom"
                  required
                />
              </div>
            )}

            <div className={!isPromotingUser ? "grid grid-cols-2 gap-4" : ""}>
              <div className="space-y-1.5">
                <Label htmlFor="execom-role" className="text-xs font-semibold text-slate-800">
                  Official Role <span className="text-[#EA4335]">*</span>
                </Label>
                <Input
                  id="execom-role"
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g. Technical Lead"
                  required
                />
              </div>

              {!isPromotingUser && (
                <div className="space-y-1.5">
                  <Label htmlFor="execom-dept" className="text-xs font-semibold text-slate-800">
                    Department
                  </Label>
                  <div className="relative">
                    <select
                      id="execom-dept"
                      value={formData.dept}
                      onChange={(e) => setFormData({ ...formData, dept: e.target.value })}
                      className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-xs transition-all duration-200 focus-visible:outline-none focus-visible:border-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500/20 hover:border-slate-300 cursor-pointer appearance-none pr-10"
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="execom-track" className="text-xs font-semibold text-slate-800">
                  Track & Specialty <span className="text-[#EA4335]">*</span>
                </Label>
                <Input
                  id="execom-track"
                  type="text"
                  value={formData.track}
                  onChange={(e) => setFormData({ ...formData, track: e.target.value })}
                  placeholder="e.g. Full Stack & Distributed Systems"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="execom-year" className="text-xs font-semibold text-slate-800">
                  Academic Year / Cohort <span className="text-[#EA4335]">*</span>
                </Label>
                <div className="relative">
                  <select
                    id="execom-year"
                    value={isCustomYear ? "custom" : formData.year}
                    onChange={(e) => {
                      if (e.target.value === "custom") {
                        setIsCustomYear(true);
                      } else {
                        setIsCustomYear(false);
                        setFormData({ ...formData, year: e.target.value });
                      }
                    }}
                    className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-xs transition-all duration-200 focus-visible:outline-none focus-visible:border-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500/20 hover:border-slate-300 cursor-pointer appearance-none pr-10"
                  >
                    <option value="2027">2026-27 Cohort (Upcoming / New)</option>
                    <option value="2028">2027-28 Cohort (Future)</option>
                    <option value="2026">2025-26 Cohort (Active)</option>
                    <option value="2025">2024-25 Alumni</option>
                    <option value="2024">2023-24 Alumni</option>
                    <option value="2023">2022-23 Alumni</option>
                    <option value="2022">2021-22 Founding</option>
                    <option value="custom">+ Enter New / Custom Year...</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>

                {isCustomYear && (
                  <Input
                    type="text"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    placeholder="Enter year e.g. 2027 or 2026-27"
                    className="mt-2 text-xs font-mono"
                    autoFocus
                  />
                )}
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
              <div className="space-y-1.5">
                <Label htmlFor="execom-username" className="text-xs font-semibold text-slate-800">
                  Profile Username (for /team/[user])
                </Label>
                <Input
                  id="execom-username"
                  type="text"
                  value={formData.username || ""}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="e.g. aiswarya-tom"
                  className="font-mono text-xs"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="execom-linkedin" className="text-xs font-semibold text-slate-800">
                  LinkedIn URL
                </Label>
                <Input
                  id="execom-linkedin"
                  type="url"
                  value={formData.linkedin || ""}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="execom-github" className="text-xs font-semibold text-slate-800">
                  GitHub URL
                </Label>
                <Input
                  id="execom-github"
                  type="url"
                  value={formData.github || ""}
                  onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                  placeholder="https://github.com/..."
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                disabled={saving}
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Saving..." : "Save Member"}</span>
              </Button>
            </div>
          </form>

          {/* PREVIEW (5 cols) */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-500 mb-3">
              <Eye className="w-3.5 h-3.5" />
              <span>LIVE CARD PREVIEW</span>
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
