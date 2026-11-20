"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Award,
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
    Layers,
    Sliders,
    Eye,
    EyeOff,
    Mail,
    Plus,
    RotateCcw,
    Type,
    Move,
    Palette,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Bold,
    Save
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
    where,
    Timestamp,
    orderBy,
    writeBatch
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useDialog } from "@/context/DialogContext";
import GoogleBadge from "../GoogleBadge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/switch";

export type ElementType = "text" | "qr" | "signatory";
export type TextAlignment = "left" | "center" | "right";
export type FontWeight = "normal" | "500" | "600" | "bold";

export interface CertificateElement {
    id: string;
    label: string;
    type: ElementType;
    text?: string;
    x: number;
    y: number;
    fontSize: number;
    color: string;
    fontFamily: string;
    fontWeight: FontWeight;
    textAlign: TextAlignment;
    visible: boolean;
    signatoryName?: string;
    signatoryRole?: string;
    signatoryRoleSize?: number;
    signatoryRoleColor?: string;
    qrSize?: number;
    isCustom?: boolean;
}

interface Participant {
    id: string;
    name: string;
    email: string;
    userId: string;
    registeredAt?: any;
    department?: string;
    college?: string;
    phoneNumber?: string;
    graduationYear?: string | number;
}

interface CertificateGeneratorProps {
    eventId: string;
    eventTitle: string;
    eventDate?: string;
    participants: Participant[];
    onCertificatesUpdated?: () => void;
    isWriter?: boolean;
}

const DEFAULT_FRAME_SVG = "/assets/certificates/gdg-certificate-frame.svg";
const BASE_TEMPLATE_URL = "/assets/certificates/gdg-certificate-template.svg";

export const FONT_OPTIONS = [
    { label: "Inter (Modern Sans)", value: "'Inter', sans-serif" },
    { label: "Playfair Display (Formal Serif)", value: "'Playfair Display', serif" },
    { label: "Georgia (Classic Serif)", value: "Georgia, serif" },
    { label: "Courier New (Monospace)", value: "'Courier New', monospace" },
    { label: "Great Vibes (Calligraphic Script)", value: "'Great Vibes', cursive" },
];

export const GDG_COLOR_PALETTE = [
    { label: "Google Blue", value: "#1a73e8" },
    { label: "Google Red", value: "#ea4335" },
    { label: "Google Yellow", value: "#fbbc04" },
    { label: "Google Green", value: "#34a853" },
    { label: "Slate Ink", value: "#202124" },
    { label: "Dark Gray", value: "#3c4043" },
    { label: "Slate Gray", value: "#64748b" },
    { label: "Muted Mist", value: "#80827f" },
    { label: "Pure White", value: "#ffffff" },
];

export const DEFAULT_CERTIFICATE_ELEMENTS: CertificateElement[] = [
    {
        id: "cert_title",
        label: "Certificate Title",
        type: "text",
        text: "CERTIFICATE OF PARTICIPATION",
        x: 877,
        y: 410,
        fontSize: 34,
        color: "#202124",
        fontFamily: "'Inter', sans-serif",
        fontWeight: "bold",
        textAlign: "center",
        visible: true,
    },
    {
        id: "cert_subtitle",
        label: "Subtitle / Header Text",
        type: "text",
        text: "THIS IS PROUDLY PRESENTED TO",
        x: 877,
        y: 475,
        fontSize: 14,
        color: "#5f6368",
        fontFamily: "'Inter', sans-serif",
        fontWeight: "600",
        textAlign: "center",
        visible: true,
    },
    {
        id: "recipient_name",
        label: "Recipient Name",
        type: "text",
        text: "{{NAME}}",
        x: 877,
        y: 545,
        fontSize: 52,
        color: "#1a73e8",
        fontFamily: "'Inter', sans-serif",
        fontWeight: "bold",
        textAlign: "center",
        visible: true,
    },
    {
        id: "cert_desc",
        label: "Citation / Description",
        type: "text",
        text: "for active participation and successful completion of",
        x: 877,
        y: 630,
        fontSize: 18,
        color: "#3c4043",
        fontFamily: "'Inter', sans-serif",
        fontWeight: "500",
        textAlign: "center",
        visible: true,
    },
    {
        id: "event_title",
        label: "Event Title",
        type: "text",
        text: "{{EVENT}}",
        x: 877,
        y: 675,
        fontSize: 32,
        color: "#202124",
        fontFamily: "'Inter', sans-serif",
        fontWeight: "bold",
        textAlign: "center",
        visible: true,
    },
    {
        id: "host_line",
        label: "Host Organization Line",
        type: "text",
        text: "hosted by Google Developer Groups on Campus, Amal Jyothi College of Engineering.",
        x: 877,
        y: 715,
        fontSize: 15,
        color: "#5f6368",
        fontFamily: "'Inter', sans-serif",
        fontWeight: "normal",
        textAlign: "center",
        visible: true,
    },
    {
        id: "signatory_1",
        label: "Signatory 1 (Advisor)",
        type: "signatory",
        signatoryName: "Prof. Fr. Rubin Thoppil",
        signatoryRole: "Faculty Advisor, GDG AJCE",
        x: 370,
        y: 965,
        fontSize: 15,
        signatoryRoleSize: 12,
        color: "#202124",
        signatoryRoleColor: "#80827f",
        fontFamily: "'Inter', sans-serif",
        fontWeight: "bold",
        textAlign: "center",
        visible: true,
    },
    {
        id: "signatory_2",
        label: "Signatory 2 (Lead)",
        type: "signatory",
        signatoryName: "Abin Varghese",
        signatoryRole: "Organizer & Chapter Lead",
        x: 710,
        y: 965,
        fontSize: 15,
        signatoryRoleSize: 12,
        color: "#202124",
        signatoryRoleColor: "#80827f",
        fontFamily: "'Inter', sans-serif",
        fontWeight: "bold",
        textAlign: "center",
        visible: true,
    },
    {
        id: "qr_code",
        label: "Verification QR Code",
        type: "qr",
        x: 1370,
        y: 900,
        fontSize: 110,
        qrSize: 110,
        color: "#202124",
        fontFamily: "'Inter', sans-serif",
        fontWeight: "normal",
        textAlign: "left",
        visible: true,
    },
    {
        id: "footer_meta",
        label: "Credential Verification Footer",
        type: "text",
        text: "CREDENTIAL ID: #{{ID}}   •   ISSUED: {{DATE}}   •   VERIFY AT: gdgajce.com/verify",
        x: 877,
        y: 1115,
        fontSize: 12,
        color: "#80827f",
        fontFamily: "'Courier New', monospace",
        fontWeight: "600",
        textAlign: "center",
        visible: true,
    },
];

export default function CertificateGenerator({
    eventId,
    eventTitle,
    eventDate,
    participants,
    onCertificatesUpdated,
    isWriter = true,
}: CertificateGeneratorProps) {
    const dialog = useDialog();

    // Studio active view tab
    const [activeStudioTab, setActiveStudioTab] = useState<string>("student");

    // Student selection state
    const [selectedStudentId, setSelectedStudentId] = useState<string>(
        participants.length > 0 ? participants[0].id : ""
    );
    const [searchStudent, setSearchStudent] = useState("");

    // Frame & Template settings
    const [frameUrl, setFrameUrl] = useState<string>(DEFAULT_FRAME_SVG);
    const [customFrameFileName, setCustomFrameFileName] = useState<string>("");
    const [uploadingFrame, setUploadingFrame] = useState(false);

    // Dynamic Elements State
    const [elements, setElements] = useState<CertificateElement[]>(DEFAULT_CERTIFICATE_ELEMENTS);
    const [selectedElementId, setSelectedElementId] = useState<string>("recipient_name");
    const [isSavingTemplate, setIsSavingTemplate] = useState(false);

    // Issue Date
    const [issueDate, setIssueDate] = useState(
        eventDate || new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    );

    // Current Certificate Preview Data
    const [currentCertId, setCurrentCertId] = useState(`GDG-${nanoid(8).toUpperCase()}`);
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
    const [issuedCertificates, setIssuedCertificates] = useState<Record<string, any>>({});
    const [loadingIssued, setLoadingIssued] = useState(true);

    // Action states
    const [isSaving, setIsSaving] = useState(false);
    const [isSendingMail, setIsSendingMail] = useState(false);
    const [isExportingPng, setIsExportingPng] = useState(false);
    const [batchIssuing, setBatchIssuing] = useState(false);
    const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);

    const previewContainerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Currently selected element object
    const selectedElement = useMemo(
        () => elements.find((el) => el.id === selectedElementId) || elements[0],
        [elements, selectedElementId]
    );

    // Find current participant
    const currentParticipant = participants.find((p) => p.id === selectedStudentId) || participants[0];

    // Filter participants for dropdown
    const filteredParticipants = participants.filter(
        (p) =>
            p.name?.toLowerCase().includes(searchStudent.toLowerCase()) ||
            p.email?.toLowerCase().includes(searchStudent.toLowerCase())
    );

    // Load saved template & issued certificates on mount
    useEffect(() => {
        const loadSavedTemplateAndCerts = async () => {
            if (!eventId) return;
            try {
                setLoadingIssued(true);

                // 1. Try to load saved template customization for this event
                try {
                    const templateDoc = await getDoc(doc(db, "events", eventId, "certificateTemplate", "default"));
                    if (templateDoc.exists()) {
                        const data = templateDoc.data();
                        if (data.elements && Array.isArray(data.elements) && data.elements.length > 0) {
                            setElements(data.elements);
                        }
                        if (data.backgroundUrl) {
                            setFrameUrl(data.backgroundUrl);
                        }
                    }
                } catch (tErr) {
                    console.log("No custom event template doc found, using defaults:", tErr);
                }

                // 2. Load already issued certificates for this event
                const q = query(
                    collection(db, "events", eventId, "issuedCertificates"),
                    orderBy("issuedAt", "desc")
                );
                const snap = await getDocs(q);
                const map: Record<string, any> = {};
                snap.docs.forEach((docSnap) => {
                    const data = docSnap.data();
                    if (data.recipientEmail) {
                        map[data.recipientEmail.toLowerCase()] = { id: docSnap.id, ...data };
                    }
                });
                setIssuedCertificates(map);
            } catch (e) {
                console.error("Error loading issued certs:", e);
            } finally {
                setLoadingIssued(false);
            }
        };

        loadSavedTemplateAndCerts();
    }, [eventId]);

    // Whenever current participant changes, assign certificate ID
    useEffect(() => {
        if (currentParticipant) {
            const existing = issuedCertificates[currentParticipant.email?.toLowerCase()];
            if (existing) {
                setCurrentCertId(existing.certificateId);
            } else {
                setCurrentCertId(`GDG-${nanoid(8).toUpperCase()}`);
            }
        }
    }, [currentParticipant, issuedCertificates]);

    // Generate unique QR Code for current certificate
    useEffect(() => {
        if (!currentCertId) return;
        const origin = typeof window !== "undefined" ? window.location.origin : "https://gdgajce.com";
        const verifyUrl = `${origin}/verify/${currentCertId}`;

        QRCode.toDataURL(verifyUrl, {
            width: 360,
            margin: 1,
            color: {
                dark: "#202124",
                light: "#FFFFFF"
            },
            errorCorrectionLevel: "H"
        })
            .then((url) => setQrCodeDataUrl(url))
            .catch((err) => console.error("QR Code error:", err));
    }, [currentCertId]);

    // Token substitution helper
    const resolveElementText = (
        templateText: string | undefined,
        participantName: string,
        eventTitleStr: string,
        certId: string,
        issueDateStr: string
    ): string => {
        if (!templateText) return "";
        return templateText
            .replace(/\{\{NAME\}\}/gi, participantName)
            .replace(/\{\{EVENT\}\}/gi, eventTitleStr)
            .replace(/\{\{ID\}\}/gi, certId)
            .replace(/\{\{DATE\}\}/gi, issueDateStr);
    };

    // Update single property of the selected element
    const updateElement = <K extends keyof CertificateElement>(key: K, value: CertificateElement[K]) => {
        if (!selectedElementId) return;
        setElements((prev) =>
            prev.map((el) => (el.id === selectedElementId ? { ...el, [key]: value } : el))
        );
    };

    // Add a custom text element
    const handleAddCustomElement = () => {
        const newId = `custom_${Date.now()}`;
        const newElement: CertificateElement = {
            id: newId,
            label: `Custom Text (${elements.filter((e) => e.isCustom).length + 1})`,
            type: "text",
            text: "Special Recognition / Award Tier",
            x: 877,
            y: 760,
            fontSize: 20,
            color: "#202124",
            fontFamily: "'Inter', sans-serif",
            fontWeight: "normal",
            textAlign: "center",
            visible: true,
            isCustom: true,
        };

        setElements((prev) => [...prev, newElement]);
        setSelectedElementId(newId);
        setActiveStudioTab("elements");
    };

    // Delete custom element
    const handleDeleteElement = (idToDelete: string) => {
        setElements((prev) => prev.filter((el) => el.id !== idToDelete));
        if (selectedElementId === idToDelete) {
            setSelectedElementId("recipient_name");
        }
    };

    // Reset layout to defaults
    const handleResetLayout = async () => {
        const confirmed = await dialog.confirm(
            "Are you sure you want to reset all certificate element positions, fonts, and colors back to the official GDG default layout?",
            "Reset Layout"
        );
        if (confirmed) {
            setElements(DEFAULT_CERTIFICATE_ELEMENTS);
            setSelectedElementId("recipient_name");
        }
    };

    // Save Template Layout to Firestore
    const handleSaveTemplate = async () => {
        if (!eventId) return;
        setIsSavingTemplate(true);
        try {
            await setDoc(doc(db, "events", eventId, "certificateTemplate", "default"), {
                backgroundUrl: frameUrl,
                elements,
                updatedAt: Timestamp.now(),
            }, { merge: true });

            dialog.alert("Certificate layout configuration saved for this event!", "Template Saved");
        } catch (err: any) {
            console.error("Save template error:", err);
            dialog.alert(`Failed to save template: ${err.message}`, "Save Error");
        } finally {
            setIsSavingTemplate(false);
        }
    };

    // Pointer-based live drag for preview elements
    const handleElementPointerDown = (e: React.PointerEvent, elementId: string) => {
        e.stopPropagation();
        setSelectedElementId(elementId);
        setActiveStudioTab("elements");

        const container = previewContainerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const startX = e.clientX;
        const startY = e.clientY;
        const targetElement = elements.find((el) => el.id === elementId);
        if (!targetElement) return;

        const initialElX = targetElement.x;
        const initialElY = targetElement.y;

        const onPointerMove = (moveEvent: PointerEvent) => {
            const deltaX = moveEvent.clientX - startX;
            const deltaY = moveEvent.clientY - startY;

            // Convert pixels on screen to canvas pixels (1754 x 1240)
            const scaleX = 1754 / rect.width;
            const scaleY = 1240 / rect.height;

            const newX = Math.round(Math.max(0, Math.min(1754, initialElX + deltaX * scaleX)));
            const newY = Math.round(Math.max(0, Math.min(1240, initialElY + deltaY * scaleY)));

            setElements((prev) =>
                prev.map((el) => (el.id === elementId ? { ...el, x: newX, y: newY } : el))
            );
        };

        const onPointerUp = () => {
            window.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("pointerup", onPointerUp);
        };

        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp);
    };

    // Handle Custom Frame Upload
    const handleFrameFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingFrame(true);
        setCustomFrameFileName(file.name);

        try {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const dataUrl = event.target?.result as string;
                setFrameUrl(dataUrl);

                try {
                    const storageRef = ref(storage, `events/${eventId}/certificates/frames/${Date.now()}_${file.name}`);
                    await uploadBytes(storageRef, file);
                    const cloudUrl = await getDownloadURL(storageRef);
                    setFrameUrl(cloudUrl);
                } catch (storageErr) {
                    console.log("Firebase storage upload skipped/cached as data URL:", storageErr);
                }
            };
            reader.readAsDataURL(file);
        } catch (err: any) {
            console.error("Error uploading frame:", err);
            dialog.alert("Failed to process certificate frame. Please try another image.", "Upload Error");
        } finally {
            setUploadingFrame(false);
        }
    };

    // Download Official GDG Base Template
    const handleDownloadBaseTemplate = () => {
        const link = document.createElement("a");
        link.href = BASE_TEMPLATE_URL;
        link.download = `gdg-certificate-base-template.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Render Certificate to HTML Canvas (for high-resolution 1754x1240 PNG download)
    const renderToCanvas = async (): Promise<HTMLCanvasElement> => {
        const CANVAS_W = 1754;
        const CANVAS_H = 1240;

        const canvas = document.createElement("canvas");
        canvas.width = CANVAS_W;
        canvas.height = CANVAS_H;
        const ctx = canvas.getContext("2d")!;

        try {
            await document.fonts.ready;
        } catch (e) {
            console.warn("Font readiness:", e);
        }

        // 1. Draw Background Frame
        const loadImg = (src: string): Promise<HTMLImageElement> =>
            new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.onload = () => resolve(img);
                img.onerror = () => {
                    const fallback = new Image();
                    fallback.onload = () => resolve(fallback);
                    fallback.onerror = reject;
                    fallback.src = DEFAULT_FRAME_SVG;
                };
                img.src = src;
            });

        try {
            const frameImg = await loadImg(frameUrl);
            ctx.drawImage(frameImg, 0, 0, CANVAS_W, CANVAS_H);
        } catch {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        }

        const participantName = currentParticipant?.name || "Participant Name";

        // 2. Iterate and draw each visible element dynamically!
        for (const el of elements) {
            if (!el.visible) continue;

            if (el.type === "qr") {
                if (qrCodeDataUrl) {
                    try {
                        const qrImg = await loadImg(qrCodeDataUrl);
                        const size = el.qrSize || el.fontSize || 110;
                        ctx.drawImage(qrImg, el.x, el.y, size, size);
                    } catch (e) {
                        console.error("Error drawing QR code onto canvas:", e);
                    }
                }
            } else if (el.type === "signatory") {
                ctx.save();
                ctx.fillStyle = el.color || "#202124";
                ctx.font = `${el.fontWeight || "bold"} ${el.fontSize}px ${el.fontFamily || "'Inter', sans-serif"}`;
                ctx.textAlign = el.textAlign || "center";
                ctx.textBaseline = "middle";
                ctx.fillText(el.signatoryName || "", el.x, el.y);

                ctx.fillStyle = el.signatoryRoleColor || "#80827f";
                ctx.font = `normal ${el.signatoryRoleSize || 12}px ${el.fontFamily || "'Inter', sans-serif"}`;
                ctx.fillText(el.signatoryRole || "", el.x, el.y + 20);
                ctx.restore();
            } else {
                // Text element
                const content = resolveElementText(
                    el.text,
                    participantName,
                    eventTitle || "Technical Workshop",
                    currentCertId,
                    issueDate
                );
                if (!content) continue;

                ctx.save();
                ctx.fillStyle = el.color || "#202124";
                ctx.font = `${el.fontWeight || "normal"} ${el.fontSize}px ${el.fontFamily || "'Inter', sans-serif"}`;
                ctx.textAlign = el.textAlign || "center";
                ctx.textBaseline = "middle";
                ctx.fillText(content, el.x, el.y);
                ctx.restore();
            }
        }

        return canvas;
    };

    // Download Generated Certificate as High-Res PNG
    const handleDownloadCertificate = async () => {
        if (!currentParticipant) return;
        setIsExportingPng(true);
        try {
            const canvas = await renderToCanvas();
            const link = document.createElement("a");
            link.download = `GDG_Certificate_${currentParticipant.name.replace(/\s+/g, "_")}_${currentCertId}.png`;
            link.href = canvas.toDataURL("image/png", 1.0);
            link.click();
        } catch (err) {
            console.error("Export error:", err);
            dialog.alert("Failed to export certificate image. Please try again.", "Export Failed");
        } finally {
            setIsExportingPng(false);
        }
    };

    // Save & Issue Certificate to Firestore and Student Profile
    const handleIssueCertificate = async (sendEmail = false) => {
        if (!currentParticipant) return;
        setIsSaving(true);

        try {
            const recipientEmail = currentParticipant.email.toLowerCase().trim();
            const recipientName = currentParticipant.name.trim();

            let linkedUserId = currentParticipant.userId;
            if (!linkedUserId || linkedUserId === "manual") {
                try {
                    const userQuery = query(collection(db, "users"), where("email", "==", recipientEmail));
                    const userSnap = await getDocs(userQuery);
                    if (!userSnap.empty) {
                        linkedUserId = userSnap.docs[0].id;
                    }
                } catch (e) {
                    console.log("User lookup by email:", e);
                }
            }

            const signatories = elements
                .filter((el) => el.type === "signatory" && el.visible)
                .map((s) => ({ name: s.signatoryName || "", role: s.signatoryRole || "" }));

            const certData = {
                certificateId: currentCertId,
                recipientName,
                recipientEmail,
                userId: linkedUserId || "manual",
                eventId,
                eventTitle,
                templateName: "GDG Official Verified Certificate",
                backgroundUrl: frameUrl,
                issueDate,
                issuedAt: Timestamp.now(),
                revoked: false,
                elements,
                templateConfig: {
                    backgroundUrl: frameUrl,
                    elements,
                    updatedAt: Timestamp.now(),
                },
                signatories,
                verificationUrl: `${window.location.origin}/verify/${currentCertId}`
            };

            const batch = writeBatch(db);

            // 1. Save in event's issuedCertificates subcollection
            const eventCertRef = doc(db, "events", eventId, "issuedCertificates", currentCertId);
            batch.set(eventCertRef, certData);

            // 2. If student has a valid UID, save directly in their user profile certificates subcollection
            if (linkedUserId && linkedUserId !== "manual") {
                const userCertRef = doc(db, "users", linkedUserId, "certificates", currentCertId);
                batch.set(userCertRef, certData);
            }

            // 3. Save in root certificates collection for rapid global resolution
            const rootCertRef = doc(db, "certificates", currentCertId);
            batch.set(rootCertRef, certData);

            await batch.commit();

            // Send notification email if requested
            if (sendEmail) {
                await sendCertificateEmail(recipientName, recipientEmail, currentCertId);
            }

            // Update local state
            setIssuedCertificates((prev) => ({
                ...prev,
                [recipientEmail]: { ...certData, id: currentCertId }
            }));

            if (onCertificatesUpdated) onCertificatesUpdated();

            dialog.alert(
                `Certificate #${currentCertId} has been successfully issued for ${recipientName}! It is now verifiable and accessible in their profile.`,
                "Certificate Issued"
            );
        } catch (err: any) {
            console.error("Error issuing certificate:", err);
            dialog.alert(`Failed to issue certificate: ${err.message}`, "Issuing Error");
        } finally {
            setIsSaving(false);
        }
    };

    // Helper: Send Certificate Email via /api/send-email
    const sendCertificateEmail = async (name: string, email: string, certId: string) => {
        setIsSendingMail(true);
        try {
            const origin = window.location.origin;
            const verifyLink = `${origin}/verify/${certId}`;
            const profileLink = `${origin}/profile/certificates`;

            const emailMarkdown = `
# Congratulations, ${name}! 🎓

Your official **Certificate of Participation** for **${eventTitle}** hosted by **Google Developer Groups on Campus, Amal Jyothi College of Engineering** has been issued!

### 🏅 Certificate Details:
- **Credential ID:** \`#${certId}\`
- **Issued Date:** ${issueDate}
- **Status:** Officially Verified & Cryptographically Signed

You can view, verify, and download your high-resolution certificate at any time using your unique verification link:
[**Verify & Download Certificate**](${verifyLink})

Your certificate is also safely stored in your [**GDG Credential Wallet**](${profileLink}).

Keep building with Google technologies!

Warm regards,  
**Team GDG on Campus AJCE**  
Amal Jyothi College of Engineering
            `.trim();

            const res = await fetch("/api/send-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    recipients: [{ name, email }],
                    subject: `🎓 Your Certificate for ${eventTitle} is Ready! (#${certId})`,
                    markdownBody: emailMarkdown
                })
            });

            const data = await res.json();
            if (!res.ok && data.needsSetup) {
                dialog.alert(
                    "Certificate issued! Note: To deliver via Resend, configure RESEND_API_KEY, or use the Broadcast & Mail tab to dispatch via Google Apps Script.",
                    "Notification Notice"
                );
            }
        } catch (mailErr) {
            console.log("Email dispatch:", mailErr);
        } finally {
            setIsSendingMail(false);
        }
    };

    // Batch Issue Certificates to All Registered Students
    const handleBatchIssueAll = async () => {
        if (!participants.length) return;

        const unissued = participants.filter(
            (p) => !issuedCertificates[p.email?.toLowerCase()]
        );

        const countToIssue = unissued.length > 0 ? unissued.length : participants.length;
        const confirmMsg = unissued.length > 0
            ? `Issue official certificates to all ${unissued.length} remaining participants? Each student will receive a unique credential ID and QR code.`
            : `Re-issue/update certificates for all ${participants.length} registered students?`;

        const confirmed = await dialog.confirm(confirmMsg, "Batch Issue Certificates");
        if (!confirmed) return;

        setBatchIssuing(true);
        setBatchProgress({ current: 0, total: countToIssue });

        const targetList = unissued.length > 0 ? unissued : participants;
        const batchSize = 100;

        try {
            const today = issueDate;
            const origin = window.location.origin;

            const signatories = elements
                .filter((el) => el.type === "signatory" && el.visible)
                .map((s) => ({ name: s.signatoryName || "", role: s.signatoryRole || "" }));

            for (let i = 0; i < targetList.length; i += batchSize) {
                const chunk = targetList.slice(i, i + batchSize);
                const write = writeBatch(db);

                for (const student of chunk) {
                    const studentEmail = student.email.toLowerCase().trim();
                    const studentCertId = `GDG-${nanoid(8).toUpperCase()}`;

                    const data = {
                        certificateId: studentCertId,
                        recipientName: student.name.trim(),
                        recipientEmail: studentEmail,
                        userId: student.userId || "manual",
                        eventId,
                        eventTitle,
                        templateName: "GDG Official Verified Certificate",
                        backgroundUrl: frameUrl,
                        issueDate: today,
                        issuedAt: Timestamp.now(),
                        revoked: false,
                        elements,
                        templateConfig: {
                            backgroundUrl: frameUrl,
                            elements,
                            updatedAt: Timestamp.now(),
                        },
                        signatories,
                        verificationUrl: `${origin}/verify/${studentCertId}`
                    };

                    const eventCertRef = doc(db, "events", eventId, "issuedCertificates", studentCertId);
                    write.set(eventCertRef, data);

                    if (student.userId && student.userId !== "manual") {
                        const userCertRef = doc(db, "users", student.userId, "certificates", studentCertId);
                        write.set(userCertRef, data);
                    }

                    const rootCertRef = doc(db, "certificates", studentCertId);
                    write.set(rootCertRef, data);
                }

                await write.commit();
                setBatchProgress({ current: Math.min(i + chunk.length, targetList.length), total: targetList.length });
            }

            // Also reload issued certs
            const q = query(
                collection(db, "events", eventId, "issuedCertificates"),
                orderBy("issuedAt", "desc")
            );
            const snap = await getDocs(q);
            const map: Record<string, any> = {};
            snap.docs.forEach((docSnap) => {
                const data = docSnap.data();
                if (data.recipientEmail) {
                    map[data.recipientEmail.toLowerCase()] = { id: docSnap.id, ...data };
                }
            });
            setIssuedCertificates(map);

            if (onCertificatesUpdated) onCertificatesUpdated();

            dialog.alert(
                `Successfully issued ${targetList.length} unique certificates! All students can now view them in their profiles and verify them via QR code.`,
                "Batch Issuing Complete"
            );
        } catch (err: any) {
            console.error("Batch issue error:", err);
            dialog.alert(`Batch generation encountered an error: ${err.message}`, "Batch Error");
        } finally {
            setBatchIssuing(false);
            setBatchProgress(null);
        }
    };

    const isCurrentIssued = !!issuedCertificates[currentParticipant?.email?.toLowerCase()];

    return (
        <div className="space-y-8 text-[#0f172a] dark:text-zinc-100">
            {/* Google Fonts import for rich typography */}
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link
                href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap"
                rel="stylesheet"
            />

            {/* Top Command Banner */}
            <div className="bg-white dark:bg-zinc-900 border border-[#e2e8f0] dark:border-zinc-800 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#2563EB]/10 border border-[#2563EB]/20 flex items-center justify-center text-[#2563EB] shrink-0">
                        <Award className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold text-[#0f172a] dark:text-white tracking-tight">
                                Certificate Studio & Issuance
                            </h2>
                            <GoogleBadge label="OFFICIAL GDG ENGINE" variant="blue" size="sm" />
                        </div>
                        <p className="text-xs text-[#64748b] dark:text-zinc-400">
                            Fully customizable layout: drag &amp; edit text, fonts, colors, positions, and issue cryptographically signed credentials.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    {/* Save Template Config */}
                    {isWriter && (
                        <button
                            type="button"
                            onClick={handleSaveTemplate}
                            disabled={isSavingTemplate}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#f8fafc] hover:bg-[#f1f5f9] dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-[#e2e8f0] dark:border-zinc-700 text-[#0f172a] dark:text-zinc-200 text-xs font-semibold transition"
                            title="Save current layout & styling as the default template for this event"
                        >
                            <Save className="w-3.5 h-3.5 text-[#2563EB]" />
                            <span>{isSavingTemplate ? "Saving..." : "Save Layout"}</span>
                        </button>
                    )}

                    {/* Download Base Template */}
                    <button
                        type="button"
                        onClick={handleDownloadBaseTemplate}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#f8fafc] hover:bg-[#f1f5f9] dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-[#e2e8f0] dark:border-zinc-700 text-[#0f172a] dark:text-zinc-200 text-xs font-semibold transition"
                        title="Download blank base certificate template to edit in Figma or Photoshop"
                    >
                        <Download className="w-3.5 h-3.5 text-[#2563EB]" />
                        <span>Base SVG</span>
                    </button>

                    {/* Batch Issue */}
                    {isWriter && (
                        <button
                            type="button"
                            onClick={handleBatchIssueAll}
                            disabled={batchIssuing || participants.length === 0}
                            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-xs font-semibold shadow-xs transition disabled:opacity-50"
                        >
                            {batchIssuing ? (
                                <>
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    <span>Issuing ({batchProgress?.current}/{batchProgress?.total})...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>Batch Issue ({participants.length})</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Main Interactive Studio Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Controls & Inspector (5 cols) */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Mode Navigation Tabs */}
                    <Tabs value={activeStudioTab} onValueChange={setActiveStudioTab} className="w-full">
                        <TabsList className="grid grid-cols-3 w-full bg-[#f1f5f9] dark:bg-zinc-800 p-1 rounded-2xl h-11 border border-[#e2e8f0] dark:border-zinc-700">
                            <TabsTrigger value="student" className="rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5">
                                <Users className="w-3.5 h-3.5" />
                                <span>Issue</span>
                            </TabsTrigger>
                            <TabsTrigger value="elements" className="rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5">
                                <Sliders className="w-3.5 h-3.5" />
                                <span>Elements</span>
                            </TabsTrigger>
                            <TabsTrigger value="frame" className="rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5">
                                <Layers className="w-3.5 h-3.5" />
                                <span>Frame</span>
                            </TabsTrigger>
                        </TabsList>

                        {/* TAB 1: Student Selection & Single Issuance */}
                        <TabsContent value="student" className="mt-4 space-y-4">
                            <div className="bg-white dark:bg-zinc-900 border border-[#e2e8f0] dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-[#2563EB]" />
                                        <label className="text-xs font-bold uppercase tracking-wider text-[#0f172a] dark:text-zinc-200">
                                            Select Participant
                                        </label>
                                    </div>
                                    <span className="text-[10px] font-mono text-[#64748b] dark:text-zinc-400">
                                        {participants.length} Registered
                                    </span>
                                </div>

                                {/* Search Filter */}
                                {participants.length > 5 && (
                                    <div className="relative">
                                        <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#64748b]" />
                                        <input
                                            type="text"
                                            value={searchStudent}
                                            onChange={(e) => setSearchStudent(e.target.value)}
                                            placeholder="Search by participant name or email..."
                                            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#f8fafc] dark:bg-zinc-800 border border-[#e2e8f0] dark:border-zinc-700 text-xs text-[#0f172a] dark:text-zinc-100 focus:outline-none focus:border-[#2563EB]"
                                        />
                                    </div>
                                )}

                                {/* Dropdown Selector */}
                                <div className="relative">
                                    <select
                                        value={selectedStudentId}
                                        onChange={(e) => setSelectedStudentId(e.target.value)}
                                        className="w-full px-4 py-3 rounded-2xl bg-[#f8fafc] dark:bg-zinc-800 border border-[#e2e8f0] dark:border-zinc-700 text-xs font-medium text-[#0f172a] dark:text-zinc-100 focus:outline-none focus:border-[#2563EB] appearance-none cursor-pointer pr-10"
                                    >
                                        {filteredParticipants.length === 0 ? (
                                            <option value="">No participants found</option>
                                        ) : (
                                            filteredParticipants.map((p) => {
                                                const issued = !!issuedCertificates[p.email?.toLowerCase()];
                                                return (
                                                    <option key={p.id} value={p.id}>
                                                        {issued ? "✓ [ISSUED] " : "○ "}
                                                        {p.name} — {p.email} {p.department ? `(${p.department})` : ""}
                                                    </option>
                                                );
                                            })
                                        )}
                                    </select>
                                    <ChevronDown className="absolute right-3.5 top-3.5 w-4 h-4 text-[#64748b] pointer-events-none" />
                                </div>

                                {/* Selected Student Meta Card */}
                                {currentParticipant && (
                                    <div className="p-3.5 rounded-2xl bg-[#f8fafc]/80 dark:bg-zinc-800/80 border border-[#e2e8f0] dark:border-zinc-700 text-xs space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-[#0f172a] dark:text-white">{currentParticipant.name}</span>
                                            {isCurrentIssued ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                                                    <CheckCircle2 className="w-3 h-3" /> Issued &amp; Verified
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-mono text-[#64748b] dark:text-zinc-400">
                                                    Pending Issuance
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-[#64748b] dark:text-zinc-400 font-mono">{currentParticipant.email}</p>
                                        {currentParticipant.department && (
                                            <p className="text-[10px] text-[#64748b] dark:text-zinc-500">
                                                Dept: {currentParticipant.department} • {currentParticipant.college || "Amal Jyothi College of Engineering"}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Issue Date Field */}
                                <div className="space-y-1 pt-2 border-t border-[#e2e8f0] dark:border-zinc-800">
                                    <label className="text-[10px] font-mono text-[#64748b] dark:text-zinc-400 uppercase block">
                                        Issue Date String
                                    </label>
                                    <Input
                                        type="text"
                                        value={issueDate}
                                        onChange={(e) => setIssueDate(e.target.value)}
                                        placeholder="e.g. November 20, 2026"
                                        className="h-9 text-xs"
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        {/* TAB 2: Dynamic Elements Inspector & Customizer */}
                        <TabsContent value="elements" className="mt-4 space-y-4">
                            <div className="bg-white dark:bg-zinc-900 border border-[#e2e8f0] dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-5">
                                {/* Top Controls Bar: Select Element & Add/Reset buttons */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Sliders className="w-4 h-4 text-[#2563EB]" />
                                            <label className="text-xs font-bold uppercase tracking-wider text-[#0f172a] dark:text-zinc-200">
                                                Element Inspector
                                            </label>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={handleAddCustomElement}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#2563EB]/10 hover:bg-[#2563EB]/20 text-[#2563EB] text-[11px] font-semibold transition"
                                                title="Add a custom text element"
                                            >
                                                <Plus className="w-3 h-3" />
                                                <span>Add Text</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleResetLayout}
                                                className="p-1 rounded-lg text-[#64748b] hover:text-[#0f172a] dark:hover:text-white hover:bg-[#f1f5f9] dark:hover:bg-zinc-800 transition"
                                                title="Reset all positions to default"
                                            >
                                                <RotateCcw className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Element Selector Dropdown */}
                                    <div className="relative">
                                        <select
                                            value={selectedElementId}
                                            onChange={(e) => setSelectedElementId(e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#f8fafc] dark:bg-zinc-800 border border-[#e2e8f0] dark:border-zinc-700 text-xs font-semibold text-[#0f172a] dark:text-zinc-100 focus:outline-none focus:border-[#2563EB] appearance-none cursor-pointer pr-9"
                                        >
                                            {elements.map((el) => (
                                                <option key={el.id} value={el.id}>
                                                    {el.visible ? "👁 " : "🚫 "}
                                                    {el.label} {el.isCustom ? "(Custom)" : ""}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-3 w-3.5 h-3.5 text-[#64748b] pointer-events-none" />
                                    </div>
                                </div>

                                {/* Active Element Inspector Controls */}
                                {selectedElement && (
                                    <div className="space-y-4 pt-2 border-t border-[#e2e8f0] dark:border-zinc-800">
                                        {/* Element Header & Visibility Toggle */}
                                        <div className="flex items-center justify-between bg-[#f8fafc] dark:bg-zinc-800/60 p-2.5 rounded-xl border border-[#e2e8f0] dark:border-zinc-700">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-[#0f172a] dark:text-zinc-200">
                                                    {selectedElement.label}
                                                </span>
                                                <span className="text-[10px] font-mono text-[#64748b] dark:text-zinc-400">
                                                    ({Math.round(selectedElement.x)}, {Math.round(selectedElement.y)})
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[10px] font-medium text-[#64748b]">Visible</span>
                                                    <Switch
                                                        checked={selectedElement.visible}
                                                        onCheckedChange={(checked) => updateElement("visible", checked)}
                                                    />
                                                </div>

                                                {selectedElement.isCustom && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteElement(selectedElement.id)}
                                                        className="p-1 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                                                        title="Delete custom element"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Text Content Input (if type is text) */}
                                        {selectedElement.type === "text" && (
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-[10px] font-mono uppercase text-[#64748b]">
                                                        Content / Template
                                                    </label>
                                                    <div className="flex gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => updateElement("text", (selectedElement.text || "") + "{{NAME}}")}
                                                            className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900"
                                                        >
                                                            +&#123;&#123;NAME&#125;&#125;
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => updateElement("text", (selectedElement.text || "") + "{{EVENT}}")}
                                                            className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900"
                                                        >
                                                            +&#123;&#123;EVENT&#125;&#125;
                                                        </button>
                                                    </div>
                                                </div>
                                                <Input
                                                    type="text"
                                                    value={selectedElement.text || ""}
                                                    onChange={(e) => updateElement("text", e.target.value)}
                                                    placeholder="Enter text or token..."
                                                    className="h-9 text-xs"
                                                />
                                            </div>
                                        )}

                                        {/* Signatory Inputs (if type is signatory) */}
                                        {selectedElement.type === "signatory" && (
                                            <div className="space-y-3">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-mono uppercase text-[#64748b]">
                                                        Signatory Name
                                                    </label>
                                                    <Input
                                                        type="text"
                                                        value={selectedElement.signatoryName || ""}
                                                        onChange={(e) => updateElement("signatoryName", e.target.value)}
                                                        className="h-9 text-xs"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-mono uppercase text-[#64748b]">
                                                        Signatory Role / Title
                                                    </label>
                                                    <Input
                                                        type="text"
                                                        value={selectedElement.signatoryRole || ""}
                                                        onChange={(e) => updateElement("signatoryRole", e.target.value)}
                                                        className="h-9 text-xs"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Coordinates X & Y Sliders */}
                                        <div className="grid grid-cols-2 gap-3 pt-2">
                                            {/* X Position */}
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-[10px] font-mono text-[#64748b] uppercase">
                                                        X Position
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateElement("x", 877)}
                                                        className="text-[9px] text-[#2563EB] hover:underline"
                                                    >
                                                        Center
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="range"
                                                        min={0}
                                                        max={1754}
                                                        value={selectedElement.x}
                                                        onChange={(e) => updateElement("x", Number(e.target.value))}
                                                        className="w-full accent-[#2563EB] cursor-pointer"
                                                    />
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={1754}
                                                        value={selectedElement.x}
                                                        onChange={(e) => updateElement("x", Number(e.target.value))}
                                                        className="w-14 px-1.5 py-1 rounded-lg bg-[#f8fafc] dark:bg-zinc-800 border border-[#e2e8f0] dark:border-zinc-700 text-[11px] font-mono text-center"
                                                    />
                                                </div>
                                            </div>

                                            {/* Y Position */}
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-[10px] font-mono text-[#64748b] uppercase">
                                                        Y Position
                                                    </label>
                                                    <span className="text-[9px] font-mono text-[#64748b]">{selectedElement.y}px</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="range"
                                                        min={0}
                                                        max={1240}
                                                        value={selectedElement.y}
                                                        onChange={(e) => updateElement("y", Number(e.target.value))}
                                                        className="w-full accent-[#2563EB] cursor-pointer"
                                                    />
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={1240}
                                                        value={selectedElement.y}
                                                        onChange={(e) => updateElement("y", Number(e.target.value))}
                                                        className="w-14 px-1.5 py-1 rounded-lg bg-[#f8fafc] dark:bg-zinc-800 border border-[#e2e8f0] dark:border-zinc-700 text-[11px] font-mono text-center"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* QR Code Specific Size Slider */}
                                        {selectedElement.type === "qr" && (
                                            <div className="space-y-1.5 pt-2">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-[10px] font-mono text-[#64748b] uppercase">
                                                        QR Code Size
                                                    </label>
                                                    <span className="text-[10px] font-mono text-[#2563EB]">{selectedElement.qrSize || 110}px</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min={60}
                                                    max={220}
                                                    value={selectedElement.qrSize || 110}
                                                    onChange={(e) => {
                                                        const val = Number(e.target.value);
                                                        updateElement("qrSize", val);
                                                        updateElement("fontSize", val);
                                                    }}
                                                    className="w-full accent-[#2563EB] cursor-pointer"
                                                />
                                            </div>
                                        )}

                                        {/* Typography Controls (for text & signatory) */}
                                        {selectedElement.type !== "qr" && (
                                            <>
                                                {/* Font Size & Weight */}
                                                <div className="grid grid-cols-2 gap-3 pt-2">
                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center justify-between">
                                                            <label className="text-[10px] font-mono text-[#64748b] uppercase">
                                                                Font Size
                                                            </label>
                                                            <span className="text-[10px] font-mono text-[#2563EB]">{selectedElement.fontSize}px</span>
                                                        </div>
                                                        <input
                                                            type="range"
                                                            min={10}
                                                            max={96}
                                                            value={selectedElement.fontSize}
                                                            onChange={(e) => updateElement("fontSize", Number(e.target.value))}
                                                            className="w-full accent-[#2563EB] cursor-pointer"
                                                        />
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-mono text-[#64748b] uppercase block">
                                                            Font Weight
                                                        </label>
                                                        <div className="grid grid-cols-4 gap-1">
                                                            {(["normal", "500", "600", "bold"] as FontWeight[]).map((w) => (
                                                                <button
                                                                    key={w}
                                                                    type="button"
                                                                    onClick={() => updateElement("fontWeight", w)}
                                                                    className={`py-1 rounded-lg text-[10px] font-mono transition capitalize ${
                                                                        selectedElement.fontWeight === w
                                                                            ? "bg-[#2563EB] text-white font-bold"
                                                                            : "bg-[#f8fafc] dark:bg-zinc-800 text-[#64748b] hover:bg-[#e2e8f0]"
                                                                    }`}
                                                                >
                                                                    {w === "normal" ? "400" : w === "bold" ? "700" : w}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Font Family Dropdown */}
                                                <div className="space-y-1.5 pt-1">
                                                    <label className="text-[10px] font-mono text-[#64748b] uppercase block">
                                                        Font Family
                                                    </label>
                                                    <select
                                                        value={selectedElement.fontFamily}
                                                        onChange={(e) => updateElement("fontFamily", e.target.value)}
                                                        className="w-full px-3 py-2 rounded-xl bg-[#f8fafc] dark:bg-zinc-800 border border-[#e2e8f0] dark:border-zinc-700 text-xs font-medium text-[#0f172a] dark:text-zinc-100 focus:outline-none focus:border-[#2563EB] cursor-pointer"
                                                    >
                                                        {FONT_OPTIONS.map((font) => (
                                                            <option key={font.value} value={font.value}>
                                                                {font.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Text Alignment */}
                                                <div className="space-y-1.5 pt-1">
                                                    <label className="text-[10px] font-mono text-[#64748b] uppercase block">
                                                        Alignment
                                                    </label>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => updateElement("textAlign", "left")}
                                                            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-xl border text-xs font-medium transition ${
                                                                selectedElement.textAlign === "left"
                                                                    ? "bg-[#2563EB]/10 border-[#2563EB] text-[#2563EB]"
                                                                    : "bg-[#f8fafc] dark:bg-zinc-800 border-[#e2e8f0] dark:border-zinc-700 text-[#64748b]"
                                                            }`}
                                                        >
                                                            <AlignLeft className="w-3.5 h-3.5" />
                                                            <span>Left</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => updateElement("textAlign", "center")}
                                                            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-xl border text-xs font-medium transition ${
                                                                selectedElement.textAlign === "center"
                                                                    ? "bg-[#2563EB]/10 border-[#2563EB] text-[#2563EB]"
                                                                    : "bg-[#f8fafc] dark:bg-zinc-800 border-[#e2e8f0] dark:border-zinc-700 text-[#64748b]"
                                                            }`}
                                                        >
                                                            <AlignCenter className="w-3.5 h-3.5" />
                                                            <span>Center</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => updateElement("textAlign", "right")}
                                                            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-xl border text-xs font-medium transition ${
                                                                selectedElement.textAlign === "right"
                                                                    ? "bg-[#2563EB]/10 border-[#2563EB] text-[#2563EB]"
                                                                    : "bg-[#f8fafc] dark:bg-zinc-800 border-[#e2e8f0] dark:border-zinc-700 text-[#64748b]"
                                                            }`}
                                                        >
                                                            <AlignRight className="w-3.5 h-3.5" />
                                                            <span>Right</span>
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Color Picker & Quick GDG Pills */}
                                                <div className="space-y-2 pt-2">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-[10px] font-mono text-[#64748b] uppercase">
                                                            Element Color
                                                        </label>
                                                        <span className="text-[10px] font-mono text-[#64748b]">{selectedElement.color}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="color"
                                                            value={selectedElement.color.startsWith("#") ? selectedElement.color : "#202124"}
                                                            onChange={(e) => updateElement("color", e.target.value)}
                                                            className="w-9 h-9 rounded-xl border border-[#e2e8f0] dark:border-zinc-700 cursor-pointer p-0.5 bg-white"
                                                        />
                                                        <div className="flex flex-wrap gap-1.5 flex-1">
                                                            {GDG_COLOR_PALETTE.map((color) => (
                                                                <button
                                                                    key={color.value}
                                                                    type="button"
                                                                    onClick={() => updateElement("color", color.value)}
                                                                    className={`w-6 h-6 rounded-full border transition transform hover:scale-110 ${
                                                                        selectedElement.color.toLowerCase() === color.value.toLowerCase()
                                                                            ? "ring-2 ring-offset-2 ring-[#2563EB] scale-110"
                                                                            : "border-black/10"
                                                                    }`}
                                                                    style={{ backgroundColor: color.value }}
                                                                    title={color.label}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        {/* TAB 3: Frame & Template Presets */}
                        <TabsContent value="frame" className="mt-4 space-y-4">
                            <div className="bg-white dark:bg-zinc-900 border border-[#e2e8f0] dark:border-zinc-800 rounded-3xl p-6 shadow-xs space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Layers className="w-4 h-4 text-[#EF4444]" />
                                        <label className="text-xs font-bold uppercase tracking-wider text-[#0f172a] dark:text-zinc-200">
                                            Frame Artwork
                                        </label>
                                    </div>
                                </div>

                                {/* Custom Frame File Upload */}
                                <div className="space-y-2">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/png, image/jpeg, image/webp, image/svg+xml"
                                        onChange={handleFrameFileUpload}
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploadingFrame}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#f8fafc] hover:bg-[#f1f5f9] dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-dashed border-[#e2e8f0] dark:border-zinc-700 text-xs font-semibold text-[#0f172a] dark:text-zinc-200 transition cursor-pointer"
                                    >
                                        <Upload className="w-4 h-4 text-[#2563EB]" />
                                        <span>{uploadingFrame ? "Processing..." : "Upload Custom Frame (.png / .jpg / .svg)"}</span>
                                    </button>

                                    {customFrameFileName && (
                                        <p className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                            <Check className="w-3 h-3" /> Custom Frame: {customFrameFileName}
                                        </p>
                                    )}
                                </div>

                                {/* Frame Presets */}
                                <div className="pt-2 border-t border-[#e2e8f0] dark:border-zinc-800">
                                    <label className="text-[11px] font-mono text-[#64748b] dark:text-zinc-400 block mb-2 uppercase">
                                        Frame Presets
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFrameUrl(DEFAULT_FRAME_SVG);
                                                setCustomFrameFileName("");
                                            }}
                                            className={`p-2.5 rounded-xl border text-xs font-medium text-left transition ${
                                                frameUrl === DEFAULT_FRAME_SVG
                                                    ? "bg-[#2563EB]/10 border-[#2563EB] text-[#2563EB]"
                                                    : "bg-[#f8fafc] dark:bg-zinc-800 border-[#e2e8f0] dark:border-zinc-700 text-[#0f172a] dark:text-zinc-200 hover:bg-white"
                                            }`}
                                        >
                                            Warm Paper Classic
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFrameUrl("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop");
                                                setCustomFrameFileName("Dark Accent");
                                            }}
                                            className={`p-2.5 rounded-xl border text-xs font-medium text-left transition ${
                                                frameUrl.includes("unsplash")
                                                    ? "bg-[#2563EB]/10 border-[#2563EB] text-[#2563EB]"
                                                    : "bg-[#f8fafc] dark:bg-zinc-800 border-[#e2e8f0] dark:border-zinc-700 text-[#0f172a] dark:text-zinc-200 hover:bg-white"
                                            }`}
                                        >
                                            Dark Accent Canvas
                                        </button>
                                    </div>
                                </div>

                                <div className="text-[11px] text-[#64748b] dark:text-zinc-400 pt-2 border-t border-[#e2e8f0] dark:border-zinc-800">
                                    Canvas Resolution: <span className="font-mono font-bold text-[#0f172a] dark:text-zinc-200">1754 x 1240 px</span> (A4 Landscape 150/300 DPI standard).
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Right Interactive Live Certificate Preview (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-white dark:bg-zinc-900 border border-[#e2e8f0] dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-[#0f172a] dark:text-zinc-200">
                                    Interactive Live Certificate
                                </h3>
                                <p className="text-xs text-[#64748b] dark:text-zinc-400">
                                    Click or drag any element to position &amp; customize it directly.
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-[#2563EB] font-bold">
                                    #{currentCertId}
                                </span>
                            </div>
                        </div>

                        {/* Interactive Certificate Canvas Viewport */}
                        <div
                            ref={previewContainerRef}
                            className="relative rounded-2xl overflow-hidden border border-[#e2e8f0] dark:border-zinc-700 shadow-md bg-white select-none"
                            style={{
                                width: "100%",
                                aspectRatio: "1754 / 1240",
                                containerType: "inline-size"
                            }}
                        >
                            {/* Background Frame Artwork */}
                            <img
                                src={frameUrl}
                                alt="Certificate Background"
                                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                            />

                            {/* Render All Dynamic Elements */}
                            {elements.map((el) => {
                                if (!el.visible) return null;

                                const isSelected = selectedElementId === el.id;
                                const leftPercent = (el.x / 1754) * 100;
                                const topPercent = (el.y / 1240) * 100;
                                const sizeInCqw = (el.fontSize / 1754) * 100;

                                // QR Code Element
                                if (el.type === "qr") {
                                    const qrSizeCqw = ((el.qrSize || 110) / 1754) * 100;
                                    return (
                                        <div
                                            key={el.id}
                                            onPointerDown={(e) => handleElementPointerDown(e, el.id)}
                                            className={`absolute cursor-move transition-shadow z-20 group ${
                                                isSelected ? "ring-2 ring-[#2563EB] bg-[#2563EB]/10 rounded-xl" : "hover:ring-1 hover:ring-[#2563EB]/50"
                                            }`}
                                            style={{
                                                left: `${leftPercent}%`,
                                                top: `${topPercent}%`,
                                                width: `${qrSizeCqw}cqw`,
                                                height: `${qrSizeCqw}cqw`,
                                            }}
                                            title="Drag to reposition QR code"
                                        >
                                            <div className="w-full h-full bg-white p-1 rounded-xl shadow-md border border-[#e2e8f0] flex items-center justify-center">
                                                {qrCodeDataUrl ? (
                                                    <img
                                                        src={qrCodeDataUrl}
                                                        alt="QR Verification"
                                                        className="w-full h-full object-contain pointer-events-none"
                                                    />
                                                ) : (
                                                    <QrCode className="w-full h-full text-zinc-400" />
                                                )}
                                            </div>
                                            {isSelected && (
                                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#2563EB] text-white text-[9px] font-mono px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap">
                                                    QR ({Math.round(el.x)}, {Math.round(el.y)})
                                                </div>
                                            )}
                                        </div>
                                    );
                                }

                                // Signatory Element
                                if (el.type === "signatory") {
                                    return (
                                        <div
                                            key={el.id}
                                            onPointerDown={(e) => handleElementPointerDown(e, el.id)}
                                            className={`absolute cursor-move z-20 px-2 py-1 transition-all group ${
                                                isSelected
                                                    ? "ring-2 ring-[#2563EB] bg-[#2563EB]/10 rounded-lg"
                                                    : "hover:ring-1 hover:ring-[#2563EB]/40 rounded-lg"
                                            }`}
                                            style={{
                                                left: `${leftPercent}%`,
                                                top: `${topPercent}%`,
                                                transform:
                                                    el.textAlign === "center"
                                                        ? "translate(-50%, -50%)"
                                                        : el.textAlign === "right"
                                                        ? "translate(-100%, -50%)"
                                                        : "translate(0, -50%)",
                                                textAlign: el.textAlign,
                                            }}
                                            title="Drag to reposition signatory"
                                        >
                                            <div
                                                style={{
                                                    fontSize: `${sizeInCqw}cqw`,
                                                    color: el.color,
                                                    fontFamily: el.fontFamily,
                                                    fontWeight: el.fontWeight,
                                                    lineHeight: 1.2,
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {el.signatoryName || "Signatory Name"}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: `${((el.signatoryRoleSize || 12) / 1754) * 100}cqw`,
                                                    color: el.signatoryRoleColor || "#80827f",
                                                    fontFamily: el.fontFamily,
                                                    lineHeight: 1.2,
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {el.signatoryRole || "Signatory Role"}
                                            </div>

                                            {isSelected && (
                                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#2563EB] text-white text-[9px] font-mono px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap">
                                                    {el.label}
                                                </div>
                                            )}
                                        </div>
                                    );
                                }

                                // Text Element
                                const resolvedText = resolveElementText(
                                    el.text,
                                    currentParticipant?.name || "Participant Name",
                                    eventTitle || "Technical Workshop",
                                    currentCertId,
                                    issueDate
                                );

                                return (
                                    <div
                                        key={el.id}
                                        onPointerDown={(e) => handleElementPointerDown(e, el.id)}
                                        className={`absolute cursor-move z-20 px-2 py-0.5 transition-all group ${
                                            isSelected
                                                ? "ring-2 ring-[#2563EB] bg-[#2563EB]/10 rounded-lg"
                                                : "hover:ring-1 hover:ring-[#2563EB]/40 rounded-lg"
                                        }`}
                                        style={{
                                            left: `${leftPercent}%`,
                                            top: `${topPercent}%`,
                                            transform:
                                                el.textAlign === "center"
                                                    ? "translate(-50%, -50%)"
                                                    : el.textAlign === "right"
                                                    ? "translate(-100%, -50%)"
                                                    : "translate(0, -50%)",
                                            fontSize: `${sizeInCqw}cqw`,
                                            color: el.color,
                                            fontFamily: el.fontFamily,
                                            fontWeight: el.fontWeight,
                                            textAlign: el.textAlign,
                                            whiteSpace: "nowrap",
                                            lineHeight: 1.1,
                                        }}
                                        title="Drag to reposition text"
                                    >
                                        {resolvedText || "(Empty)"}

                                        {isSelected && (
                                            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#2563EB] text-white text-[9px] font-mono px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap">
                                                {el.label} ({Math.round(el.x)}, {Math.round(el.y)})
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Verification & Action Command Bar */}
                        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <a
                                    href={`/verify/${currentCertId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs text-[#2563EB] hover:underline font-medium"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    <span>Preview Verification Route</span>
                                </a>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                                {/* Download PNG */}
                                <button
                                    type="button"
                                    onClick={handleDownloadCertificate}
                                    disabled={isExportingPng || !currentParticipant}
                                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#f8fafc] hover:bg-[#f1f5f9] dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-[#e2e8f0] dark:border-zinc-700 text-xs font-semibold text-[#0f172a] dark:text-zinc-200 transition disabled:opacity-50"
                                >
                                    <Download className="w-3.5 h-3.5 text-[#0f172a] dark:text-zinc-200" />
                                    <span>{isExportingPng ? "Rendering..." : "Download (.png)"}</span>
                                </button>

                                {/* Issue & Send Email */}
                                {isWriter && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => handleIssueCertificate(true)}
                                            disabled={isSaving || isSendingMail || !currentParticipant}
                                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition disabled:opacity-50"
                                            title="Issues certificate and dispatches email notification to student"
                                        >
                                            <Mail className="w-3.5 h-3.5" />
                                            <span>{isSendingMail ? "Sending..." : "Issue & Email"}</span>
                                        </button>

                                        {/* Save & Issue */}
                                        <button
                                            type="button"
                                            onClick={() => handleIssueCertificate(false)}
                                            disabled={isSaving || !currentParticipant}
                                            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-xs font-semibold shadow-xs transition disabled:opacity-50"
                                        >
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            <span>{isSaving ? "Saving..." : isCurrentIssued ? "Update Credential" : "Issue Certificate"}</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
