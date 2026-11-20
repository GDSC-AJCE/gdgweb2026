"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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
  Edit2,
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
  Maximize2,
  Wand2,
  ChevronDown,
} from "lucide-react";
import * as XLSX from "xlsx";
import GeminiMailStudio from "./GeminiMailStudio";
import { cn } from "@/lib/utils";
import {
  Button,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  toast,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Input,
  Textarea,
  Label,
  Badge,
  Checkbox,
  Progress,
  Separator,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  getDocs,
  collection,
} from "firebase/firestore";

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

interface StoredCustomTemplate {
  id: string;
  name: string;
  content: string;
  design?: any;
  hasDesign: boolean;
  type: string;
  updatedAt: string;
}

const CUSTOM_TEMPLATES_STORAGE_KEY = "gdg_mail_custom_templates";

function getStoredCustomTemplates(): Record<string, StoredCustomTemplate> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(CUSTOM_TEMPLATES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveCustomTemplateToStorage(tpl: StoredCustomTemplate) {
  if (typeof window === "undefined") return;
  try {
    const map = getStoredCustomTemplates();
    map[tpl.id] = tpl;
    localStorage.setItem(CUSTOM_TEMPLATES_STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    console.warn("Failed to cache custom template in localStorage:", e);
  }
}

function removeCustomTemplateFromStorage(id: string) {
  if (typeof window === "undefined") return;
  try {
    const map = getStoredCustomTemplates();
    delete map[id];
    localStorage.setItem(CUSTOM_TEMPLATES_STORAGE_KEY, JSON.stringify(map));
  } catch (e) {}
}

export default function MailStudioTab() {
  // Main view state: 'dispatch', 'gemini', or 'studio'
  const [activeView, setActiveView] = useState<"dispatch" | "gemini" | "studio">("dispatch");

  // Engine state: 'gateway' or 'password'
  const [engineTab, setEngineTab] = useState<"gateway" | "password">("gateway");

  // AI Subject Generator Modal state
  const [aiSubjectModalOpen, setAiSubjectModalOpen] = useState(false);
  const [aiSubjectTopic, setAiSubjectTopic] = useState("");
  const [aiSubjectSuggestions, setAiSubjectSuggestions] = useState<
    { text: string; style: string; emoji: string }[]
  >([]);
  const [loadingAiSubjects, setLoadingAiSubjects] = useState(false);

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
  const [activeTemplate, setActiveTemplate] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("gdg_mail_active_template") || "not-shortlisted";
    }
    return "not-shortlisted";
  });
  const [emailSubject, setEmailSubject] = useState(
    "Update on your GDG on Campus AJCE Core Team Application"
  );

  useEffect(() => {
    if (activeTemplate && typeof window !== "undefined") {
      localStorage.setItem("gdg_mail_active_template", activeTemplate);
    }
  }, [activeTemplate]);

  // Merge tag copy feedback
  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const copyMergeTag = (tag: string) => {
    if (typeof window !== "undefined" && navigator?.clipboard) {
      navigator.clipboard.writeText(tag);
      setCopiedTag(tag);
      toast.success(`Copied ${tag} to clipboard`);
      setTimeout(() => {
        setCopiedTag((curr) => (curr === tag ? null : curr));
      }, 1800);
    }
  };

  // Preview
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [refreshingPreview, setRefreshingPreview] = useState(false);
  const [fullscreenPreviewOpen, setFullscreenPreviewOpen] = useState(false);

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

  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [editTemplateName, setEditTemplateName] = useState("");
  const [renamingTemplate, setRenamingTemplate] = useState(false);

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
  const pendingUnlayerDesignRef = useRef<{ design: any; html: string } | null>(null);

  // AI Copilot for Visual Editor (Unlayer)
  const [aiCopilotOpen, setAiCopilotOpen] = useState(false);
  const [aiCopilotGoal, setAiCopilotGoal] = useState("more_engaging");
  const [aiCopilotPrompt, setAiCopilotPrompt] = useState("");
  const [isUpdatingWithAi, setIsUpdatingWithAi] = useState(false);
  const [aiCopilotSummary, setAiCopilotSummary] = useState<string | null>(null);
  const [aiCopilotError, setAiCopilotError] = useState<string | null>(null);

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
        const templateMap = new Map<string, any>();

        // 1. Direct Firestore mail_templates query
        try {
          const snap = await getDocs(collection(db, "mail_templates"));
          snap.forEach((docSnap) => {
            const data = docSnap.data();
            const id = docSnap.id;
            const displayName =
              data.name ||
              id
                .split("-")
                .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ");
            templateMap.set(id, {
              id,
              name: displayName,
              hasDesign: Boolean(data.hasDesign || data.design),
              type: data.type || "html",
            });
          });
        } catch (fsErr) {
          console.warn("Direct Firestore mail_templates fetch failed:", fsErr);
        }

        // 2. Load from localStorage (gdg_mail_custom_templates)
        try {
          const stored = getStoredCustomTemplates();
          Object.values(stored).forEach((t) => {
            if (!templateMap.has(t.id)) {
              templateMap.set(t.id, {
                id: t.id,
                name: t.name || t.id,
                hasDesign: Boolean(t.hasDesign || t.design),
                type: t.type || "html",
              });
            }
          });
        } catch (storageErr) {
          console.warn("LocalStorage custom templates read failed:", storageErr);
        }

        // 3. Fetch from API endpoint (includes disk templates) and merge
        try {
          const res = await fetch("/api/mail-sender/templates", { cache: "no-store" });
          if (res.ok) {
            const data = await res.json();
            if (data.templates && Array.isArray(data.templates)) {
              data.templates.forEach((t: any) => {
                if (!templateMap.has(t.id)) {
                  templateMap.set(t.id, t);
                }
              });
            }
          }
        } catch (apiErr) {
          console.warn("API templates fetch failed:", apiErr);
        }

        const mergedTemplates = Array.from(templateMap.values());
        if (mergedTemplates.length > 0) {
          setTemplates(mergedTemplates);
          const savedTemplate =
            typeof window !== "undefined"
              ? localStorage.getItem("gdg_mail_active_template")
              : null;
          if (savedTemplate && mergedTemplates.some((t: any) => t.id === savedTemplate)) {
            setActiveTemplate(savedTemplate);
          } else if (!mergedTemplates.some((t: any) => t.id === activeTemplate)) {
            setActiveTemplate(mergedTemplates[0].id);
          }
        }
      } catch (e) {
        console.error("Error loading templates list:", e);
      }
    }

    loadConfig();
    loadTemplatesList();

    // Check if coming from Event Mailer with pre-populated attendees
    try {
      const storedRecipients = localStorage.getItem("gdg_mail_studio_recipients");
      if (storedRecipients) {
        const parsed = JSON.parse(storedRecipients);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecipients(parsed);
        }
      }
      const storedEventTitle = localStorage.getItem("gdg_mail_studio_event_title");
      if (storedEventTitle) {
        setEmailSubject(`Update regarding ${storedEventTitle} — GDG on Campus AJCE`);
      }
    } catch (e) {}
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
        toast.success("Configuration saved successfully!");
      } else {
        toast.error("Failed to save: " + data.error);
      }
    } catch (e: any) {
      toast.error("Error saving config: " + e.message);
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
        toast.error(data.error || "Could not load sheet recipients.");
      }
    } catch (err: any) {
      toast.error("Failed to load recipients: " + err.message);
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
        toast.error("Error parsing file: " + err.message);
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
        toast.error(data.error || "Could not parse CSV.");
      }
    } catch (err: any) {
      toast.error("Error: " + err.message);
    }
  };

  // 7. Live Preview Generation
  const refreshPreview = async (overrideContent?: string | React.MouseEvent | any) => {
    setRefreshingPreview(true);
    try {
      const sampleRecipient = recipients.find((r) => r.selected) ||
        recipients[0] || {
          name: "Rahul Sharma",
          email: "rahul@amaljyothi.ac.in",
          category: "Web Team",
          team: "Web Team",
        };

      let contentToPreview = typeof overrideContent === "string" ? overrideContent : undefined;

      if (!contentToPreview && activeTemplate) {
        // Try localStorage cache first (fastest)
        const stored = getStoredCustomTemplates();
        if (stored[activeTemplate]?.content) {
          contentToPreview = stored[activeTemplate].content;
        }

        // If not in localStorage, try Firestore client-side
        if (!contentToPreview) {
          try {
            const snap = await getDoc(doc(db, "mail_templates", activeTemplate));
            if (snap.exists()) {
              const d = snap.data();
              if (d.content) {
                contentToPreview = d.content;
              }
            }
          } catch (fsErr) {
            console.warn("Client Firestore getDoc in refreshPreview failed:", fsErr);
          }
        }
      }

      const res = await fetch("/api/mail-sender/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateName: activeTemplate,
          templateContent: contentToPreview || undefined,
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && fullscreenPreviewOpen) {
        setFullscreenPreviewOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [fullscreenPreviewOpen]);

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
      toast.error("Please select at least 1 recipient to dispatch emails.");
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
      toast.error("Error sending batch: " + err.message);
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
  const applyDesignToUnlayer = (design: any, html: string) => {
    if (!window.unlayer) return;
    try {
      if (design && design.body && Array.isArray(design.body.rows)) {
        window.unlayer.loadDesign(design);
      } else if (html) {
        window.unlayer.loadDesign({
          counters: { u_row: 1, u_column: 1 },
          body: {
            rows: [
              {
                cells: [1],
                columns: [
                  {
                    contents: [{ type: "html", values: { html } }],
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
        });
      }
    } catch (e) {
      console.error("Error loading design into Unlayer:", e);
    }
  };

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
        if (pendingUnlayerDesignRef.current) {
          applyDesignToUnlayer(
            pendingUnlayerDesignRef.current.design,
            pendingUnlayerDesignRef.current.html
          );
          pendingUnlayerDesignRef.current = null;
        } else {
          loadTemplateToEditor(activeTemplate);
        }
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
        if (pendingUnlayerDesignRef.current) {
          applyDesignToUnlayer(
            pendingUnlayerDesignRef.current.design,
            pendingUnlayerDesignRef.current.html
          );
          pendingUnlayerDesignRef.current = null;
        } else {
          loadTemplateToEditor(activeTemplate);
        }
      });
    }
  }, [activeView]);

  const loadTemplateToEditor = async (templateName: string) => {
    try {
      let loadedDesign: any = null;
      let loadedContent: string = "";

      // 1. Try Firestore direct first
      try {
        const snap = await getDoc(doc(db, "mail_templates", templateName));
        if (snap.exists()) {
          const d = snap.data();
          if (d.design) loadedDesign = d.design;
          if (d.content) loadedContent = d.content;
        }
      } catch (fsErr) {
        console.warn("Client Firestore getDoc failed:", fsErr);
      }

      // 2. Try localStorage cache
      if (!loadedDesign && !loadedContent) {
        const stored = getStoredCustomTemplates();
        if (stored[templateName]) {
          if (stored[templateName].design) loadedDesign = stored[templateName].design;
          if (stored[templateName].content) loadedContent = stored[templateName].content;
        }
      }

      // 3. Fallback to API route
      if (!loadedDesign && !loadedContent) {
        try {
          const res = await fetch(`/api/mail-sender/templates/${templateName}`, { cache: "no-store" });
          if (res.ok) {
            const data = await res.json();
            loadedDesign = data.design;
            loadedContent = data.content;
          }
        } catch (apiErr) {
          console.warn("API route fallback failed in loadTemplateToEditor:", apiErr);
        }
      }

      if (loadedDesign || loadedContent) {
        pendingUnlayerDesignRef.current = { design: loadedDesign, html: loadedContent };
        if (window.unlayer && isUnlayerReady) {
          applyDesignToUnlayer(loadedDesign, loadedContent);
        }
      }
    } catch (e) {
      console.error("Error loading template to editor:", e);
    }
  };

  const handleSaveUnlayerDesign = () => {
    if (!window.unlayer) return;
    window.unlayer.exportHtml(async (data: any) => {
      const { html, design } = data;
      try {
        const activeMeta = templates.find((t) => t.id === activeTemplate);
        const templateDisplayName = activeMeta?.name || activeTemplate;

        const tplData: StoredCustomTemplate = {
          id: activeTemplate,
          name: templateDisplayName,
          content: html,
          design,
          hasDesign: Boolean(design),
          type: "html",
          updatedAt: new Date().toISOString(),
        };

        // 1. Direct Client Firestore save
        try {
          const docRef = doc(db, "mail_templates", activeTemplate);
          await setDoc(docRef, tplData, { merge: true });
        } catch (fsErr: any) {
          console.warn("Direct client Firestore save failed:", fsErr);
        }

        // 2. LocalStorage cache
        saveCustomTemplateToStorage(tplData);

        // 3. Also notify server API endpoint
        await fetch(`/api/mail-sender/templates/${activeTemplate}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: templateDisplayName,
            content: html,
            design,
          }),
        }).catch(() => {});

        if (typeof window !== "undefined") {
          localStorage.setItem("gdg_mail_active_template", activeTemplate);
        }
        toast.success(`Template '${templateDisplayName}' saved successfully!`);
        refreshPreview(html);
      } catch (err: any) {
        toast.error("Error saving template: " + err.message);
      }
    });
  };

  const handleSaveAndApply = () => {
    if (!window.unlayer) return;
    window.unlayer.exportHtml(async (data: any) => {
      const { html, design } = data;
      try {
        const activeMeta = templates.find((t) => t.id === activeTemplate);
        const templateDisplayName = activeMeta?.name || activeTemplate;

        const tplData: StoredCustomTemplate = {
          id: activeTemplate,
          name: templateDisplayName,
          content: html,
          design,
          hasDesign: Boolean(design),
          type: "html",
          updatedAt: new Date().toISOString(),
        };

        // 1. Direct Client Firestore save
        try {
          const docRef = doc(db, "mail_templates", activeTemplate);
          await setDoc(docRef, tplData, { merge: true });
        } catch (fsErr: any) {
          console.warn("Direct client Firestore save failed:", fsErr);
        }

        // 2. LocalStorage cache
        saveCustomTemplateToStorage(tplData);

        // 3. Server API fallback
        await fetch(`/api/mail-sender/templates/${activeTemplate}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: templateDisplayName,
            content: html,
            design,
          }),
        }).catch(() => {});

        if (typeof window !== "undefined") {
          localStorage.setItem("gdg_mail_active_template", activeTemplate);
        }
        setActiveView("dispatch");
        refreshPreview(html);
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
                      text: newTemplateName.trim(),
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

    const initialContent = `<h1>${newTemplateName.trim()}</h1><p>Dear {{name}}, Welcome to Google Developer Groups on Campus AJCE!</p>`;

    try {
      const templateData: StoredCustomTemplate = {
        id: cleanName,
        name: newTemplateName.trim(),
        content: initialContent,
        design: initialDesign,
        hasDesign: true,
        type: "html",
        updatedAt: new Date().toISOString(),
      };

      // 1. Direct Client Firestore write using authenticated session
      try {
        const docRef = doc(db, "mail_templates", cleanName);
        await setDoc(docRef, templateData, { merge: true });
      } catch (fsErr: any) {
        console.warn("Direct Firestore write during template creation failed:", fsErr);
      }

      // 2. LocalStorage caching helper
      saveCustomTemplateToStorage(templateData);

      // 3. Call server route
      await fetch(`/api/mail-sender/templates/${cleanName}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTemplateName.trim(),
          design: initialDesign,
          content: initialContent,
        }),
      }).catch(() => {});

      // 4. Update local state - ensure it merges without wiping out the new template
      const newTemplateMeta: TemplateMeta = {
        id: cleanName,
        name: newTemplateName.trim(),
        hasDesign: true,
        type: "html",
      };

      setTemplates((prev) => [
        ...prev.filter((t) => t.id !== cleanName),
        newTemplateMeta,
      ]);

      setActiveTemplate(cleanName);
      if (typeof window !== "undefined") {
        localStorage.setItem("gdg_mail_active_template", cleanName);
      }

      // Set pending design so Unlayer loads it immediately upon opening/ready
      pendingUnlayerDesignRef.current = { design: initialDesign, html: initialContent };

      if (window.unlayer && isUnlayerReady) {
        applyDesignToUnlayer(initialDesign, initialContent);
      }

      setNewTemplateModalOpen(false);
      setNewTemplateName("");

      // Render live preview immediately with initialContent
      refreshPreview(initialContent);

      toast.success(`Template '${newTemplateName}' created successfully!`);
    } catch (e: any) {
      toast.error("Error creating template: " + e.message);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!confirm(`Are you sure you want to permanently delete template '${activeTemplate}'?`)) {
      return;
    }
    try {
      // 1. Direct Client Firestore delete
      try {
        await deleteDoc(doc(db, "mail_templates", activeTemplate));
      } catch (fsErr: any) {
        console.warn("Direct client Firestore delete failed:", fsErr);
      }

      // 2. Remove from LocalStorage cache
      removeCustomTemplateFromStorage(activeTemplate);

      // 3. Server API route delete
      await fetch(`/api/mail-sender/templates/${activeTemplate}`, {
        method: "DELETE",
      }).catch(() => {});

      const remaining = templates.filter((t) => t.id !== activeTemplate);
      setTemplates(remaining);
      const nextActive = remaining.length > 0 ? remaining[0].id : "not-shortlisted";
      setActiveTemplate(nextActive);
      if (typeof window !== "undefined") {
        localStorage.setItem("gdg_mail_active_template", nextActive);
      }
      refreshPreview();
      toast.success(`Template '${activeTemplate}' deleted successfully!`);
    } catch (e: any) {
      toast.error("Error deleting: " + e.message);
    }
  };

  const handleOpenRenameModal = () => {
    const curr = templates.find((t) => t.id === activeTemplate);
    setEditTemplateName(curr?.name || activeTemplate);
    setRenameModalOpen(true);
  };

  const handleConfirmRenameTemplate = async () => {
    const trimmed = editTemplateName.trim();
    if (!trimmed) {
      toast.error("Please provide a valid template name.");
      return;
    }

    try {
      setRenamingTemplate(true);

      // 1. Direct Client Firestore rename
      try {
        const docRef = doc(db, "mail_templates", activeTemplate);
        await setDoc(
          docRef,
          {
            name: trimmed,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (fsErr: any) {
        console.warn("Direct client Firestore rename failed:", fsErr);
      }

      // 2. Update localStorage cache
      const stored = getStoredCustomTemplates();
      if (stored[activeTemplate]) {
        stored[activeTemplate].name = trimmed;
        stored[activeTemplate].updatedAt = new Date().toISOString();
        saveCustomTemplateToStorage(stored[activeTemplate]);
      }

      // 3. Server API route rename
      await fetch(`/api/mail-sender/templates/${activeTemplate}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      }).catch(() => {});

      setTemplates((prev) =>
        prev.map((t) => (t.id === activeTemplate ? { ...t, name: trimmed } : t))
      );

      toast.success("Template renamed successfully!");
      setRenameModalOpen(false);
      refreshPreview();
    } catch (err: any) {
      toast.error("Error renaming template: " + err.message);
    } finally {
      setRenamingTemplate(false);
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
        if (typeof window !== "undefined") {
          localStorage.setItem("gdg_mail_active_template", data.templateName);
        }
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

  // Gemini Studio Callbacks
  const handleSaveGeminiTemplate = async (name: string, html: string, design: any) => {
    const tplData: StoredCustomTemplate = {
      id: name,
      name,
      design,
      content: html,
      hasDesign: Boolean(design),
      type: "html",
      updatedAt: new Date().toISOString(),
    };

    // 1. Direct Client Firestore save
    try {
      const docRef = doc(db, "mail_templates", name);
      await setDoc(docRef, tplData, { merge: true });
    } catch (fsErr: any) {
      console.warn("Direct client Firestore save failed in handleSaveGeminiTemplate:", fsErr);
    }

    // 2. Cache in localStorage
    saveCustomTemplateToStorage(tplData);

    // 3. Server API route
    await fetch(`/api/mail-sender/templates/${name}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: html, design, name }),
    }).catch(() => {});

    setTemplates((prev) => [
      ...prev.filter((t) => t.id !== name),
      { id: name, name, hasDesign: Boolean(design), type: "html" },
    ]);

    setActiveTemplate(name);
    if (typeof window !== "undefined") {
      localStorage.setItem("gdg_mail_active_template", name);
    }
    refreshPreview(html);
  };

  const handleApplyGeminiToDispatch = (templateId: string, subject: string, html: string) => {
    if (subject) setEmailSubject(subject);
    setActiveView("dispatch");
    refreshPreview();
  };

  const handleOpenGeminiInUnlayer = (design: any, html: string) => {
    pendingUnlayerDesignRef.current = { design, html };
    setActiveView("studio");
    if (isUnlayerReady && window.unlayer) {
      applyDesignToUnlayer(design, html);
      pendingUnlayerDesignRef.current = null;
    }
  };

  const handleApplyAiCopilot = () => {
    if (!window.unlayer) return;
    setIsUpdatingWithAi(true);
    setAiCopilotError(null);

    window.unlayer.exportHtml(async (data: any) => {
      const { html } = data;
      try {
        const res = await fetch("/api/mail-sender/gemini", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "update-editor-content",
            content: html,
            instruction: aiCopilotPrompt,
            goal: aiCopilotGoal,
          }),
        });

        const resData = await res.json();
        if (resData.success && resData.updatedHtml) {
          applyDesignToUnlayer(null, resData.updatedHtml);
          setAiCopilotSummary(
            resData.summary || "Email content successfully updated with Gemini AI!"
          );
          setAiCopilotOpen(false);
          refreshPreview();
        } else {
          setAiCopilotError(resData.error || "Failed to update email content with AI.");
        }
      } catch (err: any) {
        setAiCopilotError(err.message || "Network error while connecting to Gemini AI.");
      } finally {
        setIsUpdatingWithAi(false);
      }
    });
  };

  const handleOpenSubjectGenerator = () => {
    const topicToUse = emailSubject || activeTemplate;
    setAiSubjectTopic(topicToUse);
    setAiSubjectModalOpen(true);
    fetchAiSubjects(topicToUse);
  };

  const fetchAiSubjects = async (topicStr: string) => {
    if (!topicStr.trim()) return;
    setLoadingAiSubjects(true);
    try {
      const savedKey = typeof window !== "undefined" ? localStorage.getItem("gdg_gemini_api_key") || "" : "";
      const res = await fetch("/api/mail-sender/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate-subjects",
          topic: topicStr,
          apiKey: savedKey || undefined,
        }),
      });
      const data = await res.json();
      if (data.success && data.subjects) {
        setAiSubjectSuggestions(data.subjects);
      }
    } catch (e) {
    } finally {
      setLoadingAiSubjects(false);
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
      <Card className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Brand & Mode */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 shrink-0">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-900 leading-none">
                  GDG AJCE Mail Studio
                </h2>
                <Badge variant="blue" className="text-[10px] font-bold px-2 py-0.5">
                  Apps Script &amp; MJML
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Automated high-deliverability email dispatcher &amp; visual Unlayer editor
              </p>
            </div>
          </div>

          {/* View Switcher Tabs */}
          <div className="flex items-center space-x-2">
            <Tabs
              value={activeView}
              onValueChange={(val) => setActiveView(val as "dispatch" | "gemini" | "studio")}
              className="w-auto"
            >
              <TabsList className="bg-slate-100 p-1 rounded-xl h-auto border border-slate-200/60">
                <TabsTrigger
                  value="dispatch"
                  className="gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs transition"
                >
                  <Send className="w-3.5 h-3.5 text-blue-600" />
                  1. Dispatch Hub
                </TabsTrigger>
                <TabsTrigger
                  value="gemini"
                  className="gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-xs transition"
                >
                  <Sparkles
                    className={cn(
                      "w-3.5 h-3.5",
                      activeView === "gemini" ? "text-amber-300" : "text-indigo-600"
                    )}
                  />
                  2. ✨ Gemini AI Studio
                </TabsTrigger>
                <TabsTrigger
                  value="studio"
                  className="gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs transition"
                >
                  <Layout className="w-3.5 h-3.5 text-indigo-600" />
                  3. Visual Editor (Unlayer)
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setWebsiteModalOpen(true)}
              className="hidden md:inline-flex items-center text-xs font-semibold rounded-xl bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 h-9"
            >
              <Globe className="w-3.5 h-3.5 mr-1 text-blue-600" />
              Website API
            </Button>
          </div>
        </div>
      </Card>

      {/* ================= VIEW 1: DISPATCH HUB ================= */}
      <div className={activeView === "dispatch" ? "block" : "hidden"}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: Controls & Recipients (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Dispatch Engine & Gateway Setup */}
            <Card className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
                <div className="flex items-center space-x-3">
                  <Badge variant="blue" className="w-7 h-7 rounded-xl p-0 flex items-center justify-center font-bold text-xs shrink-0">
                    1
                  </Badge>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      Dispatch Engine &amp; Gateway
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Send via Google Apps Script Gateway (No App Passwords required)
                    </p>
                  </div>
                </div>

                <Tabs
                  value={engineTab}
                  onValueChange={(val) => setEngineTab(val as "gateway" | "password")}
                  className="w-auto"
                >
                  <TabsList className="bg-slate-100 p-0.5 rounded-lg h-auto">
                    <TabsTrigger
                      value="gateway"
                      className="px-3 py-1 rounded-md text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-2xs data-[state=active]:font-semibold transition flex items-center gap-1"
                    >
                      <Zap className="w-3 h-3 text-amber-500" />
                      Apps Script Gateway
                    </TabsTrigger>
                    <TabsTrigger
                      value="password"
                      className="px-3 py-1 rounded-md text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-2xs data-[state=active]:font-semibold transition flex items-center gap-1"
                    >
                      <Key className="w-3 h-3 text-slate-400" />
                      App Password
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* ENGINE 1: Apps Script Gateway */}
              {engineTab === "gateway" && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 text-xs text-blue-900 flex items-start space-x-2.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div className="leading-relaxed">
                      <span className="font-bold">Organization Google Workspace Mode: </span>
                      <span>
                        Executes under authenticated session{" "}
                        <strong className="font-semibold text-blue-950">{senderEmail}</strong> with{" "}
                        <strong className="font-semibold text-blue-950">1,500 daily quota</strong>. No App Passwords or custom domain needed.
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2 space-y-1.5">
                      <Label htmlFor="gateway-url-input" className="text-xs font-semibold text-slate-700">
                        Apps Script Web App URL <span className="text-slate-400 font-normal">(/exec)</span>
                      </Label>
                      <Input
                        id="gateway-url-input"
                        type="url"
                        value={gatewayUrl}
                        onChange={(e) => setGatewayUrl(e.target.value)}
                        placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                        className="font-mono text-xs h-9 bg-slate-50/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="gateway-api-key-input" className="text-xs font-semibold text-slate-700">
                        API Key / Secret
                      </Label>
                      <Input
                        id="gateway-api-key-input"
                        type="text"
                        value={gatewayApiKey}
                        onChange={(e) => setGatewayApiKey(e.target.value)}
                        className="font-mono text-xs h-9"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="sender-name-input" className="text-xs font-semibold text-slate-700">
                        Display Sender Name
                      </Label>
                      <Input
                        id="sender-name-input"
                        type="text"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        className="text-xs h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="sender-email-input" className="text-xs font-semibold text-slate-700">
                        Sender Email
                      </Label>
                      <Input
                        id="sender-email-input"
                        type="email"
                        value={senderEmail}
                        readOnly
                        disabled
                        className="text-xs h-9 bg-slate-100 text-slate-600 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Gateway Status Alert */}
                  {gatewayStatus.tested && (
                    <div
                      className={cn(
                        "text-xs p-3 rounded-xl flex items-center space-x-2 border",
                        gatewayStatus.online
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-red-50 text-red-800 border-red-200"
                      )}
                    >
                      {gatewayStatus.online ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      )}
                      <span className="font-medium">{gatewayStatus.message}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-100 gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleTestGateway}
                        disabled={gatewayStatus.loading}
                        className="h-8 text-xs font-semibold"
                      >
                        {gatewayStatus.loading ? (
                          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin text-blue-600" />
                        ) : (
                          <Radio className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                        )}
                        Test Connection
                      </Button>
                      <Button
                        type="button"
                        variant="default"
                        size="sm"
                        onClick={handleSaveSettings}
                        className="h-8 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white"
                      >
                        <Save className="w-3.5 h-3.5 mr-1.5" />
                        Save Gateway
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setAppsScriptModalOpen(true)}
                        className="h-8 text-xs font-semibold text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                      >
                        <FileCode2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                        Setup &amp; Code
                      </Button>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setTestModalOpen(true)}
                      className="h-8 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Send className="w-3.5 h-3.5 mr-1.5" />
                      Send Test Email
                    </Button>
                  </div>
                </div>
              )}

              {/* ENGINE 2: Gmail App Password */}
              {engineTab === "password" && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
                    For personal Gmail accounts with 2-Step Verification enabled. Requires generating
                    a 16-character App Password.
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="personal-gmail-input" className="text-xs font-semibold text-slate-700">
                        Gmail Address
                      </Label>
                      <Input
                        id="personal-gmail-input"
                        type="email"
                        value={senderEmail}
                        onChange={(e) => setSenderEmail(e.target.value)}
                        className="text-xs h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="personal-app-password-input" className="text-xs font-semibold text-slate-700">
                          App Password (16-char)
                        </Label>
                        <a
                          href="https://myaccount.google.com/apppasswords"
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-blue-600 hover:underline flex items-center gap-0.5"
                        >
                          Create Password <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                      <Input
                        id="personal-app-password-input"
                        type={showPassword ? "text" : "password"}
                        value={appPassword}
                        onChange={(e) => setAppPassword(e.target.value)}
                        placeholder="xxxx xxxx xxxx xxxx"
                        className="text-xs h-9 font-mono"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-3 border-t border-slate-100">
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleSaveSettings}
                      className="h-8 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white"
                    >
                      Save App Password
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Step 2: Recipients Source */}
            <Card className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
                <div className="flex items-center space-x-3">
                  <Badge variant="blue" className="w-7 h-7 rounded-xl p-0 flex items-center justify-center font-bold text-xs shrink-0">
                    2
                  </Badge>
                  <h3 className="text-sm font-bold text-slate-800">Recipients Source</h3>
                </div>
                <Tabs
                  value={sourceTab}
                  onValueChange={(val) => setSourceTab(val as "sheet" | "csv")}
                  className="w-auto"
                >
                  <TabsList className="bg-slate-100 p-0.5 rounded-lg h-auto">
                    <TabsTrigger
                      value="sheet"
                      className="px-3 py-1 rounded-md text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-2xs data-[state=active]:font-semibold transition"
                    >
                      Google Sheet
                    </TabsTrigger>
                    <TabsTrigger
                      value="csv"
                      className="px-3 py-1 rounded-md text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-2xs data-[state=active]:font-semibold transition"
                    >
                      Upload Excel / CSV
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {sourceTab === "sheet" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2 space-y-1.5">
                      <Label htmlFor="sheet-id-input" className="text-xs font-semibold text-slate-700">
                        Google Sheet Link or Sheet ID
                      </Label>
                      <div className="relative flex items-center">
                        <Input
                          id="sheet-id-input"
                          type="text"
                          value={sheetId}
                          onChange={(e) => setSheetId(e.target.value)}
                          placeholder="Paste full Google Sheet link or Sheet ID"
                          className="font-mono text-xs pr-24 h-9"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleFetchSheetTabs}
                          disabled={fetchingTabs}
                          className="absolute right-1 top-1 h-7 px-2.5 text-[11px] font-semibold text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          {fetchingTabs ? "Fetching..." : "Fetch Tabs"}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">
                        Sheet Tab
                      </Label>
                      <Select
                        value={selectedSheetTab}
                        onValueChange={(val) => setSelectedSheetTab(val)}
                        disabled={sheetTabs.length === 0}
                      >
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue placeholder={sheetTabs.length === 0 ? "Fetch tabs first" : "Select tab"} />
                        </SelectTrigger>
                        <SelectContent>
                          {sheetTabs.map((t) => (
                            <SelectItem key={t.name} value={t.name} className="text-xs">
                              {t.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-slate-500">
                      Ensure Sheet Share is set to &quot;Anyone with link: Viewer&quot;.
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleLoadFromSheet}
                      disabled={loadingSheetData}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold h-9 px-4"
                    >
                      {loadingSheetData ? (
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      ) : (
                        <DownloadCloud className="w-3.5 h-3.5 mr-1.5" />
                      )}
                      Load from Sheet
                    </Button>
                  </div>
                </div>
              )}

              {sourceTab === "csv" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="csv-input-area" className="text-xs font-semibold text-slate-700">
                      Paste CSV or Drop Excel/CSV File
                    </Label>
                    <label className="text-xs text-blue-600 hover:underline cursor-pointer font-medium flex items-center gap-1">
                      📁 Upload .xlsx or .csv
                      <input
                        type="file"
                        accept=".csv, .xlsx, .xls"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <Textarea
                    id="csv-input-area"
                    rows={4}
                    value={csvText}
                    onChange={(e) => setCsvText(e.target.value)}
                    placeholder="Name,Email,Team&#10;Rahul Sharma,rahul@amaljyothi.ac.in,Web Team&#10;Anjali Nair,anjali@amaljyothi.ac.in,AI Team"
                    className="font-mono text-xs p-3 resize-y min-h-[90px]"
                  />
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => parseCsvData(csvText)}
                      className="bg-slate-800 hover:bg-slate-900 text-white font-semibold h-9 px-4"
                    >
                      <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                      Parse Recipients
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Step 3: Recipients Table */}
            <Card className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
                <div className="flex items-center space-x-3">
                  <Badge variant="blue" className="w-7 h-7 rounded-xl p-0 flex items-center justify-center font-bold text-xs shrink-0">
                    3
                  </Badge>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Recipients List</h3>
                    <span className="text-xs text-slate-500">
                      {recipients.length} students loaded ({selectedCount} selected)
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    <Input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search student..."
                      className="text-xs pl-8 pr-2.5 h-8 w-44"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setRecipients((prev) => prev.map((r) => ({ ...r, selected: true })))
                    }
                    className="h-8 text-xs text-blue-600 hover:text-blue-700 px-2 font-semibold"
                  >
                    All
                  </Button>
                  <Separator orientation="vertical" className="h-4" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setRecipients((prev) => prev.map((r) => ({ ...r, selected: false })))
                    }
                    className="h-8 text-xs text-slate-500 hover:text-slate-800 px-2 font-semibold"
                  >
                    None
                  </Button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto max-h-72 border border-slate-100 rounded-xl">
                <Table className="w-full text-xs">
                  <TableHeader className="bg-slate-50 sticky top-0 z-10">
                    <TableRow className="border-b border-slate-200">
                      <TableHead className="w-10 text-center p-2.5">
                        <Checkbox
                          checked={
                            recipients.length > 0 && selectedCount === recipients.length
                              ? true
                              : selectedCount > 0
                              ? "indeterminate"
                              : false
                          }
                          onCheckedChange={(val) => {
                            const isChecked = val === true;
                            setRecipients((prev) => prev.map((r) => ({ ...r, selected: isChecked })));
                          }}
                          aria-label="Select all recipients"
                        />
                      </TableHead>
                      <TableHead className="p-2.5 text-xs font-semibold text-slate-700">Name</TableHead>
                      <TableHead className="p-2.5 text-xs font-semibold text-slate-700">Email</TableHead>
                      <TableHead className="p-2.5 text-xs font-semibold text-slate-700">Category</TableHead>
                      <TableHead className="p-2.5 text-xs font-semibold text-slate-700">Time</TableHead>
                      <TableHead className="p-2.5 text-center text-xs font-semibold text-slate-700">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-100">
                    {filteredRecipients.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="p-6 text-center text-slate-400 text-xs">
                          No recipients loaded yet. Click <strong>&quot;Load from Sheet&quot;</strong> or
                          upload Excel/CSV.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRecipients.map((r) => (
                        <TableRow key={r.id} className="hover:bg-slate-50/60 transition-colors">
                          <TableCell className="p-2.5 text-center">
                            <Checkbox
                              checked={r.selected ?? false}
                              onCheckedChange={(val) => {
                                const isChecked = val === true;
                                setRecipients((prev) =>
                                  prev.map((item) =>
                                    item.id === r.id ? { ...item, selected: isChecked } : item
                                  )
                                );
                              }}
                              aria-label={`Select ${r.name}`}
                            />
                          </TableCell>
                          <TableCell className="p-2.5 font-medium text-slate-800">{r.name}</TableCell>
                          <TableCell className="p-2.5 text-slate-600 font-mono text-[11px]">{r.email}</TableCell>
                          <TableCell className="p-2.5 text-slate-600">{r.category || r.team || "-"}</TableCell>
                          <TableCell className="p-2.5 text-slate-500 text-[11px]">{r.time || "-"}</TableCell>
                          <TableCell className="p-2.5 text-center">
                            <Badge
                              variant={r.status === "Sent" ? "success" : "warning"}
                              className="text-[10px] font-bold px-2 py-0.5"
                            >
                              {r.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Progress & Send Action */}
              <div className="pt-2 space-y-3">
                {isSending && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-700">{sendProgress.statusText}</span>
                      <span className="text-blue-600 font-bold">{sendProgress.percent}%</span>
                    </div>
                    <Progress value={sendProgress.percent} className="h-2.5 bg-slate-200" />
                    <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                      <span>
                        {sendProgress.current} of {sendProgress.total} completed (Success:{" "}
                        <strong className="text-emerald-600">{sendProgress.successCount}</strong>, Failed:{" "}
                        <strong className="text-red-500">{sendProgress.failCount}</strong>)
                      </span>
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        onClick={handleCancelSend}
                        className="text-red-600 hover:text-red-700 font-semibold p-0 h-auto"
                      >
                        Cancel Sending
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">{selectedCount}</span> selected to
                    send
                  </div>
                  <Button
                    type="button"
                    onClick={handleStartBatchSend}
                    disabled={isSending || selectedCount === 0}
                    className="h-10 px-5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs disabled:opacity-50"
                  >
                    {isSending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Send Emails to Selected
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN: Template & Live Preview (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs sticky top-24 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <Palette className="w-5 h-5 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-800">Email Template</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveView("studio")}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold bg-indigo-50 border-indigo-100 hover:bg-indigo-100 h-8 px-2.5 rounded-lg"
                  >
                    <Layout className="w-3 h-3 mr-1" /> Open in Editor
                  </Button>
                  <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setPreviewDevice("desktop")}
                            className={cn(
                              "h-7 w-7 rounded-md transition-colors",
                              previewDevice === "desktop"
                                ? "bg-white shadow-2xs text-slate-800"
                                : "text-slate-500 hover:text-slate-700"
                            )}
                          >
                            <Monitor className="w-3.5 h-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs">Desktop view</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setPreviewDevice("mobile")}
                            className={cn(
                              "h-7 w-7 rounded-md transition-colors",
                              previewDevice === "mobile"
                                ? "bg-white shadow-2xs text-slate-800"
                                : "text-slate-500 hover:text-slate-700"
                            )}
                          >
                            <Smartphone className="w-3.5 h-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs">Mobile view</TooltipContent>
                      </Tooltip>
                      <Separator orientation="vertical" className="h-4 mx-0.5" />
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setFullscreenPreviewOpen(true)}
                            className="h-7 w-7 rounded-md text-slate-500 hover:text-slate-800 hover:bg-white transition-colors"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs">Expand / Fullscreen</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>

              <div className="space-y-3.5">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-semibold text-slate-700">
                      Active Template
                    </Label>
                    <div className="flex items-center space-x-1.5">
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        onClick={() => setActiveView("gemini")}
                        className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold p-0 h-auto"
                      >
                        <Sparkles className="w-3 h-3 mr-0.5 text-indigo-500" /> AI Create
                      </Button>
                      <span className="text-slate-300">|</span>
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        onClick={() => setNewTemplateModalOpen(true)}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold p-0 h-auto"
                      >
                        <PlusCircle className="w-3 h-3 mr-0.5 text-blue-500" /> New
                      </Button>
                      <span className="text-slate-300">|</span>
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        onClick={handleOpenRenameModal}
                        className="text-[11px] text-slate-700 hover:text-blue-600 font-medium p-0 h-auto"
                      >
                        <Edit2 className="w-3 h-3 mr-0.5 text-slate-500" /> Rename
                      </Button>
                      <span className="text-slate-300">|</span>
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        onClick={handleDeleteTemplate}
                        className="text-[11px] text-red-600 hover:text-red-800 font-medium p-0 h-auto"
                      >
                        <Trash2 className="w-3 h-3 mr-0.5 text-red-500" /> Delete
                      </Button>
                    </div>
                  </div>
                  <Select
                    value={activeTemplate}
                    onValueChange={(val) => setActiveTemplate(val)}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.filter((t) => Boolean(t.id)).map((t) => (
                        <SelectItem key={t.id} value={t.id} className="text-xs font-medium cursor-pointer">
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="email-subject-input" className="text-xs font-semibold text-slate-700">
                      Subject Line
                    </Label>
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      onClick={handleOpenSubjectGenerator}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold p-0 h-auto"
                    >
                      <Sparkles className="w-3 h-3 mr-1 text-indigo-500" /> ✨ AI Subject Ideas
                    </Button>
                  </div>
                  <Input
                    id="email-subject-input"
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>
              </div>

              {/* Preview Frame */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-slate-600">Live Preview</span>
                  <div className="flex items-center space-x-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFullscreenPreviewOpen(true)}
                      className="h-7 px-2 text-xs text-slate-600 hover:text-blue-600 font-semibold"
                      title="Expand / Fullscreen Preview Modal"
                    >
                      <Maximize2 className="w-3 h-3 mr-1" />
                      Expand
                    </Button>
                    <span className="text-slate-300">|</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={refreshPreview}
                      disabled={refreshingPreview}
                      className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      <RotateCw
                        className={cn("w-3 h-3 mr-1", refreshingPreview && "animate-spin")}
                      />
                      Refresh
                    </Button>
                  </div>
                </div>
                <div
                  className={cn(
                    "bg-slate-50 rounded-xl border border-slate-200 transition-all duration-300 mx-auto overflow-hidden relative shadow-inner",
                    previewDevice === "mobile" ? "max-w-[360px]" : "w-full"
                  )}
                  style={{ height: "520px", maxHeight: "520px" }}
                >
                  <iframe
                    title="Live Email Preview"
                    srcDoc={previewHtml}
                    scrolling="yes"
                    className="w-full h-full border-0 bg-white block overflow-y-auto"
                    style={{
                      height: "100%",
                      width: "100%",
                      overflowY: "auto",
                      WebkitOverflowScrolling: "touch",
                    }}
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* ================= VIEW 2: GEMINI AI STUDIO ================= */}
      <div className={activeView === "gemini" ? "block" : "hidden"}>
        <GeminiMailStudio
          onSaveAsTemplate={handleSaveGeminiTemplate}
          onApplyToDispatch={handleApplyGeminiToDispatch}
          onOpenInUnlayer={handleOpenGeminiInUnlayer}
          onSendTestEmail={(subj, html) => {
            if (subj) setEmailSubject(subj);
            setTestModalOpen(true);
          }}
          existingTemplates={templates}
        />
      </div>

      {/* ================= VIEW 3: REACT EMAIL EDITOR (UNLAYER) ================= */}
      <div className={activeView === "studio" ? "block" : "hidden"}>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[calc(100vh-180px)] overflow-hidden">
          {/* Unlayer Top Action Bar */}
          <TooltipProvider delayDuration={150}>
            <div className="bg-white/95 backdrop-blur-sm border-b border-slate-200 h-14 px-4 lg:px-6 flex items-center justify-between gap-3 flex-none z-20 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {/* Left Group: Template Management */}
              <div className="flex items-center gap-2.5 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:inline select-none">
                    Template:
                  </span>
                  <Select
                    value={activeTemplate}
                    onValueChange={(val) => {
                      setActiveTemplate(val);
                      loadTemplateToEditor(val);
                    }}
                  >
                    <SelectTrigger className="h-8 w-36 sm:w-44 md:w-52 text-xs font-semibold bg-slate-50/90 border-slate-200 hover:bg-slate-100/70 focus:ring-1 focus:ring-blue-500 rounded-lg">
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent className="max-h-64 z-50">
                      {templates.filter((t) => Boolean(t.id)).map((t) => (
                        <SelectItem key={t.id} value={t.id} className="text-xs font-medium cursor-pointer">
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleOpenRenameModal}
                        className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-slate-100 border border-slate-200 bg-white rounded-lg shrink-0"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span className="sr-only">Rename active template</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-[11px] font-medium">
                      Rename template
                    </TooltipContent>
                  </Tooltip>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setNewTemplateModalOpen(true)}
                  className="h-8 text-xs font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 hover:border-blue-200 border-slate-200 rounded-lg shrink-0 gap-1.5 whitespace-nowrap"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
                  <span>New</span>
                </Button>
              </div>

              {/* Center Group: Personalization & Merge Tags */}
              <div className="hidden lg:flex items-center gap-2 shrink-0">
                <span className="text-xs font-semibold text-slate-400 select-none">
                  Merge Tags:
                </span>
                <div className="flex items-center gap-1.5">
                  {[
                    { tag: "{{name}}", label: "Name" },
                    { tag: "{{team}}", label: "Team" },
                    { tag: "{{email}}", label: "Email" },
                  ].map(({ tag, label }) => {
                    const isCopied = copiedTag === tag;
                    return (
                      <Tooltip key={tag}>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => copyMergeTag(tag)}
                            className={cn(
                              "inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-medium transition-all cursor-pointer border select-none whitespace-nowrap",
                              isCopied
                                ? "bg-emerald-50 border-emerald-300 text-emerald-700 shadow-2xs scale-105"
                                : "bg-slate-50 hover:bg-blue-50/70 border-slate-200 hover:border-blue-200 text-slate-700 hover:text-blue-700"
                            )}
                          >
                            {isCopied ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3 text-slate-400 opacity-60" />
                            )}
                            <span>{isCopied ? "Copied!" : tag}</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-[11px]">
                          Click to copy {label} tag ({tag})
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-transparent transition cursor-pointer select-none"
                      >
                        <span>More</span>
                        <ChevronDown className="w-3 h-3 opacity-60" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="w-56 z-50">
                      <DropdownMenuLabel className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        More Personalization Tags
                      </DropdownMenuLabel>
                      {[
                        { tag: "{{category}}", desc: "Applicant role / category" },
                        { tag: "{{time_slot}}", desc: "Assigned interview slot" },
                        { tag: "{{date}}", desc: "Interview or event date" },
                        { tag: "{{meet_link}}", desc: "Google Meet link" },
                        { tag: "{{whatsapp_link}}", desc: "WhatsApp community link" },
                      ].map(({ tag, desc }) => (
                        <DropdownMenuItem
                          key={tag}
                          onClick={() => copyMergeTag(tag)}
                          className="text-xs cursor-pointer flex items-center justify-between py-1.5"
                        >
                          <div className="flex flex-col">
                            <span className="font-mono font-semibold text-blue-600">{tag}</span>
                            <span className="text-[10px] text-slate-400">{desc}</span>
                          </div>
                          <Copy className="w-3 h-3 text-slate-400 opacity-60" />
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Right Group: Structured Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {/* AI Assistant */}
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    setAiCopilotError(null);
                    setAiCopilotOpen(true);
                  }}
                  className="h-8 px-3.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-xs border-0 gap-1.5 transition-all shrink-0 whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300/30 shrink-0" />
                  <span>AI Assistant</span>
                </Button>

                {/* Design Tools Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs font-medium border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg gap-1.5 shrink-0 whitespace-nowrap"
                    >
                      <Wand2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span className="hidden sm:inline">Design Tools</span>
                      <span className="sm:hidden">Tools</span>
                      <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 z-50">
                    <DropdownMenuItem
                      onClick={() => setActiveView("gemini")}
                      className="text-xs cursor-pointer gap-2.5 py-2"
                    >
                      <div className="w-7 h-7 rounded-md bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">Gemini Studio</span>
                        <span className="text-[10px] text-slate-500">AI template generation</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setFigmaModalOpen(true)}
                      className="text-xs cursor-pointer gap-2.5 py-2"
                    >
                      <div className="w-7 h-7 rounded-md bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
                        <Palette className="w-3.5 h-3.5 text-purple-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">Figma Import</span>
                        <span className="text-[10px] text-slate-500">Import design from Figma URL</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleExportHtml}
                      className="text-xs cursor-pointer gap-2.5 py-2"
                    >
                      <div className="w-7 h-7 rounded-md bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                        <Code className="w-3.5 h-3.5 text-amber-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">Export HTML</span>
                        <span className="text-[10px] text-slate-500">Download or copy raw code</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Divider */}
                <div className="h-5 w-px bg-slate-200 hidden sm:block shrink-0" />

                {/* Save Draft */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSaveUnlayerDesign}
                  className="h-8 px-3 text-xs font-medium border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-emerald-700 rounded-lg gap-1.5 shrink-0 whitespace-nowrap"
                >
                  <Save className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="hidden sm:inline">Save Draft</span>
                  <span className="sm:hidden">Save</span>
                </Button>

                {/* Save & Apply */}
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveAndApply}
                  className="h-8 px-3.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs border-0 gap-1.5 shrink-0 whitespace-nowrap transition-all"
                >
                  <Check className="w-3.5 h-3.5 text-white stroke-[2.5] shrink-0" />
                  <span>Save & Apply</span>
                </Button>
              </div>
            </div>
          </TooltipProvider>

          {/* AI Copilot Update Summary Banner */}
          {aiCopilotSummary && (
            <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 flex items-center justify-between text-xs text-emerald-800 flex-none z-10">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>AI Update Applied:</strong> {aiCopilotSummary}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAiCopilotSummary(null)}
                className="text-emerald-600 hover:text-emerald-900 ml-4 font-bold p-0.5 rounded hover:bg-emerald-100 transition"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Unlayer Full Viewport Container */}
          <div className="flex-1 w-full h-full relative">
            <div id="unlayer-editor-container" className="w-full h-full min-h-[500px]" />
          </div>
        </div>
      </div>

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

      {/* ================= MODAL: RENAME TEMPLATE ================= */}
      {renameModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 flex items-center text-sm">
                <Edit2 className="w-4 h-4 text-blue-600 mr-2" /> Rename Email Template
              </h3>
              <button
                type="button"
                onClick={() => setRenameModalOpen(false)}
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
                value={editTemplateName}
                onChange={(e) => setEditTemplateName(e.target.value)}
                placeholder="e.g. Workshop Invite, Community Newsletter"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleConfirmRenameTemplate();
                  }
                }}
                autoFocus
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRenameModalOpen(false)}
                disabled={renamingTemplate}
                className="px-4 py-2 text-xs font-medium rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRenameTemplate}
                disabled={renamingTemplate || !editTemplateName.trim()}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center shadow-xs"
              >
                {renamingTemplate ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Name"
                )}
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
                  toast.success("Copied HTML code to clipboard!");
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

      {/* ================= MODAL 7: FULLSCREEN EMAIL PREVIEW ================= */}
      {fullscreenPreviewOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 z-50 animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setFullscreenPreviewOpen(false);
            }
          }}
        >
          <div className="bg-white rounded-2xl max-w-5xl w-full h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex-none">
              <div className="flex items-center space-x-3">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center">
                    Email Preview
                    <span className="ml-2 text-[11px] font-normal text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                      {templates.find((t) => t.id === activeTemplate)?.name || activeTemplate}
                    </span>
                  </h3>
                  {emailSubject && (
                    <p className="text-[11px] text-slate-500 truncate max-w-md">
                      <span className="font-semibold text-slate-600">Subject:</span> {emailSubject}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Device Switcher */}
                <div className="flex items-center space-x-1 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("desktop")}
                    className={`flex items-center px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      previewDevice === "desktop"
                        ? "bg-blue-50 text-blue-700 shadow-2xs font-semibold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5 mr-1.5" />
                    Desktop
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("mobile")}
                    className={`flex items-center px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      previewDevice === "mobile"
                        ? "bg-blue-50 text-blue-700 shadow-2xs font-semibold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5 mr-1.5" />
                    Mobile
                  </button>
                </div>

                <button
                  type="button"
                  onClick={refreshPreview}
                  disabled={refreshingPreview}
                  className="px-2.5 py-1.5 text-xs text-slate-700 hover:text-blue-600 bg-white border border-slate-200 rounded-lg flex items-center font-medium shadow-2xs hover:bg-slate-50 transition-colors"
                >
                  <RotateCw
                    className={`w-3.5 h-3.5 mr-1.5 ${refreshingPreview ? "animate-spin text-blue-600" : ""}`}
                  />
                  Refresh
                </button>

                <div className="h-4 w-px bg-slate-200" />

                <button
                  type="button"
                  onClick={() => setFullscreenPreviewOpen(false)}
                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
                  title="Close preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body / Scrollable email canvas */}
            <div className="flex-1 bg-slate-100 p-4 sm:p-6 overflow-y-auto flex justify-center items-start">
              <div
                className={`bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden transition-all duration-300 w-full ${
                  previewDevice === "mobile" ? "max-w-[420px]" : "max-w-[760px]"
                }`}
                style={{ height: "calc(92vh - 110px)" }}
              >
                <iframe
                  title="Fullscreen Live Email Preview"
                  srcDoc={previewHtml}
                  scrolling="yes"
                  className="w-full h-full border-0 bg-white block overflow-y-auto"
                  style={{
                    height: "100%",
                    width: "100%",
                    overflowY: "auto",
                    WebkitOverflowScrolling: "touch",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 8: AI SUBJECT IDEAS ================= */}
      {aiSubjectModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 flex items-center text-sm">
                <Sparkles className="w-4 h-4 text-indigo-600 mr-2" /> Gemini AI Subject Generator
              </h3>
              <button
                onClick={() => setAiSubjectModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Topic / Intent
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={aiSubjectTopic}
                  onChange={(e) => setAiSubjectTopic(e.target.value)}
                  placeholder="e.g. Flutter workshop announcement, Core team shortlist"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => fetchAiSubjects(aiSubjectTopic)}
                  disabled={loadingAiSubjects || !aiSubjectTopic.trim()}
                  className="px-3 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition shrink-0 flex items-center"
                >
                  {loadingAiSubjects ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RotateCw className="w-3.5 h-3.5" />
                  )}
                  <span className="ml-1.5 hidden sm:inline">Generate</span>
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {loadingAiSubjects && (
                <div className="py-8 text-center text-xs text-slate-500 flex flex-col items-center justify-center space-y-2">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                  <span>Gemini is analyzing open-rate patterns and generating subject lines...</span>
                </div>
              )}

              {!loadingAiSubjects && aiSubjectSuggestions.length === 0 && (
                <div className="py-6 text-center text-xs text-slate-400">
                  Enter a topic and click "Generate" to brainstorm 5 high-converting subject lines.
                </div>
              )}

              {!loadingAiSubjects &&
                aiSubjectSuggestions.map((subj, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setEmailSubject(subj.text);
                      setAiSubjectModalOpen(false);
                    }}
                    className="p-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 cursor-pointer transition flex items-center justify-between group"
                  >
                    <div className="space-y-0.5 pr-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{subj.emoji}</span>
                        <span className="text-xs font-semibold text-slate-800 group-hover:text-indigo-700">
                          {subj.text}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium ml-6">
                        Style: {subj.style}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-indigo-600 shrink-0 opacity-0 group-hover:opacity-100 transition">
                      Use This →
                    </span>
                  </div>
                ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAiSubjectModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 9: AI VISUAL EDITOR COPILOT ================= */}
      {aiCopilotOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">AI Visual Editor Copilot</h3>
                  <p className="text-[11px] text-slate-500">
                    Update, rewrite, or polish email copy directly on your visual canvas with Gemini AI
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAiCopilotOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Select AI Goal / Focus Preset:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    {
                      id: "more_engaging",
                      label: "Make More Engaging & Punchy",
                      desc: "Elevate tone and inject community excitement.",
                    },
                    {
                      id: "condense",
                      label: "Condense & Shorten (Cut Fluff)",
                      desc: "Trim excess words while keeping dates and links.",
                    },
                    {
                      id: "improve_cta",
                      label: "Improve Call-to-Action (CTA)",
                      desc: "Make buttons and RSVP requests high-converting.",
                    },
                    {
                      id: "add_guidelines",
                      label: "Add Participation Guidelines / FAQs",
                      desc: "Add structured eligibility rules or prerequisites.",
                    },
                    {
                      id: "urgent_countdown",
                      label: "Urgent 24-Hour Countdown Mode",
                      desc: "Create urgency around seat limits and final hours.",
                    },
                    {
                      id: "custom",
                      label: "Custom Prompt",
                      desc: "Provide custom instructions for Gemini.",
                    },
                  ].map((preset) => {
                    const isSelected = aiCopilotGoal === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setAiCopilotGoal(preset.id)}
                        className={`text-left p-2.5 rounded-xl border transition flex flex-col justify-between ${
                          isSelected
                            ? "bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-950"
                            : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                        }`}
                      >
                        <span className="font-semibold text-xs flex items-center">
                          {isSelected && <Check className="w-3.5 h-3.5 mr-1 text-indigo-600" />}
                          {preset.label}
                        </span>
                        <span className="text-[11px] text-slate-500 mt-1 leading-tight">
                          {preset.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {aiCopilotGoal === "custom"
                    ? "Custom Instructions for Gemini (Required):"
                    : "Additional Custom Instructions (Optional):"}
                </label>
                <textarea
                  rows={3}
                  value={aiCopilotPrompt}
                  onChange={(e) => setAiCopilotPrompt(e.target.value)}
                  placeholder={
                    aiCopilotGoal === "custom"
                      ? "e.g. Add a reminder that laptops are mandatory and doors close at 9:30 AM."
                      : "Optional extra instructions to tailor this update..."
                  }
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-[11px] text-slate-600">
                <span className="font-semibold text-slate-800">Merge Tag Guarantee:</span>
                <p>
                  Tags like <code className="bg-white px-1 py-0.5 rounded border border-slate-200">{"{{name}}"}</code>,{" "}
                  <code className="bg-white px-1 py-0.5 rounded border border-slate-200">{"{{team}}"}</code>, and{" "}
                  <code className="bg-white px-1 py-0.5 rounded border border-slate-200">{"{{date}}"}</code> will be safely preserved.
                </p>
              </div>

              {aiCopilotError && (
                <div className="p-3 rounded-xl bg-red-50 text-red-800 border border-red-200 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{aiCopilotError}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAiCopilotOpen(false)}
                disabled={isUpdatingWithAi}
                className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyAiCopilot}
                disabled={isUpdatingWithAi || (aiCopilotGoal === "custom" && !aiCopilotPrompt.trim())}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 flex items-center shadow-xs transition disabled:opacity-50"
              >
                {isUpdatingWithAi ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Updating Canvas with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-300" />
                    Apply AI Updates to Editor
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
