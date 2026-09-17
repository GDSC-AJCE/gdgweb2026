"use client";

import React, { useState, useRef } from "react";
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  ClipboardPaste,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Download,
  Calendar,
  Sparkles,
} from "lucide-react";
import { collection, doc, writeBatch, Timestamp, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface UploadPreviousExecomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  adminName?: string;
}

interface ParsedCandidate {
  id: string;
  name: string;
  role: string;
  team: string;
  track: string;
  dept: string;
  email: string;
  linkedin?: string;
  github?: string;
}

const PRESET_YEARS = [
  { value: "2025", label: "2024-25 (Alumni Cohort)" },
  { value: "2024", label: "2023-24 (Alumni Cohort)" },
  { value: "2023", label: "2022-23 (Alumni Cohort)" },
  { value: "2022", label: "2021-22 (Founding Cohort)" },
];

export default function UploadPreviousExecomModal({
  isOpen,
  onClose,
  onSaved,
  adminName = "Admin",
}: UploadPreviousExecomModalProps) {
  const [selectedYear, setSelectedYear] = useState<string>("2025");
  const [customYear, setCustomYear] = useState<string>("");
  const [inputMode, setInputMode] = useState<"paste" | "file" | "manual">("paste");

  // Raw text input for copy-paste
  const [rawText, setRawText] = useState<string>("");

  // Manual row input
  const [manualName, setManualName] = useState("");
  const [manualRole, setManualRole] = useState("");
  const [manualTeam, setManualTeam] = useState("");
  const [manualDept, setManualDept] = useState("CSE");
  const [manualEmail, setManualEmail] = useState("");

  // Parsed members queue
  const [parsedList, setParsedList] = useState<ParsedCandidate[]>([]);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const targetYear = selectedYear === "custom" ? (customYear.trim() || "2025") : selectedYear;

  // Intelligently deduce track from team/role
  const deduceTrack = (team: string, role: string): string => {
    const combined = `${team} ${role}`.toLowerCase();
    if (combined.includes("ai") || combined.includes("ml") || combined.includes("machine")) return "AI & Machine Learning";
    if (combined.includes("android") || combined.includes("mobile") || combined.includes("flutter")) return "Android & Mobile";
    if (combined.includes("web") || combined.includes("frontend") || combined.includes("fullstack")) return "Web Architecture";
    if (combined.includes("cloud") || combined.includes("devops") || combined.includes("gcp")) return "Cloud & Infrastructure";
    if (combined.includes("design") || combined.includes("ui") || combined.includes("ux")) return "UI/UX & Creative Systems";
    if (combined.includes("event") || combined.includes("operation")) return "Event Operations";
    if (combined.includes("media") || combined.includes("cinemat")) return "Media & Visual Production";
    if (combined.includes("market") || combined.includes("pr") || combined.includes("content")) return "Marketing & Community Growth";
    if (combined.includes("organis") || combined.includes("lead") || combined.includes("president")) return "Chapter Leadership";
    return team || "Google Developer Technologies";
  };

  // Parse Raw Tab/Comma Separated Text
  const handleParseText = (text: string) => {
    if (!text.trim()) {
      setStatusMessage({ type: "info", text: "Please paste your data first." });
      return;
    }

    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    // Detect delimiter of first line (tab vs comma)
    const firstLine = lines[0];
    const isTabDelimited = firstLine.includes("\t");
    const delimiter = isTabDelimited ? "\t" : ",";

    // Check for header row
    const firstCols = firstLine.split(delimiter).map((c) => c.trim().toLowerCase().replace(/^["']|["']$/g, ""));
    const hasHeader = firstCols.some((col) =>
      ["name", "candidate", "member", "mail", "email", "team", "role", "dept", "department"].includes(col)
    );

    const dataLines = hasHeader ? lines.slice(1) : lines;

    // Header column mapping
    let nameIdx = 0;
    let emailIdx = 1;
    let teamIdx = 2;
    let roleIdx = -1;
    let deptIdx = -1;

    if (hasHeader) {
      firstCols.forEach((col, idx) => {
        if (col.includes("name")) nameIdx = idx;
        else if (col.includes("mail") || col.includes("email")) emailIdx = idx;
        else if (col.includes("team") || col.includes("track")) teamIdx = idx;
        else if (col.includes("role") || col.includes("designation")) roleIdx = idx;
        else if (col.includes("dept") || col.includes("department") || col.includes("branch")) deptIdx = idx;
      });
    }

    const results: ParsedCandidate[] = [];

    dataLines.forEach((line, index) => {
      let parts: string[] = [];
      if (delimiter === ",") {
        const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        if (matches) {
          parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((p) => p.replace(/^["']|["']$/g, "").trim());
        } else {
          parts = line.split(",").map((p) => p.trim());
        }
      } else {
        parts = line.split("\t").map((p) => p.replace(/^["']|["']$/g, "").trim());
      }

      if (parts.length < 2 && !parts[0]) return;

      const name = parts[nameIdx]?.trim() || "";
      if (!name) return;

      const email = parts[emailIdx]?.trim() || "";
      let team = parts[teamIdx]?.trim() || "";
      let role = roleIdx !== -1 && parts[roleIdx] ? parts[roleIdx].trim() : "";
      let dept = deptIdx !== -1 && parts[deptIdx] ? parts[deptIdx].trim() : "CSE";

      // If only 2 columns provided (Name + Email or Name + Team)
      if (parts.length === 2 && !team && email.includes("@")) {
        team = "Core Team";
      } else if (parts.length === 2 && !email.includes("@")) {
        team = parts[1];
      }

      // Default role if not explicitly set
      if (!role) {
        if (team.toLowerCase().includes("lead") || name.toLowerCase().includes("lead")) {
          role = "Domain Lead";
        } else if (team) {
          role = `${team.replace(/team/i, "").trim()} Lead`;
        } else {
          role = "Core Lead";
        }
      }

      const track = deduceTrack(team, role);

      results.push({
        id: `${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now()}-${index}`,
        name,
        email,
        team: team || "General Execom",
        role,
        track,
        dept: dept || "CSE",
      });
    });

    if (results.length > 0) {
      setParsedList((prev) => [...prev, ...results]);
      setRawText("");
      setStatusMessage({
        type: "success",
        text: `Parsed ${results.length} member${results.length === 1 ? "" : "s"} successfully! Review below and click 'Upload to Firestore'.`,
      });
    } else {
      setStatusMessage({
        type: "error",
        text: "Could not detect members from the pasted text. Please check the format.",
      });
    }
  };

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        handleParseText(content);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Download Sample Template CSV
  const handleDownloadSample = () => {
    const sample = `NAME,MAIL,TEAM,ROLE,DEPT\nNandhu Babu,nandhubabuvktd@gmail.com,AI/ML Team,AI/ML Lead,CSE\nAravind R Nair,arnair126@gmail.com,AI/ML Team,Core Member,CSE\nAdithya Ajay,adityaajay574@gmail.com,Android Team,Mobile Lead,ECE\nAlan Jimmy,alanjimmy993@gmail.com,Design Team,Design Lead,IT\nBazil Salim,bazilsalim2028@it.ajce.in,Event Management Team,Operations Lead,IT`;
    const blob = new Blob([sample], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `gdg_execom_template_${targetYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add Manual Row
  const handleAddManualRow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) {
      setStatusMessage({ type: "error", text: "Name is required." });
      return;
    }

    const team = manualTeam.trim() || "General Core";
    const role = manualRole.trim() || `${team} Lead`;
    const track = deduceTrack(team, role);

    const newCandidate: ParsedCandidate = {
      id: `${manualName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now()}`,
      name: manualName.trim(),
      role,
      team,
      track,
      dept: manualDept.trim() || "CSE",
      email: manualEmail.trim(),
    };

    setParsedList((prev) => [...prev, newCandidate]);
    setManualName("");
    setManualRole("");
    setManualTeam("");
    setManualEmail("");
    setStatusMessage({ type: "success", text: `Added ${newCandidate.name} to the roster queue.` });
  };

  // Remove row from parsed queue
  const handleRemoveRow = (id: string) => {
    setParsedList((prev) => prev.filter((item) => item.id !== id));
  };

  // Batch commit to Firestore
  const handleCommitUpload = async () => {
    if (parsedList.length === 0) {
      setStatusMessage({ type: "error", text: "No members to upload. Please parse or add members first." });
      return;
    }

    setUploading(true);
    setStatusMessage(null);

    try {
      const batch = writeBatch(db);

      parsedList.forEach((m) => {
        const cleanName = m.name.trim();
        const baseUsername = cleanName.toLowerCase().replace(/[^a-z0-9]/g, "-");
        const docId = `${baseUsername}-${targetYear}`;

        const docRef = doc(db, "coreProfiles", docId);
        batch.set(
          docRef,
          {
            name: cleanName,
            role: m.role || "Core Lead",
            track: m.track || "Google Developer Technologies",
            team: m.team || null,
            dept: m.dept || "CSE",
            email: m.email || null,
            year: targetYear,
            username: baseUsername,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          },
          { merge: true }
        );
      });

      await batch.commit();

      // Audit log
      try {
        await addDoc(collection(db, "auditLogs"), {
          action: "EXECOM_PREVIOUS_YEAR_UPLOAD",
          performedBy: adminName,
          target: `Cohort ${targetYear}`,
          details: `Uploaded ${parsedList.length} previous year members for ${targetYear} Execom roster`,
          timestamp: Timestamp.now(),
        });
      } catch (err) {}

      alert(`Successfully saved ${parsedList.length} members to the ${targetYear} Execom roster!`);
      onSaved();
      onClose();
    } catch (err: any) {
      console.error("Error uploading previous Execom members:", err);
      setStatusMessage({ type: "error", text: err.message || "Failed to upload to Firestore." });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-4xl bg-white border border-[#d5d5d4] rounded-[36px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* MODAL HEADER */}
        <div className="p-6 border-b border-[#d5d5d4] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#2ba0ff]/10 text-[#2ba0ff] flex items-center justify-center shadow-xs">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[#2c2e2a]">Upload Previous Year's Execom</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-[#f5f1e4] border border-[#d5d5d4] text-[10px] font-mono font-bold text-[#2ba0ff]">
                  Cohort {targetYear}
                </span>
              </div>
              <p className="text-xs text-[#80827f]">
                Upload past chapter rosters manually via copy-paste, CSV spreadsheet, or direct tabular entry.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#f5f1e4] flex items-center justify-center text-[#80827f] hover:text-[#2c2e2a] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* STEP 1: TARGET COHORT SELECTION */}
          <div className="p-4 rounded-[24px] bg-[#f5f1e4] border border-[#d5d5d4] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-[#ff705d]" />
              <div>
                <label className="text-xs font-bold text-[#2c2e2a] block">Target Cohort / Year</label>
                <span className="text-[11px] text-[#80827f]">
                  Publicly categorized under the Alumni tabs on <span className="font-mono text-[#2ba0ff]">/about#execom</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-3.5 py-2 rounded-full bg-white border border-[#d5d5d4] text-xs font-medium text-[#2c2e2a] focus:outline-none focus:border-[#2ba0ff]"
              >
                {PRESET_YEARS.map((yr) => (
                  <option key={yr.value} value={yr.value}>
                    {yr.label}
                  </option>
                ))}
                <option value="custom">Other / Custom Year...</option>
              </select>

              {selectedYear === "custom" && (
                <input
                  type="text"
                  placeholder="e.g. 2021"
                  value={customYear}
                  onChange={(e) => setCustomYear(e.target.value)}
                  className="w-24 px-3 py-2 rounded-full bg-white border border-[#d5d5d4] text-xs font-medium text-[#2c2e2a] focus:outline-none focus:border-[#2ba0ff]"
                />
              )}
            </div>
          </div>

          {/* STEP 2: INPUT MODE TABS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[#d5d5d4] pb-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInputMode("paste")}
                  className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                    inputMode === "paste"
                      ? "bg-[#2c2e2a] text-white shadow-xs"
                      : "bg-[#f5f1e4] text-[#80827f] hover:text-[#2c2e2a]"
                  }`}
                >
                  <ClipboardPaste className="w-3.5 h-3.5" />
                  <span>Copy-Paste Text / Table</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode("file")}
                  className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                    inputMode === "file"
                      ? "bg-[#2c2e2a] text-white shadow-xs"
                      : "bg-[#f5f1e4] text-[#80827f] hover:text-[#2c2e2a]"
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Upload CSV File</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode("manual")}
                  className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                    inputMode === "manual"
                      ? "bg-[#2c2e2a] text-white shadow-xs"
                      : "bg-[#f5f1e4] text-[#80827f] hover:text-[#2c2e2a]"
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Manually</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleDownloadSample}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#2ba0ff] hover:underline cursor-pointer"
                title="Download formatted sample CSV file"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Sample Template</span>
              </button>
            </div>

            {/* STATUS ALERT */}
            {statusMessage && (
              <div
                className={`p-3 rounded-[20px] text-xs font-medium flex items-center gap-2 ${
                  statusMessage.type === "success"
                    ? "bg-[#34A853]/10 border border-[#34A853]/30 text-[#34A853]"
                    : statusMessage.type === "error"
                    ? "bg-[#ff705d]/10 border border-[#ff705d]/30 text-[#ff705d]"
                    : "bg-[#2ba0ff]/10 border border-[#2ba0ff]/30 text-[#2ba0ff]"
                }`}
              >
                {statusMessage.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            {/* TAB 1: PASTE DATA */}
            {inputMode === "paste" && (
              <div className="space-y-3">
                <div className="p-3 rounded-[20px] bg-[#f5f1e4] border border-[#d5d5d4] text-[11px] text-[#80827f] flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#ff705d] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#2c2e2a]">Spreadsheet Copy-Paste:</strong> Simply highlight rows in Google Sheets or Excel and paste them here! Tab-separated or comma-separated formats with columns like{" "}
                    <code className="bg-white px-1.5 py-0.5 rounded border border-[#d5d5d4] text-[#2c2e2a]">NAME | MAIL | TEAM</code> are automatically parsed.
                  </div>
                </div>

                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder={`Example:\nNAME\tMAIL\tTEAM\nNandhu Babu\tnandhubabuvktd@gmail.com\tAI/ML Team\nAravind R Nair\tarnair126@gmail.com\tAI/ML Team\nAdithya Ajay\tadityaajay574@gmail.com\tAndroid Team\nAlan Jimmy\talanjimmy993@gmail.com\tDesign Team`}
                  rows={6}
                  className="w-full p-4 rounded-[24px] bg-[#f5f1e4] border border-[#d5d5d4] font-mono text-xs text-[#2c2e2a] focus:outline-none focus:border-[#2ba0ff] resize-y"
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleParseText(rawText)}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#2c2e2a] hover:bg-black text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#ffd600]" />
                    <span>Parse Pasted Data</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: FILE UPLOAD */}
            {inputMode === "file" && (
              <div className="space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-8 rounded-[28px] border-2 border-dashed border-[#d5d5d4] hover:border-[#2ba0ff] bg-[#f5f1e4]/60 hover:bg-[#f5f1e4] flex flex-col items-center justify-center text-center cursor-pointer transition"
                >
                  <FileSpreadsheet className="w-10 h-10 text-[#2ba0ff] mb-2" />
                  <p className="text-xs font-bold text-[#2c2e2a]">Click to select CSV or TXT file</p>
                  <p className="text-[11px] text-[#80827f] mt-1">Supports standard CSV with Name, Email, Team, Role, Department</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv, .tsv, .txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: MANUAL SINGLE ENTRY FORM */}
            {inputMode === "manual" && (
              <form onSubmit={handleAddManualRow} className="p-5 rounded-[28px] bg-[#f5f1e4] border border-[#d5d5d4] space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#2c2e2a] mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Nandhu Babu"
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-full bg-white border border-[#d5d5d4] text-xs font-medium text-[#2c2e2a] focus:outline-none focus:border-[#2ba0ff]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#2c2e2a] mb-1">Email / Gmail</label>
                    <input
                      type="email"
                      placeholder="e.g. nandhu@gmail.com"
                      value={manualEmail}
                      onChange={(e) => setManualEmail(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-full bg-white border border-[#d5d5d4] text-xs font-medium text-[#2c2e2a] focus:outline-none focus:border-[#2ba0ff]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#2c2e2a] mb-1">Team / Committee</label>
                    <input
                      type="text"
                      placeholder="e.g. AI/ML Team"
                      value={manualTeam}
                      onChange={(e) => setManualTeam(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-full bg-white border border-[#d5d5d4] text-xs font-medium text-[#2c2e2a] focus:outline-none focus:border-[#2ba0ff]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#2c2e2a] mb-1">Role / Designation</label>
                    <input
                      type="text"
                      placeholder="e.g. AI/ML Lead (or blank for auto)"
                      value={manualRole}
                      onChange={(e) => setManualRole(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-full bg-white border border-[#d5d5d4] text-xs font-medium text-[#2c2e2a] focus:outline-none focus:border-[#2ba0ff]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#2c2e2a] mb-1">Department</label>
                    <select
                      value={manualDept}
                      onChange={(e) => setManualDept(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-full bg-white border border-[#d5d5d4] text-xs font-medium text-[#2c2e2a] focus:outline-none focus:border-[#2ba0ff]"
                    >
                      {["CSE", "ECE", "EEE", "IT", "AIDS", "ME", "CE", "Cyber Security", "Robotics"].map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-[#2c2e2a] hover:bg-black text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Queue</span>
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* STEP 3: PREVIEW & VERIFICATION TABLE */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#2c2e2a] uppercase tracking-wider">
                Roster Preview ({parsedList.length} members ready)
              </h4>
              {parsedList.length > 0 && (
                <button
                  type="button"
                  onClick={() => setParsedList([])}
                  className="text-[11px] text-[#ff705d] hover:underline cursor-pointer"
                >
                  Clear Queue
                </button>
              )}
            </div>

            {parsedList.length === 0 ? (
              <div className="p-8 rounded-[28px] bg-[#f5f1e4]/50 border border-[#d5d5d4] text-center text-xs text-[#80827f]">
                No members added yet. Paste a list above, upload a CSV file, or add members one by one.
              </div>
            ) : (
              <div className="rounded-[24px] border border-[#d5d5d4] bg-white overflow-hidden shadow-xs">
                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#f5f1e4] border-b border-[#d5d5d4] font-mono text-[10px] text-[#80827f] uppercase sticky top-0">
                      <tr>
                        <th className="px-4 py-2.5">Name</th>
                        <th className="px-4 py-2.5">Role</th>
                        <th className="px-4 py-2.5">Team / Track</th>
                        <th className="px-4 py-2.5">Dept</th>
                        <th className="px-4 py-2.5">Email</th>
                        <th className="px-4 py-2.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f5f1e4]">
                      {parsedList.map((cand) => (
                        <tr key={cand.id} className="hover:bg-[#f5f1e4]/40 transition">
                          <td className="px-4 py-2.5 font-bold text-[#2c2e2a]">{cand.name}</td>
                          <td className="px-4 py-2.5 text-[#2c2e2a]">{cand.role}</td>
                          <td className="px-4 py-2.5">
                            <span className="px-2 py-0.5 rounded-full bg-[#f5f1e4] border border-[#d5d5d4] font-mono text-[10px] text-[#80827f]">
                              {cand.team}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 font-mono text-[10px] text-[#80827f]">{cand.dept}</td>
                          <td className="px-4 py-2.5 text-[11px] text-[#80827f] truncate max-w-[180px]">
                            {cand.email || "—"}
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <button
                              onClick={() => handleRemoveRow(cand.id)}
                              className="p-1 rounded-full text-[#80827f] hover:text-[#ff705d] transition cursor-pointer"
                              title="Remove from queue"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="p-5 border-t border-[#d5d5d4] bg-white flex items-center justify-between gap-4">
          <div className="text-xs text-[#80827f]">
            Target: <strong className="text-[#2c2e2a]">Cohort {targetYear}</strong> •{" "}
            <span>{parsedList.length} total members</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-full border border-[#d5d5d4] text-xs font-semibold text-[#2c2e2a] hover:bg-[#f5f1e4] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={uploading || parsedList.length === 0}
              onClick={handleCommitUpload}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-[#2c2e2a] hover:bg-black text-white text-xs font-semibold shadow-md transition disabled:opacity-50 active:scale-95 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-[#2ba0ff]" />
              <span>{uploading ? "Uploading to Firestore..." : `Upload to Cohort ${targetYear}`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
