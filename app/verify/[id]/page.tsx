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
    templateName: string;
    templateId: string;
    eventId: string;
    issueDate: string;
    issuedAt: any;
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
    const [aspectRatio, setAspectRatio] = useState<string>("1754 / 1240");
    const [copied, setCopied] = useState(false);
    const certificateRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchCertificate = async () => {
            try {
                // Fetch certificate from issuedCertificates collectionGroup
                const q = query(
                    collectionGroup(db, "issuedCertificates"),
                    where("certificateId", "==", id)
                );
                const snap = await getDocs(q);

                if (!snap.empty) {
                    const certData = snap.docs[0].data() as CertificateData;
                    setCertificate(certData);

                    // Fetch template
                    if (certData.templateId && certData.eventId) {
                        const templateDoc = await getDoc(
                            doc(db, "events", certData.eventId, "certificates", certData.templateId)
                        );
                        if (templateDoc.exists()) {
                            setTemplate(templateDoc.data() as TemplateData);
                        }
                    }

                    // Generate clean QR code
                    const verifyUrl = `${window.location.origin}/verify/${id}`;
                    const qr = await QRCode.toDataURL(verifyUrl, {
                        width: 400,
                        margin: 0,
                        color: {
                            dark: "#000000",
                            light: "#ffffff"
                        },
                        errorCorrectionLevel: "H"
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

    // Download certificate high-resolution canvas
    const handleDownload = async () => {
        if (!certificate || !template?.backgroundUrl || !qrDataUrl) return;

        try {
            setIsDownloading(true);
            setDownloadProgress(0);
            setDownloadStatus("Initializing canvas...");

            await document.fonts.ready;
            setDownloadProgress(15);
            setDownloadStatus("Fetching high-res background...");

            const loadImage = (src: string, crossOrigin = true): Promise<HTMLImageElement> =>
                new Promise((resolve, reject) => {
                    const img = new Image();
                    if (crossOrigin) img.crossOrigin = "anonymous";
                    img.onload = () => resolve(img);
                    img.onerror = reject;
                    img.src = src;
                });

            const bgImg = await loadImage(template.backgroundUrl);
            const bgRatio = bgImg.naturalWidth / bgImg.naturalHeight;

            // Standard A4 Landscape @ 300 DPI
            const RENDER_W = 3508;
            const RENDER_H = Math.round(RENDER_W / bgRatio);

            setDownloadProgress(40);
            setDownloadStatus("Synthesizing credential layers...");

            const canvas = document.createElement("canvas");
            canvas.width = RENDER_W;
            canvas.height = RENDER_H;
            const ctx = canvas.getContext("2d")!;

            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, RENDER_W, RENDER_H);
            ctx.drawImage(bgImg, 0, 0, RENDER_W, RENDER_H);

            setDownloadProgress(60);
            setDownloadStatus("Injecting cryptographic signature...");

            const qrImg = await loadImage(qrDataUrl, false);

            for (const el of (template.elements ?? [])) {
                const leftPx = (el.x / 100) * RENDER_W;
                const topPx = (el.y / 100) * RENDER_H;
                const sizePx = (el.fontSize / 800) * RENDER_W;

                if (el.type === "qrcode") {
                    let drawX = leftPx;
                    if (el.textAlign === "center") drawX = leftPx - sizePx / 2;
                    else if (el.textAlign === "right") drawX = leftPx - sizePx;
                    ctx.drawImage(qrImg, drawX, topPx, sizePx, sizePx);
                } else {
                    let content = "";
                    if (el.type === "name") content = certificate.recipientName;
                    else if (el.type === "date") content = certificate.issueDate;
                    else if (el.type === "certificateId") content = certificate.certificateId;
                    if (!content) continue;

                    const fontFamily = (el.fontFamily || "Inter, sans-serif")
                        .split(",")[0]
                        .trim()
                        .replace(/['"]/g, "");

                    try {
                        await document.fonts.load(`${el.fontWeight || "normal"} ${sizePx}px "${fontFamily}"`);
                    } catch {
                        // fallback
                    }

                    ctx.save();
                    ctx.font = `${el.fontWeight || "normal"} ${sizePx}px "${fontFamily}"`;
                    ctx.fillStyle = el.color || "#000000";
                    ctx.textBaseline = "top";
                    ctx.textAlign = (el.textAlign === "center" || el.textAlign === "right")
                        ? el.textAlign
                        : "left";
                    ctx.fillText(content, leftPx, topPx);
                    ctx.restore();
                }
            }

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
                // User dismissed share dialog
            }
        } else {
            try {
                await navigator.clipboard.writeText(shareUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2500);
                dialog.alert("Verification URL copied to clipboard!", "Link Copied");
            } catch {
                dialog.prompt("Verification URL:", shareUrl, "Copy Link");
            }
        }
    };

    if (loading) return <LoadingSpinner text="Querying Google credential registry..." />;

    if (!certificate || !template) {
        return (
            <main className="min-h-screen text-[#2c2e2a] relative overflow-hidden pb-32">
                <div className="max-w-4xl mx-auto px-6 pt-32 pb-20 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                        <XCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-[#2c2e2a] mb-4">Certificate Not Found</h1>
                    <p className="text-[#80827f] text-sm max-w-md mx-auto">
                        This credential ID is either invalid, nonexistent, or has been archived from the Google Developer Groups registry.
                    </p>
                </div>
            </main>
        );
    }

    if (certificate.revoked) {
        return (
            <main className="min-h-screen text-[#2c2e2a] relative overflow-hidden pb-32">
                <div className="max-w-2xl mx-auto px-6 pt-32 pb-20 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                        <XCircle className="w-10 h-10 text-red-500" />
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
        <main className="min-h-screen text-[#e3e3e3] relative overflow-hidden pb-32">
            <div className="google-ambient-bg pointer-events-none" />

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-20">
                {/* Verified Header Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4 shadow-lg shadow-emerald-500/5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <span className="text-emerald-300 font-semibold text-xs tracking-wide">
                            Official Google Developer Groups Credential
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-black text-[#2c2e2a] tracking-tight mb-2">
                        {certificate.recipientName}
                    </h1>
                    <div className="flex items-center justify-center gap-2 text-xs font-mono text-[#80827f]">
                        <span>Credential ID:</span>
                        <span className="text-[#4285F4] font-bold">#{id}</span>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(id);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                            }}
                            className="p-1 rounded-md hover:bg-[#f5f1e4] text-[#80827f] hover:text-[#2c2e2a] transition"
                            title="Copy ID"
                        >
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                    </div>
                </motion.div>

                {/* Certificate Preview Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15 }}
                    className="relative max-w-4xl mx-auto mb-12"
                >
                    <div
                        ref={certificateRef}
                        data-cert-container="true"
                        className="relative mx-auto rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs border border-[#d5d5d4] bg-white"
                        style={{
                            width: "800px",
                            maxWidth: "100%",
                            aspectRatio: aspectRatio,
                            containerType: "inline-size"
                        }}
                    >
                        {/* Background */}
                        <img
                            src={template.backgroundUrl}
                            alt="Certificate artwork"
                            className="absolute inset-0 w-full h-full object-cover"
                            onLoad={(e) => {
                                const img = e.currentTarget;
                                if (img.naturalWidth && img.naturalHeight) {
                                    setAspectRatio(`${img.naturalWidth} / ${img.naturalHeight}`);
                                }
                            }}
                            crossOrigin="anonymous"
                        />

                        {/* Elements */}
                        {template.elements?.map((el: any) => {
                            const baseFontSizePercent = (el.fontSize / 800) * 100;

                            const style: React.CSSProperties = {
                                position: "absolute",
                                left: `${el.x}%`,
                                top: `${el.y}%`,
                                fontSize: `${baseFontSizePercent}cqw`,
                                color: el.color,
                                fontWeight: el.fontWeight,
                                fontFamily: el.fontFamily || "Inter, sans-serif",
                                textAlign: el.textAlign || "left",
                                whiteSpace: "nowrap",
                                lineHeight: 1,
                                display: "inline-block",
                                transform: (el.textAlign === "center" ? "translateX(-50%)" : el.textAlign === "right" ? "translateX(-100%)" : "none")
                            };

                            if (el.type === "qrcode" && qrDataUrl) {
                                const qrSizePercent = (el.fontSize / 800) * 100;
                                return (
                                    <div
                                        key={el.id}
                                        className="cert-element qr-element"
                                        style={{
                                            position: "absolute",
                                            left: `${el.x}%`,
                                            top: `${el.y}%`,
                                            width: `${qrSizePercent}cqw`,
                                            height: `${qrSizePercent}cqw`,
                                            transform: (el.textAlign === "center" ? "translateX(-50%)" : el.textAlign === "right" ? "translateX(-100%)" : "none")
                                        }}
                                    >
                                        <img
                                            src={qrDataUrl}
                                            alt="Verification QR"
                                            className="w-full h-full"
                                            style={{ display: "block" }}
                                        />
                                    </div>
                                );
                            }

                            let content = "";
                            switch (el.type) {
                                case "name":
                                    content = certificate.recipientName;
                                    break;
                                case "date":
                                    content = certificate.issueDate;
                                    break;
                                case "certificateId":
                                    content = certificate.certificateId;
                                    break;
                            }

                            return (
                                <div
                                    key={el.id}
                                    className="cert-element"
                                    style={style}
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
                    <div className="bg-[#ffffff] border border-[#d5d5d4] rounded-3xl p-6 sm:p-8 shadow-xs">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-xl bg-[#2ba0ff]/10 border border-[#2ba0ff]/20 text-[#2ba0ff]">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <h3 className="text-base font-bold text-[#2c2e2a] tracking-wide">Registry Details</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                            <div>
                                <span className="text-[11px] font-mono text-[#80827f] uppercase tracking-wider block mb-1">Recipient Name</span>
                                <p className="text-[#2c2e2a] font-semibold">{certificate.recipientName}</p>
                            </div>
                            <div>
                                <span className="text-[11px] font-mono text-[#80827f] uppercase tracking-wider block mb-1">Associated Event</span>
                                <p className="text-[#2c2e2a] font-semibold">{certificate.eventTitle}</p>
                            </div>
                            <div>
                                <span className="text-[11px] font-mono text-[#80827f] uppercase tracking-wider block mb-1">Credential Track</span>
                                <p className="text-[#2c2e2a] font-semibold">{certificate.templateName}</p>
                            </div>
                            <div>
                                <span className="text-[11px] font-mono text-[#80827f] uppercase tracking-wider block mb-1">Issuance Date</span>
                                <p className="text-[#2c2e2a] font-semibold">{certificate.issueDate}</p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={handleDownload}
                            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-[#4285F4] hover:bg-[#3367d6] text-white font-semibold text-sm rounded-full transition-all shadow-xs hover:scale-[1.02] cursor-pointer"
                        >
                            <Download className="w-4 h-4" />
                            Download High-Res PNG
                        </button>
                        <button
                            onClick={handleShare}
                            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-[#ffffff] hover:bg-[#f5f1e4] text-[#2c2e2a] font-semibold text-sm rounded-full transition-all border border-[#d5d5d4] hover:scale-[1.02] cursor-pointer shadow-xs"
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
                        <div className="w-16 h-16 bg-[#4285F4]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#4285F4]/20">
                            <Download className="w-8 h-8 text-[#4285F4] animate-bounce" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">Rendering Artifact</h3>
                        <p className="text-zinc-400 text-xs mb-6">{downloadStatus}</p>

                        <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden mb-2">
                            <motion.div
                                className="h-full bg-gradient-to-r from-[#4285F4] to-[#34A853]"
                                initial={{ width: 0 }}
                                animate={{ width: `${downloadProgress}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                            <span>Processing</span>
                            <span className="text-[#4285F4] font-bold">{downloadProgress}%</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </main>
    );
}
