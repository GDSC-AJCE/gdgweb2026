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
      <div
        data-lenis-prevent
        className="relative w-full max-w-4xl bg-white border border-[#d5d5d4] rounded-[36px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
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
        <div
          data-scroll-allow
          data-lenis-prevent
          className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-8 overscroll-contain"
        >
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
              <div className="space-y-1.5">
                <Label htmlFor="execom-name" className="text-xs font-semibold text-[#2c2e2a]">
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
                <Label htmlFor="execom-role" className="text-xs font-semibold text-[#2c2e2a]">
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
                  <Label htmlFor="execom-dept" className="text-xs font-semibold text-[#2c2e2a]">
                    Department
                  </Label>
                  <div className="relative">
                    <select
                      id="execom-dept"
                      value={formData.dept}
                      onChange={(e) => setFormData({ ...formData, dept: e.target.value })}
                      className="flex h-10 w-full rounded-xl border border-[#d5d5d4] bg-white px-3.5 py-2 text-sm text-[#2c2e2a] shadow-xs transition-all duration-200 focus-visible:outline-none focus-visible:border-[#4285F4] focus-visible:ring-3 focus-visible:ring-[#4285F4]/20 hover:border-[#a0a29f] cursor-pointer appearance-none pr-10"
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#80827f] pointer-events-none" />
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="execom-track" className="text-xs font-semibold text-[#2c2e2a]">
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
                <Label htmlFor="execom-year" className="text-xs font-semibold text-[#2c2e2a]">
                  Year
                </Label>
                <div className="relative">
                  <select
                    id="execom-year"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="flex h-10 w-full rounded-xl border border-[#d5d5d4] bg-white px-3.5 py-2 text-sm text-[#2c2e2a] shadow-xs transition-all duration-200 focus-visible:outline-none focus-visible:border-[#4285F4] focus-visible:ring-3 focus-visible:ring-[#4285F4]/20 hover:border-[#a0a29f] cursor-pointer appearance-none pr-10"
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
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#80827f] pointer-events-none" />
                </div>
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
                <Label htmlFor="execom-username" className="text-xs font-semibold text-[#2c2e2a]">
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
                <Label htmlFor="execom-linkedin" className="text-xs font-semibold text-[#2c2e2a]">
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
                <Label htmlFor="execom-github" className="text-xs font-semibold text-[#2c2e2a]">
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

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#d5d5d4]">
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
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Saving..." : "Save Member"}</span>
              </Button>
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
