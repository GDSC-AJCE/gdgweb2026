"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Download,
  QrCode,
  Send,
  CheckCircle2,
  Calendar,
  Users,
  Sparkles,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Search,
  ChevronDown,
  Plus,
  Type,
  Move,
  Eye,
  Mail,
  Award,
  Layers,
  Settings2,
  FileCheck2,
  Image as ImageIcon,
  PenTool,
  Link as LinkIcon,
  Save,
} from "lucide-react";
import QRCode from "qrcode";
import { nanoid } from "nanoid";
import { db, storage } from "@/lib/firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  Timestamp,
  orderBy,
  writeBatch,
  deleteDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useDialog } from "@/context/DialogContext";

export interface DynamicElement {
  id: string;
  type: "text" | "qrcode" | "signature" | "badge";
  field: "name" | "college" | "department" | "email" | "eventTitle" | "date" | "certificateId" | "custom";
  customText?: string;
  label: string;
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  fontSize: number; // in pixels relative to standard 1600x1131 canvas
  fontFamily: string;
  fontWeight: string;
  color: string;
  textAlign: "left" | "center" | "right";
  width?: number; // for QR code / signatures
  height?: number;
  imageUrl?: string;
  visible: boolean;
}

interface Participant {
  id: string;
  name: string;
  email: string;
  userId?: string;
  registeredAt?: any;
  department?: string;
  college?: string;
  phoneNumber?: string;
  graduationYear?: string | number;
}

interface CertificateStudioProps {
  eventId: string;
  eventTitle: string;
  eventDate?: string;
  participants: Participant[];
  onCertificatesUpdated?: () => void;
  isWriter?: boolean;
}

const DEFAULT_FONTS = [
  { value: "Inter, sans-serif", label: "Inter (Modern Sans)" },
  { value: "Urbanist, sans-serif", label: "Urbanist (Clean Tech)" },
  { value: "Playfair Display, serif", label: "Playfair Display (Editorial Serif)" },
  { value: "Great Vibes, cursive", label: "Great Vibes (Calligraphy)" },
  { value: "Cinzel, serif", label: "Cinzel (Classic Formal)" },
  { value: "Courier New, monospace", label: "Courier (Monospace ID)" },
];

const DEFAULT_ELEMENTS: DynamicElement[] = [
  {
    id: "elem_title",
    type: "text",
    field: "custom",
    customText: "CERTIFICATE OF PARTICIPATION",
    label: "Certificate Title",
    x: 50,
    y: 28,
    fontSize: 26,
    fontFamily: "Urbanist, sans-serif",
    fontWeight: "800",
    color: "#0f172a",
    textAlign: "center",
    visible: true,
  },
  {
    id: "elem_subtitle",
    type: "text",
    field: "custom",
    customText: "THIS IS PROUDLY PRESENTED TO",
    label: "Subtitle / Tag",
    x: 50,
    y: 35,
    fontSize: 12,
    fontFamily: "Urbanist, sans-serif",
    fontWeight: "700",
    color: "#64748b",
    textAlign: "center",
    visible: true,
  },
  {
    id: "elem_name",
    type: "text",
    field: "name",
    label: "Participant Name",
    x: 50,
    y: 45,
    fontSize: 48,
    fontFamily: "Playfair Display, serif",
    fontWeight: "800",
    color: "#2563EB",
    textAlign: "center",
    visible: true,
  },
  {
    id: "elem_desc",
    type: "text",
    field: "custom",
    customText: "for active participation and successful completion of the hands-on technical workshop.",
    label: "Description / Citation",
    x: 50,
    y: 54,
    fontSize: 14,
    fontFamily: "Urbanist, sans-serif",
    fontWeight: "500",
    color: "#475569",
    textAlign: "center",
    visible: true,
  },
  {
    id: "elem_event",
    type: "text",
    field: "eventTitle",
    label: "Event Name",
    x: 50,
    y: 61,
    fontSize: 22,
    fontFamily: "Urbanist, sans-serif",
    fontWeight: "800",
    color: "#0f172a",
    textAlign: "center",
    visible: true,
  },
  {
    id: "elem_date",
    type: "text",
    field: "date",
    label: "Issue Date",
    x: 25,
    y: 82,
    fontSize: 13,
    fontFamily: "Urbanist, sans-serif",
    fontWeight: "600",
    color: "#334155",
    textAlign: "center",
    visible: true,
  },
  {
    id: "elem_sig1",
    type: "text",
    field: "custom",
    customText: "Prof. Fr. Rubin Thoppil\nFaculty Advisor, GDG AJCE",
    label: "Signatory 1",
    x: 50,
    y: 82,
    fontSize: 12,
    fontFamily: "Urbanist, sans-serif",
    fontWeight: "600",
    color: "#334155",
    textAlign: "center",
    visible: true,
  },
  {
    id: "elem_id",
    type: "text",
    field: "certificateId",
    label: "Certificate ID",
    x: 82,
    y: 87,
    fontSize: 11,
    fontFamily: "Courier New, monospace",
    fontWeight: "700",
    color: "#2563EB",
    textAlign: "center",
    visible: true,
  },
  {
    id: "elem_qr",
    type: "qrcode",
    field: "certificateId",
    label: "Verification QR Code",
    x: 82,
    y: 76,
    fontSize: 80, // width & height in px
    fontFamily: "Urbanist, sans-serif",
    fontWeight: "normal",
    color: "#0f172a",
    textAlign: "center",
    visible: true,
  },
];

export default function CertificateStudio({
  eventId,
  eventTitle,
  eventDate,
  participants,
  onCertificatesUpdated,
  isWriter = true,
}: CertificateStudioProps) {
  const dialog = useDialog();

  // Selected participant for preview
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    participants.length > 0 ? participants[0].id : ""
  );
  const [searchStudent, setSearchStudent] = useState("");

  // Frame Background: image link / URL
  const [bgImage, setBgImage] = useState<string>("");
  const [bgInputUrl, setBgInputUrl] = useState<string>("");
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);

  // Dynamic Canvas Elements
  const [elements, setElements] = useState<DynamicElement[]>(DEFAULT_ELEMENTS);
  const [selectedElemId, setSelectedElemId] = useState<string>("elem_name");

  // Dragging state
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDraggingRef = useRef(false);
  const dragElemIdRef = useRef<string | null>(null);

  // Figma-style Alignment Snapping & Guides
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [showGridLines, setShowGridLines] = useState(false);
  const [activeGuides, setActiveGuides] = useState<{
    vertical: number | null; // X percentage (e.g., 50 for center, or matching another element)
    horizontal: number | null; // Y percentage
    matchingElementLabel?: string;
  }>({ vertical: null, horizontal: null });

  // Issued registry state
  const [issuedMap, setIssuedMap] = useState<Record<string, any>>({});
  const [loadingIssued, setLoadingIssued] = useState(true);
  const [showRegistry, setShowRegistry] = useState(false);

  // Actions
  const [batchIssuing, setBatchIssuing] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copiedLink, setCopiedLink] = useState(false);

  const currentParticipant =
    participants.find((p) => p.id === selectedStudentId) ||
    participants[0] || {
      id: "demo",
      name: "Alex Mercer",
      email: "alex.mercer@amaljyothi.ac.in",
      department: "Computer Science",
      college: "Amal Jyothi College of Engineering",
    };

  const previewCertId = `GDG-${(currentParticipant.id || "CERT").slice(0, 8).toUpperCase()}`;

  // Fetch already saved template config for this event if it exists
  const fetchTemplate = async () => {
    try {
      const templateDoc = await getDoc(doc(db, "events", eventId, "certificates", "default"));
      if (templateDoc.exists()) {
        const data = templateDoc.data();
        if (data.backgroundUrl) {
          setBgImage(data.backgroundUrl);
          setBgInputUrl(data.backgroundUrl);
        }
        if (Array.isArray(data.elements) && data.elements.length > 0) {
          setElements(data.elements);
        }
      }
    } catch (e) {
      console.warn("Could not load saved template:", e);
    }
  };

  // Fetch already issued certificates
  const fetchIssued = async () => {
    try {
      setLoadingIssued(true);
      const q = query(
        collection(db, "events", eventId, "issuedCertificates"),
        orderBy("issuedAt", "desc")
      );
      const snap = await getDocs(q);
      const map: Record<string, any> = {};
      snap.docs.forEach((d) => {
        const data = d.data();
        if (data.recipientEmail) {
          map[data.recipientEmail.toLowerCase()] = { id: d.id, ...data };
        }
      });
      setIssuedMap(map);
    } catch (err) {
      console.error("Error loading issued certs:", err);
    } finally {
      setLoadingIssued(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchIssued();
      fetchTemplate();
    }
  }, [eventId]);

  // Generate QR code for the current preview cert ID
  useEffect(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://gdgajce.vercel.app";
    const verifyUrl = `${origin}/verify/${previewCertId}`;
    QRCode.toDataURL(verifyUrl, { margin: 1, width: 240 }, (err, url) => {
      if (!err && url) setQrDataUrl(url);
    });
  }, [previewCertId]);

  // Render certificate to canvas
  useEffect(() => {
    renderCanvas();
  }, [elements, currentParticipant, bgImage, qrDataUrl]);

  const getElementRenderText = (elem: DynamicElement): string => {
    if (elem.type === "qrcode") return "[QR]";
    switch (elem.field) {
      case "name":
        return currentParticipant.name || "Recipient Name";
      case "college":
        return currentParticipant.college || "Amal Jyothi College of Engineering";
      case "department":
        return currentParticipant.department || "Engineering & Technology";
      case "email":
        return currentParticipant.email || "";
      case "eventTitle":
        return eventTitle || "Google Developer Groups Event";
      case "date":
        return eventDate
          ? new Date(eventDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
          : new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
      case "certificateId":
        return previewCertId;
      case "custom":
      default:
        return elem.customText || "";
    }
  };

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 1600;
    const height = 1131;
    canvas.width = width;
    canvas.height = height;

    const drawContent = () => {
      // Draw visible elements
      elements.forEach((elem) => {
        if (!elem.visible) return;

        const posX = (elem.x / 100) * width;
        const posY = (elem.y / 100) * height;

        if (elem.type === "qrcode" && qrDataUrl) {
          const img = new Image();
          img.onload = () => {
            const size = elem.fontSize * 1.5;
            let drawX = posX - size / 2;
            if (elem.textAlign === "left") drawX = posX;
            if (elem.textAlign === "right") drawX = posX - size;
            ctx.drawImage(img, drawX, posY - size / 2, size, size);
          };
          img.src = qrDataUrl;
          return;
        }

        const text = getElementRenderText(elem);
        ctx.fillStyle = elem.color || "#0f172a";
        ctx.font = `${elem.fontWeight || "normal"} ${elem.fontSize * 1.3}px ${elem.fontFamily || "sans-serif"}`;
        ctx.textAlign = elem.textAlign || "center";
        ctx.textBaseline = "middle";

        const lines = text.split("\n");
        const lineHeight = elem.fontSize * 1.6;
        lines.forEach((line, i) => {
          ctx.fillText(line, posX, posY + i * lineHeight);
        });
      });
    };

    if (bgImage) {
      const bg = new Image();
      bg.crossOrigin = "anonymous";
      bg.onload = () => {
        ctx.drawImage(bg, 0, 0, width, height);
        drawContent();
      };
      bg.onerror = () => {
        drawFallbackBg(ctx, width, height);
        drawContent();
      };
      bg.src = bgImage;
    } else {
      drawFallbackBg(ctx, width, height);
      drawContent();
    }
  };

  const drawFallbackBg = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Elegant Google Modern White Tech certificate layout
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Subtle outer border with GDG 4-color accents
    ctx.lineWidth = 14;
    ctx.strokeStyle = "#f1f5f9";
    ctx.strokeRect(36, 36, width - 72, height - 72);

    ctx.lineWidth = 2;
    ctx.strokeStyle = "#cbd5e1";
    ctx.strokeRect(48, 48, width - 96, height - 96);

    // Google accent corners
    const cornerSize = 48;
    // Top-Left Blue
    ctx.fillStyle = "#2563EB";
    ctx.fillRect(48, 48, cornerSize, 8);
    ctx.fillRect(48, 48, 8, cornerSize);
    // Top-Right Red
    ctx.fillStyle = "#EF4444";
    ctx.fillRect(width - 48 - cornerSize, 48, cornerSize, 8);
    ctx.fillRect(width - 48 - 8, 48, 8, cornerSize);
    // Bottom-Left Yellow
    ctx.fillStyle = "#F59E0B";
    ctx.fillRect(48, height - 48 - 8, cornerSize, 8);
    ctx.fillRect(48, height - 48 - cornerSize, 8, cornerSize);
    // Bottom-Right Green
    ctx.fillStyle = "#10B981";
    ctx.fillRect(width - 48 - cornerSize, height - 48 - 8, cornerSize, 8);
    ctx.fillRect(width - 48 - 8, height - 48 - cornerSize, 8, cornerSize);

    // Header Tag
    ctx.font = "bold 18px Urbanist, sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.textAlign = "center";
    ctx.fillText("GOOGLE DEVELOPER GROUPS ON CAMPUS • AMAL JYOTHI COLLEGE OF ENGINEERING", width / 2, 130);
  };

  // Set Image Link handler
  const handleApplyImageLink = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) {
      setBgImage("");
      return;
    }
    setBgImage(trimmed);
  };

  // Save template configuration to Firestore
  const handleSaveTemplate = async () => {
    try {
      setSavingTemplate(true);
      const templateData = {
        backgroundUrl: bgImage || "",
        elements,
        updatedAt: Timestamp.now(),
        eventId,
      };
      await setDoc(doc(db, "events", eventId, "certificates", "default"), templateData, { merge: true });
      dialog.alert("Certificate layout & background saved successfully!", "Template Saved");
    } catch (err: any) {
      console.error("Error saving template:", err);
      dialog.alert("Failed to save template configuration.", "Error");
    } finally {
      setSavingTemplate(false);
    }
  };

  // Drag and Drop positioning handlers with Figma-style snapping & dynamic guide lines
  const handleMouseDown = (elemId: string, e: React.MouseEvent) => {
    isDraggingRef.current = true;
    dragElemIdRef.current = elemId;
    setSelectedElemId(elemId);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !dragElemIdRef.current || !canvasContainerRef.current) return;

    const rect = canvasContainerRef.current.getBoundingClientRect();
    let rawX = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    let rawY = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    let snappedX = rawX;
    let snappedY = rawY;
    let verticalGuide: number | null = null;
    let horizontalGuide: number | null = null;
    let matchingLabel: string | undefined = undefined;

    const SNAP_THRESHOLD = 1.6; // In percentage (approx 15-20px)

    // 1. Center Snapping (Figma Canvas Center Lines at 50% X and 50% Y)
    if (Math.abs(rawX - 50) < SNAP_THRESHOLD) {
      snappedX = 50;
      verticalGuide = 50;
      matchingLabel = "Canvas Center";
    }

    if (Math.abs(rawY - 50) < SNAP_THRESHOLD) {
      snappedY = 50;
      horizontalGuide = 50;
    }

    // 2. Inter-Element Alignment Snapping (Snaps to other elements' X and Y axes)
    const otherElements = elements.filter((el) => el.id !== dragElemIdRef.current && el.visible);

    for (const other of otherElements) {
      // Snap to other element's X (vertical alignment)
      if (Math.abs(rawX - other.x) < SNAP_THRESHOLD) {
        snappedX = other.x;
        verticalGuide = other.x;
        matchingLabel = other.label;
      }
      // Snap to other element's Y (horizontal alignment)
      if (Math.abs(rawY - other.y) < SNAP_THRESHOLD) {
        snappedY = other.y;
        horizontalGuide = other.y;
        matchingLabel = other.label;
      }
    }

    // 3. Grid Snapping fallback (if enabled and no alignment guide caught)
    if (snapToGrid) {
      if (verticalGuide === null) {
        // Snap to nearest 2%
        snappedX = Math.round(snappedX / 2) * 2;
      }
      if (horizontalGuide === null) {
        snappedY = Math.round(snappedY / 2) * 2;
      }
    }

    setActiveGuides({
      vertical: verticalGuide,
      horizontal: horizontalGuide,
      matchingElementLabel: matchingLabel,
    });

    setElements((prev) =>
      prev.map((el) =>
        el.id === dragElemIdRef.current
          ? { ...el, x: Math.round(snappedX * 10) / 10, y: Math.round(snappedY * 10) / 10 }
          : el
      )
    );
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    dragElemIdRef.current = null;
    setActiveGuides({ vertical: null, horizontal: null });
  };

  const selectedElem = elements.find((e) => e.id === selectedElemId);

  const updateSelectedElem = (updates: Partial<DynamicElement>) => {
    if (!selectedElemId) return;
    setElements((prev) => prev.map((el) => (el.id === selectedElemId ? { ...el, ...updates } : el)));
  };

  const addCustomField = (field: DynamicElement["field"], label: string, customText: string = "") => {
    const newElem: DynamicElement = {
      id: `elem_${nanoid(6)}`,
      type: "text",
      field,
      customText,
      label,
      x: 50,
      y: 70,
      fontSize: 16,
      fontFamily: "Urbanist, sans-serif",
      fontWeight: "600",
      color: "#0f172a",
      textAlign: "center",
      visible: true,
    };
    setElements((prev) => [...prev, newElem]);
    setSelectedElemId(newElem.id);
  };

  const removeElement = (id: string) => {
    setElements((prev) => prev.filter((e) => e.id !== id));
    if (selectedElemId === id) setSelectedElemId("");
  };

  // Download high-resolution PNG
  const handleDownloadPreview = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `Certificate_${currentParticipant.name || "Participant"}.png`;
    link.href = canvas.toDataURL("image/png", 1.0);
    link.click();
  };

  // Issue Certificate for single student
  const handleIssueSingle = async () => {
    if (!currentParticipant?.email) {
      dialog.alert("Please select a participant with a valid email.", "Notice");
      return;
    }

    try {
      const templateData = {
        backgroundUrl: bgImage || "",
        elements,
      };

      // Ensure template is saved
      await setDoc(doc(db, "events", eventId, "certificates", "default"), templateData, { merge: true });

      const certPayload = {
        certificateId: previewCertId,
        recipientName: currentParticipant.name,
        recipientEmail: currentParticipant.email.toLowerCase().trim(),
        userId: currentParticipant.userId || currentParticipant.id || "manual",
        eventTitle,
        eventDate: eventDate || new Date().toISOString(),
        issuedAt: Timestamp.now(),
        verified: true,
        templateId: "default",
        backgroundUrl: bgImage || "",
        elements,
      };

      const certRef = doc(collection(db, "events", eventId, "issuedCertificates"), previewCertId);
      await setDoc(certRef, certPayload);

      // Also register in root certificates collection for universal /verify/[id] lookup
      await setDoc(doc(db, "certificates", previewCertId), {
        ...certPayload,
        eventId,
      });

      // Also register directly into the participant's user certificates subcollection if linked
      if (currentParticipant.userId && currentParticipant.userId !== "manual") {
        try {
          await setDoc(doc(db, "users", currentParticipant.userId, "certificates", previewCertId), {
            ...certPayload,
            eventId,
          });
        } catch (uErr) {
          console.warn("Could not write directly to user certificates subcollection:", uErr);
        }
      }

      setIssuedMap((prev) => ({
        ...prev,
        [currentParticipant.email.toLowerCase()]: { id: previewCertId, issuedAt: new Date() },
      }));

      dialog.alert(`Certificate #${previewCertId} issued successfully to ${currentParticipant.name}!`, "Success");
      if (onCertificatesUpdated) onCertificatesUpdated();
    } catch (err: any) {
      console.error("Error issuing certificate:", err);
      dialog.alert("Failed to issue certificate.", "Error");
    }
  };

  // Batch issue to all attendees
  const handleBatchIssue = async () => {
    if (participants.length === 0) {
      dialog.alert("No participants registered for this event yet.", "No Attendees");
      return;
    }

    const confirmed = await dialog.confirm(
      `Issue automated certificates to all ${participants.length} registered participants with the current layout?`,
      "Batch Issuance Confirmation"
    );
    if (!confirmed) return;

    try {
      setBatchIssuing(true);
      setBatchProgress({ current: 0, total: participants.length });

      // Save template first
      const templateData = {
        backgroundUrl: bgImage || "",
        elements,
      };
      await setDoc(doc(db, "events", eventId, "certificates", "default"), templateData, { merge: true });

      const batch = writeBatch(db);
      const newMap = { ...issuedMap };

      for (let i = 0; i < participants.length; i++) {
        const p = participants[i];
        const certId = `GDG-${(p.id || nanoid(6)).slice(0, 8).toUpperCase()}`;

        const certPayload = {
          certificateId: certId,
          recipientName: p.name,
          recipientEmail: p.email.toLowerCase().trim(),
          userId: p.userId || p.id || "manual",
          eventTitle,
          eventDate: eventDate || new Date().toISOString(),
          issuedAt: Timestamp.now(),
          verified: true,
          templateId: "default",
          backgroundUrl: bgImage || "",
          elements,
        };

        const eventCertRef = doc(collection(db, "events", eventId, "issuedCertificates"), certId);
        batch.set(eventCertRef, certPayload);

        const rootCertRef = doc(db, "certificates", certId);
        batch.set(rootCertRef, {
          ...certPayload,
          eventId,
        });

        if (p.userId && p.userId !== "manual") {
          const userCertRef = doc(db, "users", p.userId, "certificates", certId);
          batch.set(userCertRef, {
            ...certPayload,
            eventId,
          });
        }

        if (p.email) {
          newMap[p.email.toLowerCase()] = { id: certId, issuedAt: new Date() };
        }
        setBatchProgress({ current: i + 1, total: participants.length });
      }

      await batch.commit();
      setIssuedMap(newMap);
      dialog.alert(`Successfully issued certificates to ${participants.length} attendees!`, "Batch Completed");
      if (onCertificatesUpdated) onCertificatesUpdated();
    } catch (err) {
      console.error("Batch issue error:", err);
      dialog.alert("Failed to complete batch issuance.", "Error");
    } finally {
      setBatchIssuing(false);
      setBatchProgress(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#2563EB]" />
            <h2 className="text-base font-bold text-[#0f172a]">Certificate Studio & Drag-and-Drop Designer</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Design certificates with image link frames, drag fields with exact bounding hitboxes, and issue directly.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setShowUrlModal(!showUrlModal)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0f172a] text-xs font-semibold transition border border-slate-200"
          >
            <LinkIcon className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>{bgImage ? "Change Image Link" : "Set Certificate Image Link"}</span>
          </button>

          {bgImage && (
            <button
              onClick={() => {
                setBgImage("");
                setBgInputUrl("");
              }}
              className="px-3 py-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-semibold transition"
              title="Reset to default template"
            >
              Reset Frame
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveTemplate}
            disabled={savingTemplate}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold shadow-sm transition disabled:opacity-50"
            title="Save current layout & frame for this event"
          >
            <Save className="w-3.5 h-3.5 text-slate-300" />
            <span>{savingTemplate ? "Saving..." : "Save Layout"}</span>
          </button>

          {isWriter && (
            <button
              onClick={handleBatchIssue}
              disabled={batchIssuing || participants.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-xs font-semibold shadow-sm transition disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{batchIssuing ? `Issuing (${batchProgress?.current}/${batchProgress?.total})...` : "Batch Issue to All"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Frame Image Link Configuration Dropdown / Modal */}
      {showUrlModal && (
        <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-[#2563EB]" />
              <span className="text-xs font-bold text-[#0f172a]">Certificate Background Image Link</span>
            </div>
            <button
              type="button"
              onClick={() => setShowUrlModal(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Close
            </button>
          </div>

          <p className="text-[11px] text-slate-600">
            Paste any direct image URL (PNG, JPG, or SVG hosted on Google Drive, Imgur, Cloudinary, Firebase, or your CDN).
          </p>

          <div className="flex items-center gap-2">
            <input
              type="url"
              placeholder="https://example.com/certificate-frame.png"
              value={bgInputUrl}
              onChange={(e) => setBgInputUrl(e.target.value)}
              className="flex-1 h-9 px-3 rounded-xl bg-white border border-slate-300 text-xs text-[#0f172a] outline-none focus:border-[#2563EB]"
            />
            <button
              type="button"
              onClick={() => {
                handleApplyImageLink(bgInputUrl);
                setShowUrlModal(false);
              }}
              className="px-4 h-9 rounded-xl bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-xs font-semibold transition"
            >
              Apply Link
            </button>
          </div>

          <div className="flex items-center gap-2 pt-1 flex-wrap">
            <span className="text-[10px] font-mono text-slate-500">Quick Presets:</span>
            <button
              type="button"
              onClick={() => {
                const sample = "/assets/certificates/gdg-certificate-frame.svg";
                setBgInputUrl(sample);
                handleApplyImageLink(sample);
              }}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
            >
              GDG Official SVG Frame
            </button>
            <button
              type="button"
              onClick={() => {
                setBgInputUrl("");
                handleApplyImageLink("");
              }}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
            >
              Clean Canvas Border
            </button>
          </div>
        </div>
      )}

      {/* Main Studio Grid: Left Sidebar Controls + Center Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Field Selector & Element Customization */}
        <div className="lg:col-span-4 space-y-4">
          {/* 1. Preview Attendee Selector */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">Preview Participant</label>
              <span className="text-[11px] font-mono font-semibold text-slate-400">{participants.length} Available</span>
            </div>

            {participants.length > 0 ? (
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#0f172a] outline-none"
              >
                {participants.map((p) => {
                  const isIssued = Boolean(issuedMap[p.email?.toLowerCase()]);
                  return (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.department || p.email}) {isIssued ? "✓ Issued" : ""}
                    </option>
                  );
                })}
              </select>
            ) : (
              <p className="text-xs text-slate-400 italic">No registered participants. Showing mock data.</p>
            )}
          </div>

          {/* 2. Drag & Drop Elements List */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">Canvas Dynamic Fields</label>
              <span className="text-[10px] text-slate-400">Click to edit / drag on canvas</span>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {elements.map((el) => {
                const isSelected = el.id === selectedElemId;
                return (
                  <div
                    key={el.id}
                    onClick={() => setSelectedElemId(el.id)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                      isSelected
                        ? "bg-blue-50 border-blue-300 text-[#2563EB]"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {el.type === "qrcode" ? (
                        <QrCode className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                      ) : (
                        <Type className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      )}
                      <span className="truncate">{el.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setElements((prev) =>
                            prev.map((item) => (item.id === el.id ? { ...item, visible: !item.visible } : item))
                          );
                        }}
                        className={`p-1 rounded-md text-[10px] ${el.visible ? "text-emerald-600" : "text-slate-400"}`}
                        title={el.visible ? "Visible" : "Hidden"}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeElement(el.id);
                        }}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-500"
                        title="Remove Element"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Custom Elements Quick Selector */}
            <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => addCustomField("custom", "Custom Heading", "EXCELLENCE AWARD")}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 transition"
              >
                <Plus className="w-3 h-3" /> Heading
              </button>
              <button
                type="button"
                onClick={() => addCustomField("college", "College / Org")}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 transition"
              >
                <Plus className="w-3 h-3" /> College
              </button>
              <button
                type="button"
                onClick={() => addCustomField("department", "Department / Branch")}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 transition"
              >
                <Plus className="w-3 h-3" /> Dept
              </button>
              <button
                type="button"
                onClick={() => addCustomField("custom", "Signatory 2", "Coordinator Name\nLead Organizer")}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 transition"
              >
                <Plus className="w-3 h-3" /> Signatory
              </button>
            </div>
          </div>

          {/* 3. Selected Element Inspector */}
          {selectedElem && (
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Inspector: {selectedElem.label}</span>
                <span className="text-[10px] font-mono text-slate-400">
                  X: {selectedElem.x}% | Y: {selectedElem.y}%
                </span>
              </div>

              {selectedElem.field === "custom" && (
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Text Content</label>
                  <textarea
                    rows={2}
                    value={selectedElem.customText || ""}
                    onChange={(e) => updateSelectedElem({ customText: e.target.value })}
                    className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0f172a] outline-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                    {selectedElem.type === "qrcode" ? "QR Size" : "Font Size"}
                  </label>
                  <input
                    type="range"
                    min={selectedElem.type === "qrcode" ? "40" : "8"}
                    max={selectedElem.type === "qrcode" ? "180" : "72"}
                    value={selectedElem.fontSize}
                    onChange={(e) => updateSelectedElem({ fontSize: parseInt(e.target.value) })}
                    className="w-full accent-blue-600"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Color</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={selectedElem.color}
                      onChange={(e) => updateSelectedElem({ color: e.target.value })}
                      className="w-7 h-7 rounded border border-slate-200 cursor-pointer p-0"
                    />
                    <input
                      type="text"
                      value={selectedElem.color}
                      onChange={(e) => updateSelectedElem({ color: e.target.value })}
                      className="w-full h-7 px-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {selectedElem.type !== "qrcode" && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Font Style</label>
                    <select
                      value={selectedElem.fontFamily}
                      onChange={(e) => updateSelectedElem({ fontFamily: e.target.value })}
                      className="w-full h-7 px-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px]"
                    >
                      {DEFAULT_FONTS.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Alignment</label>
                    <div className="flex rounded-lg border border-slate-200 overflow-hidden">
                      {(["left", "center", "right"] as const).map((align) => (
                        <button
                          key={align}
                          type="button"
                          onClick={() => updateSelectedElem({ textAlign: align })}
                          className={`flex-1 py-1 text-[10px] font-bold capitalize ${
                            selectedElem.textAlign === align ? "bg-slate-900 text-white" : "bg-white text-slate-600"
                          }`}
                        >
                          {align}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Interactive Drag & Drop Canvas & Issuance Actions */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#0f172a]">Live Interactive Canvas</h3>
                <p className="text-[11px] text-slate-400">Click any element on the preview to drag and position it with Figma-style snapping.</p>
              </div>

              {/* Snapping & Guides Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowGridLines(!showGridLines)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                    showGridLines
                      ? "bg-blue-50 border-blue-300 text-[#2563EB]"
                      : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"
                  }`}
                  title="Toggle background alignment grid"
                >
                  Grid Lines
                </button>

                <button
                  type="button"
                  onClick={() => setSnapToGrid(!snapToGrid)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                    snapToGrid
                      ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                      : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"
                  }`}
                  title="Toggle alignment & grid snapping"
                >
                  {snapToGrid ? "Snapping ON" : "Snapping OFF"}
                </button>

                <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                  {previewCertId}
                </span>
              </div>
            </div>

            {/* Interactive Canvas Container */}
            <div
              ref={canvasContainerRef}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="relative w-full aspect-[1600/1131] rounded-xl overflow-hidden border border-slate-300 shadow-md bg-white select-none cursor-crosshair [container-type:inline-size]"
            >
              {/* Optional Subtle Figma Grid Pattern Overlay */}
              {showGridLines && (
                <div
                  className="absolute inset-0 pointer-events-none z-10 opacity-30"
                  style={{
                    backgroundImage: `linear-gradient(to right, rgba(148, 163, 184, 0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.4) 1px, transparent 1px)`,
                    backgroundSize: "4% 4%",
                  }}
                />
              )}

              {/* HTML5 Canvas Render */}
              <canvas ref={canvasRef} className="w-full h-full object-contain pointer-events-none" />

              {/* FIGMA-STYLE DYNAMIC SNAP ALIGNMENT GUIDES */}
              {/* Vertical Guide Line (Red/Magenta Figma Accent Line) */}
              {activeGuides.vertical !== null && (
                <div
                  className="absolute top-0 bottom-0 pointer-events-none z-30 flex items-center justify-center transition-all"
                  style={{ left: `${activeGuides.vertical}%`, transform: "translateX(-50%)" }}
                >
                  <div className="w-[1.5px] h-full bg-[#E11D48] shadow-[0_0_8px_rgba(225,29,72,0.8)]" />
                  {activeGuides.matchingElementLabel && (
                    <span className="absolute top-2 px-1.5 py-0.5 rounded bg-[#E11D48] text-white text-[9px] font-mono font-bold whitespace-nowrap shadow-md">
                      {activeGuides.matchingElementLabel} ({activeGuides.vertical}%)
                    </span>
                  )}
                </div>
              )}

              {/* Horizontal Guide Line */}
              {activeGuides.horizontal !== null && (
                <div
                  className="absolute left-0 right-0 pointer-events-none z-30 flex items-center justify-center transition-all"
                  style={{ top: `${activeGuides.horizontal}%`, transform: "translateY(-50%)" }}
                >
                  <div className="h-[1.5px] w-full bg-[#E11D48] shadow-[0_0_8px_rgba(225,29,72,0.8)]" />
                  <span className="absolute left-2 px-1.5 py-0.5 rounded bg-[#E11D48] text-white text-[9px] font-mono font-bold whitespace-nowrap shadow-md">
                    Y: {activeGuides.horizontal}%
                  </span>
                </div>
              )}

              {/* Interactive Drag Handles Overlay with Accurate Hitboxes */}
              {elements.map((el) => {
                if (!el.visible) return null;
                const isSelected = el.id === selectedElemId;

                // QR Code Hitbox: Exact square matching elem.fontSize * 1.5 in canvas coordinate space
                if (el.type === "qrcode") {
                  const qrSizePercent = (el.fontSize * 1.5 / 1600) * 100;
                  const qrHeightPercent = (el.fontSize * 1.5 / 1131) * 100;
                  let translateX = "-50%";
                  if (el.textAlign === "left") translateX = "0";
                  if (el.textAlign === "right") translateX = "-100%";

                  return (
                    <div
                      key={el.id}
                      onMouseDown={(e) => handleMouseDown(el.id, e)}
                      style={{
                        position: "absolute",
                        left: `${el.x}%`,
                        top: `${el.y}%`,
                        width: `${qrSizePercent}%`,
                        height: `${qrHeightPercent}%`,
                        transform: `translate(${translateX}, -50%)`,
                      }}
                      className={`z-20 cursor-move rounded-md transition-all flex items-center justify-center ${
                        isSelected
                          ? "ring-2 ring-[#2563EB] bg-[#2563EB]/15 shadow-sm"
                          : "hover:ring-1 hover:ring-blue-400 hover:bg-blue-500/10"
                      }`}
                    >
                      <div className="opacity-0 hover:opacity-100 absolute -top-5 px-1.5 py-0.5 rounded bg-slate-900 text-white text-[9px] font-mono whitespace-nowrap shadow pointer-events-none">
                        QR Code
                      </div>
                    </div>
                  );
                }

                // Text Element Hitbox: Matches font size and lines directly
                const text = getElementRenderText(el);
                const baseFontSizePercent = ((el.fontSize * 1.3) / 1600) * 100;
                let translateX = "-50%";
                if (el.textAlign === "left") translateX = "0";
                if (el.textAlign === "right") translateX = "-100%";

                return (
                  <div
                    key={el.id}
                    onMouseDown={(e) => handleMouseDown(el.id, e)}
                    style={{
                      position: "absolute",
                      left: `${el.x}%`,
                      top: `${el.y}%`,
                      fontSize: `${baseFontSizePercent}cqw`,
                      fontFamily: el.fontFamily || "sans-serif",
                      fontWeight: el.fontWeight || "normal",
                      textAlign: el.textAlign || "center",
                      whiteSpace: "pre-line",
                      lineHeight: 1.25,
                      transform: `translate(${translateX}, -50%)`,
                    }}
                    className={`z-20 px-1 py-0.5 rounded cursor-move transition-all ${
                      isSelected
                        ? "ring-2 ring-[#2563EB] bg-[#2563EB]/15 shadow-sm"
                        : "hover:ring-1 hover:ring-blue-400 hover:bg-blue-500/10"
                    }`}
                  >
                    {/* Ghost text for pixel-perfect hitbox bounding box matching */}
                    <span className="invisible select-none whitespace-pre-line pointer-events-none">
                      {text || el.label}
                    </span>
                    <div className="opacity-0 hover:opacity-100 absolute -top-5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-slate-900 text-white text-[9px] font-mono whitespace-nowrap shadow pointer-events-none z-30">
                      {el.label}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions Bar */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadPreview}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0f172a] text-xs font-semibold transition"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>Download PNG</span>
                </button>

                <a
                  href={`/verify/${previewCertId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0f172a] text-xs font-semibold transition"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                  <span>Test Verification Route</span>
                </a>
              </div>

              {isWriter && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleIssueSingle}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-xs font-semibold shadow-sm transition"
                  >
                    <FileCheck2 className="w-3.5 h-3.5" />
                    <span>Issue to {currentParticipant.name || "Participant"}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
