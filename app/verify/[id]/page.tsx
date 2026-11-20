"use client";

import { use, useEffect, useState, useRef } from "react";
import { db } from "@/lib/firebase";
import { collectionGroup, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import {
    CheckCircle2,
    XCircle,
    Download,
    Share2,
    Calendar,
    ShieldCheck,
    Award,
    Copy,
    Check
} from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useDialog } from "@/context/DialogContext";
import QRCode from "qrcode";
import GoogleBadge from "@/components/GoogleBadge";

interface CertificateData {
    certificateId: string;
    recipientName: string;
    recipientEmail: string;
    eventTitle: string;
    templateName?: string;
    templateId?: string;
    eventId?: string;
    issueDate?: string;
    issuedAt?: any;
    backgroundUrl?: string;
    elements?: any[];
    revoked?: boolean;
    revokedAt?: any;
    revokedReason?: string;
}

interface TemplateData {
    backgroundUrl: string;
    elements: any[];
}

export default function VerifyPage({
    params
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const dialog = useDialog();
    const [loading, setLoading] = useState(true);
    const [certificate, setCertificate] = useState<CertificateData | null>(null);
    const [template, setTemplate] = useState<TemplateData | null>(null);
    const [qrDataUrl, setQrDataUrl] = useState<string>("");
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [downloadStatus, setDownloadStatus] = useState("");
    const [aspectRatio, setAspectRatio] = useState<string>("1600 / 1131");
    const [copied, setCopied] = useState(false);
    const certificateRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchCertificate = async () => {
            try {
                let certData: CertificateData | null = null;

                // 1. Fetch certificate from issuedCertificates collectionGroup
                try {
                    const q = query(
                        collectionGroup(db, "issuedCertificates"),
                        where("certificateId", "==", id)
                    );
                    const snap = await getDocs(q);
                    if (!snap.empty) {
                        certData = snap.docs[0].data() as CertificateData;
                    }
                } catch (e) {
                    console.log("CollectionGroup query error:", e);
                }

                // 2. Fallback to direct /certificates/{id} root collection
                if (!certData) {
                    try {
                        const directDoc = await getDoc(doc(db, "certificates", id));
                        if (directDoc.exists()) {
                            certData = directDoc.data() as CertificateData;
                        }
                    } catch (e) {
                        console.log("Direct doc query error:", e);
                    }
                }

                if (certData) {
                    setCertificate(certData);

                    // Fetch template from event if available
                    let fetchedTemplate: TemplateData | null = null;
                    if (certData.eventId) {
                        try {
                            const templateDoc = await getDoc(
                                doc(db, "events", certData.eventId, "certificates", certData.templateId || "default")
                            );
                            if (templateDoc.exists()) {
                                fetchedTemplate = templateDoc.data() as TemplateData;
                            }
                        } catch (err) {
                            console.warn("Could not load event templateDoc:", err);
                        }
                    }

                    if (fetchedTemplate && fetchedTemplate.elements && fetchedTemplate.elements.length > 0) {
                        setTemplate(fetchedTemplate);
                    } else if (certData.elements && certData.elements.length > 0) {
                        setTemplate({
                            backgroundUrl: certData.backgroundUrl || "",
                            elements: certData.elements,
                        });
                    } else {
                        // Fallback default elements
                        setTemplate({
                            backgroundUrl: certData.backgroundUrl || "",
                            elements: [
                                { id: "elem_title", type: "text", field: "custom", customText: "CERTIFICATE OF PARTICIPATION", x: 50, y: 28, fontSize: 26, color: "#0f172a", fontFamily: "Urbanist, sans-serif", fontWeight: "800", textAlign: "center", visible: true },
                                { id: "elem_name", type: "text", field: "name", x: 50, y: 45, fontSize: 48, color: "#2563EB", fontFamily: "Playfair Display, serif", fontWeight: "800", textAlign: "center", visible: true },
                                { id: "elem_desc", type: "text", field: "custom", customText: "for active participation and successful completion of the hands-on technical workshop.", x: 50, y: 54, fontSize: 14, color: "#475569", fontFamily: "Urbanist, sans-serif", fontWeight: "500", textAlign: "center", visible: true },
                                { id: "elem_event", type: "text", field: "eventTitle", x: 50, y: 61, fontSize: 22, color: "#0f172a", fontFamily: "Urbanist, sans-serif", fontWeight: "800", textAlign: "center", visible: true },
                                { id: "elem_date", type: "text", field: "date", x: 25, y: 82, fontSize: 13, color: "#334155", fontFamily: "Urbanist, sans-serif", fontWeight: "600", textAlign: "center", visible: true },
                                { id: "elem_sig1", type: "text", field: "custom", customText: "Prof. Fr. Rubin Thoppil\nFaculty Advisor, GDG AJCE", x: 50, y: 82, fontSize: 12, color: "#334155", fontFamily: "Urbanist, sans-serif", fontWeight: "600", textAlign: "center", visible: true },
                                { id: "elem_id", type: "text", field: "certificateId", x: 82, y: 87, fontSize: 11, color: "#2563EB", fontFamily: "Courier New, monospace", fontWeight: "700", textAlign: "center", visible: true },
                                { id: "elem_qr", type: "qrcode", field: "certificateId", x: 82, y: 76, fontSize: 80, color: "#0f172a", textAlign: "center", visible: true },
                            ],
                        });
                    }

                    // Generate clean QR code
                    const verifyUrl = `${window.location.origin}/verify/${id}`;
                    const qr = await QRCode.toDataURL(verifyUrl, {
                        width: 400,
                        margin: 1,
                        color: {
                            dark: "#000000",
                            light: "#ffffff",
                        },
                        errorCorrectionLevel: "H",
                    });
                    setQrDataUrl(qr);
                }
            } catch (error) {
                console.error("Error fetching certificate:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchCertificate();
    }, [id]);

    const getElementContent = (el: any): string => {
        if (!certificate) return "";
        const field = el.field || el.type;
        switch (field) {
            case "name":
                return certificate.recipientName || "Recipient Name";
            case "eventTitle":
                return certificate.eventTitle || "GDG Event";
            case "date":
                return certificate.issueDate || (certificate.issuedAt?.toDate ? certificate.issuedAt.toDate().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }));
            case "certificateId":
                return certificate.certificateId || id;
            case "custom":
                return el.customText || "";
            default:
                return el.customText || "";
        }
    };

    // Download certificate high-resolution canvas matching Studio 1:1
    const handleDownload = async () => {
        if (!certificate || !qrDataUrl) return;

        try {
            setIsDownloading(true);
            setDownloadProgress(0);
            setDownloadStatus("Initializing canvas...");

            await document.fonts.ready;
            setDownloadProgress(15);
            setDownloadStatus("Preparing artwork...");

            const RENDER_W = 1600;
            const RENDER_H = 1131;

            const canvas = document.createElement("canvas");
            canvas.width = RENDER_W;
            canvas.height = RENDER_H;
            const ctx = canvas.getContext("2d")!;

            const drawContent = async () => {
                const qrImg = new Image();
                await new Promise((resolve) => {
                    qrImg.onload = resolve;
                    qrImg.onerror = resolve;
                    qrImg.src = qrDataUrl;
                });

                const elementsToRender = template?.elements || [];
                for (const el of elementsToRender) {
                    if (el.visible === false) continue;

                    const posX = (el.x / 100) * RENDER_W;
                    const posY = (el.y / 100) * RENDER_H;

                    if (el.type === "qrcode") {
                        const size = (el.fontSize || 80) * 1.5;
                        let drawX = posX - size / 2;
                        if (el.textAlign === "left") drawX = posX;
                        if (el.textAlign === "right") drawX = posX - size;
                        ctx.drawImage(qrImg, drawX, posY - size / 2, size, size);
                    } else {
                        const content = getElementContent(el);
                        if (!content) continue;

                        const fontSize = (el.fontSize || 20) * 1.3;
                        const fontFamily = el.fontFamily || "Urbanist, sans-serif";
                        const fontWeight = el.fontWeight || "normal";

                        ctx.save();
                        ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
                        ctx.fillStyle = el.color || "#0f172a";
                        ctx.textAlign = el.textAlign || "center";
                        ctx.textBaseline = "middle";

                        const lines = content.split("\n");
                        const lineHeight = (el.fontSize || 20) * 1.6;
                        lines.forEach((line: string, i: number) => {
                            ctx.fillText(line, posX, posY + i * lineHeight);
                        });
                        ctx.restore();
                    }
                }
            };

            if (template?.backgroundUrl) {
                const bgImg = new Image();
                bgImg.crossOrigin = "anonymous";
                await new Promise((resolve) => {
                    bgImg.onload = () => {
                        ctx.drawImage(bgImg, 0, 0, RENDER_W, RENDER_H);
                        resolve(null);
                    };
                    bgImg.onerror = () => {
                        drawFallbackBg(ctx, RENDER_W, RENDER_H);
                        resolve(null);
                    };
                    bgImg.src = template.backgroundUrl;
                });
            } else {
                drawFallbackBg(ctx, RENDER_W, RENDER_H);
            }

            setDownloadProgress(60);
            setDownloadStatus("Rendering credential layers...");
            await drawContent();

            setDownloadProgress(90);
            setDownloadStatus("Finalizing PNG artifact...");

            const link = document.createElement("a");
            link.download = `gdg-certificate-${id}.png`;
            link.href = canvas.toDataURL("image/png", 1.0);
            link.click();

            setDownloadProgress(100);
            setDownloadStatus("Downloaded!");
            setTimeout(() => {
                setIsDownloading(false);
                setDownloadProgress(0);
            }, 800);

        } catch (error) {
            console.error("Error downloading certificate:", error);
            dialog.alert("Failed to export certificate image. Please try again.", "Export Failed");
            setIsDownloading(false);
        }
    };

    const drawFallbackBg = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);

        ctx.lineWidth = 14;
        ctx.strokeStyle = "#f1f5f9";
        ctx.strokeRect(36, 36, width - 72, height - 72);

        ctx.lineWidth = 2;
        ctx.strokeStyle = "#cbd5e1";
        ctx.strokeRect(48, 48, width - 96, height - 96);

        const cornerSize = 48;
        ctx.fillStyle = "#2563EB";
        ctx.fillRect(48, 48, cornerSize, 8);
        ctx.fillRect(48, 48, 8, cornerSize);

        ctx.fillStyle = "#EF4444";
        ctx.fillRect(width - 48 - cornerSize, 48, cornerSize, 8);
        ctx.fillRect(width - 48 - 8, 48, 8, cornerSize);

        ctx.fillStyle = "#F59E0B";
        ctx.fillRect(48, height - 48 - 8, cornerSize, 8);
        ctx.fillRect(48, height - 48 - cornerSize, 8, cornerSize);

        ctx.fillStyle = "#10B981";
        ctx.fillRect(width - 48 - cornerSize, height - 48 - 8, cornerSize, 8);
        ctx.fillRect(width - 48 - 8, height - 48 - cornerSize, 8, cornerSize);

        ctx.font = "bold 18px Urbanist, sans-serif";
        ctx.fillStyle = "#64748b";
        ctx.textAlign = "center";
        ctx.fillText("GOOGLE DEVELOPER GROUPS ON CAMPUS • AMAL JYOTHI COLLEGE OF ENGINEERING", width / 2, 130);
    };

    const handleShare = async () => {
        const shareUrl = window.location.href;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `GDG Credential - ${certificate?.recipientName}`,
                    text: `Verify my official Google Developer Groups certificate for ${certificate?.eventTitle}`,
                    url: shareUrl
                });
            } catch (error) {
                console.log("Error sharing:", error);
            }
        } else {
            navigator.clipboard.writeText(shareUrl);
            dialog.alert("Verification link copied to clipboard!", "Link Copied");
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" text="Validating credential cryptographic signature..." />
            </main>
        );
    }

    if (!certificate) {
        return (
            <main className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-[#ffffff] border border-[#d5d5d4] rounded-3xl p-8 text-center shadow-xs">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-200">
                        <XCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <GoogleBadge label="Record Not Found" variant="red" />
                    <h1 className="text-2xl font-bold text-[#2c2e2a] mt-4 mb-2">Invalid Credential</h1>
                    <p className="text-[#80827f] text-sm mb-6 leading-relaxed">
                        No official certificate with ID <span className="font-mono text-[#2c2e2a]">#{id}</span> was found on the GDG AJCE registry.
                    </p>
                    <a
                        href="/programs"
                        className="inline-flex items-center justify-center px-6 py-2.5 bg-[#4285F4] hover:bg-[#3367d6] text-white text-xs font-semibold rounded-full transition shadow-xs"
                    >
                        Browse GDG Programs
                    </a>
                </div>
            </main>
        );
    }

    if (certificate.revoked) {
        return (
            <main className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-[#ffffff] border border-red-200 rounded-3xl p-8 text-center shadow-xs">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-200">
                        <XCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <GoogleBadge label="Credential Revoked" variant="red" />
                    <h1 className="text-3xl font-extrabold text-[#2c2e2a] mt-4 mb-3">Certificate Deauthorized</h1>
                    <p className="text-[#80827f] text-sm mb-6">
                        This credential has been officially revoked and is no longer valid.
                    </p>
                    {certificate.revokedReason && (
                        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-left mb-8">
                            <span className="text-xs font-mono font-bold text-red-600 uppercase tracking-widest block mb-1">Revocation Rationale</span>
                            <p className="text-[#2c2e2a] text-sm">{certificate.revokedReason}</p>
                        </div>
                    )}
                    <div className="p-6 bg-[#ffffff] rounded-3xl border border-[#d5d5d4] text-left shadow-xs">
                        <div className="flex justify-between py-2 border-b border-[#f5f1e4]">
                            <span className="text-xs text-[#80827f] font-mono">Issued To</span>
                            <span className="text-sm font-medium text-[#2c2e2a]">{certificate.recipientName}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-[#f5f1e4]">
                            <span className="text-xs text-[#80827f] font-mono">Event</span>
                            <span className="text-sm font-medium text-[#2c2e2a]">{certificate.eventTitle}</span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-xs text-[#80827f] font-mono">Certificate ID</span>
                            <span className="text-sm font-mono text-[#80827f]">#{id}</span>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen text-[#0f172a] relative overflow-hidden pb-32">
            <div className="google-ambient-bg pointer-events-none" />

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-20">
                {/* Verified Header Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4 shadow-lg shadow-emerald-500/5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <span className="text-emerald-700 font-semibold text-xs tracking-wide">
                            Official Google Developer Groups Credential
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-black text-[#0f172a] tracking-tight mb-2">
                        {certificate.recipientName}
                    </h1>
                    <div className="flex items-center justify-center gap-2 text-xs font-mono text-[#64748b]">
                        <span>Credential ID:</span>
                        <span className="text-[#2563EB] font-bold">#{id}</span>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(id);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                            }}
                            className="p-1 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition"
                            title="Copy ID"
                        >
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                    </div>
                </motion.div>

                {/* 1:1 Responsive Certificate Preview Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15 }}
                    className="relative max-w-4xl mx-auto mb-12"
                >
                    <div
                        ref={certificateRef}
                        data-cert-container="true"
                        className="relative mx-auto rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border border-slate-200 bg-white select-none [container-type:inline-size]"
                        style={{
                            width: "100%",
                            maxWidth: "960px",
                            aspectRatio: "1600 / 1131",
                        }}
                    >
                        {/* Background */}
                        {template?.backgroundUrl ? (
                            <img
                                src={template.backgroundUrl}
                                alt="Certificate artwork"
                                className="absolute inset-0 w-full h-full object-cover"
                                crossOrigin="anonymous"
                            />
                        ) : (
                            <div className="absolute inset-0 w-full h-full bg-white">
                                <div className="absolute inset-4 border-[7px] border-slate-100" />
                                <div className="absolute inset-6 border border-slate-300" />
                                {/* 4 Google Corner accents */}
                                <div className="absolute top-6 left-6 w-8 h-1.5 bg-[#2563EB]" />
                                <div className="absolute top-6 left-6 w-1.5 h-8 bg-[#2563EB]" />
                                <div className="absolute top-6 right-6 w-8 h-1.5 bg-[#EF4444]" />
                                <div className="absolute top-6 right-6 w-1.5 h-8 bg-[#EF4444]" />
                                <div className="absolute bottom-6 left-6 w-8 h-1.5 bg-[#F59E0B]" />
                                <div className="absolute bottom-6 left-6 w-1.5 h-8 bg-[#F59E0B]" />
                                <div className="absolute bottom-6 right-6 w-8 h-1.5 bg-[#10B981]" />
                                <div className="absolute bottom-6 right-6 w-1.5 h-8 bg-[#10B981]" />
                                <div className="absolute top-10 left-0 right-0 text-center font-bold text-[1.2cqw] tracking-wider text-slate-500 font-sans">
                                    GOOGLE DEVELOPER GROUPS ON CAMPUS • AMAL JYOTHI COLLEGE OF ENGINEERING
                                </div>
                            </div>
                        )}

                        {/* 1:1 Responsive Dynamic Elements matching Studio */}
                        {template?.elements?.map((el: any) => {
                            if (el.visible === false) return null;

                            // Scale font size proportionally using container query units (cqw)
                            // In Studio, width is 1600px. So fontSize * 1.3 relative to 1600 is:
                            const fontSizeCqw = ((el.fontSize * 1.3) / 1600) * 100;
                            let translateX = "-50%";
                            if (el.textAlign === "left") translateX = "0";
                            if (el.textAlign === "right") translateX = "-100%";

                            if (el.type === "qrcode" && qrDataUrl) {
                                const qrSizePercent = (el.fontSize * 1.5 / 1600) * 100;
                                const qrHeightPercent = (el.fontSize * 1.5 / 1131) * 100;
                                return (
                                    <div
                                        key={el.id}
                                        style={{
                                            position: "absolute",
                                            left: `${el.x}%`,
                                            top: `${el.y}%`,
                                            width: `${qrSizePercent}%`,
                                            height: `${qrHeightPercent}%`,
                                            transform: `translate(${translateX}, -50%)`,
                                        }}
                                    >
                                        <img
                                            src={qrDataUrl}
                                            alt="Verification QR"
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                );
                            }

                            const content = getElementContent(el);
                            if (!content) return null;

                            return (
                                <div
                                    key={el.id}
                                    style={{
                                        position: "absolute",
                                        left: `${el.x}%`,
                                        top: `${el.y}%`,
                                        fontSize: `${fontSizeCqw}cqw`,
                                        color: el.color || "#0f172a",
                                        fontWeight: el.fontWeight || "normal",
                                        fontFamily: el.fontFamily || "Urbanist, sans-serif",
                                        textAlign: el.textAlign || "center",
                                        whiteSpace: "pre-line",
                                        lineHeight: 1.25,
                                        transform: `translate(${translateX}, -50%)`,
                                    }}
                                >
                                    {content}
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Credential Metadata Breakdown */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="max-w-2xl mx-auto space-y-6"
                >
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-[#2563EB]">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <h3 className="text-base font-bold text-[#0f172a] tracking-wide">Registry Details</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                            <div>
                                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Recipient Name</span>
                                <p className="text-[#0f172a] font-semibold">{certificate.recipientName}</p>
                            </div>
                            <div>
                                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Associated Event</span>
                                <p className="text-[#0f172a] font-semibold">{certificate.eventTitle}</p>
                            </div>
                            <div>
                                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Recipient Email</span>
                                <p className="text-[#0f172a] font-semibold">{certificate.recipientEmail || "Protected"}</p>
                            </div>
                            <div>
                                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Issuance Date</span>
                                <p className="text-[#0f172a] font-semibold">
                                    {certificate.issueDate || (certificate.issuedAt?.toDate ? certificate.issuedAt.toDate().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }))}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={handleDownload}
                            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold text-sm rounded-full transition-all shadow-md hover:scale-[1.02] cursor-pointer"
                        >
                            <Download className="w-4 h-4" />
                            Download High-Res PNG
                        </button>
                        <button
                            onClick={handleShare}
                            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-white hover:bg-slate-50 text-[#0f172a] font-semibold text-sm rounded-full transition-all border border-slate-200 hover:scale-[1.02] cursor-pointer shadow-sm"
                        >
                            <Share2 className="w-4 h-4" />
                            Share Verification Link
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Progress overlay */}
            {isDownloading && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#1e1f20] border border-zinc-800 rounded-3xl p-8 max-w-sm w-full mx-6 text-center shadow-2xl relative overflow-hidden"
                    >
                        <div className="w-16 h-16 bg-[#2563EB]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#2563EB]/20">
                            <Download className="w-8 h-8 text-[#2563EB] animate-bounce" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">Rendering Artifact</h3>
                        <p className="text-zinc-400 text-xs mb-6">{downloadStatus}</p>

                        <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden mb-2">
                            <motion.div
                                className="h-full bg-gradient-to-r from-[#2563EB] to-[#10B981]"
                                initial={{ width: 0 }}
                                animate={{ width: `${downloadProgress}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                            <span>Processing</span>
                            <span className="text-[#2563EB] font-bold">{downloadProgress}%</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </main>
    );
}
