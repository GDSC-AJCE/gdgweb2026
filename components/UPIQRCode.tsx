"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Copy, Check, QrCode, Smartphone } from "lucide-react";

interface UPIQRCodeProps {
    upiId: string;
    payeeName: string;
    amount: number;
    note?: string;
    className?: string;
}

export default function UPIQRCode({ upiId, payeeName, amount, note, className = "" }: UPIQRCodeProps) {
    const [qrDataUrl, setQrDataUrl] = useState<string>("");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const generateQR = async () => {
            const encodedName = encodeURIComponent(payeeName);
            const encodedNote = encodeURIComponent(note || `Payment for ${payeeName}`);
            const upiLink = `upi://pay?pa=${upiId}&pn=${encodedName}&am=${amount}&cu=INR&tn=${encodedNote}`;

            try {
                const url = await QRCode.toDataURL(upiLink, {
                    width: 320,
                    margin: 1,
                    color: {
                        dark: "#000000",
                        light: "#ffffff"
                    },
                    errorCorrectionLevel: "M"
                });
                setQrDataUrl(url);
            } catch (err) {
                console.error("QR Code generation error:", err);
            }
        };

        if (upiId && amount > 0) {
            generateQR();
        }
    }, [upiId, payeeName, amount, note]);

    const handleCopyUPI = async () => {
        try {
            await navigator.clipboard.writeText(upiId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    if (!qrDataUrl) return null;

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Header with Amount */}
            <div className="p-4 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-mono font-medium text-zinc-400 uppercase tracking-widest">Payable Amount</p>
                    <p className="text-2xl font-bold text-white tracking-tight">₹{amount.toLocaleString("en-IN")}</p>
                </div>
                <div className="text-right">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#4285F4]/10 border border-[#4285F4]/30 text-[#4285F4] text-[10px] font-mono font-medium uppercase tracking-wider">
                        <QrCode className="w-3 h-3" />
                        UPI Direct
                    </span>
                    <p className="text-[11px] text-zinc-400 mt-1 truncate max-w-[140px] font-medium">{payeeName}</p>
                </div>
            </div>

            {/* QR Code Box */}
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-zinc-900 border border-white/10">
                <div className="p-3 bg-white rounded-2xl shadow-xl">
                    <img src={qrDataUrl} alt="UPI QR Code" className="w-44 h-44 rounded-lg block" />
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400 mt-4 font-medium">
                    <Smartphone className="w-4 h-4 text-[#34A853]" />
                    <span>Scan with GPay, Paytm, PhonePe or BHIM</span>
                </div>
            </div>

            {/* UPI ID Button with Copy */}
            <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 uppercase px-1">
                    <span>UPI ID</span>
                    <span>Tap to copy</span>
                </div>
                <button
                    type="button"
                    onClick={handleCopyUPI}
                    className="w-full flex items-center justify-between px-4 py-3 bg-zinc-900 border border-white/10 rounded-2xl hover:border-[#4285F4] transition group"
                >
                    <span className="text-zinc-200 font-mono text-xs font-semibold">{upiId}</span>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 group-hover:text-white transition">
                        {copied ? (
                            <>
                                <Check className="w-4 h-4 text-[#34A853]" />
                                <span className="text-[11px] text-[#34A853] font-semibold">Copied!</span>
                            </>
                        ) : (
                            <>
                                <Copy className="w-4 h-4 text-zinc-400 group-hover:text-white" />
                                <span className="text-[11px]">Copy</span>
                            </>
                        )}
                    </div>
                </button>
            </div>
        </div>
    );
}
