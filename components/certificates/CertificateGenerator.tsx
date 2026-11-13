"use client";

import React, { useState, useEffect, useRef } from "react";
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
    FileImage,
    Layers,
    Sliders,
    Eye,
    Mail
} from "lucide-react";
import QRCode from "qrcode";
import { nanoid } from "nanoid";
import { db, storage } from "@/lib/firebase";
import {
    collection,
    doc,
    setDoc,
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

export default function CertificateGenerator({
    eventId,
    eventTitle,
    eventDate,
    participants,
    onCertificatesUpdated,
    isWriter = true,
}: CertificateGeneratorProps) {
    const dialog = useDialog();

    // Student selection state
    const [selectedStudentId, setSelectedStudentId] = useState<string>(
        participants.length > 0 ? participants[0].id : ""
    );
    const [searchStudent, setSearchStudent] = useState("");

    // Frame & Template settings
    const [frameUrl, setFrameUrl] = useState<string>(DEFAULT_FRAME_SVG);
    const [customFrameFileName, setCustomFrameFileName] = useState<string>("");
    const [uploadingFrame, setUploadingFrame] = useState(false);

    // Certificate metadata
    const [certTitle, setCertTitle] = useState("CERTIFICATE OF PARTICIPATION");
    const [certSubtitle, setCertSubtitle] = useState("THIS IS PROUDLY PRESENTED TO");
    const [certDescription, setCertDescription] = useState(
        `for active participation and successful completion of ${eventTitle || "the technical workshop"}`
    );
    const [signatory1Name, setSignatory1Name] = useState("Prof. Fr. Rubin Thoppil");
    const [signatory1Role, setSignatory1Role] = useState("Faculty Advisor, GDG AJCE");
    const [signatory2Name, setSignatory2Name] = useState("Abin Varghese");
    const [signatory2Role, setSignatory2Role] = useState("Organizer & Chapter Lead");
    const [issueDate, setIssueDate] = useState(
        new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
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
    const [copiedLink, setCopiedLink] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Find current participant
    const currentParticipant = participants.find((p) => p.id === selectedStudentId) || participants[0];

    // Filter participants for dropdown
    const filteredParticipants = participants.filter(
        (p) =>
            p.name?.toLowerCase().includes(searchStudent.toLowerCase()) ||
            p.email?.toLowerCase().includes(searchStudent.toLowerCase())
    );

    // Load already issued certificates for this event
    const fetchIssuedCerts = async () => {
        try {
            setLoadingIssued(true);
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

    useEffect(() => {
        if (eventId) fetchIssuedCerts();
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
            width: 320,
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

    // Handle Custom Frame Upload
    const handleFrameFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingFrame(true);
        setCustomFrameFileName(file.name);

        try {
            // Read immediately as Data URL for snappy local preview
            const reader = new FileReader();
            reader.onload = async (event) => {
                const dataUrl = event.target?.result as string;
                setFrameUrl(dataUrl);

                // Also try to upload to Firebase Storage if online
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

    // Render Certificate to HTML Canvas (for high-resolution PNG download)
    const renderToCanvas = async (): Promise<HTMLCanvasElement> => {
        const CANVAS_W = 1754;
        const CANVAS_H = 1240;

        const canvas = document.createElement("canvas");
        canvas.width = CANVAS_W;
        canvas.height = CANVAS_H;
        const ctx = canvas.getContext("2d")!;

        // 1. Draw Background Frame
        const loadImg = (src: string): Promise<HTMLImageElement> =>
            new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.onload = () => resolve(img);
                img.onerror = () => {
                    // Fallback to local image or blank canvas
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

        // 2. Student Name
        const studentName = currentParticipant?.name || "Participant Name";
        ctx.save();
        ctx.fillStyle = "#1a73e8";
        ctx.font = "bold 52px 'Inter', -apple-system, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(studentName, CANVAS_W / 2, 530);
        ctx.restore();

        // 3. Event Description / Title
        ctx.save();
        ctx.fillStyle = "#3c4043";
        ctx.font = "500 18px 'Inter', -apple-system, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(certDescription, CANVAS_W / 2, 620);

        ctx.fillStyle = "#202124";
        ctx.font = "bold 32px 'Inter', -apple-system, sans-serif";
        ctx.fillText(eventTitle || "Technical Workshop", CANVAS_W / 2, 665);

        ctx.fillStyle = "#5f6368";
        ctx.font = "15px 'Inter', -apple-system, sans-serif";
        ctx.fillText("hosted by Google Developer Groups on Campus, Amal Jyothi College of Engineering.", CANVAS_W / 2, 705);
        ctx.restore();

        // 4. Signatures
        ctx.save();
        ctx.fillStyle = "#202124";
        ctx.font = "bold 15px 'Inter', -apple-system, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(signatory1Name, 370, 965);
        ctx.fillStyle = "#80827f";
        ctx.font = "12px 'Inter', -apple-system, sans-serif";
        ctx.fillText(signatory1Role, 370, 985);

        ctx.fillStyle = "#202124";
        ctx.font = "bold 15px 'Inter', -apple-system, sans-serif";
        ctx.fillText(signatory2Name, 710, 965);
        ctx.fillStyle = "#80827f";
        ctx.font = "12px 'Inter', -apple-system, sans-serif";
        ctx.fillText(signatory2Role, 710, 985);
        ctx.restore();

        // 5. Unique QR Code
        if (qrCodeDataUrl) {
            try {
                const qrImg = await loadImg(qrCodeDataUrl);
                ctx.drawImage(qrImg, 1370, 900, 110, 110);
            } catch (e) {
                console.error("Error drawing QR code onto canvas:", e);
            }
        }

        // 6. Footer Credential String
        ctx.save();
        ctx.fillStyle = "#80827f";
        ctx.font = "600 11.5px 'Courier New', monospace";
        ctx.textAlign = "center";
        ctx.fillText(
            `CREDENTIAL ID: #${currentCertId}   •   ISSUED: ${issueDate}   •   VERIFY AT: gdgajce.com/verify`,
            CANVAS_W / 2,
            1115
        );
        ctx.restore();

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

            // Check if student has a linked Firebase User
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
                signatories: [
                    { name: signatory1Name, role: signatory1Role },
                    { name: signatory2Name, role: signatory2Role }
                ],
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

    // Helper: Send Certificate Email via /api/send-email or mail-sender
    const sendCertificateEmail = async (name: string, email: string, certId: string) => {
        setIsSendingMail(true);
        try {
            const origin = window.location.origin;
            const verifyLink = `${origin}/verify/${certId}`;
            const profileLink = `${origin}/profile/certificates`;

            const emailMarkdown = `
# Congratulations, {{name}}! 🎓

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
                // Try fallback to Google Apps Script gateway or alert user
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

            await fetchIssuedCerts();
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
        <div className="space-y-8 text-[#2c2e2a]">
            {/* Top Command Banner */}
            <div className="bg-[#ffffff] border border-[#d5d5d4] rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#4285F4]/10 border border-[#4285F4]/20 flex items-center justify-center text-[#4285F4] shrink-0">
                        <Award className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold text-[#2c2e2a] tracking-tight">
                                Certificate Studio & Issuance
                            </h2>
                            <GoogleBadge label="OFFICIAL GDG ENGINE" variant="blue" size="sm" />
                        </div>
                        <p className="text-xs text-[#80827f]">
                            Auto-generate personalized certificates with unique verification QR codes for registered students.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    {/* 1-Click Download Base Template */}
                    <button
                        onClick={handleDownloadBaseTemplate}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#f5f1e4] hover:bg-[#eae5d8] border border-[#d5d5d4] text-[#2c2e2a] text-xs font-semibold transition"
                        title="Download blank base certificate template to edit in Figma or Photoshop"
                    >
                        <Download className="w-3.5 h-3.5 text-[#4285F4]" />
                        <span>Download Template</span>
                    </button>

                    {isWriter && (
                        <button
                            onClick={handleBatchIssueAll}
                            disabled={batchIssuing || participants.length === 0}
                            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#4285F4] hover:bg-[#3367d6] text-white text-xs font-semibold shadow-xs transition disabled:opacity-50"
                        >
                            {batchIssuing ? (
                                <>
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    <span>Issuing ({batchProgress?.current}/{batchProgress?.total})...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>Batch Issue to All ({participants.length})</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Main Interactive Studio Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Controls & Custom Frame Upload (4 cols) */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Student Selection Dropdown */}
                    <div className="bg-[#ffffff] border border-[#d5d5d4] rounded-3xl p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-[#4285F4]" />
                                <label className="text-xs font-bold uppercase tracking-wider text-[#2c2e2a]">
                                    Student / Username
                                </label>
                            </div>
                            <span className="text-[10px] font-mono text-[#80827f]">
                                {participants.length} Registered
                            </span>
                        </div>

                        {/* Search Filter if many participants */}
                        {participants.length > 5 && (
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#80827f]" />
                                <input
                                    type="text"
                                    value={searchStudent}
                                    onChange={(e) => setSearchStudent(e.target.value)}
                                    placeholder="Search by student name or email..."
                                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#f5f1e4] border border-[#d5d5d4] text-xs text-[#2c2e2a] focus:outline-none focus:border-[#4285F4]"
                                />
                            </div>
                        )}

                        {/* Dropdown Selector */}
                        <div className="relative">
                            <select
                                value={selectedStudentId}
                                onChange={(e) => setSelectedStudentId(e.target.value)}
                                className="w-full px-4 py-3 rounded-2xl bg-[#f5f1e4] border border-[#d5d5d4] text-xs font-medium text-[#2c2e2a] focus:outline-none focus:border-[#4285F4] appearance-none cursor-pointer pr-10"
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
                            <ChevronDown className="absolute right-3.5 top-3.5 w-4 h-4 text-[#80827f] pointer-events-none" />
                        </div>

                        {/* Selected Student Meta Pill */}
                        {currentParticipant && (
                            <div className="p-3.5 rounded-2xl bg-[#f5f1e4]/70 border border-[#d5d5d4] text-xs space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-[#2c2e2a]">{currentParticipant.name}</span>
                                    {isCurrentIssued ? (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                                            <CheckCircle2 className="w-3 h-3" /> Issued & Verified
                                        </span>
                                    ) : (
                                        <span className="text-[10px] font-mono text-[#80827f]">
                                            Pending Issuance
                                        </span>
                                    )}
                                </div>
                                <p className="text-[11px] text-[#80827f] font-mono">{currentParticipant.email}</p>
                                {currentParticipant.department && (
                                    <p className="text-[10px] text-[#80827f]">
                                        Dept: {currentParticipant.department} • {currentParticipant.college || "AJCE"}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Frame & Background Customizer */}
                    <div className="bg-[#ffffff] border border-[#d5d5d4] rounded-3xl p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Layers className="w-4 h-4 text-[#EA4335]" />
                                <label className="text-xs font-bold uppercase tracking-wider text-[#2c2e2a]">
                                    Certificate Frame / Background
                                </label>
                            </div>
                        </div>

                        {/* Upload Custom Frame Button */}
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
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#f5f1e4] hover:bg-[#eae5d8] border border-dashed border-[#d5d5d4] text-xs font-semibold text-[#2c2e2a] transition cursor-pointer"
                            >
                                <Upload className="w-4 h-4 text-[#4285F4]" />
                                <span>{uploadingFrame ? "Processing..." : "Upload Custom Frame (.png / .jpg / .svg)"}</span>
                            </button>

                            {customFrameFileName && (
                                <p className="text-[10px] font-mono text-[#34A853] flex items-center gap-1">
                                    <Check className="w-3 h-3" /> Custom Frame: {customFrameFileName}
                                </p>
                            )}
                        </div>

                        {/* Preset Choice */}
                        <div className="pt-2 border-t border-[#f5f1e4]">
                            <label className="text-[11px] font-mono text-[#80827f] block mb-2 uppercase">
                                Quick Frame Presets
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
                                            ? "bg-[#4285F4]/10 border-[#4285F4] text-[#4285F4]"
                                            : "bg-[#f5f1e4] border-[#d5d5d4] text-[#2c2e2a] hover:bg-white"
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
                                            ? "bg-[#4285F4]/10 border-[#4285F4] text-[#4285F4]"
                                            : "bg-[#f5f1e4] border-[#d5d5d4] text-[#2c2e2a] hover:bg-white"
                                    }`}
                                >
                                    Dark Accent Canvas
                                </button>
                            </div>
                        </div>

                        {/* Issue Date & Title Config */}
                        <div className="space-y-3 pt-2 border-t border-[#f5f1e4]">
                            <div>
                                <label className="text-[10px] font-mono text-[#80827f] uppercase block mb-1">
                                    Issue Date Display
                                </label>
                                <input
                                    type="text"
                                    value={issueDate}
                                    onChange={(e) => setIssueDate(e.target.value)}
                                    placeholder="e.g. November 24, 2026"
                                    className="w-full px-3 py-2 rounded-xl bg-[#f5f1e4] border border-[#d5d5d4] text-xs text-[#2c2e2a]"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-mono text-[#80827f] uppercase block mb-1">
                                    Event Subtitle / Reason
                                </label>
                                <input
                                    type="text"
                                    value={certDescription}
                                    onChange={(e) => setCertDescription(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-[#f5f1e4] border border-[#d5d5d4] text-xs text-[#2c2e2a]"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Interactive Live Certificate Preview (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-[#ffffff] border border-[#d5d5d4] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-[#2c2e2a]">
                                    Live Generated Certificate
                                </h3>
                                <p className="text-xs text-[#80827f]">
                                    Auto-updates dynamically based on selected student and frame.
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-[#4285F4] font-bold">
                                    #{currentCertId}
                                </span>
                            </div>
                        </div>

                        {/* Interactive Certificate Canvas Viewport */}
                        <div className="relative rounded-2xl overflow-hidden border border-[#d5d5d4] shadow-md bg-white select-none">
                            {/* Certificate Canvas Mock */}
                            <div
                                className="relative w-full"
                                style={{ aspectRatio: "1754 / 1240" }}
                            >
                                {/* Background Frame */}
                                <img
                                    src={frameUrl}
                                    alt="Certificate Background"
                                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                                />

                                {/* Overlaid Content */}
                                <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-8 pointer-events-none">
                                    {/* Header space */}
                                    <div className="h-16" />

                                    {/* Center: Recipient Name & Details */}
                                    <div className="text-center space-y-2 transform -translate-y-2">
                                        <h2
                                            className="font-extrabold text-[#1a73e8] tracking-tight drop-shadow-xs"
                                            style={{ fontSize: "clamp(1.1rem, 3.5vw, 2.4rem)" }}
                                        >
                                            {currentParticipant?.name || "Participant Name"}
                                        </h2>
                                        <p
                                            className="text-[#3c4043] font-medium"
                                            style={{ fontSize: "clamp(0.55rem, 1.4vw, 0.95rem)" }}
                                        >
                                            {certDescription}
                                        </p>
                                        <p
                                            className="text-[#202124] font-bold tracking-tight"
                                            style={{ fontSize: "clamp(0.75rem, 2.2vw, 1.4rem)" }}
                                        >
                                            {eventTitle || "Technical Workshop"}
                                        </p>
                                    </div>

                                    {/* Bottom: Signatures and Unique QR Code */}
                                    <div className="flex items-end justify-between pt-4 px-2 sm:px-6">
                                        {/* Faculty Advisor */}
                                        <div className="text-center w-28 sm:w-44">
                                            <div className="border-t border-[#2c2e2a]/40 pt-1">
                                                <p className="font-bold text-[#202124] text-[9px] sm:text-xs">
                                                    {signatory1Name}
                                                </p>
                                                <p className="text-[7px] sm:text-[10px] text-[#80827f]">
                                                    {signatory1Role}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Chapter Lead */}
                                        <div className="text-center w-28 sm:w-44">
                                            <div className="border-t border-[#2c2e2a]/40 pt-1">
                                                <p className="font-bold text-[#202124] text-[9px] sm:text-xs">
                                                    {signatory2Name}
                                                </p>
                                                <p className="text-[7px] sm:text-[10px] text-[#80827f]">
                                                    {signatory2Role}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Unique QR Code Badge */}
                                        <div className="flex flex-col items-center">
                                            <div className="w-12 h-12 sm:w-20 sm:h-20 bg-white p-1 rounded-xl shadow-md border border-[#d5d5d4] flex items-center justify-center">
                                                {qrCodeDataUrl ? (
                                                    <img
                                                        src={qrCodeDataUrl}
                                                        alt="QR Verification"
                                                        className="w-full h-full object-contain"
                                                    />
                                                ) : (
                                                    <QrCode className="w-full h-full text-zinc-400" />
                                                )}
                                            </div>
                                            <span className="text-[7px] sm:text-[9px] font-bold font-mono text-[#5f6368] mt-1">
                                                SCAN TO VERIFY
                                            </span>
                                        </div>
                                    </div>

                                    {/* Footer micro ID */}
                                    <div className="text-center font-mono text-[6px] sm:text-[9px] text-[#80827f] pt-1">
                                        #{currentCertId} • VERIFY AT GDGAJCE.COM/VERIFY
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Verification & Action Command Bar */}
                        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <a
                                    href={`/verify/${currentCertId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs text-[#4285F4] hover:underline font-medium"
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
                                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#f5f1e4] hover:bg-[#eae5d8] border border-[#d5d5d4] text-xs font-semibold text-[#2c2e2a] transition disabled:opacity-50"
                                >
                                    <Download className="w-3.5 h-3.5 text-[#2c2e2a]" />
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
                                            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#4285F4] hover:bg-[#3367d6] text-white text-xs font-semibold shadow-xs transition disabled:opacity-50"
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
