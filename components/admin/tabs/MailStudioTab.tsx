"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Layout,
  Zap,
  Key,
  ShieldCheck,
  Radio,
  Save,
  FileCode2,
  Globe,
  DownloadCloud,
  CheckCircle,
  FileText,
  Search,
  Monitor,
  Smartphone,
  RotateCw,
  PlusCircle,
  Trash2,
  Code,
  Sparkles,
  Image as ImageIcon,
  Check,
  X,
  ExternalLink,
  Copy,
  AlertCircle,
  Clock,
  Loader2,
  Palette,
  Megaphone,
} from "lucide-react";
import * as XLSX from "xlsx";

declare global {
  interface Window {
    unlayer?: any;
  }
}

interface Recipient {
  id: number;
  name: string;
  email: string;
  category: string;
  team: string;
  time: string;
  time_slot: string;
  date: string;
  meet_link?: string;
  whatsapp_link?: string;
  status: "Pending" | "Sent";
  isValid: boolean;
  selected?: boolean;
}

interface TemplateMeta {
  id: string;
  name: string;
  hasDesign: boolean;
  type: string;
}

export default function MailStudioTab() {
  // Main view state: 'dispatch' or 'studio'
  const [activeView, setActiveView] = useState<"dispatch" | "studio">("dispatch");

  // Engine state: 'gateway' or 'password'
  const [engineTab, setEngineTab] = useState<"gateway" | "password">("gateway");

  // Recipients source state: 'sheet' or 'csv'
  const [sourceTab, setSourceTab] = useState<"sheet" | "csv">("sheet");

  // Config & Gateway states
  const [gatewayUrl, setGatewayUrl] = useState(
    "https://script.google.com/macros/s/AKfycbxcIThvSrqiIT-4lKcJA-Z5EjGfwWtbXWMpljIL4ebMhfaNWX-OD2nJ_9qDosCcwq7O/exec"
  );
  const [gatewayApiKey, setGatewayApiKey] = useState("gdgajce");
  const [senderName, setSenderName] = useState("GDG on Campus AJCE");
  const [senderEmail, setSenderEmail] = useState("dsc@amaljyothi.ac.in");
  const [appPassword, setAppPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Gateway status
  const [gatewayStatus, setGatewayStatus] = useState<{
    tested: boolean;
    online: boolean;
    quota?: number;
    message?: string;
    loading: boolean;
  }>({ tested: false, online: false, loading: false });

  // Google Sheet states
  const [sheetId, setSheetId] = useState(
    "https://docs.google.com/spreadsheets/d/1vn4T6EPHooqKAsAfAJWBH3MT__v3drPs9oce7V4SWIw/edit"
  );
  const [sheetTabs, setSheetTabs] = useState<{ name: string; gid: string }[]>([
    { name: "Not Shortlisted", gid: "0" },
  ]);
  const [selectedSheetTab, setSelectedSheetTab] = useState("Not Shortlisted");
  const [fetchingTabs, setFetchingTabs] = useState(false);
  const [loadingSheetData, setLoadingSheetData] = useState(false);

  // CSV Data state
  const [csvText, setCsvText] = useState("");

  // Recipients
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Templates
  const [templates, setTemplates] = useState<TemplateMeta[]>([]);
  const [activeTemplate, setActiveTemplate] = useState("not-shortlisted");
  const [emailSubject, setEmailSubject] = useState(
    "Update on your GDG on Campus AJCE Core Team Application"
  );

  // Preview
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [refreshingPreview, setRefreshingPreview] = useState(false);

  // Sending progress
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState({
    current: 0,
    total: 0,
    percent: 0,
    statusText: "",
    successCount: 0,
    failCount: 0,
  });

  // Modals
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(
    null
  );

  const [appsScriptModalOpen, setAppsScriptModalOpen] = useState(false);
  const [websiteModalOpen, setWebsiteModalOpen] = useState(false);

  const [newTemplateModalOpen, setNewTemplateModalOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplatePreset, setNewTemplatePreset] = useState<"blank" | "hero" | "announcement">(
    "blank"
  );

  const [figmaModalOpen, setFigmaModalOpen] = useState(false);
  const [figmaUrl, setFigmaUrl] = useState("");
  const [figmaToken, setFigmaToken] = useState("");
  const [figmaTemplateName, setFigmaTemplateName] = useState("figma-email");
  const [figmaImporting, setFigmaImporting] = useState(false);
  const [figmaAlert, setFigmaAlert] = useState<{ success?: boolean; text?: string } | null>(null);

  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportedHtml, setExportedHtml] = useState("");

  // Unlayer Editor state
  const [isUnlayerReady, setIsUnlayerReady] = useState(false);
  const unlayerInitRef = useRef(false);

  // 1. Initial Load: Fetch Server Config & Templates
  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch("/api/mail-sender/config");
        if (res.ok) {
          const data = await res.json();
          if (data.gatewayUrl) setGatewayUrl(data.gatewayUrl);
          if (data.gatewayApiKey) setGatewayApiKey(data.gatewayApiKey);
          if (data.senderName) setSenderName(data.senderName);
          if (data.senderEmail) setSenderEmail(data.senderEmail);
          if (data.sheetId) setSheetId(data.sheetId);
          if (data.sheetName) setSelectedSheetTab(data.sheetName);
          if (data.defaultSubject) setEmailSubject(data.defaultSubject);
        }
      } catch (e) {}
    }

    async function loadTemplatesList() {
      try {
        const res = await fetch("/api/mail-sender/templates");
        if (res.ok) {
          const data = await res.json();
          if (data.templates && data.templates.length > 0) {
            setTemplates(data.templates);
            if (!activeTemplate && data.templates[0]) {
              setActiveTemplate(data.templates[0].id);
            }
          }
        }
      } catch (e) {}
    }

    loadConfig();
    loadTemplatesList();
  }, []);

  // 2. Fetch live sheet tabs when sheetId changes or on start
  const handleFetchSheetTabs = async () => {
    if (!sheetId.trim()) return;
    setFetchingTabs(true);
    try {
      const res = await fetch("/api/mail-sender/sheet/tabs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sheetId }),
      });
      const data = await res.json();
      if (data.tabs && data.tabs.length > 0) {
        setSheetTabs(data.tabs);
        if (!data.tabs.some((t: any) => t.name === selectedSheetTab)) {
          setSelectedSheetTab(data.tabs[0].name);
        }
      }
    } catch (e) {
    } finally {
      setFetchingTabs(false);
    }
  };

  // 3. Test Gateway Connectivity
  const handleTestGateway = async () => {
    setGatewayStatus({ tested: false, online: false, loading: true });
    try {
      const res = await fetch("/api/mail-sender/gateway/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gatewayUrl, gatewayApiKey }),
      });
      const data = await res.json();
      if (data.success) {
        setGatewayStatus({
          tested: true,
          online: true,
          quota: data.remainingDailyQuota,
          message: `Gateway Online! Remaining Daily Quota: ${data.remainingDailyQuota ?? "1,500"}`,
          loading: false,
        });
      } else {
        setGatewayStatus({
          tested: true,
          online: false,
          message: data.error || "Gateway connection failed",
          loading: false,
        });
      }
    } catch (err: any) {
      setGatewayStatus({
        tested: true,
        online: false,
        message: err.message,
        loading: false,
      });
    }
  };

  // 4. Save Gateway & Engine Settings
  const handleSaveSettings = async () => {
    try {
      const res = await fetch("/api/mail-sender/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gatewayUrl,
          gatewayApiKey,
          senderName,
          senderEmail,
          sheetId,
          sheetName: selectedSheetTab,
          appPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Configuration saved successfully!");
      } else {
        alert("Failed to save: " + data.error);
      }
    } catch (e: any) {
      alert("Error saving config: " + e.message);
    }
  };

  // 5. Load Recipients from Google Sheet
  const handleLoadFromSheet = async () => {
    setLoadingSheetData(true);
    try {
      const selectedTabObj = sheetTabs.find((t) => t.name === selectedSheetTab);
      const res = await fetch("/api/mail-sender/recipients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sheetId,
          sheetName: selectedSheetTab,
          gid: selectedTabObj?.gid,
        }),
      });
      const data = await res.json();
      if (data.success && data.recipients) {
        setRecipients(data.recipients.map((r: any) => ({ ...r, selected: true })));
      } else {
        alert(data.error || "Could not load sheet recipients.");
      }
    } catch (err: any) {
      alert("Failed to load recipients: " + err.message);
    } finally {
      setLoadingSheetData(false);
    }
  };

  // 6. Parse CSV or Excel File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const firstSheetName = workbook.SheetNames[0];
        const csvContent = XLSX.utils.sheet_to_csv(workbook.Sheets[firstSheetName]);
        setCsvText(csvContent);
        await parseCsvData(csvContent);
      } catch (err: any) {
        alert("Error parsing file: " + err.message);
      }
    };
    reader.readAsBinaryString(file);
  };

  const parseCsvData = async (rawCsv: string) => {
    if (!rawCsv.trim()) return;
    try {
      const res = await fetch("/api/mail-sender/recipients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvData: rawCsv }),
      });
      const data = await res.json();
      if (data.success && data.recipients) {
        setRecipients(data.recipients.map((r: any) => ({ ...r, selected: true })));
      } else {
        alert(data.error || "Could not parse CSV.");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  // 7. Live Preview Generation
  const refreshPreview = async () => {
    setRefreshingPreview(true);
    try {
      const sampleRecipient = recipients.find((r) => r.selected) ||
        recipients[0] || {
          name: "Rahul Sharma",
          email: "rahul@amaljyothi.ac.in",
          category: "Web Team",
          team: "Web Team",
        };

      const res = await fetch("/api/mail-sender/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateName: activeTemplate,
          recipient: sampleRecipient,
        }),
      });
      const data = await res.json();
      if (data.success && data.html) {
        setPreviewHtml(data.html);
      }
    } catch (e) {
    } finally {
      setRefreshingPreview(false);
    }
  };

  useEffect(() => {
    refreshPreview();
  }, [activeTemplate]);

  // 8. Send Test Email
  const handleSendTestEmail = async () => {
    if (!testEmail.trim()) {
      setTestResult({ success: false, message: "Please enter your test email address." });
      return;
    }
    setSendingTest(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/mail-sender/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toEmail: testEmail.trim(),
          templateName: activeTemplate,
          senderName,
          gatewayUrl,
          gatewayApiKey,
          appPassword,
        }),
      });
      const data = await res.json();
      setTestResult({
        success: data.success,
        message: data.message || data.error,
      });
    } catch (err: any) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setSendingTest(false);
    }
  };

  // 9. Bulk Batch Dispatch with SSE Progress
  const handleStartBatchSend = async () => {
    const selectedRecipients = recipients.filter((r) => r.selected);
    if (!selectedRecipients.length) {
      alert("Please select at least 1 recipient to dispatch emails.");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to broadcast personalized emails to ${selectedRecipients.length} recipients?`
      )
    ) {
      return;
    }

    setIsSending(true);
    setSendProgress({
      current: 0,
      total: selectedRecipients.length,
      percent: 0,
      statusText: "Initiating dispatch engine...",
      successCount: 0,
      failCount: 0,
    });

    try {
      const response = await fetch("/api/mail-sender/send-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipients: selectedRecipients,
          templateName: activeTemplate,
          subject: emailSubject,
          delay: 800,
          senderName,
          gatewayUrl,
          gatewayApiKey,
          appPassword,
        }),
      });

      if (!response.body) {
        throw new Error("ReadableStream not supported by response");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const matchEvent = line.match(/^event:\s*(\w+)/m);
          const matchData = line.match(/^data:\s*(.*)/m);
          if (matchEvent && matchData) {
            const eventType = matchEvent[1];
            try {
              const eventData = JSON.parse(matchData[1]);

              if (eventType === "progress") {
                const percent = Math.round((eventData.index / eventData.total) * 100);
                setSendProgress((prev) => ({
                  ...prev,
                  current: eventData.index,
                  total: eventData.total,
                  percent,
                  statusText: eventData.success
                    ? `Sent: ${eventData.recipient.name} (${eventData.recipient.email})`
                    : `Failed: ${eventData.recipient.name} - ${eventData.error}`,
                  successCount: eventData.successCount,
                  failCount: eventData.failCount,
                }));

                // Update row status in table
                setRecipients((prev) =>
                  prev.map((r) =>
                    r.email === eventData.recipient.email
                      ? { ...r, status: eventData.success ? "Sent" : "Pending" }
                      : r
                  )
                );
              } else if (eventType === "done") {
                setSendProgress((prev) => ({
                  ...prev,
                  statusText: `Completed! Sent: ${eventData.successCount}, Failed: ${eventData.failCount}`,
                  percent: 100,
                }));
              } else if (eventType === "cancelled") {
                setSendProgress((prev) => ({
                  ...prev,
                  statusText: "Dispatch cancelled by admin.",
                }));
              }
            } catch (e) {}
          }
        }
      }
    } catch (err: any) {
      alert("Error sending batch: " + err.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleCancelSend = async () => {
    try {
      await fetch("/api/mail-sender/cancel", { method: "POST" });
    } catch (e) {}
  };

  // 10. Unlayer Drag & Drop Editor Integration
  useEffect(() => {
    if (activeView !== "studio") return;

    if (!window.unlayer) {
      const script = document.createElement("script");
      script.src = "https://editor.unlayer.com/embed.js";
      script.async = true;
      script.onload = () => {
        initUnlayer();
      };
      document.body.appendChild(script);
    } else {
      initUnlayer();
    }

    function initUnlayer() {
      if (unlayerInitRef.current) {
        loadTemplateToEditor(activeTemplate);
        return;
      }

      window.unlayer.init({
        id: "unlayer-editor-container",
        projectId: 0,
        displayMode: "email",
        appearance: {
          theme: "light",
          panels: {
            tools: {
              dock: "left",
            },
          },
        },
      });

      window.unlayer.addEventListener("editor:ready", () => {
        unlayerInitRef.current = true;
        setIsUnlayerReady(true);
        loadTemplateToEditor(activeTemplate);
      });
    }
  }, [activeView]);

  const loadTemplateToEditor = async (templateName: string) => {
    if (!window.unlayer) return;
    try {
      const res = await fetch(`/api/mail-sender/templates/${templateName}`);
      if (res.ok) {
        const data = await res.json();
        if (data.design) {
          window.unlayer.loadDesign(data.design);
        } else if (data.content) {
          // Fallback load raw HTML if design json not available
          window.unlayer.loadDesign({
            counters: { u_row: 1, u_column: 1 },
            body: {
              rows: [
                {
                  cells: [1],
                  columns: [
                    {
                      contents: [{ type: "html", values: { html: data.content } }],
                    },
                  ],
                },
              ],
            },
          });
        }
      }
    } catch (e) {}
  };

  const handleSaveUnlayerDesign = () => {
    if (!window.unlayer) return;
    window.unlayer.exportHtml(async (data: any) => {
      const { html, design } = data;
      try {
        const res = await fetch(`/api/mail-sender/templates/${activeTemplate}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: html, design }),
        });
        const resData = await res.json();
        if (resData.success) {
          alert(`Template '${activeTemplate}' saved successfully!`);
          refreshPreview();
        } else {
          alert("Failed to save: " + resData.error);
        }
      } catch (err: any) {
        alert("Error saving template: " + err.message);
      }
    });
  };

  const handleSaveAndApply = () => {
    if (!window.unlayer) return;
    window.unlayer.exportHtml(async (data: any) => {
      const { html, design } = data;
      try {
        await fetch(`/api/mail-sender/templates/${activeTemplate}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: html, design }),
        });
        setActiveView("dispatch");
        refreshPreview();
      } catch (e) {
        setActiveView("dispatch");
      }
    });
  };

  const handleCreateNewTemplate = async () => {
    if (!newTemplateName.trim()) return;
    const cleanName = newTemplateName.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-");

    let initialDesign: any = {
      counters: { u_row: 1, u_column: 1 },
      body: {
        rows: [
          {
            cells: [1],
            columns: [
              {
                contents: [
                  {
                    type: "heading",
                    values: {
                      text: newTemplateName,
                      headingType: "h1",
                      textAlign: "center",
                      color: "#1A73E8",
                    },
                  },
                  {
                    type: "text",
                    values: {
                      text: "<p>Dear {{name}},</p><p>Welcome to Google Developer Groups on Campus AJCE!</p>",
                      lineHeight: "160%",
                      color: "#374151",
                    },
                  },
                ],
              },
            ],
          },
        ],
        values: {
          backgroundColor: "#f8fafc",
          contentWidth: "600px",
          fontFamily: { label: "Google Sans", value: "'Google Sans', Roboto, sans-serif" },
        },
      },
    };

    try {
      await fetch(`/api/mail-sender/templates/${cleanName}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          design: initialDesign,
          content: `<h1>${newTemplateName}</h1><p>Dear {{name}}, Welcome!</p>`,
        }),
      });

      setTemplates((prev) => [
        ...prev,
        { id: cleanName, name: newTemplateName, hasDesign: true, type: "html" },
      ]);
      setActiveTemplate(cleanName);
      setNewTemplateModalOpen(false);
      setNewTemplateName("");
      if (activeView === "studio" && window.unlayer) {
        window.unlayer.loadDesign(initialDesign);
      }
    } catch (e: any) {
      alert("Error creating template: " + e.message);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!confirm(`Are you sure you want to permanently delete template '${activeTemplate}'?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/mail-sender/templates/${activeTemplate}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        const remaining = templates.filter((t) => t.id !== activeTemplate);
        setTemplates(remaining);
        if (remaining.length > 0) {
          setActiveTemplate(remaining[0].id);
        }
      }
    } catch (e: any) {
      alert("Error deleting: " + e.message);
    }
  };

  const handleExportHtml = () => {
    if (!window.unlayer) return;
    window.unlayer.exportHtml((data: any) => {
      setExportedHtml(data.html);
      setExportModalOpen(true);
    });
  };

  const handleFigmaImport = async () => {
    if (!figmaUrl.trim()) return;
    setFigmaImporting(true);
    setFigmaAlert(null);
    try {
      const res = await fetch("/api/mail-sender/figma/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          figmaUrl,
          accessToken: figmaToken,
          templateName: figmaTemplateName,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFigmaAlert({
          success: true,
          text: `Imported '${data.templateName}' successfully!`,
        });
        setTemplates((prev) => [
          ...prev.filter((t) => t.id !== data.templateName),
          { id: data.templateName, name: data.templateName, hasDesign: true, type: "html" },
        ]);
        setActiveTemplate(data.templateName);
        if (window.unlayer && data.design) {
          window.unlayer.loadDesign(data.design);
        }
      } else {
        setFigmaAlert({ success: false, text: data.error || "Failed to import Figma design." });
      }
    } catch (err: any) {
      setFigmaAlert({ success: false, text: err.message });
    } finally {
      setFigmaImporting(false);
    }
  };

  // Recipient filtering
  const filteredRecipients = recipients.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q)
    );
  });

  const selectedCount = recipients.filter((r) => r.selected).length;

  return (
    <div className="space-y-6">
      {/* ================= TOP SUB-HEADER & NAVIGATION ================= */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Brand & Mode */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-900 leading-none">
                GDG AJCE Mail Studio
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                Apps Script & MJML
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Automated high-deliverability email dispatcher & visual Unlayer editor
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center space-x-2">
          <div className="flex p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveView("dispatch")}
              className={`flex items-center px-3.5 py-1.5 rounded-lg transition ${
                activeView === "dispatch"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Send className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
              1. Dispatch Hub
            </button>
            <button
              onClick={() => setActiveView("studio")}
              className={`flex items-center px-3.5 py-1.5 rounded-lg transition ${
                activeView === "studio"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layout className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
              2. Email Editor (Unlayer)
            </button>
          </div>

          <button
            onClick={() => setWebsiteModalOpen(true)}
            className="hidden md:inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-xl bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition"
          >
            <Globe className="w-3.5 h-3.5 mr-1 text-blue-600" />
            Website API
          </button>
        </div>
      </div>

      {/* ================= VIEW 1: DISPATCH HUB ================= */}
      {activeView === "dispatch" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: Controls & Recipients (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Dispatch Engine & Gateway Setup */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">
                      Dispatch Engine & Gateway
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Send via Google Apps Script Gateway (No App Passwords required)
                    </p>
                  </div>
                </div>

                <div className="flex p-0.5 bg-slate-100 rounded-lg text-xs font-medium">
                  <button
                    onClick={() => setEngineTab("gateway")}
                    className={`px-3 py-1 rounded-md transition flex items-center ${
                      engineTab === "gateway"
                        ? "bg-white text-slate-800 shadow-2xs font-semibold"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Zap className="w-3 h-3 mr-1 text-amber-500" />
                    Apps Script Gateway
                  </button>
                  <button
                    onClick={() => setEngineTab("password")}
                    className={`px-3 py-1 rounded-md transition flex items-center ${
                      engineTab === "password"
                        ? "bg-white text-slate-800 shadow-2xs font-semibold"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Key className="w-3 h-3 mr-1 text-slate-400" />
                    App Password
                  </button>
                </div>
              </div>

              {/* ENGINE 1: Apps Script Gateway */}
              {engineTab === "gateway" && (
                <div className="space-y-3.5">
                  <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 text-xs text-blue-900 flex items-start space-x-2.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Organization Google Workspace Mode:</span>
                      <span>
                        {" "}
                        Executes under authenticated session{" "}
                        <strong className="font-semibold">{senderEmail}</strong> with{" "}
                        <strong>1,500 daily quota</strong>. No App Passwords or custom domain needed.
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Apps Script Web App URL <span className="text-slate-400 font-normal">(/exec)</span>
                      </label>
                      <input
                        type="url"
                        value={gatewayUrl}
                        onChange={(e) => setGatewayUrl(e.target.value)}
                        placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                        className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        API Key / Secret
                      </label>
                      <input
                        type="text"
                        value={gatewayApiKey}
                        onChange={(e) => setGatewayApiKey(e.target.value)}
                        className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Display Sender Name
                      </label>
                      <input
                        type="text"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Sender Email
                      </label>
                      <input
                        type="email"
                        value={senderEmail}
                        readOnly
                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-slate-100 text-slate-600 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Gateway Status Alert */}
                  {gatewayStatus.tested && (
                    <div
                      className={`text-xs p-3 rounded-xl flex items-center space-x-2 ${
                        gatewayStatus.online
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-red-50 text-red-800 border border-red-200"
                      }`}
                    >
                      {gatewayStatus.online ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      )}
                      <span>{gatewayStatus.message}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-100 gap-2">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleTestGateway}
                        disabled={gatewayStatus.loading}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
                      >
                        {gatewayStatus.loading ? (
                          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin text-blue-600" />
                        ) : (
                          <Radio className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                        )}
                        Test Connection
                      </button>
                      <button
                        onClick={handleSaveSettings}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition"
                      >
                        <Save className="w-3.5 h-3.5 mr-1.5" />
                        Save Gateway
                      </button>
                      <button
                        onClick={() => setAppsScriptModalOpen(true)}
                        className="inline-flex items-center px-2.5 py-1.5 text-xs font-semibold rounded-lg text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition"
                      >
                        <FileCode2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                        Setup & Code
                      </button>
                    </div>

                    <button
                      onClick={() => setTestModalOpen(true)}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                    >
                      <Send className="w-3.5 h-3.5 mr-1" />
                      Send Test Email
                    </button>
                  </div>
                </div>
              )}

              {/* ENGINE 2: Gmail App Password */}
              {engineTab === "password" && (
                <div className="space-y-3.5">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                    For personal Gmail accounts with 2-Step Verification enabled. Requires generating
                    a 16-character App Password.
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Gmail Address
                      </label>
                      <input
                        type="email"
                        value={senderEmail}
                        onChange={(e) => setSenderEmail(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-semibold text-slate-700">
                          App Password (16-char)
                        </label>
                        <a
                          href="https://myaccount.google.com/apppasswords"
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-blue-600 hover:underline flex items-center"
                        >
                          Create Password <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                        </a>
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={appPassword}
                        onChange={(e) => setAppPassword(e.target.value)}
                        placeholder="xxxx xxxx xxxx xxxx"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-2 border-t border-slate-100">
                    <button
                      onClick={handleSaveSettings}
                      className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition"
                    >
                      Save App Password
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Recipients Source */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800">Recipients Source</h3>
                </div>
                <div className="flex p-0.5 bg-slate-100 rounded-lg text-xs font-medium">
                  <button
                    onClick={() => setSourceTab("sheet")}
                    className={`px-3 py-1 rounded-md transition ${
                      sourceTab === "sheet"
                        ? "bg-white text-slate-800 shadow-2xs font-semibold"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Google Sheet
                  </button>
                  <button
                    onClick={() => setSourceTab("csv")}
                    className={`px-3 py-1 rounded-md transition ${
                      sourceTab === "csv"
                        ? "bg-white text-slate-800 shadow-2xs font-semibold"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Upload Excel / CSV
                  </button>
                </div>
              </div>

              {sourceTab === "sheet" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Google Sheet Link or Sheet ID
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={sheetId}
                          onChange={(e) => setSheetId(e.target.value)}
                          placeholder="Paste full Google Sheet link or Sheet ID"
                          className="w-full text-xs font-mono px-3 py-2 pr-24 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleFetchSheetTabs}
                          disabled={fetchingTabs}
                          className="absolute right-1.5 top-1.5 px-2.5 py-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 rounded-md border border-blue-200 transition"
                        >
                          {fetchingTabs ? "Fetching..." : "Fetch Tabs"}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Sheet Tab
                      </label>
                      <select
                        value={selectedSheetTab}
                        onChange={(e) => setSelectedSheetTab(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        {sheetTabs.map((t) => (
                          <option key={t.name} value={t.name}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-slate-500">
                      Ensure Sheet Share is set to "Anyone with link: Viewer".
                    </span>
                    <button
                      onClick={handleLoadFromSheet}
                      disabled={loadingSheetData}
                      className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                    >
                      {loadingSheetData ? (
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      ) : (
                        <DownloadCloud className="w-3.5 h-3.5 mr-1.5" />
                      )}
                      Load from Sheet
                    </button>
                  </div>
                </div>
              )}

              {sourceTab === "csv" && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Paste CSV or Drop Excel/CSV File
                    </label>
                    <label className="text-xs text-blue-600 hover:underline cursor-pointer font-medium flex items-center">
                      📁 Upload .xlsx or .csv
                      <input
                        type="file"
                        accept=".csv, .xlsx, .xls"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <textarea
                    rows={4}
                    value={csvText}
                    onChange={(e) => setCsvText(e.target.value)}
                    placeholder="Name,Email,Team&#10;Rahul Sharma,rahul@amaljyothi.ac.in,Web Team&#10;Anjali Nair,anjali@amaljyothi.ac.in,AI Team"
                    className="w-full text-xs font-mono p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={() => parseCsvData(csvText)}
                      className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-white hover:bg-slate-900 transition"
                    >
                      <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                      Parse Recipients
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Recipients Table */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">Recipients List</h3>
                    <span className="text-xs text-slate-500">
                      {recipients.length} students loaded ({selectedCount} selected)
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search student..."
                      className="text-xs pl-8 pr-2.5 py-1.5 rounded-lg border border-slate-200 focus:ring-1 focus:ring-blue-500 focus:outline-none w-44"
                    />
                  </div>
                  <button
                    onClick={() =>
                      setRecipients((prev) => prev.map((r) => ({ ...r, selected: true })))
                    }
                    className="text-xs text-blue-600 hover:underline font-semibold"
                  >
                    All
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    onClick={() =>
                      setRecipients((prev) => prev.map((r) => ({ ...r, selected: false })))
                    }
                    className="text-xs text-slate-500 hover:underline font-semibold"
                  >
                    None
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto max-h-72 border border-slate-100 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-600 font-semibold sticky top-0 border-b border-slate-200 z-10">
                    <tr>
                      <th className="p-2.5 w-8 text-center">
                        <input
                          type="checkbox"
                          checked={recipients.length > 0 && selectedCount === recipients.length}
                          onChange={(e) => {
                            const val = e.target.checked;
                            setRecipients((prev) => prev.map((r) => ({ ...r, selected: val })));
                          }}
                          className="rounded text-blue-600"
                        />
                      </th>
                      <th className="p-2.5">Name</th>
                      <th className="p-2.5">Email</th>
                      <th className="p-2.5">Category</th>
                      <th className="p-2.5">Time</th>
                      <th className="p-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-normal">
                    {filteredRecipients.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-400">
                          No recipients loaded yet. Click <strong>"Load from Sheet"</strong> or
                          upload Excel/CSV.
                        </td>
                      </tr>
                    ) : (
                      filteredRecipients.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50/50">
                          <td className="p-2.5 text-center">
                            <input
                              type="checkbox"
                              checked={r.selected ?? false}
                              onChange={(e) => {
                                const val = e.target.checked;
                                setRecipients((prev) =>
                                  prev.map((item) =>
                                    item.id === r.id ? { ...item, selected: val } : item
                                  )
                                );
                              }}
                              className="rounded text-blue-600"
                            />
                          </td>
                          <td className="p-2.5 font-medium text-slate-800">{r.name}</td>
                          <td className="p-2.5 text-slate-600 font-mono text-[11px]">{r.email}</td>
                          <td className="p-2.5 text-slate-600">{r.category || r.team || "-"}</td>
                          <td className="p-2.5 text-slate-500 text-[11px]">{r.time || "-"}</td>
                          <td className="p-2.5 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                r.status === "Sent"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Progress & Send Action */}
              <div className="pt-2 space-y-3">
                {isSending && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-700">{sendProgress.statusText}</span>
                      <span className="text-blue-600 font-bold">{sendProgress.percent}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${sendProgress.percent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                      <span>
                        {sendProgress.current} of {sendProgress.total} completed (Success:{" "}
                        {sendProgress.successCount}, Failed: {sendProgress.failCount})
                      </span>
                      <button
                        onClick={handleCancelSend}
                        className="text-red-600 font-semibold hover:underline"
                      >
                        Cancel Sending
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">{selectedCount}</span> selected to
                    send
                  </div>
                  <button
                    onClick={handleStartBatchSend}
                    disabled={isSending || selectedCount === 0}
                    className="inline-flex items-center px-5 py-2.5 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition shadow-sm disabled:opacity-50"
                  >
                    {isSending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Send Emails to Selected
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Template & Live Preview (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs sticky top-24 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <Palette className="w-5 h-5 text-blue-600" />
                  <h3 className="text-sm font-semibold text-slate-800">Email Template</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setActiveView("studio")}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100"
                  >
                    <Layout className="w-3 h-3 mr-1" /> Open in Editor
                  </button>
                  <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
                    <button
                      onClick={() => setPreviewDevice("desktop")}
                      className={`p-1 rounded ${
                        previewDevice === "desktop"
                          ? "bg-white shadow-2xs text-slate-800"
                          : "text-slate-500"
                      }`}
                    >
                      <Monitor className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setPreviewDevice("mobile")}
                      className={`p-1 rounded ${
                        previewDevice === "mobile"
                          ? "bg-white shadow-2xs text-slate-800"
                          : "text-slate-500"
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Active Template
                    </label>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setNewTemplateModalOpen(true)}
                        className="text-[11px] text-blue-600 hover:underline flex items-center font-semibold"
                      >
                        <PlusCircle className="w-3 h-3 mr-0.5 text-blue-500" /> New
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        onClick={handleDeleteTemplate}
                        className="text-[11px] text-red-600 hover:underline flex items-center font-medium"
                      >
                        <Trash2 className="w-3 h-3 mr-0.5 text-red-500" /> Delete
                      </button>
                    </div>
                  </div>
                  <select
                    value={activeTemplate}
                    onChange={(e) => setActiveTemplate(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Preview Frame */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-slate-600">Live Preview</span>
                  <button
                    onClick={refreshPreview}
                    disabled={refreshingPreview}
                    className="text-xs text-blue-600 hover:underline flex items-center font-semibold"
                  >
                    <RotateCw
                      className={`w-3 h-3 mr-1 ${refreshingPreview ? "animate-spin" : ""}`}
                    />
                    Refresh
                  </button>
                </div>
                <div
                  className={`bg-slate-100 rounded-xl overflow-hidden border border-slate-200 transition-all duration-300 mx-auto ${
                    previewDevice === "mobile" ? "max-w-[340px]" : "w-full"
                  }`}
                  style={{ height: "480px" }}
                >
                  <iframe
                    title="Live Email Preview"
                    srcDoc={previewHtml}
                    className="w-full h-full border-0 bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= VIEW 2: REACT EMAIL EDITOR (UNLAYER) ================= */}
      {activeView === "studio" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[calc(100vh-180px)] overflow-hidden">
          {/* Unlayer Top Action Bar */}
          <div className="bg-white border-b border-slate-200 h-12 px-4 flex items-center justify-between flex-none z-20">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Template:
                </span>
                <select
                  value={activeTemplate}
                  onChange={(e) => {
                    setActiveTemplate(e.target.value);
                    loadTemplateToEditor(e.target.value);
                  }}
                  className="text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1 focus:ring-1 focus:ring-blue-500 focus:outline-none cursor-pointer"
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="h-4 w-px bg-slate-200 hidden md:block" />

              <div className="text-xs text-slate-500 hidden lg:flex items-center space-x-1.5">
                <span className="font-medium text-slate-600">Merge Tags:</span>
                <span className="bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded text-[11px] font-mono">
                  {"{{name}}"}
                </span>
                <span className="bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded text-[11px] font-mono">
                  {"{{team}}"}
                </span>
                <span className="bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded text-[11px] font-mono">
                  {"{{email}}"}
                </span>
              </div>
            </div>

            {/* Unlayer Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setFigmaModalOpen(true)}
                className="px-2.5 py-1 text-xs font-semibold rounded-md border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 flex items-center shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1 text-purple-600" /> Figma
              </button>

              <button
                onClick={() => setNewTemplateModalOpen(true)}
                className="px-2.5 py-1 text-xs font-semibold rounded-md border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center shadow-2xs"
              >
                <PlusCircle className="w-3.5 h-3.5 mr-1 text-blue-600" /> + New
              </button>

              <button
                onClick={handleSaveUnlayerDesign}
                className="px-2.5 py-1 text-xs font-semibold rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 flex items-center shadow-2xs"
              >
                <Save className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Save
              </button>

              <button
                onClick={handleExportHtml}
                className="px-2.5 py-1 text-xs font-semibold rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 flex items-center shadow-2xs"
              >
                <Code className="w-3.5 h-3.5 mr-1 text-amber-600" /> HTML
              </button>

              <button
                onClick={handleSaveAndApply}
                className="px-3.5 py-1 text-xs font-bold rounded-md bg-blue-600 text-white hover:bg-blue-700 flex items-center shadow-2xs transition"
              >
                <Check className="w-3.5 h-3.5 mr-1.5" /> Save & Apply
              </button>
            </div>
          </div>

          {/* Unlayer Full Viewport Container */}
          <div className="flex-1 w-full h-full relative">
            <div id="unlayer-editor-container" className="w-full h-full min-h-[500px]" />
          </div>
        </div>
      )}

      {/* ================= MODAL 1: TEST EMAIL ================= */}
      {testModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 flex items-center text-sm">
                <Send className="w-4 h-4 text-blue-600 mr-2" /> Send Test Email
              </h3>
              <button
                onClick={() => setTestModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Send a single sample email to your personal address to check inbox appearance, images,
              and formatting before bulk dispatch.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Email Address
              </label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="you@amaljyothi.ac.in"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {testResult && (
              <div
                className={`text-xs p-3 rounded-xl flex items-center space-x-2 ${
                  testResult.success
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {testResult.success ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setTestModalOpen(false)}
                className="px-4 py-2 text-xs font-medium rounded-lg text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
              <button
                onClick={handleSendTestEmail}
                disabled={sendingTest}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center shadow-xs"
              >
                {sendingTest ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : null}
                Send Test
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: APPS SCRIPT SETUP ================= */}
      {appsScriptModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[88vh] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 flex items-center text-sm">
                <Zap className="w-4 h-4 text-amber-500 mr-2" /> Google Apps Script Setup & Deploy
              </h3>
              <button
                onClick={() => setAppsScriptModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-2 space-y-3 overflow-y-auto text-xs text-slate-600 leading-relaxed">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
                <strong>Critical Permission Requirement:</strong>
                <p className="mt-1">
                  In Google Apps Script (<code>script.google.com</code>), when clicking{" "}
                  <strong>Deploy &gt; New deployment (or Manage deployments)</strong>, set:
                </p>
                <ul className="list-disc list-inside mt-1 font-semibold">
                  <li>Execute as: Me ({senderEmail})</li>
                  <li>Who has access: Anyone (allows your website server to dispatch emails)</li>
                </ul>
              </div>

              <div>
                <p className="font-bold text-slate-800 mb-1">Copy this Apps Script code:</p>
                <pre className="bg-slate-900 text-slate-100 p-3 rounded-xl font-mono text-[11px] overflow-x-auto">
{`function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    if (data.action === "ping") {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        remainingDailyQuota: MailApp.getRemainingDailyEmails()
      })).setMimeType(ContentService.MimeType.JSON);
    }
    MailApp.sendEmail({
      to: data.to,
      subject: data.subject,
      htmlBody: data.html,
      name: data.name || "GDG on Campus AJCE"
    });
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      remainingDailyQuota: MailApp.getRemainingDailyEmails()
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}`}
                </pre>
              </div>
            </div>
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setAppsScriptModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: FIGMA IMPORT ================= */}
      {figmaModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 flex items-center text-sm">
                <Sparkles className="w-4 h-4 text-purple-600 mr-2" /> Import Design from Figma
              </h3>
              <button
                onClick={() => setFigmaModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Paste your Figma frame URL and Personal Access Token. Frames will be imported as an
              editable email template.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Figma File / Frame Link
                </label>
                <input
                  type="text"
                  value={figmaUrl}
                  onChange={(e) => setFigmaUrl(e.target.value)}
                  placeholder="https://www.figma.com/design/AbC123XyZ/Email-Template?node-id=1-23"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Figma Personal Access Token
                </label>
                <input
                  type="password"
                  value={figmaToken}
                  onChange={(e) => setFigmaToken(e.target.value)}
                  placeholder="figd_xxxx..."
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Save as Template Name
                </label>
                <input
                  type="text"
                  value={figmaTemplateName}
                  onChange={(e) => setFigmaTemplateName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              {figmaAlert && (
                <div
                  className={`text-xs p-3 rounded-xl ${
                    figmaAlert.success
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {figmaAlert.text}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setFigmaModalOpen(false)}
                className="px-4 py-2 text-xs font-medium rounded-lg text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleFigmaImport}
                disabled={figmaImporting}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-purple-600 text-white hover:bg-purple-700 flex items-center shadow-xs"
              >
                {figmaImporting ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : null}
                Import Frame
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: NEW TEMPLATE ================= */}
      {newTemplateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 flex items-center text-sm">
                <PlusCircle className="w-4 h-4 text-blue-600 mr-2" /> Create New Email Template
              </h3>
              <button
                onClick={() => setNewTemplateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Template Name
              </label>
              <input
                type="text"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder="e.g. Workshop Invite, Community Newsletter"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setNewTemplateModalOpen(false)}
                className="px-4 py-2 text-xs font-medium rounded-lg text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewTemplate}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Create Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 5: EXPORT HTML ================= */}
      {exportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[85vh] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 flex items-center text-sm">
                <Code className="w-4 h-4 text-amber-600 mr-2" /> Exported HTML Output
              </h3>
              <button
                onClick={() => setExportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <textarea
              readOnly
              value={exportedHtml}
              className="w-full flex-1 p-3 bg-slate-900 text-slate-100 font-mono text-xs rounded-xl focus:outline-none resize-none h-80"
            />
            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(exportedHtml);
                  alert("Copied HTML code to clipboard!");
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800"
              >
                Copy Code
              </button>
              <button
                onClick={() => setExportModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 6: GDG WEBSITE INTEGRATION ================= */}
      {websiteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[85vh] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 flex items-center text-sm">
                <Globe className="w-4 h-4 text-blue-600 mr-2" /> GDG Website Email Integration
              </h3>
              <button
                onClick={() => setWebsiteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-2 space-y-3 overflow-y-auto text-xs text-slate-600 leading-relaxed">
              <p>
                This Mail Studio is natively integrated into your GDG website. You can also trigger
                email dispatch from anywhere across the site (e.g. event RSVPs, contact forms, execom
                acceptance letters) using the Google Apps Script Gateway.
              </p>
              <pre className="bg-slate-900 text-slate-100 p-3 rounded-xl font-mono text-[11px] overflow-x-auto">
{`// Dispatch email from anywhere in the app:
await fetch("${gatewayUrl}", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    to: studentEmail,
    subject: "Update on your GDG on Campus Application",
    html: renderedHtml,
    name: "GDG on Campus AJCE",
    apiKey: "gdgajce"
  })
});`}
              </pre>
            </div>
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setWebsiteModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
