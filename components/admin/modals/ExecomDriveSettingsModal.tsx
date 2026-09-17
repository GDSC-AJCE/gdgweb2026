"use client";

import React, { useState, useEffect } from "react";
import { X, Save, AlertCircle } from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import CustomFormBuilder, { FormField } from "@/components/CustomFormBuilder";

interface ExecomDriveSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminName: string;
}

export default function ExecomDriveSettingsModal({ isOpen, onClose, adminName }: ExecomDriveSettingsModalProps) {
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2c2e2a]/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-[32px] shadow-2xl w-full max-w-4xl overflow-hidden border border-[#d5d5d4] max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#f5f1e4] shrink-0">
            <div>
              <h2 className="text-xl font-bold text-[#2c2e2a]">Recruitment Settings</h2>
              <p className="text-xs text-[#80827f]">Configure the frontend application drive.</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-[#f5f1e4] text-[#80827f] transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            {loading ? (
              <div className="text-center text-sm text-[#80827f] py-8">Loading settings...</div>
            ) : (
              <>
                {error && (
                  <div className="p-3 bg-[#EA4335]/10 border border-[#EA4335]/20 rounded-2xl flex items-center gap-2 text-[#EA4335]">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs font-medium">{error}</span>
                  </div>
                )}

                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left Column: Basic Settings */}
                  <div className="space-y-4 w-full lg:w-1/3 shrink-0">
                    <div className="flex items-center justify-between p-4 bg-[#f5f1e4] rounded-2xl border border-[#d5d5d4]">
                      <div>
                        <h4 className="text-sm font-bold text-[#2c2e2a]">Accept Applications</h4>
                        <p className="text-[10px] text-[#80827f]">Toggle whether the form is open.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={formData.isOpen}
                          onChange={(e) => setFormData({ ...formData, isOpen: e.target.checked })}
                        />
                        <div className="w-11 h-6 bg-[#d5d5d4] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#d5d5d4] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#34A853]"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#2c2e2a] mb-1">Drive Title</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full bg-[#f5f1e4] border border-[#d5d5d4] rounded-2xl px-4 py-3 text-sm text-[#2c2e2a] focus:border-[#4285F4] focus:bg-[#ffffff] outline-none transition-colors"
                        placeholder="e.g. Core Team Recruitment 2026"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#2c2e2a] mb-1">Description</label>
                      <textarea
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full bg-[#f5f1e4] border border-[#d5d5d4] rounded-2xl px-4 py-3 text-sm text-[#2c2e2a] focus:border-[#4285F4] focus:bg-[#ffffff] outline-none transition-colors resize-none"
                        placeholder="Details about the recruitment drive..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#2c2e2a] mb-1">Deadline</label>
                      <input
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                        className="w-full bg-[#f5f1e4] border border-[#d5d5d4] rounded-2xl px-4 py-3 text-sm text-[#2c2e2a] focus:border-[#4285F4] focus:bg-[#ffffff] outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Right Column: Custom Form Builder */}
                  <div className="flex-1 w-full border-t lg:border-t-0 lg:border-l border-[#d5d5d4] pt-6 lg:pt-0 lg:pl-6">
                    <h3 className="text-sm font-bold text-[#2c2e2a] mb-4">Application Form Questions</h3>
                    <div className="p-3 bg-[#f5f1e4] rounded-xl text-xs text-[#80827f] mb-4">
                      <strong>Note:</strong> We automatically collect the applicant's Name, Email, Phone, Department, and Semester from their signed-in profile. You only need to add questions specific to this application (e.g. tracks, portfolio links, motivation).
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
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-xs font-semibold text-[#2c2e2a] hover:bg-[#f5f1e4] transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading || saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#2c2e2a] hover:bg-[#1a1a1a] text-white text-xs font-semibold shadow-xs transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving..." : "Save Settings"}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
