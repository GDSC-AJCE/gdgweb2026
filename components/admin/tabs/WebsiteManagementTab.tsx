import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Save, AlertCircle } from "lucide-react";

interface WebsiteManagementTabProps {
  adminName?: string | null;
}

interface HomepageConfig {
  showHero: boolean;
  showEvents: boolean;
  showTracks: boolean;
  showCommunity: boolean;
  showContact: boolean;
}

export default function WebsiteManagementTab({ adminName }: WebsiteManagementTabProps) {
  const [config, setConfig] = useState<HomepageConfig>({
    showHero: true,
    showEvents: true,
    showTracks: true,
    showCommunity: true,
    showContact: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const docRef = doc(db, "settings", "homepage");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setConfig({
            showHero: docSnap.data().showHero ?? true,
            showEvents: docSnap.data().showEvents ?? true,
            showTracks: docSnap.data().showTracks ?? true,
            showCommunity: docSnap.data().showCommunity ?? true,
            showContact: docSnap.data().showContact ?? true,
          });
        } else {
          // Initialize default if doesn't exist
          await setDoc(docRef, config);
        }
      } catch (e) {
        console.error("Error fetching homepage config:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleToggle = (key: keyof HomepageConfig) => {
    setConfig((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      await setDoc(doc(db, "settings", "homepage"), config, { merge: true });
      setSaveMessage({ text: "Settings saved successfully", type: "success" });
    } catch (e) {
      console.error("Error saving homepage config:", e);
      setSaveMessage({ text: "Failed to save settings", type: "error" });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-[#d5d5d4] animate-pulse">
        <div className="h-6 w-1/3 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-4">
          <div className="h-10 w-full bg-gray-200 rounded"></div>
          <div className="h-10 w-full bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const sections = [
    { id: "showHero", label: "Hero Section", description: "The main hero banner at the top of the homepage." },
    { id: "showEvents", label: "Ongoing Events Section", description: "Showcase for active and upcoming events." },
    { id: "showTracks", label: "Innovation Pathways (Tracks)", description: "Display the technology tracks and domains." },
    { id: "showCommunity", label: "Community & Leaderboard", description: "Chapter arena leaderboard and credentials." },
    { id: "showContact", label: "Contact Section", description: "Direct connect and dispatch desk." },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white rounded-[32px] border border-[#d5d5d4] overflow-hidden shadow-sm">
        <div className="p-6 sm:p-8 border-b border-[#d5d5d4] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#faf9f6]">
          <div>
            <h3 className="text-lg font-bold text-[#2c2e2a]">Homepage Sections Configuration</h3>
            <p className="text-xs text-[#80827f] mt-1 max-w-lg leading-relaxed">
              Toggle the visibility of different sections on the homepage. Useful for hiding sections during maintenance or when no data is available.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="shrink-0 inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-[50px] bg-[#2c2e2a] text-white text-xs font-semibold hover:bg-[#1a1a1a] transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save Configuration"}</span>
          </button>
        </div>

        {saveMessage && (
          <div className={`px-8 py-3 text-xs font-medium flex items-center gap-2 ${
            saveMessage.type === "success" ? "bg-[#8ed462]/10 text-[#34A853]" : "bg-red-50 text-red-600"
          }`}>
            <AlertCircle className="w-4 h-4" />
            <span>{saveMessage.text}</span>
          </div>
        )}

        <div className="p-2">
          {sections.map((section, idx) => {
            const isEnabled = config[section.id as keyof HomepageConfig];
            return (
              <div
                key={section.id}
                className={`flex items-center justify-between p-4 sm:p-6 rounded-2xl transition-colors ${
                  idx !== sections.length - 1 ? "border-b border-[#d5d5d4]/50" : ""
                } hover:bg-[#f5f1e4]/30`}
              >
                <div className="pr-4">
                  <h4 className="text-sm font-semibold text-[#2c2e2a]">{section.label}</h4>
                  <p className="text-xs text-[#80827f] mt-1">{section.description}</p>
                </div>
                <button
                  onClick={() => handleToggle(section.id as keyof HomepageConfig)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#2ba0ff] focus:ring-offset-2 ${
                    isEnabled ? "bg-[#2ba0ff]" : "bg-gray-200"
                  }`}
                  role="switch"
                  aria-checked={isEnabled}
                >
                  <span className="sr-only">Toggle {section.label}</span>
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute left-0.5 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
