"use client";

import React, { useState, useEffect } from "react";
import { X, Save, AlertCircle } from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import CustomFormBuilder, { FormField } from "@/components/CustomFormBuilder";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/Button";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

interface ExecomDriveSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminName: string;
}

export default function ExecomDriveSettingsModal({ isOpen, onClose, adminName }: ExecomDriveSettingsModalProps) {
  useBodyScrollLock(isOpen);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    isOpen: false,
    title: "GDG Execom Recruitment",
    description: "Join the core team and help us build the community.",
    deadline: "",
  });

  const [formFields, setFormFields] = useState<FormField[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchSettings();
    }
  }, [isOpen]);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const docRef = doc(db, "settings", "execomRecruitment");
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        setFormData({
          isOpen: data.isOpen ?? false,
          title: data.title || "",
          description: data.description || "",
          deadline: data.deadline || "",
        });
        setFormFields(data.fields || []);
      } else {
        setFormFields([
          { id: "track", type: "select", label: "Which track are you applying for?", required: true, options: ["AI & ML", "Cloud & DevOps", "Web & Mobile", "Design & Media"] },
          { id: "motivation", type: "textarea", label: "Why do you want to join?", required: true },
          { id: "portfolio", type: "text", label: "Portfolio / GitHub / LinkedIn URL", required: false },
        ]);
      }
    } catch (err: any) {
      console.error("Error fetching drive settings:", err);
      setError(err.message || "Failed to load settings.");
    } finally {
      setLoading(false);
    }
  };

function cleanFirestoreData(data: any): any {
  if (data === undefined) return null;
  if (data === null) return null;
  if (Array.isArray(data)) {
    return data.map(cleanFirestoreData);
  }
  if (typeof data === "object" && !(data instanceof Date)) {
    const cleaned: Record<string, any> = {};
    for (const [key, val] of Object.entries(data)) {
      if (val !== undefined) {
        cleaned[key] = cleanFirestoreData(val);
      }
    }
    return cleaned;
  }
  return data;
}

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      // Ensure all fields have required shape with no undefined values
      const sanitizedFields = formFields.map((f, index) => ({
        id: f.id || `field_${index}_${Date.now()}`,
        type: f.type || "text",
        label: (f.label || "").trim() || `Question ${index + 1}`,
        required: Boolean(f.required),
        placeholder: f.placeholder || "",
        options: Array.isArray(f.options) ? f.options.filter(Boolean) : [],
      }));

      const payload = cleanFirestoreData({
        ...formData,
        fields: sanitizedFields,
        updatedAt: new Date().toISOString(),
        updatedBy: adminName,
      });

      const docRef = doc(db, "settings", "execomRecruitment");
      await setDoc(docRef, payload, { merge: true });
      onClose();
    } catch (err: any) {
      console.error("Error saving drive settings:", err);
      setError(err.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f172a]/50 backdrop-blur-sm">
        <motion.div
          data-lenis-prevent
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-[32px] shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
            <div>
              <h2 className="text-xl font-bold text-[#0f172a]">Core Team Application Settings</h2>
              <p className="text-xs text-slate-500">Manage when student applications are open and customize questions on the form.</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div
            data-scroll-allow
            data-lenis-prevent
            className="flex-1 p-6 space-y-6 overflow-y-auto overscroll-contain"
          >
            {loading ? (
              <div className="text-center text-sm text-slate-500 py-8">Loading settings...</div>
            ) : (
              <>
                {error && (
                  <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-2xl flex items-center gap-2 text-[#EF4444]">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs font-medium">{error}</span>
                  </div>
                )}

                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left Column: Basic Settings */}
                  <div className="space-y-4 w-full lg:w-1/3 shrink-0">
                    <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                      <div>
                        <h4 className="text-sm font-bold text-[#0f172a]">Accept Applications</h4>
                        <p className="text-[11px] text-slate-500">Turn on to show the "Join Execom" button on the website.</p>
                      </div>
                      <Switch
                        checked={formData.isOpen}
                        onCheckedChange={(checked) => setFormData({ ...formData, isOpen: checked })}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="drive-title" className="text-xs font-semibold text-[#0f172a]">Recruitment Title</Label>
                      <Input
                        id="drive-title"
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full bg-white rounded-xl border-slate-200 text-sm text-[#0f172a]"
                        placeholder="e.g. Core Team Recruitment 2026"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="drive-desc" className="text-xs font-semibold text-[#0f172a]">Short Description / Instructions</Label>
                      <Textarea
                        id="drive-desc"
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full bg-white rounded-xl border-slate-200 text-sm text-[#0f172a]"
                        placeholder="Instructions or roles available for student applicants..."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="drive-deadline" className="text-xs font-semibold text-[#0f172a]">Application Deadline</Label>
                      <DateTimePicker
                        id="drive-deadline"
                        showTime={false}
                        value={formData.deadline}
                        onChange={(val) => setFormData({ ...formData, deadline: val })}
                        placeholder="Pick closing date..."
                      />
                    </div>
                  </div>

                  {/* Right Column: Custom Form Builder */}
                  <div className="flex-1 w-full border-t lg:border-t-0 lg:border-l border-slate-200 pt-6 lg:pt-0 lg:pl-6">
                    <h3 className="text-sm font-bold text-[#0f172a] mb-2">Custom Application Questions</h3>
                    <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-600 mb-4 leading-relaxed">
                      <p className="mb-1">Add any extra questions you want applicants to answer (e.g. portfolio links, domain experience, motivation).</p>
                      <p className="text-[11px] text-slate-500"><strong>Note:</strong> We automatically collect the applicant&apos;s Name, Email, Phone, Department, and Semester from their profile.</p>
                    </div>
                    <CustomFormBuilder 
                      fields={formFields} 
                      onChange={setFormFields} 
                      hideParticipationFormat={true}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-[#f5f1e4] flex justify-end gap-3 bg-[#faf9f6] shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-10 px-5 rounded-xl border-[#d5d5d4] text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading || saving}
              className="h-10 px-6 rounded-xl bg-[#2c2e2a] hover:bg-[#1a1a1a] text-white text-xs font-semibold shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4 mr-2" />
              <span>{saving ? "Saving..." : "Save Settings"}</span>
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
